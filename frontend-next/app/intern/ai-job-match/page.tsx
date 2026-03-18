'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'
import JobMatchCard, { type JobMatchPost } from '@/components/job-post/JobMatchCard'

const mockJobMatches: JobMatchPost[] = [
  {
    id: '1',
    jobTitle: 'รับนักศึกษาฝึกงาน AI Engineer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyEmail: 'info@trinitythai.com',
    companyLogo: null,
    workplaceType: 'HYBRID',
    positions: ['AI Developer', 'Machine Learning'],
    locationProvince: 'Bangkok',
    positionsAvailable: 4,
    allowance: 5000,
    allowancePeriod: 'MONTH',
    noAllowance: false,
    score: 80,
    isBookmarked: false,
  },
  {
    id: '2',
    jobTitle: 'รับนักศึกษาฝึกงาน Software Engineer',
    companyName: 'DataWorks Thailand',
    companyEmail: 'hr@dataworks.co.th',
    companyLogo: null,
    workplaceType: 'ON_SITE',
    positions: ['Backend Developer', 'Node.js'],
    locationProvince: 'Chiang Mai',
    positionsAvailable: 2,
    allowance: 6000,
    allowancePeriod: 'MONTH',
    noAllowance: false,
    score: 75,
    isBookmarked: false,
  },
  {
    id: '3',
    jobTitle: 'รับนักศึกษาฝึกงาน UX/UI Designer',
    companyName: 'Creative Studio Co., Ltd.',
    companyEmail: 'contact@creativestudio.co.th',
    companyLogo: null,
    workplaceType: 'REMOTE',
    positions: ['UI Designer', 'Figma'],
    locationProvince: 'Bangkok',
    positionsAvailable: 1,
    allowance: 7000,
    allowancePeriod: 'MONTH',
    noAllowance: false,
    score: 68,
    isBookmarked: false,
  },
  {
    id: '4',
    jobTitle: 'รับนักศึกษาฝึกงาน Data Analyst',
    companyName: 'FinTech Solutions Co., Ltd.',
    companyEmail: 'recruit@fintechsolutions.co.th',
    companyLogo: null,
    workplaceType: 'HYBRID',
    positions: ['Data Analyst', 'Python'],
    locationProvince: 'Bangkok',
    positionsAvailable: 3,
    allowance: 8000,
    allowancePeriod: 'MONTH',
    noAllowance: false,
    score: 62,
    isBookmarked: false,
  },
]

export default function JobMatchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [jobs, setJobs] = useState<JobMatchPost[]>(mockJobMatches)

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

  const handleBookmark = async (id: string, next: boolean) => {
    try {
      if (next) {
        await apiFetch(`/api/bookmarks/${id}`, { method: 'POST' })
      } else {
        await apiFetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
      }
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, isBookmarked: next } : j))
    } catch (e) {
      console.error('Bookmark failed:', e)
    }
  }

  // Helper function to handle dynamic classes for Sidebar Links
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
            <header className="mb-8">
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
            </header>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="transform transition-transform hover:-translate-y-1">
                  <JobMatchCard
                    post={job}
                    onBookmark={handleBookmark}
                    onDetail={() => router.push(`/intern/find-companies/${job.id}`)}
                    onApply={() => router.push(`/intern/find-companies/${job.id}`)}
                  />
                </div>
              ))}
            </div>
            
            {jobs.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No matching jobs found at the moment.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}