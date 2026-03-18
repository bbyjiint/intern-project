'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'
import JobMatchCard, { type JobMatchPost } from '@/components/job-post/JobMatchCard'

export default function JobMatchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [jobs, setJobs] = useState<JobMatchPost[]>([])
  const [isFetchingJobs, setIsFetchingJobs] = useState(false)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const isAIAnalysisPage = pathname === '/intern/ai-analysis'
  const isCertificatesPage = pathname === '/intern/certificates'
  const isExperiencePage = pathname === '/intern/experience'
  const isProjectPage = pathname === '/intern/project'
  const isAIJobMatchPage = pathname === '/intern/ai-job-match'
  const isProfileDropdownPage = isAIAnalysisPage || isCertificatesPage || isExperiencePage || isProjectPage

  useEffect(() => {
    if (isProfileDropdownPage) {
      setIsProfileDropdownOpen(true)
    }
  }, [isProfileDropdownPage])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        if (userData.user.role === 'COMPANY') { router.push('/employer/profile'); return }
        if (!userData.user.role) { router.push('/role-selection'); return }
        setIsLoading(false)
        fetchJobMatches(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          router.push('/login')
        } else {
          setIsLoading(false)
        }
      }
    }
    checkAuth()
  }, [router])

  const fetchJobMatches = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRecalculating(true)
      } else {
        setIsFetchingJobs(true)
      }
      const url = forceRefresh
        ? '/api/candidates/job-matches?refresh=true'
        : '/api/candidates/job-matches'
      const data = await apiFetch<{ jobs: JobMatchPost[], cached: boolean }>(url)
      setJobs(data.jobs || [])
      setIsFromCache(data.cached ?? false)
    } catch (e) {
      console.error('Failed to fetch job matches:', e)
    } finally {
      setIsFetchingJobs(false)
      setIsRecalculating(false)
    }
  }

  const handleBookmark = async (id: string, next: boolean) => {
    try {
      if (next) {
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: 'POST' })
      } else {
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: 'DELETE' })
      }
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, isBookmarked: next } : j))
    } catch (e) {
      console.error('Bookmark failed:', e)
    }
  }

  const getLinkClasses = (active: boolean) => `
    px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 font-medium
    ${active
      ? 'bg-[#0273B1] text-white shadow-md'
      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0273B1] dark:hover:text-[#38bdf8]'}
  `

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <InternNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400 animate-pulse font-medium">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-[#0f172a] transition-colors duration-300">
      <InternNavbar />
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-[#1e293b] min-h-[calc(100vh-64px)] pt-8 border-r border-slate-200 dark:border-slate-700 hidden md:block">
          <div className="px-6 space-y-2">

            {/* Profile Dropdown Group */}
            <div className="space-y-1">
              <div
                onClick={() => router.push('/intern/profile')}
                className={`cursor-pointer group ${getLinkClasses(pathname === '/intern/profile')}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen) }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isProfileDropdownOpen && (
                <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-2 space-y-1 mt-1">
                  {[
                    { href: '/intern/ai-analysis', label: 'AI Analysis', active: isAIAnalysisPage, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                    { href: '/intern/certificates', label: 'Certificates', active: isCertificatesPage, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                    { href: '/intern/project', label: 'Project', active: isProjectPage, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
                  ].map(({ href, label, active, icon }) => (
                    <Link key={href} href={href} className={getLinkClasses(active)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      <span className="text-sm">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Standard Links */}
            {[
              { href: '/intern/ai-job-match', label: 'AI Job Match', active: isAIJobMatchPage, icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { href: '/intern/applied', label: 'Applied', active: pathname === '/intern/applied', icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              { href: '/intern/bookmark', label: 'Bookmark', active: pathname === '/intern/bookmark', icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
            ].map(({ href, label, active, icon }) => (
              <Link key={href} href={href} className={getLinkClasses(active)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  AI Job Match
                </h1>
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-semibold text-[#0273B1] dark:text-[#38bdf8]">
                    Job Recommendations from AI
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                    A collection of jobs and internships personalized for your skills, updated in real-time.
                  </p>
                </div>
              </div>

              {/* Recalculate button */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button
                  onClick={() => fetchJobMatches(true)}
                  disabled={isRecalculating || isFetchingJobs}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0273B1] hover:bg-[#0261a0] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <svg
                    className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRecalculating ? 'Recalculating...' : 'Recalculate Match'}
                </button>
                {isFromCache && !isRecalculating && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Using cached results
                  </p>
                )}
              </div>
            </header>

            {/* Loading skeleton */}
            {(isFetchingJobs || isRecalculating) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-3" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Grid */}
            {!isFetchingJobs && !isRecalculating && jobs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="transform transition-transform hover:-translate-y-1">
                    <JobMatchCard
                      post={job}
                      onBookmark={handleBookmark}
                      onDetail={() => router.push(`/intern/job-detail/${job.id}`)}
                      onApply={() => router.push(`/intern/job-detail/${job.id}`)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isFetchingJobs && !isRecalculating && jobs.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-1">No matching jobs found</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Try updating your profile skills and preferred positions to get better matches.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}