export type Task = "analysis" | "qa" | "extraction" | "creative";

export type LoadingState = "idle" | "uploading" | "analyzing";

export type ErrorType = "client" | "server" | "network" | "timeout" | "quota";

export interface AnalysisResult {
  text: string;
  error?: string;
  metadata?: {
    model: string;
    processingTime: number;
    task: string;
    timestamp?: number;
  };
}
