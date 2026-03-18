"use client";

import { useState, useRef } from "react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void | Promise<void>;
  currentFileName?: string;
}

export default function ResumeModal({
  isOpen,
  onClose,
  onUpload,
  currentFileName,
}: ResumeModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleChangeFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Upload Resume
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
          Upload your resume in <span className="text-blue-600 dark:text-blue-400 font-bold">PDF format</span> so companies can review your profile.
        </p>

        {/* Upload Zone */}
        <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 py-12 px-6 transition-colors">
          <div className="relative mb-5 flex flex-col items-center">
            <svg
              className="h-20 w-16 text-blue-100 dark:text-blue-900/40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <div className="absolute bottom-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-black text-white shadow-lg">
              PDF
            </div>
          </div>

          <p className="mb-6 text-center text-base font-bold text-gray-800 dark:text-gray-100 break-all">
            {selectedFile
              ? selectedFile.name
              : currentFileName || "No file selected"}
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          
          <button
            onClick={handleChangeFile}
            className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 px-6 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {selectedFile || currentFileName ? "Change File" : "Select File"}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleClose}
            className="order-2 sm:order-1 rounded-xl border border-gray-200 dark:border-gray-700 px-8 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="order-1 sm:order-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Now
          </button>
        </div>
      </div>
    </div>
  );
}