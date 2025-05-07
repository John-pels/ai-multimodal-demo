import { handleServerError } from "@/lib/server-error-handler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

// Add a MAX_FILE_SIZE constant at the top of the file (after imports)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

// Check if the API key is set
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set");
}

// Update the POST function to validate file size
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;
    const task = formData.get("task") as string;

    if (!image || !prompt) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          errorType: "missing_fields",
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File size exceeds 2 MB limit",
          errorType: "file_too_large",
        },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key not configured",
          errorType: "missing_api_key",
        },
        { status: 500 },
      );
    }

    // Convert image to base64
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = image.type;

    // Start timing for performance metrics
    const startTime = Date.now();

    // Create Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the image for the API
    const imageData = {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    };

    // Generate response from Gemini with timeout
    const result = await Promise.race([
      model.generateContent([prompt, imageData]),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000);
      }),
    ]);

    // Extract the response text
    const response = result.response;
    const text = response.text();

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Set cache control headers
    const headers = new Headers();
    headers.set("Cache-Control", "private, max-age=3600"); // Cache for 1 hour

    return NextResponse.json(
      {
        text,
        metadata: {
          model: "gemini-1.5-flash",
          processingTime,
          task,
          timestamp: Date.now(),
        },
      },
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    return handleServerError(error);
  }
}
