'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import ResumeModal from './ResumeModal'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

interface ResumeSectionProps {
  resumeData?: {
    id?: string
    name?: string
    url?: string
    createdAt?: string
  }
  onRefresh?: () => void | Promise<void>
}

function formatResumeDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB')
}

export default function ResumeSection({ resumeData, onRefresh }: ResumeSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // ป้องกันการ Scroll เมื่อเปิด Modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const resumeHref = resumeData?.url
    ? (resumeData.url.startsWith('http') ? resumeData.url : `${API_BASE_URL}${resumeData.url}`)
    : null

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'RESUME')

    setIsUploading(true)
    try {
      await apiFetch('/api/candidates/resumes', {
        method: 'POST',
        body: formData,
      })
      await onRefresh?.()
    } finally {
      setIsUploading(false)
    }
  }

  return (
    // ปรับ Card ให้รองรับ Dark Mode และเพิ่ม Contrast ของ Border
    <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition-colors">
      
      {/* Header Section */}
      <div className="mb-5 flex items-center space-x-3">
        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
          Resume File
        </h2>
      </div>

      {/* Content Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-5">
        
        <div className="flex items-center space-x-4">
          {/* Resume Icon */}
          <div className="relative flex flex-col items-center shrink-0">
            <svg className="h-14 w-12 text-blue-200 dark:text-blue-900/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <div className="absolute bottom-1 rounded-sm bg-blue-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
              PDF
            </div>
          </div>

          {/* Text Info */}
          <div className="overflow-hidden">
            <h3 className="truncate text-base font-bold text-gray-800 dark:text-gray-100">
              {resumeData?.name || 'No resume uploaded yet'}
            </h3>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Uploaded: <span className="text-gray-700 dark:text-gray-300">{formatResumeDate(resumeData?.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full sm:w-auto items-center gap-3">
          {resumeHref && (
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm"
            >
              View File
            </a>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isUploading}
            className="flex-1 sm:flex-none rounded-lg border-2 border-blue-500 bg-transparent px-5 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : (resumeData?.name ? 'Change' : 'Upload Resume')}
          </button>
        </div>
      </div>

      <ResumeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        currentFileName={resumeData?.name}
      />
    </div>
  )
}