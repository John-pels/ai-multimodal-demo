"use client";

import { Clock, Loader2, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult, LoadingState } from "@/lib/types";

interface ResultsPanelProps {
  result: AnalysisResult | null;
  loadingState: LoadingState;
  onRetry?: () => void;
  isCached?: boolean;
}

export default function ResultsPanel({
  result,
  loadingState,
  onRetry,
  isCached = false,
}: ResultsPanelProps) {
  const isLoading = loadingState === "analyzing";

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return null;

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-700">Results</CardTitle>
        {isCached && (
          <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            <Clock className="h-3 w-3 mr-1" />
            Cached Result
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Processing with Gemini AI...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
          </div>
        ) : result ? (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{result.text}</div>

            {result.error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
                <div className="flex-1">{result.error}</div>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    type="button"
                    className="ml-2 p-1 rounded hover:bg-red-200"
                    title="Retry"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {result.metadata && (
              <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                <p>Model: {result.metadata.model}</p>
                <p>Processing time: {result.metadata.processingTime}ms</p>
                <p>Task: {result.metadata.task}</p>
                {result.metadata.timestamp && (
                  <p>Generated: {formatTimestamp(result.metadata.timestamp)}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <p>Upload an image and click "Analyze with Gemini" to see results</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
