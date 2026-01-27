'use client'

import { useState, useEffect, useRef, memo, useCallback } from 'react'

interface Step2JobDescriptionProps {
  data: any
  onUpdate: (data: any) => void
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder: string
  maxLength: number
}

// Move RichTextEditor outside to prevent remounting on parent re-renders
const RichTextEditor = memo(({ value, onChange, onBlur, placeholder, maxLength }: RichTextEditorProps) => {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setIsBold(!isBold)
          }}
          className={`p-2 rounded ${isBold ? 'bg-blue-100' : ''}`}
          style={{ color: isBold ? '#0273B1' : '#6B7280' }}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setIsItalic(!isItalic)
          }}
          className={`p-2 rounded ${isItalic ? 'bg-blue-100' : ''}`}
          style={{ color: isItalic ? '#0273B1' : '#6B7280' }}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setIsUnderline(!isUnderline)
          }}
          className={`p-2 rounded ${isUnderline ? 'bg-blue-100' : ''}`}
          style={{ color: isUnderline ? '#0273B1' : '#6B7280' }}
        >
          <span className="underline">U</span>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="p-2 rounded text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="p-2 rounded text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </button>
      </div>
      {/* Text Area */}
      <div className="relative">
        <textarea
          value={value ?? ''}
          onChange={(e) => {
            const newValue = e.target.value
            onChange(newValue)
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 min-h-[200px] border-0 focus:ring-0 focus:outline-none resize-none bg-white"
          style={{
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
          }}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">
          {(value ?? '').length}/{maxLength.toLocaleString()}
        </div>
      </div>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default function Step2JobDescription({ data, onUpdate }: Step2JobDescriptionProps) {
  const [localData, setLocalData] = useState(data || {
    jobDescription: '',
    jobSpecification: '',
  })
  const localDataRef = useRef(localData)
  const isInitialMount = useRef(true)

  // Keep ref in sync with state
  useEffect(() => {
    localDataRef.current = localData
  }, [localData])

  // Sync to parent only when component unmounts (when navigating away from this step)
  useEffect(() => {
    return () => {
      onUpdate(localDataRef.current)
    }
  }, [onUpdate])

  // Initialize local state from props on mount
  // If navigating back to this step, merge with existing local data (preserve user input)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLocalData(data)
    }
  }, []) // Only initialize once on mount

  const handleChange = useCallback((field: string, value: string) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }))
  }, [])

  const handleBlur = useCallback(() => {
    // Sync to parent on blur
    onUpdate(localDataRef.current)
  }, [onUpdate])

  const handleJobDescriptionChange = useCallback((value: string) => {
    handleChange('jobDescription', value)
  }, [handleChange])

  const handleJobSpecificationChange = useCallback((value: string) => {
    handleChange('jobSpecification', value)
  }, [handleChange])

  return (
    <div>
      <h2 className="text-xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Job Description
      </h2>

      {/* Job Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1C2D4F' }}>
          Job Description
        </h3>
        <RichTextEditor
          value={localData.jobDescription ?? ''}
          onChange={handleJobDescriptionChange}
          onBlur={handleBlur}
          placeholder="Write your job description"
          maxLength={10000}
        />
      </div>

      {/* Job Specification */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1C2D4F' }}>
          Job Specification
        </h3>
        <RichTextEditor
          value={localData.jobSpecification ?? ''}
          onChange={handleJobSpecificationChange}
          onBlur={handleBlur}
          placeholder="Write your job specification"
          maxLength={5000}
        />
      </div>
    </div>
  )
}
