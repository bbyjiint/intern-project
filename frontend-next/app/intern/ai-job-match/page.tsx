'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import InternNavbar from '@/components/InternNavbar'
import InternSidebar from '@/components/InternSidebar'
import { apiFetch } from '@/lib/api'
import JobMatchCard, { type JobMatchPost } from '@/components/job-post/JobMatchCard'

export default function JobMatchPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState<JobMatchPost[]>([])
  const [isFetchingJobs, setIsFetchingJobs] = useState(false)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)
  
  // เพิ่ม state สำหรับจัดการ Sidebar บนมือถือ
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      
      <div className="flex relative">
        {/* Sidebar Component - ส่ง props ไปควบคุมการเปิดปิด */}
        <InternSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-10 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Area */}
            <header className="flex flex-col gap-6 mb-8">
              
              {/* Mobile Menu Trigger & Title */}
              <div className="flex items-center justify-between lg:hidden">
                 <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                 </button>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    AI Job Match
                  </h1>
                  <p className="text-base md:text-lg font-semibold text-[#0273B1] dark:text-[#38bdf8]">
                    Job Recommendations from AI
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                    A collection of jobs and internships personalized for your skills, updated in real-time.
                  </p>
                </div>

                {/* Recalculate button */}
                <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => fetchJobMatches(true)}
                    disabled={isRecalculating || isFetchingJobs}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0273B1] hover:bg-[#0261a0] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
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
                    <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Using cached results
                    </p>
                  )}
                </div>
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
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-3" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Grid */}
            {!isFetchingJobs && !isRecalculating && jobs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="transform transition-all duration-300 hover:-translate-y-1">
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
              <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-2">No matching jobs found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                  Try updating your profile skills and preferred positions to get better matches.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}