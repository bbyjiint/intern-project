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
        ...(lastName && { lastName, _aiFilled_lastName: true }),
        ...(parsed.email && { email: parsed.email, _aiFilled_email: true }),
        ...(parsed.phoneNumber && {
          phoneNumber: parsed.phoneNumber,
          _aiFilled_phoneNumber: true,
        }),
        ...(parsed.bio && { aboutYou: parsed.bio, _aiFilled_aboutYou: true }),
        ...(parsed.education?.length > 0 && {
          education: parsed.education,
          _aiFilled_education: true,
        }),
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
      setError("AI could not analyze your resume. Please try manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileSelected = !!resumeUrl;

  return (
    <div className="w-full transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            Upload Your Resume
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload your resume to get started. You can autofill your profile using AI or fill in manually.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all
                     border-2 border-sky-600 text-sky-600 bg-white
                     dark:border-sky-500 dark:text-sky-400 dark:bg-transparent
                     hover:bg-sky-50 dark:hover:bg-sky-900/30"
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

      {/* ── Drop Zone / File Selected ─────────────────────────────────────── */}
      {fileSelected ? (
        <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all
                      border-sky-500 bg-sky-50 dark:bg-sky-900/10 dark:border-sky-400">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-3 text-sky-600 dark:text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {resumeFile?.name || data.resumeFile || "Resume uploaded"}
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {data._pendingResumeFile ? "Ready to save" : "File successfully attached"}
            </p>
            <button
              onClick={handleRemoveFile}
              className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline transition-all"
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
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-sky-400"
          }`}
          onClick={handleSelectFileClick}
        >
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-sky-100 dark:bg-sky-900/30 mb-4">
              <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white mb-2">
              Drag and drop your resume here
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              or click to browse from your computer
            </p>
            <div className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md transition-all">
              Select File
            </div>
            <p className="text-xs mt-4 text-slate-400 dark:text-slate-500 font-medium">
              PDF or DOCX (Max 5 MB)
            </p>
          </div>
        </div>
      )}

      {/* ── AI Autofill Options ───────────────────────────────────────────── */}
      <div
        className={`mt-6 rounded-xl border transition-all duration-300 ${
          useAI 
            ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/10 shadow-sm" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
        } p-5`}
      >
        <label htmlFor="use-ai" className="flex items-center gap-4 cursor-pointer group">
          <input
            type="checkbox"
            id="use-ai"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:bg-slate-700 dark:border-slate-600"
          />
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              ✨ Use AI to analyze and autofill my profile
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              AI will automatically populate your profile, education, projects, and skills.
            </p>
          </div>
        </label>

        {useAI && (
          <div className="mt-5 pt-5 border-t border-sky-100 dark:border-sky-900/30">
            {!fileSelected ? (
              <div className="flex items-center gap-3 text-sm px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 font-medium">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Please upload a resume first to use AI features.
              </div>
            ) : aiDone ? (
              <div className="flex items-start gap-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Profile autofilled successfully!
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Check the fields marked with <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold">✨ AI filled</span>. You can review and edit them.
                  </p>
                  <button
                    onClick={handleAnalyzeResume}
                    className="mt-3 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Re-analyze resume
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ready to process: <span className="text-sky-600 dark:text-sky-400 font-bold">{resumeFile?.name || data.resumeFile}</span>
                </p>
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-lg
                    ${isAnalyzing ? "bg-slate-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"}`}
                >
                  {isAnalyzing ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Analyzing...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Analyze & Autofill</>
                  )}
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-4">
                <div className="flex gap-4 items-center mb-3">
                  {["Reading...", "Extracting...", "Mapping..."].map((label, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-sky-500 w-1/2 rounded-full animate-shimmer" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
          width: 40%;
        }
      `}</style>
    </div>
  );
}