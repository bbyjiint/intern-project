"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface TranscriptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationId: string;
  onUploaded?: () => void;
}

export default function TranscriptUploadModal({
  isOpen,
  onClose,
  educationId,
  onUploaded,
}: TranscriptUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] =
    useState<TranscriptUploadModalProps | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      await apiFetch(`/api/candidates/education/${educationId}/transcript`, {
        method: "POST",
        body: formData,
      });

      onUploaded?.();
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload transcript");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl w-full max-w-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6">
            <div>
              <h2 className="text-lg font-bold text-[#1C2D4F]">
                Upload Transcript
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload your transcript to verify your education information.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Upload Area */}
          <div className="px-6 mt-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-blue-200 rounded-xl p-10 text-center"
            >
              {/* Upload Icon */}
              <div className="flex justify-center mb-4">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                  <path d="M4 20h16" />
                </svg>
              </div>

              <p className="text-gray-600 mb-3 font-medium">
                Drag and drop your file here
              </p>

              {/* Select file button */}
              <label className="inline-block">
                <span className="bg-blue-600 text-white px-5 py-2 rounded-md cursor-pointer text-sm font-semibold hover:bg-blue-700">
                  Select File
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-400 mt-3">
                PDF or DOCX format. Max size: 5 MB
              </p>

              {file && (
                <p className="text-sm text-blue-600 mt-4 font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-5 mt-4 border-t">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 hover:bg-blue-700"
            >
              {isUploading ? "Uploading..." : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
