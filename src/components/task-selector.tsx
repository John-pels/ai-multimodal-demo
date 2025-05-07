"use client";

import { FileText, HelpCircle, Search, Sparkles } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task } from "@/lib/types";

interface TaskSelectorProps {
  selectedTask: Task;
  setSelectedTask: (task: Task) => void;
  disabled?: boolean;
}

export default function TaskSelector({
  selectedTask,
  setSelectedTask,
  disabled = false,
}: TaskSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="selectTask">
        Select Task
      </label>

      <Tabs
        value={selectedTask}
        onValueChange={(value) => !disabled && setSelectedTask(value as Task)}
        className="w-full"
      >
        <TabsList className={`grid grid-cols-4 w-full ${disabled ? "opacity-70" : ""}`}>
          <TabsTrigger
            value="analysis"
            className="flex flex-col items-center py-2 px-1 sm:px-3"
            disabled={disabled}
          >
            <Search className="h-4 w-4 mb-1" />
            <span className="text-xs">Analysis</span>
          </TabsTrigger>
          <TabsTrigger
            value="qa"
            className="flex flex-col items-center py-2 px-1 sm:px-3"
            disabled={disabled}
          >
            <HelpCircle className="h-4 w-4 mb-1" />
            <span className="text-xs">Q&A</span>
          </TabsTrigger>
          <TabsTrigger
            value="extraction"
            className="flex flex-col items-center py-2 px-1 sm:px-3"
            disabled={disabled}
          >
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-xs">Text</span>
          </TabsTrigger>
          <TabsTrigger
            value="creative"
            className="flex flex-col items-center py-2 px-1 sm:px-3"
            disabled={disabled}
          >
            <Sparkles className="h-4 w-4 mb-1" />
            <span className="text-xs">Creative</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-2 text-xs text-gray-500">
        {selectedTask === "analysis" && "Detailed description and analysis of the image content."}
        {selectedTask === "qa" && "Ask questions about the image and get detailed answers."}
        {selectedTask === "extraction" && "Extract text visible in the image."}
        {selectedTask === "creative" && "Generate creative content inspired by the image."}
      </div>
    </div>
  );
}
