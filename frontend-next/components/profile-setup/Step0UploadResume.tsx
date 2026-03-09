"use client";

import { useState, useRef, useEffect } from "react";

interface Step0UploadResumeProps {
  data: any;
  onUpdate: (data: any) => void;
  onSkip?: () => void;
}

export default function Step0UploadResume({
  data,
  onUpdate,
  onSkip,
}: Step0UploadResumeProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // resumeUrl ใช้แค่เพื่อแสดงว่ามีไฟล์อยู่ (อาจเป็น local blob URL หรือ URL จาก DB)
  const [resumeUrl, setResumeUrl] = useState<string | null>(
    data.resumeUrl || null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.resumeUrl) {
      setResumeUrl(data.resumeUrl);
    }
  }, [data.resumeUrl]);

  // ★ เพิ่มตรงนี้ — ดัก Leave without saving แล้วกลับมา
useEffect(() => {
    if (!data._pendingResumeFile && !data.resumeUrl) {
      setResumeFile(null);
      setResumeUrl(null);
    }
  }, [data._pendingResumeFile, data.resumeUrl]);

  const validateFile = (file: File): string | null => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".pdf", ".docx"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      return "Invalid file type. Please upload a PDF or DOCX file.";
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size exceeds 5 MB limit. Please choose a smaller file.";
    }

    return null;
  };

  // ★ ไม่ call API ที่นี่อีกต่อไป — แค่เก็บไฟล์ไว้ใน state
  // การ upload จริงจะเกิดใน handleSave ของ page.tsx
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setResumeFile(file);

    // สร้าง local URL แค่เพื่อแสดง UI ว่าเลือกไฟล์แล้ว
    const localUrl = URL.createObjectURL(file);
    setResumeUrl(localUrl);

    // ★ ส่ง _pendingResumeFile ขึ้นไปให้ parent รู้ว่ามีไฟล์รอ upload
    onUpdate({
      resumeUrl: localUrl,
      resumeFile: file.name,
      _pendingResumeFile: file,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (resumeUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(resumeUrl);
    }

    setResumeFile(null);
    setResumeUrl(null);
    setError(null);
    // ★ ล้าง _pendingResumeFile ด้วย
    onUpdate({ resumeUrl: null, resumeFile: null, _pendingResumeFile: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {/* Header with Skip Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#1C2D4F", fontWeight: 700 }}
          >
            Upload Your Resume
          </h2>
          <p className="text-sm" style={{ color: "#A9B4CD" }}>
            Please upload your resume before saving this step.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{
              border: "2px solid #0273B1",
              color: "#0273B1",
              backgroundColor: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F0F4F8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            Skip &gt;
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {resumeUrl ? (
        /* ── File selected state ─────────────────────────────────────────── */
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center"
          style={{ borderColor: "#0273B1", backgroundColor: "#F0F8FF" }}
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-3"
              style={{ color: "#0273B1" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#1C2D4F" }}>
                {resumeFile?.name || data.resumeFile || "Resume uploaded"}
              </p>
            </div>
            <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
              {/* ★ ถ้าเป็นไฟล์ใหม่ (pending) แสดงข้อความต่างกัน */}
              {data._pendingResumeFile
                ? "File selected. Press Save to upload."
                : "File uploaded successfully. You can now save this step."}
            </p>
            <button
              onClick={handleRemoveFile}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: "#EF4444", backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Remove and upload another
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ───────────────────────────────────────────────────── */
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-4"
              style={{ color: "#0273B1" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            <p
              className="text-sm font-medium mb-4"
              style={{ color: "#1C2D4F" }}
            >
              Drag and drop your resume here, or
            </p>
            <button
              onClick={handleSelectFileClick}
              className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: "#0273B1", minWidth: "140px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#025a8f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0273B1";
              }}
            >
              Select File
            </button>
            <p className="text-xs mt-2" style={{ color: "#A9B4CD" }}>
              PDF or DOCX format. Max size: 5 MB
            </p>
          </div>
        </div>
      )}

      {/* AI Analysis Checkbox */}
      <div className="flex items-center mt-6">
        <input
          type="checkbox"
          id="use-ai"
          checked={useAI}
          onChange={(e) => setUseAI(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
          style={{ accentColor: "#0273B1" }}
        />
        <label
          htmlFor="use-ai"
          className="ml-2 text-sm"
          style={{ color: "#1C2D4F" }}
        >
          Use AI to analyze my resume and autofill my profile
        </label>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
