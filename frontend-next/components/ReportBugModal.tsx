"use client";

import { useState } from "react";

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
}

export default function ReportBugModal({ isOpen, onClose, onSubmit }: ReportBugModalProps) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (description.trim().length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }
    onSubmit(description);
    setDescription(""); // เคลียร์ข้อความหลังจากส่ง
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={handleClose} // คลิกพื้นหลังเพื่อปิด
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative flex flex-col"
        onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกข้างในแล้วปิด
      >
        {/* Header & Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[22px] font-bold text-[#1C2D4F]">
            Send a Bug Report
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Text Area */}
        <div className="flex-1 mb-6">
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError(""); // เคลียร์ error เมื่อเริ่มพิมพ์
            }}
            placeholder="Please describe what happened, including steps to reproduce the issue (minimum 10 characters)"
            className={`w-full h-56 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm ${
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            }`}
          ></textarea>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-[15px]"
        >
          Send Report
        </button>
      </div>
    </div>
  );
}