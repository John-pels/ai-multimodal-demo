import { NextResponse } from "next/server";

const errorDetails = {
  server_error: {
    message: "An error occurred while processing your request",
    statusCode: 500,
  },
  quota_exceeded: {
    message: "API quota exceeded. Please try again later.",
    statusCode: 429,
  },
  rate_limited: {
    message: "Rate limit exceeded. Please try again in a few moments.",
    statusCode: 429,
  },
  invalid_key: {
    message: "Invalid API key. Please check your API key configuration.",
    statusCode: 401,
  },
  content_filtered: {
    message: "The content was flagged as inappropriate or unsafe.",
    statusCode: 400,
  },
  timeout: {
    message: "The request timed out. Please try again.",
    statusCode: 408,
  },
} as const;

type ErrorType = keyof typeof errorDetails;

function detectErrorType(message: string): ErrorType {
  if (/quota/i.test(message)) return "quota_exceeded";
  if (/rate/i.test(message)) return "rate_limited";
  if (/invalid/i.test(message)) return "invalid_key";
  if (/content/i.test(message)) return "content_filtered";
  if (/timeout/i.test(message)) return "timeout";
  return "server_error";
}
export function handleServerError(error: unknown) {
  console.error("Gemini API error:", error);

  let errorType: ErrorType = "server_error";

  if (error instanceof Error) {
    errorType = detectErrorType(error.message);
  }

  const { message: errorMessage, statusCode } = errorDetails[errorType];

  return NextResponse.json(
    {
      text: "",
      error: errorMessage,
      errorType,
    },
    { status: statusCode },
  );
}
