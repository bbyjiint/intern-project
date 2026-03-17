'use client'

import { useState } from 'react'

interface TranscriptUploadModalProps {
  isOpen: boolean
  onClose: () => void
  educationId: string
  onUploaded?: () => void  // เรียกเมื่อ verified สำเร็จ → refresh education list
  onNeedEdit?: () => void  // เรียกเมื่อ mismatch → เปิด edit modal
}

type Step = 'upload' | 'analyzing' | 'success' | 'mismatch' | 'error'

interface MismatchField {
  field: string
  profile: string
  transcript: string
}

interface VerifyResult {
  verified: boolean
  extractedData?: Record<string, string>
  mismatches?: MismatchField[]
  error?: string
  message?: string
}

export default function TranscriptUploadModal({
  isOpen,
  onClose,
  educationId,
  onUploaded,
  onNeedEdit,
}: TranscriptUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [result, setResult] = useState<VerifyResult | null>(null)

  if (!isOpen) return null

  const reset = () => {
    setFile(null)
    setStep('upload')
    setResult(null)
  }

  const handleClose = () => {
    if (step === 'analyzing') return
    reset()
    onClose()
  }

  const handleVerify = async () => {
    if (!file) return
    setStep('analyzing')

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(
        `${API_BASE_URL}/api/candidates/education/${educationId}/transcript`,
        { method: 'POST', credentials: 'include', body: formData }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Upload failed')
      }

      const data: VerifyResult = await res.json()
      setResult(data)
      setStep(data.verified ? 'success' : 'mismatch')
    } catch (err: any) {
      setResult({ verified: false, message: err.message || 'An unexpected error occurred' })
      setStep('error')
    }
  }

  const handleConfirm = () => {
    onUploaded?.()
    reset()
    onClose()
  }

  const handleGoEdit = () => {
    onNeedEdit?.()
    reset()
    onClose()
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── UPLOAD ── */}
        {step === 'upload' && (
          <>
            <div className="flex justify-between items-start p-8 pb-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1C2D4F] mb-1">Upload Transcript</h2>
                <p className="text-[#64748B] text-sm">
                  Upload your transcript to verify your education information.
                </p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 pb-6">
              <div
                className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors
                  ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-[#CBD5E1]'}
                  ${file ? 'border-green-400 bg-green-50/30' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="transcript-upload"
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="transcript-upload" className="flex flex-col items-center cursor-pointer w-full">
                  <div className="mb-4">
                    {file ? (
                      <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 16V3" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-[#334155] font-bold text-base mb-4">
                    {file ? file.name : 'Drag and drop your file here'}
                  </h3>
                  <div className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg text-sm font-medium mb-4 hover:bg-blue-700 transition-colors shadow-sm">
                    {file ? 'Change File' : 'Select File'}
                  </div>
                  <p className="text-[#94A3B8] text-xs">PDF or DOCX format. Max size: 5 MB</p>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 pb-8">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg border border-[#CBD5E1] text-[#64748B] font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={!file}
                className="px-8 py-2.5 rounded-lg bg-[#2563EB] text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Verify
              </button>
            </div>
          </>
        )}

        {/* ── ANALYZING ── */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Transcript...</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              AI is reading and comparing your transcript with the information you provided. Please wait.
            </p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <>
            <div className="flex flex-col items-center pt-12 pb-6 px-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Successfully Verified!</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                All information matches your transcript. Your education badge will be updated to{' '}
                <span className="font-semibold text-green-600">Verified by Transcript</span>.
              </p>
            </div>

            {result?.extractedData && Object.keys(result.extractedData).length > 0 && (
              <div className="mx-8 mb-6 bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 mb-3 uppercase tracking-wide">
                  Verified Information
                </p>
                <div className="space-y-2">
                  {Object.entries(result.extractedData).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-500 w-32 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium text-gray-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center px-8 pb-8">
              <button
                onClick={handleConfirm}
                className="px-10 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </>
        )}

        {/* ── MISMATCH ── */}
        {step === 'mismatch' && (
          <>
            <div className="flex flex-col items-center pt-10 pb-4 px-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Information Doesn't Match</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                The following fields differ from your uploaded transcript.
                Please edit your profile to match, then try again.
              </p>
            </div>

            {result?.mismatches && result.mismatches.length > 0 && (
              <div className="mx-8 mb-6 border border-yellow-200 bg-yellow-50 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-yellow-100 border-b border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">
                    Fields That Don't Match
                  </p>
                </div>
                <div className="divide-y divide-yellow-100">
                  {result.mismatches.map((m, i) => (
                    <div key={i} className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{m.field}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <p className="text-gray-400 mb-0.5">Your Profile</p>
                          <p className="font-semibold text-gray-700">{m.profile}</p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 border border-red-200">
                          <p className="text-red-400 mb-0.5">From Transcript</p>
                          <p className="font-semibold text-red-600">{m.transcript}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3 px-8 pb-8">
              <button
                onClick={reset}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Try Another File
              </button>
              <button
                onClick={handleGoEdit}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                Go Edit Profile
              </button>
            </div>
          </>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <>
            <div className="flex flex-col items-center pt-12 pb-6 px-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Failed</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {result?.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
            <div className="flex justify-center px-8 pb-8">
              <button
                onClick={reset}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}