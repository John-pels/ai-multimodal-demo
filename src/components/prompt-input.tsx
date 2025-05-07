"use client";

import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ prompt, setPrompt, disabled = false }: PromptInputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="customizePrompt">
        Customize Prompt
      </label>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className="min-h-[100px]"
        disabled={disabled}
        id="customizePrompt"
      />
      <p className="mt-1 text-xs text-gray-500">
        Customize the prompt to get more specific results from Gemini.
      </p>
    </div>
  );
}
