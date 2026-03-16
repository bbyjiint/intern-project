'use client'

import { useState } from 'react'

interface TranscriptUploadModalProps {
  isOpen: boolean
  onClose: () => void
  educationId: string
  onUploaded?: () => void
}

export default function TranscriptUploadModal({
  isOpen,
  onClose,
  educationId,
  onUploaded
}: TranscriptUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  if (!isOpen) return null

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setIsUploading(true)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
      const response = await fetch(`${API_BASE_URL}/api/candidates/education/${educationId}/transcript`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload transcript");
      }

      onUploaded?.()
      setFile(null)
      onClose()

    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload transcript")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-8 pb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[#1C2D4F] mb-1">
              Upload Transcript
            </h2>
            <p className="text-[#64748B] text-sm">
              Upload your transcript to verify your education information.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div className="px-8 pb-8">
          <div 
            className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors
              ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-[#CBD5E1] bg-white'}
              ${file ? 'border-green-400 bg-green-50/30' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="transcript-file-upload"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            
            <label 
              htmlFor="transcript-file-upload" 
              className="flex flex-col items-center cursor-pointer w-full"
            >
              {/* Upload Icon */}
              <div className="mb-4">
                {file ? (
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V3" />
                    <path d="M7 8l5-5 5 5" />
                    <path d="M5 21h14" />
                  </svg>
                )}
              </div>

              {/* Text */}
              <h3 className="text-[#334155] font-bold text-base mb-4">
                {file ? file.name : "Drag and drop your file here"}
              </h3>

              {/* Select File Button Lookalike */}
              <div className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg text-sm font-medium mb-4 hover:bg-blue-700 transition-colors shadow-sm">
                {file ? "Change File" : "Select File"}
              </div>

              {/* Helper Text */}
              <p className="text-[#94A3B8] text-xs">
                PDF or DOCX format. Max size: 5 MB
              </p>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 px-8 pb-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-[#CBD5E1] text-[#64748B] font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-8 py-2.5 rounded-lg bg-[#2563EB] text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isUploading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  )
}