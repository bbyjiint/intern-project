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
  const isAIJobMatchPage = pathname === '/intern/ai-job-match'  // ← แก้
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
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('log in')) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6EBF4]">
        <InternNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E6EBF4]">
      <InternNavbar />
      <div className="flex">

        {/* Sidebar */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">

            {/* Profile + dropdown */}
            <div className="profile-dropdown-container">
              <button
                onClick={() => router.push('/intern/profile')}
                className="w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
                style={{
                  color: pathname === '/intern/profile' ? 'white' : '#1C2D4F',
                  backgroundColor: pathname === '/intern/profile' ? '#0273B1' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/intern/profile') {
                    e.currentTarget.style.color = '#0273B1'
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/intern/profile') {
                    e.currentTarget.style.color = '#1C2D4F'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Profile</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(true) }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <svg className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </button>

              {isProfileDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  {[
                    { href: '/intern/ai-analysis', label: 'AI Analysis', active: isAIAnalysisPage, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                    { href: '/intern/certificates', label: 'Certificates', active: isCertificatesPage, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                    { href: '/intern/project', label: 'Project', active: isProjectPage, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
                  ].map(({ href, label, active, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                      style={{ color: active ? 'white' : '#1C2D4F', backgroundColor: active ? '#0273B1' : 'transparent' }}
                      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = '#F0F4F8'; e.currentTarget.style.color = '#0273B1' } }}
                      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1C2D4F' } }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Job Match, Applied, Bookmark — ระดับเดียวกัน */}
            {[
              { href: '/intern/ai-job-match', label: 'AI Job Match', active: isAIJobMatchPage, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
              { href: '/intern/applied', label: 'Applied', active: pathname === '/intern/applied', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
              { href: '/intern/bookmark', label: 'Bookmark', active: pathname === '/intern/bookmark', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /> },
            ].map(({ href, label, active, icon }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
                style={{
                  color: active ? 'white' : '#1C2D4F',
                  backgroundColor: active ? '#0273B1' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#0273B1'
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#1C2D4F'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                <span className="font-medium">{label}</span>
              </Link>
            ))}

          </div>
        </div>

        {/* Main Content */}
        <div className="layout-container layout-page flex-1">
          <div className="mb-6">
            <h1 className="text-[30px] font-bold text-black">AI Job Match</h1>
            <p className="mt-[6px] text-[16px] font-semibold text-[#1F2937]">Job Recommendations from Ai</p>
            <p className="mt-[4px] text-[13px] text-[#6B7280]">
              A collection of jobs/internships you might be interested in, updated recently.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobMatchCard
                key={job.id}
                post={job}
                onBookmark={handleBookmark}
                onDetail={() => router.push(`/intern/find-companies/${job.id}`)}
                onApply={() => router.push(`/intern/find-companies/${job.id}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}