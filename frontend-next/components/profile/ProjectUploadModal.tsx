"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

interface ProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any | null;
  onUpdate: (id: string, data: any) => void;
  onRefresh?: () => void;
}

interface VerifyChecks {
  repoExists: boolean;
  hasEnoughCommits: boolean;
}

export default function ProjectUploadModal({
  isOpen,
  onClose,
  project,
  onUpdate,
  onRefresh,
}: ProjectUploadModalProps) {
  const [githubUrl, setGithubUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [githubVerified, setGithubVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyChecks, setVerifyChecks] = useState<VerifyChecks | null>(null);
  const [commitCount, setCommitCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project && isOpen) {
      setGithubUrl(project.githubUrl || "");
      setProjectUrl(project.projectUrl || "");
      setGithubVerified(project.githubVerified || false);
      setVerifyError("");
      setVerifyChecks(null);
      setCommitCount(null);
      setFile(null);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleVerifyGithub = async () => {
    if (!githubUrl?.trim()) {
      setVerifyError("Please enter a GitHub URL to verify.");
      setGithubVerified(false);
      return;
    }
    setIsVerifying(true);
    setVerifyError("");
    setVerifyChecks(null);
    try {
      const data = await apiFetch<any>("/api/github/verify-github", {
        method: "POST",
        body: JSON.stringify({ githubUrl, projectId: project?.id }),
      });
      setVerifyChecks(data.checks || null);
      setCommitCount(data.data?.commitCount ?? null);
      if (data.success) {
        setGithubVerified(true);
      } else {
        setGithubVerified(false);
        setVerifyError(data.message || "Verification failed.");
      }
    } catch (error: any) {
      setGithubVerified(false);
      setVerifyError("Failed to connect to verification server.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpload = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      let uploadedFileUrl = project.fileUrl || "";
      let uploadedFileName = project.fileName || "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/candidates/projects/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploadedFileUrl = data.url;
        uploadedFileName = file.name;
      }

      await apiFetch(`/api/candidates/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...project,
          githubUrl,
          githubVerified,
          projectUrl,
          onUpdate,
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
        }),
      });

      onRefresh?.();
      onClose();
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ label, passed, detail }: { label: string; passed: boolean; detail?: string }) => (
    <div className="flex items-start gap-2 text-sm">
      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${passed ? "bg-emerald-500" : "bg-rose-500"}`}>
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {passed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </span>
      <span className={`font-medium ${passed ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
        {label} {detail && <span className="text-slate-400 dark:text-slate-500 font-normal">({detail})</span>}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-7 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upload Project Data</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Add links or files to showcase your work.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
          {/* GitHub Section */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              GitHub Repository URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setGithubVerified(false);
                    setVerifyError("");
                    setVerifyChecks(null);
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all pr-12 ${
                    githubVerified ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5" : verifyError ? "border-rose-500/50" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {githubVerified && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleVerifyGithub}
                disabled={isVerifying || !githubUrl || githubVerified}
                className="rounded-xl bg-blue-600 px-7 py-3 font-black text-white text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-40 shadow-lg shadow-blue-500/25"
              >
                {isVerifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : githubVerified ? "Verified" : "Verify"}
              </button>
            </div>

            {verifyChecks && (
              <div className={`p-4 rounded-2xl border-2 animate-in slide-in-from-top-2 duration-300 ${githubVerified ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-900/30"}`}>
                <div className="space-y-2.5">
                  <CheckItem label="Public Repository" passed={verifyChecks.repoExists} />
                  <CheckItem label="Contribution Depth" passed={verifyChecks.hasEnoughCommits} detail={commitCount !== null ? `${commitCount} commits found` : "Min. 3 required"} />
                </div>
              </div>
            )}
            
            {verifyError && (
              <p className="text-rose-500 dark:text-rose-400 text-xs font-bold flex items-center gap-2 px-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {verifyError}
              </p>
            )}
          </div>

          {/* Project Link */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Live Project URL</label>
            <input
              type="text"
              placeholder="https://your-project.com"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Project Documentation</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx" className="hidden" />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setIsDragging(false);
                if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-500/5" : file || project?.fileUrl ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-slate-500"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm ${file || project?.fileUrl ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400"}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {(file || project?.fileUrl) ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  )}
                </svg>
              </div>
              <p className="font-black text-slate-800 dark:text-slate-100 text-base mb-1">
                {file?.name || project?.fileName || "Drop project file here"}
              </p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                {file || project?.fileUrl ? "Click to change file" : "PDF or DOCX (Max 5MB)"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button onClick={onClose} disabled={loading} className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleUpload} 
            disabled={loading || isVerifying || (!githubUrl && !projectUrl && !file && !project?.fileUrl) || (githubUrl.trim().length > 0 && !githubVerified)} 
            className="px-10 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-blue-500/25 active:scale-95"
          >
            {loading ? "Processing..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}