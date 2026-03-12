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

        // 💡 เพิ่มส่วนนี้เข้าไปครับ
      useEffect(() => {
        if (isModalOpen) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
    
        // คืนค่าเดิมเมื่อปิดหรือเปลี่ยนหน้า
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
    <div className="mb-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center space-x-2">
        <div className="rounded-md bg-blue-100 p-1.5">
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Resume File
        </h2>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-5">
        <div className="flex items-center space-x-4">
          <div className="relative flex flex-col items-center">
            <svg className="h-14 w-12 text-blue-100" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <div className="absolute bottom-1 rounded-sm bg-blue-600 px-1 text-[8px] font-bold text-white">
              PDF
            </div>
          </div>

          <div>
            <h3 className="text-md font-bold text-gray-800">
              {resumeData?.name || 'No resume uploaded yet'}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Upload latest: {formatResumeDate(resumeData?.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {resumeHref ? (
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
            >
              View File
            </a>
          ) : null}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isUploading}
            className="rounded-lg border-2 border-blue-500 bg-white px-5 py-2 text-sm font-bold text-blue-500 transition-all hover:bg-blue-50"
          >
            {isUploading ? 'Uploading...' : (resumeData?.name ? 'Change File' : 'Upload Resume')}
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