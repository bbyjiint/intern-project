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

      const res = await fetch("http://localhost:5000/api/ai/parse-resume", {
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
      {/* Header — Skip compact, top-right */}
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-6">
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="mb-0.5 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-2xl md:font-bold">
            Upload Your Resume
          </h2>
          <p className="text-xs leading-snug text-[#64748B] dark:text-slate-400 md:text-sm md:leading-relaxed">
            <span className="md:hidden">
              Add your resume to provide recruiters an overview of your skills and experience.
            </span>
            <span className="hidden md:inline">
              Upload your resume to get started. You can autofill your profile using AI or fill in manually.
            </span>
          </p>
        </div>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 rounded-md border border-[#0273B1] bg-white px-2 py-1 text-xs font-semibold leading-none text-[#0273B1] transition-colors hover:bg-[#F0F4F8] dark:border-blue-400 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
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
        <div className="rounded-lg border-2 border-dashed border-[#0273B1] bg-[#F0F8FF] px-3 py-4 text-center dark:bg-blue-900/20 md:rounded-xl md:p-8">
          <div className="flex flex-col items-center justify-center">
            <svg
              className="mb-1.5 h-8 w-8 text-[#0273B1] md:mb-3 md:h-12 md:w-12"
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
              <p className="text-xs font-semibold text-[#1C2D4F] dark:text-slate-200 md:text-sm">
                {resumeFile?.name || data.resumeFile || "Resume uploaded"}
              </p>
            </div>
            <p className="mb-2 text-xs text-[#6B7280] dark:text-slate-400 md:mb-3">
              {data._pendingResumeFile
                ? "File selected. Press Save to upload."
                : "File uploaded successfully."}
            </p>
            <button
              onClick={handleRemoveFile}
              className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:underline md:px-4 md:py-2 md:text-sm"
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
          className={`rounded-lg border-2 border-dashed px-3 py-5 text-center transition-colors md:rounded-xl md:p-8 lg:p-12 ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-700"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="mb-2 h-8 w-8 text-[#0273B1] md:mb-4 md:h-12 md:w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <p className="mb-2 text-sm font-medium text-[#1C2D4F] dark:text-slate-200 md:mb-3">
              Drag and drop your resume here, or
            </p>
            <button
              type="button"
              onClick={handleSelectFileClick}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors md:px-6 md:py-2.5"
              style={{ backgroundColor: "#0273B1", minWidth: "100px" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#025a8f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; }}
            >
              Select File
            </button>
            <p className="mt-1.5 text-xs text-[#94A3B8] dark:text-slate-500 md:mt-2">
              PDF or DOCX · max 5 MB
            </p>
          </div>
        </div>
      )}

      {/* AI Autofill Options */}
      <div
        className={`mt-3 rounded-lg border p-3 transition-all duration-200 md:mt-5 md:rounded-xl md:p-4 ${
          useAI
            ? "border-[#0273B1] bg-[#F0F8FF] dark:bg-blue-900/20 dark:border-blue-500"
            : "border-gray-200 dark:border-slate-600 bg-[#FAFAFA] dark:bg-slate-700"
        }`}
      >
        <label htmlFor="use-ai" className="flex cursor-pointer select-none items-start gap-2 md:items-center md:gap-3">
          <input
            type="checkbox"
            id="use-ai"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 md:mt-0 md:h-5 md:w-5"
            style={{ accentColor: "#0273B1" }}
          />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium leading-snug text-[#1C2D4F] dark:text-slate-200 md:hidden">
              Auto-parse resume &amp; autofill profile
            </span>
            <span className="hidden text-sm font-semibold text-[#1C2D4F] dark:text-slate-200 md:inline">
              ✨ Use AI to analyze and autofill my profile
            </span>
            <p className="mt-0.5 hidden text-xs text-[#6B7280] dark:text-slate-400 md:block">
              AI will read your resume and fill in Profile, Education, Projects, and Skills automatically.
            </p>
          </div>
        </label>

        {useAI && (
          <div className="mt-3 border-t border-[#DBEAFE] pt-3 dark:border-slate-600 md:mt-4 md:pt-4">
            {!fileSelected ? (
              <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 md:rounded-lg md:px-4 md:text-sm">
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 text-sm text-[#374151] dark:text-slate-300">
                  Ready to analyze{" "}
                  <span className="font-medium break-all text-[#0273B1]">
                    {resumeFile?.name || data.resumeFile}
                  </span>
                </p>
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzing}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
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