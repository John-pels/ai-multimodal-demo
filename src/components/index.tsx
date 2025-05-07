"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import ImageUpload from "@/components/image-upload";
import PromptInput from "@/components/prompt-input";
import ResultsPanel from "@/components/results-panel";
import TaskSelector from "@/components/task-selector";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { AnalysisResult, ErrorType, LoadingState, Task } from "@/lib/types";

// Cache key prefix
const CACHE_PREFIX = "gemini-vision-cache-";

export function LandingPage() {
  const [selectedTask, setSelectedTask] = useState<Task>("analysis");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Load cached results if available
  useEffect(() => {
    if (cacheKey) {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setResult(parsedData);
          toast({
            title: "Loaded from cache",
            description: "Showing previously cached result",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Failed to load from cache:", err);
        // Continue without cached data
      }
    }
  }, [cacheKey, toast]);

  // Update prompt based on selected task
  useEffect(() => {
    switch (selectedTask) {
      case "analysis":
        setPrompt("Describe this image in detail.");
        break;
      case "qa":
        setPrompt("What can you tell me about this image?");
        break;
      case "extraction":
        setPrompt("Extract all text visible in this image.");
        break;
      case "creative":
        setPrompt("Create a short story inspired by this image.");
        break;
    }
  }, [selectedTask]);

  // Generate a cache key based on image hash, task, and prompt
  const generateCacheKey = useCallback(async (file: File, task: Task, promptText: string) => {
    try {
      // Create a simple hash from the file
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Create a cache key from the hash, task, and prompt
      return `${CACHE_PREFIX}${hashHex.substring(0, 10)}-${task}-${promptText.substring(0, 20).replace(/\s+/g, "-")}`;
    } catch (err) {
      console.error("Failed to generate cache key:", err);
      return null;
    }
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      setLoadingState("uploading");
      setImageFile(file);
      setResult(null);
      setError(null);

      // Read the file and set preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setLoadingState("idle");
      };
      reader.onerror = () => {
        setError({
          type: "client",
          message: "Failed to read the image file. Please try another one.",
        });
        setLoadingState("idle");
      };
      reader.readAsDataURL(file);

      // Generate cache key for this image + task + prompt combination
      const key = await generateCacheKey(file, selectedTask, prompt);
      setCacheKey(key);
    } catch (err) {
      setError({
        type: "client",
        message: "Failed to process the image. Please try another one.",
      });
      setLoadingState("idle");
      console.error("Image processing error:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError({ type: "client", message: "Please upload an image first." });
      return;
    }

    setLoadingState("analyzing");
    setError(null);

    try {
      // Check if we have a cached result
      if (cacheKey) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setResult(parsedData);
          setLoadingState("idle");
          toast({
            title: "Loaded from cache",
            description: "Showing cached result",
            duration: 3000,
          });
          return;
        }
      }

      // No cache hit, proceed with API call
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("prompt", prompt);
      formData.append("task", selectedTask);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/gemini", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);

      // Cache the result
      if (cacheKey) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (err) {
          console.error("Failed to cache result:", err);
          // Continue without caching
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError({
            type: "timeout",
            message: "Request timed out. The server took too long to respond.",
          });
        } else if (err.message.includes("quota") || err.message.includes("rate")) {
          setError({
            type: "quota",
            message: "API quota or rate limit exceeded. Please try again later.",
          });
        } else if (err.message.includes("network") || err.message.includes("fetch")) {
          setError({
            type: "network",
            message: "Network error. Please check your internet connection and try again.",
          });
        } else {
          setError({
            type: "server",
            message: err.message,
          });
        }
      } else {
        setError({
          type: "server",
          message: "An unknown error occurred",
        });
      }
    } finally {
      setLoadingState("idle");
    }
  };

  const handleRetry = () => {
    if (error?.type === "network" || error?.type === "timeout" || error?.type === "server") {
      handleAnalyze();
    }
  };

  const handleClearCache = () => {
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
      toast({
        title: "Cache cleared",
        description: "The cached result has been cleared",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl max-sm:text-2xl  font-bold text-center mb-8 text-gray-700">
          Multimodal AI Application Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardContent className="p-6 max-sm:p-2">
                <div className="mb-6">
                  <TaskSelector
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    disabled={loadingState === "analyzing"}
                  />
                </div>

                <div className="mb-6">
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    imagePreview={imagePreview}
                    isLoading={loadingState === "uploading"}
                    disabled={loadingState === "analyzing"}
                  />
                </div>

                <div className="mb-6">
                  <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    disabled={loadingState === "analyzing"}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    onClick={handleAnalyze}
                    disabled={loadingState !== "idle" || !imageFile}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingState === "analyzing" ? "Processing..." : "Analyze"}
                  </button>

                  {result && (
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-md transition-colors"
                      title="Clear cached result"
                    >
                      Clear Cache
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">Error: {error.type}</h3>
                        <p className="text-sm text-red-700 mt-1">{error.message}</p>

                        {(error.type === "network" ||
                          error.type === "timeout" ||
                          error.type === "server") && (
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
                          >
                            Retry
                          </button>
                        )}

                        {error.type === "quota" && (
                          <p className="text-xs text-red-600 mt-2">
                            The API has usage limits. Please wait a few minutes before trying again.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <ResultsPanel
              result={result}
              loadingState={loadingState}
              onRetry={handleRetry}
              isCached={!!(result && cacheKey && localStorage.getItem(cacheKey))}
            />
          </div>
        </div>
      </main>
      <footer className="text-center mt-8">
        <p className="text-center text-gray-500 mb-4">
          Multimodal AI Workshop Demo | Build with AI plus ❤️ Ibadan 2025
        </p>
      </footer>
    </>
  );
}
