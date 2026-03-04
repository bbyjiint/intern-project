'use client'

import { useState, useRef } from 'react'

interface ResumeSectionProps {
  resumeData?: {
    fileName: string;
    lastUpdated: string;
  };
  onFileChange?: (file: File) => void;
}

export default function ResumeSection({ resumeData, onFileChange }: ResumeSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      {/* Header with Icon */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 bg-blue-100 rounded-md">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Resume File
        </h2>
      </div>

      {/* File Card Container */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* PDF Icon Graphic */}
          <div className="relative flex flex-col items-center">
            <svg className="w-12 h-14 text-blue-100" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <div className="absolute bottom-1 bg-blue-600 text-[8px] font-bold text-white px-1 rounded-sm">
              PDF
            </div>
          </div>

          {/* File Information */}
          <div>
            <h3 className="text-md font-bold text-gray-800">
              {resumeData?.fileName || 'Simple Resume.pdf'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Upload lastest: {resumeData?.lastUpdated || '26/2/2026'}
            </p>
          </div>
        </div>

        {/* Change File Action */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileChange) onFileChange(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2 rounded-lg font-bold text-sm border-2 transition-all"
            style={{ 
              borderColor: '#4285F4',
              color: '#4285F4',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f7ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            Change File
          </button>
        </div>
      </div>
    </div>
  )
}