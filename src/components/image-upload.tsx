"use client";

import { Loader2, Upload } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";
import type React from "react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageUpload,
  imagePreview,
  isLoading = false,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndUpload(e.target.files?.[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 2 MB limit. Please upload a smaller image.");
      return;
    }

    onImageUpload(file);
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="uploadImage">
        Upload Image
      </label>

      <div
        onClick={handleClick}
        onKeyUp={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : isDragging
              ? "border-blue-500 bg-blue-50 cursor-pointer"
              : "border-gray-300 hover:border-gray-400 cursor-pointer"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
          id="uploadImage"
        />

        {isLoading ? (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Processing image...</p>
          </div>
        ) : imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className={`mx-auto max-h-64 rounded-md object-contain ${disabled ? "opacity-50" : ""}`}
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-black bg-opacity-50 text-white p-2 rounded">Click to change</div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            <Upload
              className={`mx-auto h-12 w-12 ${disabled ? "text-gray-300" : "text-gray-400"}`}
            />
            <p className={`mt-2 text-sm ${disabled ? "text-gray-400" : "text-gray-500"}`}>
              Drag and drop an image, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, GIF, WEBP (max 2 MB)</p>
          </div>
        )}
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
