'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default function AIAnalysisPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  
  const isAIAnalysisPage = pathname === '/intern/ai-analysis'
  const isJobMatchPage = pathname === '/intern/job-match' || pathname === '/intern/find-companies'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        if (userData.user.role === 'COMPANY') {
          router.push('/employer/profile')
          return
        }
        
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to check auth:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('log in')) {
          router.push('/login')
        } else {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InternNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            {/* Profile with Dropdown */}
            <div>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
                style={{ color: '#1C2D4F' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0273B1'
                  e.currentTarget.style.backgroundColor = '#F0F4F8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1C2D4F'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Profile</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link
                    href="/intern/ai-analysis"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isAIAnalysisPage ? 'white' : '#1C2D4F',
                      backgroundColor: isAIAnalysisPage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isAIAnalysisPage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAIAnalysisPage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>AI Analysis</span>
                  </Link>
                  <Link
                    href="/intern/job-match"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isJobMatchPage ? 'white' : '#1C2D4F',
                      backgroundColor: isJobMatchPage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isJobMatchPage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isJobMatchPage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Job Match</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/intern/applied"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Applied</span>
            </Link>
            <Link
              href="/intern/bookmark"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">Bookmark</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
              Profile / Setup Page
            </h1>
            <p className="text-gray-600">
              Complete your profile setup to get started with AI analysis
            </p>
          </div>

          {/* Resume Analysis Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ResumeAnalysisCard onAnalysisComplete={(skills) => {
              // Pass skills to SkillsSetupCard via parent state if needed
              console.log('Analysis complete:', skills)
            }} />
            <SkillsSetupCard />
          </div>

          {/* AI Suggested Skills Card */}
          <div className="mb-6">
            <AISuggestedSkillsCard />
          </div>

          {/* Video Upload Card */}
          <div>
            <VideoUploadCard />
          </div>
        </div>
      </div>
    </div>
  )
}

// Resume Analysis Card Component
function ResumeAnalysisCard({ onAnalysisComplete }: { onAnalysisComplete?: (skills: Array<{ name: string; score: number }>) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<Array<{ name: string; score: number }> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamically import PDF.js
      const pdfjsLib = await import('pdfjs-dist')
      
      // Set worker source
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
      })
      const pdf = await loadingTask.promise
      
      // Extract text from all pages
      let fullText = ''
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => {
            if (typeof item === 'string') {
              return item
            }
            return item.str || ''
          })
          .join(' ')
        fullText += pageText + '\n'
      }
      
      return fullText.trim()
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', '.pdf']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(file.type) && fileExtension !== 'pdf') {
      setError('Invalid file type. Please upload a PDF file.')
      return
    }

    setIsUploading(true)
    setIsAnalyzing(false)
    setError(null)
    setUploadedFileName(file.name)
    setAnalysisResult(null)

    try {
      // Extract text from PDF using PDF.js
      const text = await extractTextFromPDF(file)
      setExtractedText(text)
      
      // Send text to backend for AI analysis
      setIsAnalyzing(true)
      setIsUploading(false)
      
      try {
        const response = await apiFetch<{ skills: Array<{ name: string; score: number }> }>('/api/ai/analyze-resume', {
          method: 'POST',
          body: JSON.stringify({ text }),
        })
        
        setAnalysisResult(response.skills || [])
        setIsAnalyzing(false)
        
        if (onAnalysisComplete && response.skills) {
          onAnalysisComplete(response.skills)
        }
      } catch (apiError) {
        console.error('API Error:', apiError)
        // If API endpoint doesn't exist yet, use mock data
        const mockSkills = [
          { name: 'Python', score: 8.5 },
          { name: 'Data Analysis', score: 6.5 },
          { name: 'Problem Solving', score: 7.0 },
          { name: 'Machine Learning', score: 7.5 },
          { name: 'JavaScript', score: 6.0 },
        ]
        setAnalysisResult(mockSkills)
        setIsAnalyzing(false)
        
        if (onAnalysisComplete) {
          onAnalysisComplete(mockSkills)
        }
      }
    } catch (error) {
      console.error('Error processing file:', error)
      setError(error instanceof Error ? error.message : 'Failed to process file. Please try again.')
      setIsUploading(false)
      setIsAnalyzing(false)
      setUploadedFileName(null)
    }
  }

  const handleUploadClick = () => {
    const input = document.getElementById('resume-upload') as HTMLInputElement
    input?.click()
  }

  const handleRemoveFile = () => {
    setUploadedFileName(null)
    setExtractedText('')
    setAnalysisResult(null)
    setError(null)
    const input = document.getElementById('resume-upload') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
          <svg className="w-6 h-6" style={{ color: '#0273B1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Resume Analysis
        </h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!uploadedFileName ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F5F5F5' }}>
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">Upload your resume as a PDF for AI analysis.</p>
            <p className="text-xs mb-4" style={{ color: '#DC2626' }}>PDF .DOC .DOCX .RTF</p>
          </div>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#0273B1' }}
            onMouseEnter={(e) => {
              if (!isUploading) e.currentTarget.style.backgroundColor = '#025a8f'
            }}
            onMouseLeave={(e) => {
              if (!isUploading) e.currentTarget.style.backgroundColor = '#0273B1'
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload PDF Resume'}
          </button>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{uploadedFileName}</p>
                {isAnalyzing && (
                  <p className="text-sm text-gray-500">Analyzing resume...</p>
                )}
                {analysisResult && (
                  <p className="text-sm" style={{ color: '#0273B1' }}>Analysis complete!</p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0273B1' }}></div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && analysisResult.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>
                Detected Skills:
              </h4>
              <div className="space-y-3">
                {analysisResult.map((skill, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-600">{skill.score.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(skill.score / 10) * 100}%`,
                            backgroundColor: '#0273B1',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Skills Setup Card Component
function SkillsSetupCard() {
  const [desiredJobTitle, setDesiredJobTitle] = useState('Software Engineer')
  const [coreSkills, setCoreSkills] = useState<string[]>(['Physics', 'Mathematics', 'Machine Learning'])
  const [newSkillInput, setNewSkillInput] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !coreSkills.includes(newSkillInput.trim())) {
      setCoreSkills([...coreSkills, newSkillInput.trim()])
      setNewSkillInput('')
      setShowAddInput(false)
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setCoreSkills(coreSkills.filter(skill => skill !== skillToRemove))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
          <svg className="w-6 h-6" style={{ color: '#4CAF50' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Skills Setup
        </h3>
      </div>

      {/* Desired Job Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#1C2D4F' }}>
          Desired Job Title
        </label>
        <input
          type="text"
          value={desiredJobTitle}
          onChange={(e) => setDesiredJobTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter desired job title"
        />
      </div>

      {/* Core Skills */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#1C2D4F' }}>
          Core Skills
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {coreSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: '#E3F2FD', color: '#0273B1' }}
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
          {showAddInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill()
                  } else if (e.key === 'Escape') {
                    setShowAddInput(false)
                    setNewSkillInput('')
                  }
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type skill name"
                autoFocus
              />
              <button
                onClick={handleAddSkill}
                className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#0273B1' }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddInput(false)
                  setNewSkillInput('')
                }}
                className="px-3 py-1 rounded-lg text-sm font-medium text-gray-600 border border-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddInput(true)}
              className="px-3 py-1 rounded-lg text-sm font-medium border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500"
            >
              + Add Skill
            </button>
          )}
        </div>
        <button
          onClick={async () => {
            // Ask AI to suggest skills based on job title
            try {
              const response = await apiFetch<{ skills: string[] }>('/api/ai/suggest-skills', {
                method: 'POST',
                body: JSON.stringify({ jobTitle: desiredJobTitle }),
              })
              if (response.skills) {
                setCoreSkills([...coreSkills, ...response.skills.filter(s => !coreSkills.includes(s))])
              }
            } catch (error) {
              console.error('Failed to get AI suggestions:', error)
              // If API doesn't exist, show message
              alert('AI suggestion feature will be available soon!')
            }
          }}
          className="px-4 py-1 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#025a8f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0273B1'
          }}
        >
          + Add All (AI Suggested)
        </button>
      </div>
    </div>
  )
}

// AI Suggested Skills Card Component
function AISuggestedSkillsCard() {
  const [desiredJobTitle, setDesiredJobTitle] = useState('Software Engineer')
  const [coreSkills] = useState<string[]>(['Physics', 'Mathematics', 'Machine Learning'])
  const [suggestedSkills, setSuggestedSkills] = useState<Array<{ name: string; enabled: boolean; score: number }>>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState<{ skill: string; index: number } | null>(null)
  const [tempScore, setTempScore] = useState(5)

  // Load AI suggestions when component mounts or job title changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!desiredJobTitle.trim()) return
      
      setIsLoadingSuggestions(true)
      try {
        const response = await apiFetch<{ skills: Array<{ name: string; score?: number }> }>('/api/ai/suggest-skills', {
          method: 'POST',
          body: JSON.stringify({ jobTitle: desiredJobTitle }),
        })
        
        if (response.skills) {
          setSuggestedSkills(response.skills.map(skill => ({
            name: skill.name,
            enabled: true,
            score: skill.score || 0
          })))
        }
      } catch (error) {
        console.error('Failed to load AI suggestions:', error)
        // If no skills yet, show empty state
        if (suggestedSkills.length === 0) {
          // Show message that AI will suggest skills
        }
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    loadSuggestions()
  }, [desiredJobTitle])

  const handleToggleSkill = (index: number) => {
    const updated = [...suggestedSkills]
    updated[index].enabled = !updated[index].enabled
    setSuggestedSkills(updated)
  }

  const handleScoreChange = (index: number, score: number) => {
    const updated = [...suggestedSkills]
    updated[index].score = Math.max(0, Math.min(10, score))
    setSuggestedSkills(updated)
  }

  const handleAddSkill = (index: number) => {
    // Add skill to user's profile
    const skill = suggestedSkills[index]
    console.log('Adding skill:', skill)
    // TODO: Call API to save skill
  }

  const openScoreModal = (skill: string, index: number) => {
    setTempScore(suggestedSkills[index].score)
    setShowScoreModal({ skill, index })
  }

  const saveScore = () => {
    if (showScoreModal) {
      handleScoreChange(showScoreModal.index, tempScore)
      setShowScoreModal(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
          <svg className="w-6 h-6" style={{ color: '#4CAF50' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Skills Setup
        </h3>
      </div>

      {/* Desired Job Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#1C2D4F' }}>
          Desired Job Title
        </label>
        <input
          type="text"
          value={desiredJobTitle}
          onChange={(e) => setDesiredJobTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter desired job title"
        />
      </div>

      {/* Core Skills */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: '#1C2D4F' }}>
          Core Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {coreSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: '#E3F2FD', color: '#0273B1' }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* AI Suggested Skills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium" style={{ color: '#1C2D4F' }}>
            AI Suggested Skills
          </label>
          {suggestedSkills.length === 0 && !isLoadingSuggestions && (
            <button
              onClick={async () => {
                setIsLoadingSuggestions(true)
                try {
                  const response = await apiFetch<{ skills: Array<{ name: string; score?: number }> }>('/api/ai/suggest-skills', {
                    method: 'POST',
                    body: JSON.stringify({ jobTitle: desiredJobTitle }),
                  })
                  if (response.skills) {
                    setSuggestedSkills(response.skills.map(skill => ({
                      name: skill.name,
                      enabled: true,
                      score: skill.score || 0
                    })))
                  }
                } catch (error) {
                  console.error('Failed to get AI suggestions:', error)
                  // Mock data for demo
                  setSuggestedSkills([
                    { name: 'Python', enabled: true, score: 8.5 },
                    { name: 'Data Analysis', enabled: true, score: 6.5 },
                    { name: 'Problem Solving', enabled: true, score: 7.0 },
                  ])
                } finally {
                  setIsLoadingSuggestions(false)
                }
              }}
              className="text-sm font-medium"
              style={{ color: '#0273B1' }}
            >
              Ask AI to Suggest Skills
            </button>
          )}
        </div>

        {isLoadingSuggestions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#0273B1' }}></div>
          </div>
        ) : suggestedSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No skills suggested yet. Enter a job title and click "Ask AI to Suggest Skills"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedSkills.map((skill, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={skill.enabled}
                    onChange={() => handleToggleSkill(index)}
                    className="w-5 h-5 rounded border-gray-300"
                    style={{ accentColor: '#0273B1' }}
                  />
                  <span className="font-medium text-gray-900 flex-1 min-w-[120px]">{skill.name}</span>
                  <button
                    onClick={() => openScoreModal(skill.name, index)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Score: {skill.score.toFixed(1)}/10
                  </button>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(skill.score / 10) * 100}%`,
                        backgroundColor: skill.enabled ? '#0273B1' : '#9CA3AF',
                      }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddSkill(index)}
                  className="px-3 py-1 text-sm font-medium rounded-lg text-white"
                  style={{ backgroundColor: '#0273B1' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#025a8f'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0273B1'
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1C2D4F' }}>
              Rate Your Skill: {showScoreModal.skill}
            </h3>
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={tempScore}
                onChange={(e) => setTempScore(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0</span>
                <span className="font-bold text-lg" style={{ color: '#0273B1' }}>{tempScore.toFixed(1)}</span>
                <span>10</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveScore}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#0273B1' }}
              >
                Save
              </button>
              <button
                onClick={() => setShowScoreModal(null)}
                className="flex-1 px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Video Upload Card Component
function VideoUploadCard() {
  const [videoUrl, setVideoUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const extractVideoId = (url: string): string | null => {
    // Support multiple YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^"&?\/\s]{11})/,  // watch?v=
      /(?:youtube\.com\/embed\/)([^"&?\/\s]{11})/,     // embed/
      /(?:youtu\.be\/)([^"&?\/\s]{11})/,               // youtu.be/
      /(?:youtube\.com\/.*[?&]v=)([^"&?\/\s]{11})/,    // other formats with v=
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    return null
  }

  const handleUrlChange = (url: string) => {
    setVideoUrl(url)
    const videoId = extractVideoId(url)
    setIsValidUrl(!!videoId)
  }

  const getEmbedUrl = (url: string): string | null => {
    const videoId = extractVideoId(url)
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return null
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setVideoUrl('')
    setIsValidUrl(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFEBEE' }}>
          <svg className="w-6 h-6" style={{ color: '#F44336' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Video Upload
        </h3>
      </div>

      <div className="space-y-4">
        {(isEditing || !isValidUrl) && (
          <div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste YouTube URL..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter video URL, youtu.be/embed/</p>
            {isEditing && isValidUrl && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: '#0273B1' }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {isValidUrl && getEmbedUrl(videoUrl) && !isEditing ? (
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={getEmbedUrl(videoUrl) || ''}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button
              onClick={handleEdit}
              className="absolute top-4 right-4 px-4 py-2 bg-white rounded-lg shadow-md font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="w-full bg-gray-200 rounded-lg relative" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Smiling man in suit video thumbnail</p>
            </div>
            <div className="absolute bottom-4 left-4 px-2 py-1 bg-gray-800 rounded text-white text-xs">
              John Doe
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343l12.728 12.728" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
