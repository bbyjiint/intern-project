"use client";

import { useState, useEffect } from "react";

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
}

export default function ReportBugModal({ isOpen, onClose, onSubmit }: ReportBugModalProps) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = () => {
    if (description.trim().length < 10) {
      setError("Please enter at least 10 characters to help us understand the issue.");
      return;
    }
    onSubmit(description);
    setDescription("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative flex flex-col border border-gray-100 dark:border-slate-800 transform transition-all"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 id="modal-title" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Report a Bug
            </h2>
          </div>
          
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-all"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 mb-6">
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
            placeholder="What happened? Please describe the steps to reproduce the bug..."
            className={`w-full h-48 p-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all text-[15px] leading-relaxed
              ${error 
                ? "border-red-500 focus:ring-red-500 text-red-900 dark:text-red-100" 
                : "border-slate-200 dark:border-slate-700 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              }`}
          ></textarea>
          
          <div className="flex justify-between items-center mt-2 px-1">
            {error ? (
              <p className="text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                Minimum 10 characters
              </p>
            )}
            <span className={`text-[11px] font-medium ${description.length >= 10 ? 'text-green-500' : 'text-slate-400'}`}>
              {description.length} characters
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 dark:shadow-blue-900/20 active:scale-[0.98]"
          >
            Submit Bug Report
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