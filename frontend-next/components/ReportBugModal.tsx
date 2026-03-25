"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportBugModal({ isOpen, onClose }: ReportBugModalProps) {
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ป้องกันการเลื่อนหน้าจอเบื้องหลังเมื่อ Modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSuccess(false);

    if (description.trim().length < 10) {
      setError("Please enter at least 10 characters to help us understand the issue.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      form.append("description", description.trim());
      form.append("pageUrl", window.location.href);
      form.append("referrerUrl", document.referrer || "");
      if (screenshot) form.append("screenshot", screenshot);

      await apiFetch("/api/bug-reports", {
        method: "POST",
        body: form,
      });

      setSuccess(true);
      setDescription("");
      setScreenshot(null);

      // Give a moment so the user sees success, then close.
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bug report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDescription("");
    setScreenshot(null);
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative flex flex-col border-t sm:border border-gray-100 dark:border-slate-800 transform transition-all max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Mobile Handle (UI Decor) */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden" />

        {/* Header Section */}
        <div className="flex justify-between items-center mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 id="modal-title" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">
              Report a Bug
            </h2>
          </div>
          
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-all shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-visible">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
            Description
          </label>
          <textarea
            value={description}
            autoFocus
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError(""); 
            }}
            placeholder="What happened? Please describe the steps..."
            className={`w-full min-h-[160px] md:h-48 p-4 bg-slate-50 dark:bg-slate-800/40 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all text-[15px] leading-relaxed
              ${error 
                ? "border-red-500 focus:ring-red-500 text-red-900 dark:text-red-100" 
                : "border-slate-200 dark:border-slate-700 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              }`}
          ></textarea>
          
          <div className="flex justify-between items-center mt-2 px-1 gap-4">
            {error ? (
              <p className="text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1.5 leading-tight">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                Minimum 10 characters
              </p>
            )}
            <span className={`text-[11px] font-medium shrink-0 ${description.length >= 10 ? 'text-green-500' : 'text-slate-400'}`}>
              {description.length} chars
            </span>
          </div>

          <div className="mt-5 md:mt-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5 ml-1">
              Screenshot (optional)
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                className="block w-full text-xs md:text-sm text-slate-500
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-xl file:border-0
                  file:text-xs file:font-bold
                  file:bg-slate-100 dark:file:bg-slate-800
                  file:text-slate-700 dark:file:text-slate-200
                  hover:file:bg-slate-200 dark:hover:file:bg-slate-700
                  file:transition-colors file:cursor-pointer cursor-pointer"
              />
            </div>
            {screenshot && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium truncate">
                  {screenshot.name}
                </p>
                <button 
                  onClick={() => setScreenshot(null)}
                  className="ml-auto p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8 md:mt-10">
          <button
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl font-black text-[16px] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
              ${isSubmitting 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none" 
                : success 
                  ? "bg-green-500 text-white shadow-green-500/25" 
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-blue-500/25 dark:shadow-blue-900/20"
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : success ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                Submitted!
              </>
            ) : (
              "Submit Bug Report"
            )}
          </button>
          <button
            onClick={handleClose}
            className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}