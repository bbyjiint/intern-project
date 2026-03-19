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
  const [resumeUrl, setResumeUrl] = useState<string | null>(
    data.resumeUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.resumeUrl) setResumeUrl(data.resumeUrl);
  }, [data.resumeUrl]);

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
    if (file.size > 5 * 1024 * 1024) {
      return "File size exceeds 5 MB limit. Please choose a smaller file.";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setResumeFile(file);
    setAiDone(false);
    const localUrl = URL.createObjectURL(file);
    setResumeUrl(localUrl);
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

  const handleSelectFileClick = () => fileInputRef.current?.click();

  const handleRemoveFile = () => {
    if (resumeUrl?.startsWith("blob:")) URL.revokeObjectURL(resumeUrl);
    setResumeFile(null);
    setResumeUrl(null);
    setError(null);
    setAiDone(false);
    onUpdate({ resumeUrl: null, resumeFile: null, _pendingResumeFile: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyzeResume = async () => {
    const file = data._pendingResumeFile as File | null;
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const uploadForm = new FormData();
      uploadForm.append("resume", file);

      const res = await fetch("http://localhost:5001/api/ai/parse-resume", {
        method: "POST",
        body: uploadForm,
        credentials: "include",
      });

      if (!res.ok) throw new Error("AI analysis failed");

      const result = await res.json();
      const parsed = result.parsedData;

      if (!parsed) throw new Error("No data returned");

      const nameParts = (parsed.fullName || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      onUpdate({
        ...(firstName && { firstName, _aiFilled_firstName: true }),
        ...(lastName  && { lastName,  _aiFilled_lastName:  true }),
        ...(parsed.email && { email: parsed.email, _aiFilled_email: true }),
        ...(parsed.phoneNumber && { phoneNumber: parsed.phoneNumber, _aiFilled_phoneNumber: true }),
        ...(parsed.bio && { aboutYou: parsed.bio, _aiFilled_aboutYou: true }),
        ...(parsed.education?.length > 0 && { education: parsed.education, _aiFilled_education: true }),
        ...(parsed.projects?.length > 0 && {
          projects: parsed.projects.map((p: any) => ({ ...p, _aiTag: true })),
          _aiFilled_projects: true,
        }),
        ...(parsed.skills?.length > 0 && {
          skills: parsed.skills.map((s: any) =>
            typeof s === "string"
              ? { name: s, category: "technical", level: "beginner", _aiTag: true }
              : { category: "technical", level: "beginner", ...s, _aiTag: true }
          ),
          _aiFilled_skills: true,
        }),
        _aiAutofilled: true,
      });

      setAiDone(true);
    } catch (err) {
      console.error("AI parse error:", err);
      setError("AI could not analyze your resume. Please try again or fill in manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileSelected = !!resumeUrl;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-[#1C2D4F] dark:text-slate-100">
            Upload Your Resume
          </h2>
          <p className="text-sm text-[#A9B4CD] dark:text-slate-400">
            Upload your resume to get started. You can autofill your profile using AI or fill in manually.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors border-2 border-[#0273B1] text-[#0273B1] bg-white dark:bg-slate-700 dark:text-blue-400 dark:border-blue-400 hover:bg-[#F0F4F8] dark:hover:bg-slate-600"
          >
            Skip &gt;
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Drop Zone / File Selected */}
      {fileSelected ? (
        <div className="border-2 border-dashed rounded-xl p-8 text-center border-[#0273B1] bg-[#F0F8FF] dark:bg-blue-900/20">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-3 text-[#0273B1]"
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
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-[#1C2D4F] dark:text-slate-200">
                {resumeFile?.name || data.resumeFile || "Resume uploaded"}
              </p>
            </div>
            <p className="text-xs mb-3 text-[#6B7280] dark:text-slate-400">
              {data._pendingResumeFile
                ? "File selected. Press Save to upload."
                : "File uploaded successfully."}
            </p>
            <button
              onClick={handleRemoveFile}
              className="text-sm px-4 py-2 rounded-lg font-medium text-red-500 hover:underline transition-colors"
            >
              Remove and upload another
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700"
          }`}
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-4 text-[#0273B1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <p className="text-sm font-medium mb-4 text-[#1C2D4F] dark:text-slate-200">
              Drag and drop your resume here, or
            </p>
            <button
              onClick={handleSelectFileClick}
              className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: "#0273B1", minWidth: "140px" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#025a8f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; }}
            >
              Select File
            </button>
            <p className="text-xs mt-2 text-[#A9B4CD] dark:text-slate-500">
              PDF or DOCX format. Max size: 5 MB
            </p>
          </div>
        </div>
      )}

      {/* AI Autofill Options */}
      <div
        className={`mt-5 rounded-xl border p-4 transition-all duration-200 ${
          useAI
            ? "border-[#0273B1] bg-[#F0F8FF] dark:bg-blue-900/20 dark:border-blue-500"
            : "border-gray-200 dark:border-slate-600 bg-[#FAFAFA] dark:bg-slate-700"
        }`}
      >
        <label htmlFor="use-ai" className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            id="use-ai"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300"
            style={{ accentColor: "#0273B1" }}
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-[#1C2D4F] dark:text-slate-200">
              ✨ Use AI to analyze and autofill my profile
            </span>
            <p className="text-xs mt-0.5 text-[#6B7280] dark:text-slate-400">
              AI will read your resume and fill in Profile, Education, Projects, and Skills automatically.
            </p>
          </div>
        </label>

        {useAI && (
          <div className="mt-4 pt-4 border-t border-[#DBEAFE] dark:border-slate-600">
            {!fileSelected ? (
              <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Please upload a resume file first to use AI autofill.
              </div>
            ) : aiDone ? (
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-green-100 dark:bg-green-900/30">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Profile autofilled successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    AI has filled in your profile fields. Fields marked with{" "}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                      ✨ AI filled
                    </span>{" "}
                    were autofilled. You can edit them anytime.
                  </p>
                  <button onClick={handleAnalyzeResume} className="mt-2 text-xs underline text-[#0273B1]">
                    Re-analyze resume
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#374151] dark:text-slate-300">
                  Ready to analyze{" "}
                  <span className="font-medium text-[#0273B1]">
                    {resumeFile?.name || data.resumeFile}
                  </span>
                </p>
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors shrink-0"
                  style={{
                    backgroundColor: isAnalyzing ? "#93C5FD" : "#0273B1",
                    cursor: isAnalyzing ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => { if (!isAnalyzing) e.currentTarget.style.backgroundColor = "#025a8f"; }}
                  onMouseLeave={(e) => { if (!isAnalyzing) e.currentTarget.style.backgroundColor = "#0273B1"; }}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.6 3.6 0 0114 18.6V19a2 2 0 11-4 0v-.4a3.6 3.6 0 01-1.062-2.563l-.347-.347z" />
                      </svg>
                      Analyze &amp; Autofill
                    </>
                  )}
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-3">
                <div className="flex gap-1.5 items-center mb-1.5">
                  {["Reading resume...", "Extracting data...", "Filling profile..."].map((label, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: "#0273B1",
                          animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                          opacity: 0.7,
                        }}
                      />
                      <span className="text-xs text-[#6B7280] dark:text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-blue-100 dark:bg-slate-600">
                  <div
                    className="h-full rounded-full bg-[#0273B1]"
                    style={{ width: "60%", animation: "shimmer 1.5s ease-in-out infinite" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {fileSelected && !useAI && (
        <p className="mt-3 text-xs text-[#9CA3AF] dark:text-slate-500">
          Resume will be saved to your profile. Tick the checkbox above to autofill fields with AI.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}