'use client'

import { useState, useRef } from 'react'

interface ResumeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  currentFileName?: string
}

export default function ResumeModal({ isOpen, onClose, onUpload, currentFileName }: ResumeModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Upload Resume</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          Upload your resume so companies can review your profile.
        </p>

        {/* Upload Zone */}
        <div className="mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-white py-12">
          <div className="relative mb-4 flex flex-col items-center">
            <svg className="h-16 w-14 text-blue-100" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <div className="absolute bottom-1 rounded-sm bg-blue-600 px-1 text-[10px] font-bold text-white">
              PDF
            </div>
          </div>
          
          <p className="mb-4 font-bold text-gray-700">
            {selectedFile ? selectedFile.name : (currentFileName || 'Simple Resume.pdf')}
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            Change File
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="rounded-lg bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}