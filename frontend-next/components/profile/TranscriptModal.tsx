'use client'

import { useState, useEffect } from 'react'

export type VerificationStep = 'upload' | 'success' | 'mismatch' | 'error'

export interface MismatchField {
  field: string
  profile: string
  transcript: string
}

export interface VerifyResult {
  verified: boolean
  extractedData?: Record<string, string>
  mismatches?: MismatchField[]
  error?: string
  message?: string
}

interface TranscriptUploadModalProps {
  isOpen: boolean
  onClose: () => void
  step: VerificationStep
  result?: VerifyResult | null
  onStartVerification?: (file: File) => void
  onNeedEdit?: () => void
  onRetry?: () => void
  onSuccessConfirm?: () => void
}

export default function TranscriptUploadModal({
  isOpen,
  onClose,
  step,
  result,
  onStartVerification,
  onNeedEdit,
  onRetry,
  onSuccessConfirm
}: TranscriptUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // เคลียร์ไฟล์ทุกครั้งที่เปิด Modal หน้า Upload ใหม่
  useEffect(() => {
    if (isOpen && step === 'upload') {
      setFile(null);
    }
  }, [isOpen, step]);

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
  }

  const handleStart = () => {
    if (file && onStartVerification) {
      onStartVerification(file);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── UPLOAD STEP ── */}
        {step === 'upload' && (
          <>
            <div className="flex justify-between items-start p-8 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Upload Transcript</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Upload your transcript to verify your education information.
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 pb-6">
              <div
                className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300
                  ${isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-inner' : 'border-slate-200 dark:border-slate-700'}
                  ${file ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5' : ''}
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
                <label htmlFor="transcript-upload" className="flex flex-col items-center cursor-pointer w-full text-center">
                  <div className="mb-4">
                    {file ? (
                      <div className="bg-emerald-100 dark:bg-emerald-500/20 p-4 rounded-full">
                        <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="bg-blue-100 dark:bg-blue-500/20 p-4 rounded-full">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 16V3" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-slate-800 dark:text-slate-100 font-black text-lg mb-2 truncate max-w-xs">
                    {file ? file.name : 'Drag and drop your file here'}
                  </h3>
                  <div className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest mb-4 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                    {file ? 'Change File' : 'Select File'}
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wide">PDF or DOCX • Max size 5 MB</p>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 pb-8">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                disabled={!file}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
              >
                Upload & Verify
              </button>
            </div>
          </>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <>
            <div className="flex flex-col items-center pt-16 pb-6 px-8 text-center transition-all animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50 dark:ring-emerald-500/5">
                <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Verified!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm">
                Your education is now <span className="text-emerald-600 dark:text-emerald-400 font-black">AI Verified</span>. A badge will be added to your profile.
              </p>
            </div>

            {result?.extractedData && (
              <div className="mx-8 mb-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-all">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-4 uppercase tracking-[0.2em]">Verified Data Point</p>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(result.extractedData).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-700/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-400 dark:text-slate-500 font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-black text-slate-800 dark:text-slate-100">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center px-8 pb-10">
              <button onClick={onSuccessConfirm} className="px-12 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs">
                Close & Done
              </button>
            </div>
          </>
        )}

        {/* ── MISMATCH STEP ── */}
        {step === 'mismatch' && (
          <>
            <div className="flex flex-col items-center pt-12 pb-4 px-8 text-center animate-in slide-in-from-bottom-4 duration-300">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Data Mismatch</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm">
                Some fields on your profile don't match the transcript. Please correct them to get verified.
              </p>
            </div>

            <div className="px-8 mb-8">
              <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl overflow-hidden shadow-sm transition-all">
                <div className="px-5 py-3 bg-amber-100 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20">
                  <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Mismatch Report</p>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-amber-100 dark:divide-amber-500/10">
                  {result?.mismatches?.map((m, i) => (
                    <div key={i} className="p-5">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tighter">{m.field}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Your Profile</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">{m.profile}</p>
                        </div>
                        <div className="bg-white dark:bg-rose-500/5 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
                          <p className="text-[10px] text-rose-400 font-black uppercase mb-1">Transcript</p>
                          <p className="font-bold text-rose-600 dark:text-rose-400 text-sm truncate">{m.transcript}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 px-8 pb-10">
              <button onClick={onRetry} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Retry File
              </button>
              <button onClick={onNeedEdit} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs">
                Edit My Profile
              </button>
            </div>
          </>
        )}

        {/* ── ERROR STEP ── */}
        {step === 'error' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col items-center pt-16 pb-8 px-8 text-center">
              <div className="w-24 h-24 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50 dark:ring-rose-500/5">
                <svg className="w-12 h-12 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Upload Failed</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xs leading-relaxed">
                {result?.message || 'We encountered an error processing your file. Please try again.'}
              </p>
            </div>
            <div className="flex justify-center px-8 pb-10">
              <button onClick={onRetry} className="px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-xl shadow-rose-500/20 uppercase tracking-widest text-xs">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}