'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as pdfjsLib from 'pdfjs-dist'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface Skill {
  name: string
  score: number
  reason?: string
  type?: 'Hard Skill' | 'Soft Skill'
}

interface AnalysisResult {
  overallScore: number
  breakdown: {
    profileStrength: { score: number; reason: string }
    skillValidation: { score: number; reason: string }
    jobMatch: { score: number; reason: string }
  }
  jobSkillMatches?: {
    skill: string
    requiredLevel: 'must-have' | 'nice-to-have'
    matched: boolean
    evidence?: string
  }[]
  feedback: {
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
  }
}

function buildFallbackAnalysis(skills: Skill[], desiredJobTitle: string): AnalysisResult {
  const scoredSkills = skills.filter(
    (s) => s.score !== undefined && s.score !== null && !Number.isNaN(Number(s.score))
  )
  if (scoredSkills.length === 0) {
    return {
      overallScore: 0,
      breakdown: {
        profileStrength: { score: 0, reason: 'Not enough data to evaluate profile strength.' },
        skillValidation: { score: 0, reason: 'Not enough skill evidence found in the resume.' },
        jobMatch: { score: 0, reason: `No clear match to ${desiredJobTitle || 'the selected role'}.` },
      },
      feedback: {
        strengths: ['Add more details about projects, responsibilities, and concrete achievements.'],
        weaknesses: ['Profile lacks strong evidence of skills and role-specific experience.'],
        improvements: [
          `Highlight 2–3 projects that relate directly to ${desiredJobTitle || 'this role'}.`,
          'Quantify impact where possible (numbers, results, technologies used).',
        ],
      },
    }
  }

  const totalScore = scoredSkills.reduce(
    (sum, skill) => sum + Number(skill.score),
    0
  )
  const avgScore = totalScore / scoredSkills.length
  const overallScore = Math.max(1, Math.min(100, Math.round(avgScore * 10)))

  const profileStrengthScore = Math.max(1, Math.min(100, Math.round(overallScore * 0.95)))
  const skillValidationScore = Math.max(1, Math.min(100, Math.round(overallScore)))
  const jobMatchScore = Math.max(1, Math.min(100, Math.round(overallScore * 0.9)))

  const sortedByScore = [...scoredSkills].sort(
    (a, b) => Number(b.score) - Number(a.score)
  )
  const topSkills = sortedByScore.slice(0, 3)
  const bottomSkills = sortedByScore.slice(-3).reverse()

  const strengths =
    topSkills.length > 0
      ? topSkills.map((s) => `Strong potential in ${s.name} (${s.score}/10).`)
      : ['Profile shows some emerging strengths but needs more detail.']

  const weaknesses =
    bottomSkills.length > 0
      ? bottomSkills.map((s) => `Limited evidence for ${s.name} (only ${s.score}/10).`)
      : ['No clear weaknesses detected, but profile could use more differentiation.']

  const improvements = [
    `Focus on improving the lowest-scored skills to better match ${desiredJobTitle || 'the selected role'}.`,
    'Add concrete examples of how you used these skills in projects or coursework.',
    'Consider adding relevant online courses or certifications to strengthen the profile.',
  ]

  return {
    overallScore,
    breakdown: {
      profileStrength: {
        score: profileStrengthScore,
        reason: 'Estimated from the overall quality and balance of your current skills.',
      },
      skillValidation: {
        score: skillValidationScore,
        reason: 'Derived from the strength and consistency of your skill scores.',
      },
      jobMatch: {
        score: jobMatchScore,
        reason: `Approximate match between your current skills and ${desiredJobTitle || 'the selected role'}.`,
      },
    },
    feedback: {
      strengths,
      weaknesses,
      improvements,
    },
  }
}

interface UploadedFile {
  id: string
  name: string
  size: number
  date: string
  text: string
}
export default function AIAnalysisPage() {
  const [resumeText, setResumeText] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desiredJobTitle, setDesiredJobTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [analyzed, setAnalyzed] = useState(false)
  const [certificateFiles, setCertificateFiles] = useState<{ file: File; text: string }[]>([])
  const [uploadedResumes, setUploadedResumes] = useState<UploadedFile[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('')

  const effectiveAnalysis =
    analyzed && skills.length > 0
      ? analysisResult ?? buildFallbackAnalysis(skills, desiredJobTitle || 'General Role')
      : null

  // Helper to extract text from PDF
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: { str: string }) => item.str).join(' ')
        fullText += pageText + ' '
      }
      return fullText
    } catch (err) {
      console.error('PDF extraction failed for', file.name, err)
      return ''
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file)
        setVideoPreviewUrl(URL.createObjectURL(file))
        setYoutubeUrl('') // Clear YouTube URL if file is uploaded
      } else {
        alert('Please upload a valid video file')
      }
    }
  }

  const removeVideo = () => {
    setVideoFile(null)
    setVideoPreviewUrl('')
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFiles = await Promise.all(Array.from(files).map(async (file) => {
        let text = ''
        if (file.type === 'application/pdf') {
          text = await extractPdfText(file)
        }
        return { file, text }
      }))
      setCertificateFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeCertificate = (index: number) => {
    setCertificateFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeResume = (id: string) => {
    setUploadedResumes(prev => {
      const remaining = prev.filter((resume) => resume.id !== id)
      if (remaining.length === 0) {
        setResumeText('')
        setSkills([])
        setAnalysisResult(null)
        setAnalyzed(false)
        localStorage.removeItem('internResumeText')
        localStorage.removeItem('internAnalysisResult')
      }
      return remaining
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    try {
      setLoading(true)
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: { str: string }) => item.str).join(' ')
        fullText += pageText + ' '
      }

      setResumeText(fullText)
      localStorage.setItem('internResumeText', fullText) // Save for Job Match
      setError('')
      
      // Add to list
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        text: fullText
      }
      
      setUploadedResumes(prev => [newFile, ...prev])
      await analyzeResume(fullText)
    } catch (err) {
      console.error('PDF extraction failed:', err)
      setError('Failed to read PDF file')
    } finally {
      setLoading(false)
    }
  }

  const analyzeResume = async (text: string, overrideJobTitle?: string) => {
    try {
      setLoading(true)
      setError('')
      
      const targetJobTitle = overrideJobTitle ?? desiredJobTitle
      
      let endpoint = '/api/ai/analyze-resume'
      let body: any = { text }

      if (targetJobTitle) {
        endpoint = '/api/ai/suggest-skills'
        body = {
          jobTitle: targetJobTitle,
          resumeText: text,
          certificates: certificateFiles.map(f => f.file.name),
          certificateContents: certificateFiles.map(f => `File: ${f.file.name}\nContent: ${f.text || '(No text extracted - likely image or non-PDF)'}`).join('\n\n')
        }
      }

      const data = await apiFetch<{ skills: Skill[], analysis?: AnalysisResult }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (data.skills) {
        const mappedSkills = data.skills.map((skill) => {
          let type = skill.type
          if (desiredJobTitle) {
            const rawType = (skill as any).type
            if (typeof rawType === 'string') {
              const t = rawType.toLowerCase()
              if (t.includes('soft')) type = 'Soft Skill'
              else type = 'Hard Skill'
            } else if (!type) {
              type = 'Hard Skill'
            }
          }
          return { ...skill, type }
        })
        setSkills(mappedSkills)
      }
      if (data.analysis) {
        setAnalysisResult(data.analysis)
        localStorage.setItem('internAnalysisResult', JSON.stringify(data.analysis))
      }
      
      setAnalyzed(true)
    } catch (err: unknown) {
      console.error('Analysis failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze resume'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    // Handle standard youtube URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : ''
  }

  return (
    <div className="min-h-screen bg-white">
      <InternNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200 hidden md:block">
          <div className="px-6 space-y-2">
            <Link
              href="/intern/profile"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>

            <Link
              href="/intern/ai-analysis"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors bg-[#0273B1] text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="font-medium">AI Analysis</span>
            </Link>

            <Link
              href="/intern/job-match"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">Job Match</span>
            </Link>

            <Link
              href="/intern/applied"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Applied</span>
            </Link>

            <Link
              href="/intern/bookmark"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1]"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">Bookmark</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1C2D4F]">Profile / Setup Page</h1>
            <p className="text-gray-600">Complete your profile setup to get started with AI analysis</p>
          </div>

          {/* Resume Analysis and Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Resume Analysis Card */}
            <div className={`bg-white rounded-xl border border-gray-200 ${uploadedResumes.length > 0 ? 'p-6' : 'p-8'} text-center h-full`}>
              {uploadedResumes.length === 0 ? (
                <>
                  <div className="flex items-center justify-center mb-2">
                     <span className="text-[#0273B1] font-semibold flex items-center gap-2">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                         <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                       </svg>
                       Resume Analysis
                     </span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="mb-4">
                       <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                       </svg>
                    </div>
                    
                    <label className="cursor-pointer bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-medium py-2 px-6 rounded-md transition-colors mb-2">
                      Upload PDF Resume
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    
                    <div className="text-xs text-blue-500 font-medium space-x-2 mt-2">
                      <span>.PDF</span>
                      <span>.DOC</span>
                      <span>.DOCX</span>
                      <span>.RTF</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Upload your resume as a PDF for AI analysis.</p>
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1C2D4F]">Uploaded Resume ({uploadedResumes.length})</h3>
                    <label className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors">
                      <svg className="w-6 h-6 text-[#1C2D4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    {uploadedResumes.map((resume) => (
                      <div key={resume.id} className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-[#1C2D4F] text-sm">{resume.name}</h4>
                            <p className="text-xs text-gray-500">{(resume.size / 1024).toFixed(2)} KB • {resume.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeResume(resume.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {loading && (
                 <div className="mt-4 text-[#0273B1] flex items-center justify-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0273B1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Analyzing resume...
                 </div>
              )}
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Certificates Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center h-full">
               <div className="flex items-center justify-center mb-2">
                 <span className="text-[#F59E0B] font-semibold flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l4 4a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                   </svg>
                   Certificates Upload
                 </span>
              </div>
              
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-4">
                   <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                   </svg>
                </div>
                
                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-md transition-colors mb-2">
                  + Add Certificates
                  <input
                    type="file"
                    multiple
                    onChange={handleCertificateUpload}
                    className="hidden"
                  />
                </label>
                
                <div className="text-xs text-yellow-500 font-medium space-x-2 mt-2">
                  <span>.PDF</span>
                  <span>.JPG</span>
                  <span>.PNG</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Upload your certificates, transcripts, or other documents.</p>
              </div>

              {certificateFiles.length > 0 && (
                <div className="space-y-2 mt-4 text-left">
                  {certificateFiles.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l4 4a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-gray-700 truncate">{item.file.name}</span>
                          {item.text && <span className="text-[10px] text-green-600">Text extracted</span>}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">({(item.file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button 
                        onClick={() => removeCertificate(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills Setup */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
               <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
               <h2 className="text-lg font-bold text-[#1C2D4F]">Skills Setup</h2>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Desired Job Title</label>
              <div className="relative">
                <select
                  value={desiredJobTitle}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    setDesiredJobTitle(newTitle)
                    if (resumeText) analyzeResume(resumeText, newTitle)
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0273B1] appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>Select a job title</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UX/UI Designer">UX/UI Designer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Marketing Intern">Marketing Intern</option>
                  <option value="Graphic Designer">Graphic Designer</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Sales Representative">Sales Representative</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
               {['Physics', 'Mathematics', 'Machine Learning'].map(tag => (
                 <span key={tag} className="bg-[#E0E7FF] text-[#3730A3] px-3 py-1 rounded-md text-sm font-medium">
                   {tag}
                 </span>
               ))}
            </div>
            
            {/* Detailed Analysis Section */}
            {effectiveAnalysis && !loading && (
              effectiveAnalysis.overallScore > 0 || desiredJobTitle ? (
                <div className="mb-8 border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-[#1C2D4F] mb-4 text-xl">Comprehensive Analysis</h3>
                  
                  {/* Overall Score */}
                  <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                      <circle 
                        cx="64" cy="64" r="56" 
                        stroke={effectiveAnalysis.overallScore >= 80 ? "#10B981" : effectiveAnalysis.overallScore >= 60 ? "#F59E0B" : "#EF4444"} 
                        strokeWidth="12" 
                        fill="none" 
                        strokeDasharray="351.86" 
                        strokeDashoffset={351.86 - (351.86 * effectiveAnalysis.overallScore) / 100} 
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-[#1C2D4F]">{effectiveAnalysis.overallScore}</span>
                      <span className="text-xs text-gray-500">Master Score</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    {/* Profile Strength */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-blue-800">Profile Strength</span>
                        <span className="text-lg font-bold text-blue-600">{effectiveAnalysis.breakdown.profileStrength.score}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${effectiveAnalysis.breakdown.profileStrength.score}%` }}></div>
                      </div>
                      <p className="text-xs text-blue-700 leading-tight">{effectiveAnalysis.breakdown.profileStrength.reason}</p>
                    </div>

                    {/* Skill Validation */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-purple-800">Skill Validation</span>
                        <span className="text-lg font-bold text-purple-600">{effectiveAnalysis.breakdown.skillValidation.score}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-1.5 mb-2">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${effectiveAnalysis.breakdown.skillValidation.score}%` }}></div>
                      </div>
                      <p className="text-xs text-purple-700 leading-tight">{effectiveAnalysis.breakdown.skillValidation.reason}</p>
                    </div>

                    {/* Job Match */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-green-800">Job Match</span>
                        <span className="text-lg font-bold text-green-600">{effectiveAnalysis.breakdown.jobMatch.score}%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-1.5 mb-2">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${effectiveAnalysis.breakdown.jobMatch.score}%` }}></div>
                      </div>
                      <p className="text-xs text-green-700 leading-tight">{effectiveAnalysis.breakdown.jobMatch.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Company Skill Match vs Job Title */}
                {effectiveAnalysis.jobSkillMatches && effectiveAnalysis.jobSkillMatches.length > 0 && (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#1C2D4F] mb-3">
                        Must-have Skills Match
                      </h4>
                      <ul className="space-y-2">
                        {effectiveAnalysis.jobSkillMatches
                          .filter((m) => m.requiredLevel === 'must-have')
                          .map((m, idx) => (
                            <li
                              key={`must-${idx}-${m.skill}`}
                              className="flex items-start justify-between gap-3 text-sm text-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    m.matched ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                ></span>
                                <span className="font-medium">{m.skill}</span>
                              </div>
                              <span className="text-xs text-gray-500 max-w-xs text-right">
                                {m.evidence || (m.matched ? '' : 'No clear evidence in resume/certificates.')}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#1C2D4F] mb-3">
                        Nice-to-have Skills Match
                      </h4>
                      <ul className="space-y-2">
                        {effectiveAnalysis.jobSkillMatches
                          .filter((m) => m.requiredLevel === 'nice-to-have')
                          .map((m, idx) => (
                            <li
                              key={`nice-${idx}-${m.skill}`}
                              className="flex items-start justify-between gap-3 text-sm text-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    m.matched ? 'bg-green-500' : 'bg-yellow-400'
                                  }`}
                                ></span>
                                <span className="font-medium">{m.skill}</span>
                              </div>
                              <span className="text-xs text-gray-500 max-w-xs text-right">
                                {m.evidence || (m.matched ? '' : 'No strong evidence yet.')}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Feedback Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {effectiveAnalysis.feedback.strengths.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-yellow-700 mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {effectiveAnalysis.feedback.weaknesses.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-blue-700 mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {effectiveAnalysis.feedback.improvements.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 border-t border-gray-100 pt-6 text-center py-8">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 inline-block max-w-lg">
                  <h3 className="font-semibold text-[#1C2D4F] mb-2">Ready for Analysis</h3>
                  <p className="text-gray-600 text-sm">
                    We have extracted skills from your resume. Select a <strong>Job Title</strong> above to see how well you match specific roles and get a detailed score.
                  </p>
                </div>
              </div>
            ))}
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1C2D4F]">AI Suggested Skills</h3>
                <button className="bg-[#DBEAFE] text-[#2563EB] px-3 py-1 rounded-md text-sm font-medium hover:bg-[#bfdbfe] transition-colors">
                  + Add
                </button>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-[#0273B1]">
                    <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">
                      {desiredJobTitle 
                        ? `AI is analyzing your fit for ${desiredJobTitle}...` 
                        : 'AI is analyzing skills from your resume...'}
                    </span>
                  </div>
                ) : analyzed ? (
                  <>
                    {/* Hard Skills Section */}
                    {skills.some(s => s.type === 'Hard Skill') && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-[#1C2D4F] mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          Technical & Hard Skills
                        </h4>
                        <div className="space-y-4">
                          {skills.filter(s => s.type === 'Hard Skill').map((skill, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-32 flex items-center gap-2 text-sm text-gray-600">
                                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${skill.score >= 8 ? 'bg-green-500' : skill.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                <span className="truncate" title={skill.name}>{skill.name}</span>
                              </div>
                              <div className="w-12 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                                {skill.score}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-200 rounded-full h-3">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-1000 ${skill.score >= 8 ? 'bg-blue-600' : skill.score >= 5 ? 'bg-blue-400' : 'bg-blue-300'}`}
                                    style={{ width: `${(skill.score / 10) * 100}%` }}
                                  ></div>
                                </div>
                                {skill.reason && (
                                  <p className="text-[10px] text-gray-500 mt-1 italic truncate max-w-md">
                                    AI Reasoning: {skill.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Soft Skills Section */}
                    {skills.some(s => s.type === 'Soft Skill') && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-[#1C2D4F] mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          Soft Skills & People Skills
                        </h4>
                        <div className="space-y-4">
                          {skills.filter(s => s.type === 'Soft Skill').map((skill, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-32 flex items-center gap-2 text-sm text-gray-600">
                                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${skill.score >= 8 ? 'bg-green-500' : skill.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                <span className="truncate" title={skill.name}>{skill.name}</span>
                              </div>
                              <div className="w-12 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                                {skill.score}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-200 rounded-full h-3">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-1000 ${skill.score >= 8 ? 'bg-purple-600' : skill.score >= 5 ? 'bg-purple-400' : 'bg-purple-300'}`}
                                    style={{ width: `${(skill.score / 10) * 100}%` }}
                                  ></div>
                                </div>
                                {skill.reason && (
                                  <p className="text-[10px] text-gray-500 mt-1 italic truncate max-w-md">
                                    AI Reasoning: {skill.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback for unclassified skills */}
                    {skills.some(s => !s.type) && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-[#1C2D4F] mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Detected Skills from Resume
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {skills.filter(s => !s.type).map((skill, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-40 flex-shrink-0 flex items-center gap-2 text-sm text-gray-600 truncate" title={skill.name}>
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                <span className="truncate">{skill.name}</span>
                              </div>
                              <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                {skill.score ?? '-'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="bg-[#2563EB] h-2 rounded-full" 
                                    style={{ width: `${(skill.score ? (skill.score / 10) * 100 : 0)}%` }}
                                  ></div>
                                </div>
                                {skill.reason && (
                                  <p className="text-[10px] text-gray-500 mt-1 italic truncate max-w-xs" title={skill.reason}>
                                    AI: {skill.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                   <div className="text-center py-8 text-gray-400 text-sm italic">
                     Upload your resume to see AI suggested skills here.
                   </div>
                )}
                
                {/* Mock data for preview removed as per user request */}
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
             <div className="flex items-center gap-2 mb-4">
               <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
               <h2 className="text-lg font-bold text-[#1C2D4F]">Video Upload</h2>
            </div>
            
            <div className="mb-4">
              <div className="flex gap-4 items-center mb-4">
                 <label className="flex-1 cursor-pointer bg-[#FFF5F5] hover:bg-[#ffe0e0] text-red-500 border border-red-200 font-medium py-2 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Video File
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                 </label>
                 <span className="text-gray-400 font-medium">OR</span>
                 <div className="flex-1">
                    <input 
                      type="text" 
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value)
                        if (e.target.value) {
                          setVideoFile(null)
                          setVideoPreviewUrl('')
                        }
                      }}
                      placeholder="Paste YouTube URL..." 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0273B1]"
                    />
                 </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Supported: MP4, WebM or YouTube URL</p>
            </div>
            
            <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative group">
               {videoFile && videoPreviewUrl ? (
                 <>
                   <video 
                     src={videoPreviewUrl} 
                     className="w-full h-full object-cover" 
                     controls
                   />
                   <button 
                     onClick={removeVideo}
                     className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Remove Video"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </>
               ) : getEmbedUrl(youtubeUrl) ? (
                 <iframe 
                   src={getEmbedUrl(youtubeUrl)} 
                   className="w-full h-full" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               ) : (
                 <div className="text-center">
                    <p className="text-gray-400 font-medium">Video preview will appear here</p>
                    <p className="text-gray-400 text-sm">Upload a video or paste a YouTube link</p>
                 </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
