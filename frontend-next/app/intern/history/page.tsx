'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

interface AnalysisHistory {
  id: string
  jobTitle: string | null
  createdAt: string
  analysisResult: any
  skills: any
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)
  const pathname = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAIAnalysisPage = pathname === '/intern/ai-analysis'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isHistoryPage = pathname === '/intern/history'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isJobMatchPage = pathname === '/intern/job-match' || pathname === '/intern/find-companies'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiFetch<{ history: AnalysisHistory[] }>('/api/ai/history')
        setHistory(data.history)
      } catch (err) {
        console.error('Failed to fetch history:', err)
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="font-medium">AI Analysis</span>
            </Link>

            <Link
              href="/intern/history"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors bg-[#0273B1] text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">History</span>
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
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1C2D4F] mb-6">Analysis History</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0273B1]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : history.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500 mb-4">No analysis history found.</p>
              <Link
                href="/intern/ai-analysis"
                className="inline-block px-6 py-2 bg-[#0273B1] text-white rounded-lg hover:bg-[#025a8f] transition-colors"
              >
                Start New Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedAnalysis(selectedAnalysis?.id === item.id ? null : item)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-[#1C2D4F]">
                          {item.jobTitle ? `Analysis for ${item.jobTitle}` : 'General Resume Analysis'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(item.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {item.analysisResult?.overallScore && (
                          <div className="text-right">
                            <span className="block text-2xl font-bold text-[#0273B1]">{item.analysisResult.overallScore}%</span>
                            <span className="text-xs text-gray-500">Match Score</span>
                          </div>
                        )}
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${selectedAnalysis?.id === item.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {selectedAnalysis?.id === item.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50 pt-6">
                      {/* Comprehensive Analysis Section */}
                      {item.analysisResult?.overallScore > 0 && (
                        <div className="mb-8">
                          <h3 className="font-bold text-[#1C2D4F] mb-4 text-xl">Comprehensive Analysis</h3>
                          
                          {/* Overall Score */}
                          <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
                            <div className="relative w-32 h-32 flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                                <circle 
                                  cx="64" cy="64" r="56" 
                                  stroke={item.analysisResult.overallScore >= 80 ? "#10B981" : item.analysisResult.overallScore >= 60 ? "#F59E0B" : "#EF4444"} 
                                  strokeWidth="12" 
                                  fill="none" 
                                  strokeDasharray="351.86" 
                                  strokeDashoffset={351.86 - (351.86 * item.analysisResult.overallScore) / 100} 
                                  className="transition-all duration-1000 ease-out"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-[#1C2D4F]">{item.analysisResult.overallScore}</span>
                                <span className="text-xs text-gray-500">Master Score</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                              {/* Profile Strength */}
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-blue-800">Profile Strength</span>
                                  <span className="text-lg font-bold text-blue-600">{item.analysisResult.breakdown?.profileStrength?.score || 0}%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${item.analysisResult.breakdown?.profileStrength?.score || 0}%` }}></div>
                                </div>
                                <p className="text-xs text-blue-700 leading-tight">{item.analysisResult.breakdown?.profileStrength?.reason}</p>
                              </div>

                              {/* Skill Validation */}
                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-purple-800">Skill Validation</span>
                                  <span className="text-lg font-bold text-purple-600">{item.analysisResult.breakdown?.skillValidation?.score || 0}%</span>
                                </div>
                                <div className="w-full bg-purple-200 rounded-full h-1.5 mb-2">
                                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${item.analysisResult.breakdown?.skillValidation?.score || 0}%` }}></div>
                                </div>
                                <p className="text-xs text-purple-700 leading-tight">{item.analysisResult.breakdown?.skillValidation?.reason}</p>
                              </div>

                              {/* Job Match */}
                              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-green-800">Job Match</span>
                                  <span className="text-lg font-bold text-green-600">{item.analysisResult.breakdown?.jobMatch?.score || 0}%</span>
                                </div>
                                <div className="w-full bg-green-200 rounded-full h-1.5 mb-2">
                                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${item.analysisResult.breakdown?.jobMatch?.score || 0}%` }}></div>
                                </div>
                                <p className="text-xs text-green-700 leading-tight">{item.analysisResult.breakdown?.jobMatch?.reason}</p>
                              </div>
                            </div>
                          </div>

                          {/* Company Skill Match vs Job Title */}
                          {item.analysisResult.jobSkillMatches && item.analysisResult.jobSkillMatches.length > 0 && (
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-[#1C2D4F] mb-3">
                                  Must-have Skills Match
                                </h4>
                                <ul className="space-y-2">
                                  {item.analysisResult.jobSkillMatches
                                    .filter((m: any) => m.requiredLevel === 'must-have')
                                    .map((m: any, idx: number) => (
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
                                          {m.evidence || (m.matched ? '' : 'No clear evidence.')}
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
                                  {item.analysisResult.jobSkillMatches
                                    .filter((m: any) => m.requiredLevel === 'nice-to-have')
                                    .map((m: any, idx: number) => (
                                      <li
                                        key={`nice-${idx}-${m.skill}`}
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
                                          {m.evidence || (m.matched ? '' : 'Not found.')}
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Feedback Grid */}
                          {item.analysisResult.feedback && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Strengths
                                </h4>
                                <ul className="space-y-2">
                                  {item.analysisResult.feedback.strengths?.map((feedItem: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-green-500 mt-1">•</span> {feedItem}
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
                                  {item.analysisResult.feedback.weaknesses?.map((feedItem: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-yellow-500 mt-1">•</span> {feedItem}
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
                                  {item.analysisResult.feedback.improvements?.map((feedItem: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-blue-500 mt-1">•</span> {feedItem}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skills Section */}
                      <div>
                        <h3 className="font-bold text-[#1C2D4F] mb-4">AI Suggested Skills</h3>
                        <div className="space-y-4">
                            {/* Hard Skills Section */}
                            {item.skills.some((s: any) => s.type === 'Hard Skill') && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-[#1C2D4F] mb-3 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                  Technical & Hard Skills
                                </h4>
                                <div className="space-y-4">
                                  {item.skills.filter((s: any) => s.type === 'Hard Skill').map((skill: any, index: number) => (
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
                            {item.skills.some((s: any) => s.type === 'Soft Skill') && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-[#1C2D4F] mb-3 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                  Soft Skills & People Skills
                                </h4>
                                <div className="space-y-4">
                                  {item.skills.filter((s: any) => s.type === 'Soft Skill').map((skill: any, index: number) => (
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

                            {/* Unclassified/Other Skills */}
                            {item.skills.some((s: any) => !s.type) && (
                              <div className="mt-4">
                                <h4 className="font-semibold text-[#1C2D4F] mb-3 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  Detected Skills from Resume
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                  {item.skills.filter((s: any) => !s.type).map((skill: any, idx: number) => (
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
