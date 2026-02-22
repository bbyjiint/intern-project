'use client'

import { useState, useRef, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface Step0UploadResumeProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step0UploadResume({ data, onUpdate }: Step0UploadResumeProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(data.resumeUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data.resumeUrl) {
      setResumeUrl(data.resumeUrl)
    }
  }, [data.resumeUrl])

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validExtensions = ['.pdf', '.docx']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload a PDF or DOCX file.'
    }

    // Check file size (5 MB)
    const maxSize = 5 * 1024 * 1024 // 5 MB in bytes
    if (file.size > maxSize) {
      return 'File size exceeds 5 MB limit. Please choose a smaller file.'
    }

    return null
  }

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setResumeFile(file)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'RESUME')

      const result = await apiFetch<{ resume: { url: string; name: string } }>('/api/candidates/resumes', {
        method: 'POST',
        body: formData,
      })

      const uploadedUrl = result.resume?.url
      
      setResumeUrl(uploadedUrl)
      onUpdate({ resumeUrl: uploadedUrl, resumeFile: file.name })
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume. Please try again.')
      setResumeFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSelectFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
    setResumeUrl(null)
    setError(null)
    onUpdate({ resumeUrl: null, resumeFile: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C2D4F', fontWeight: 700 }}>
        Upload Your Resume
      </h2>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
        Add your resume to provide recruiters with an overview of your skills and experience.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {resumeUrl ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' }}>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-3" style={{ color: '#0273B1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium mb-2" style={{ color: '#1C2D4F' }}>
              {resumeFile?.name || 'Resume uploaded'}
            </p>
            <button
              onClick={handleRemoveFile}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ color: '#0273B1', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none'
              }}
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
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 mb-4"
              style={{ color: '#0273B1' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-base mb-4" style={{ color: '#374151' }}>
              Drag and drop your resume here, or
            </p>
            <button
              onClick={handleSelectFileClick}
              disabled={isUploading}
              className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0273B1', minWidth: '140px' }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }
              }}
            >
              {isUploading ? 'Uploading...' : 'Select File'}
            </button>
            <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
              PDF or DOCX format. Max size: 5 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
