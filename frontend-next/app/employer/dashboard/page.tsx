'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import EmployerApplicantsOverviewCard, { type EmployerApplicantsOverviewCardData } from '@/components/job-post/EmployerApplicantsOverviewCard'
import { apiFetch } from '@/lib/api'

interface JobPost extends EmployerApplicantsOverviewCardData {
  createdAt: string
}

export default function EmployerDashboardPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'latest'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  // Check user role and redirect if necessary
  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // If user has CANDIDATE role, redirect to intern pages
        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/dashboard')
          return
        }
        
        // If user has no role, redirect to role selection
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }
      } catch (error) {
        console.error('Failed to check user role:', error)
        // If auth fails, redirect to login
        router.push('/login')
      }
    }

    checkRole()
  }, [router])

  useEffect(() => {
    ;(async () => {
      try {
        const [postsResp, companyResp] = await Promise.all([
          apiFetch<{ jobPosts: any[] }>('/api/job-posts'),
          apiFetch<{ profile: { companyName?: string; email?: string; companyLogo?: string; logoURL?: string; profileImage?: string } }>('/api/companies/profile'),
        ])

        const companyName = companyResp?.profile?.companyName || 'Company Name'
        const companyEmail = companyResp?.profile?.email || 'info@companyhub.com'
        const companyLogoImage =
          companyResp?.profile?.companyLogo || companyResp?.profile?.logoURL || companyResp?.profile?.profileImage || ''

        const normalized: JobPost[] = await Promise.all(
          (postsResp.jobPosts || []).map(async (post: any) => {
            const createdAt = post.createdAt || post.updatedAt || new Date().toISOString()
            const diffMs = Math.max(Date.now() - new Date(createdAt).getTime(), 0)
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

            const postedDate =
              diffHours < 1 ? 'just now' : diffHours < 24 ? `${diffHours} hour${diffHours === 1 ? '' : 's'} ago` : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`

            const workType =
              post.workplaceType === 'ON_SITE'
                ? 'On-Site'
                : post.workplaceType === 'HYBRID'
                ? 'Hybrid'
                : post.workplaceType === 'REMOTE'
                ? 'Remote'
                : 'On-Site'

            const allowance =
              post.noAllowance
                ? 'No allowance'
                : post.allowance
                ? `${Number(post.allowance).toLocaleString()} THB`
                : '-'

            let applicantsCount = 0
            try {
              const applicantsResp = await apiFetch<{ applicants: any[] }>(`/api/job-posts/${post.id}/applicants`)
              applicantsCount = applicantsResp.applicants?.length || 0
            } catch {
              applicantsCount = 0
            }

            return {
              id: post.id,
              title: post.jobTitle || 'Untitled Job Post',
              companyName,
              companyEmail,
              companyLogo: companyName.substring(0, 2).toUpperCase(),
              companyLogoImage,
              workType,
              secondaryTag: post.jobType ? String(post.jobType).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'AI Developer',
              preferred: post.locationProvince || post.locationDistrict || 'Bangkok',
              applicantsCount,
              allowance,
              postedDate,
              isNew: diffHours < 24,
              createdAt,
            }
          })
        )

        setJobPosts(normalized)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to load candidates')
        setJobPosts([])
      }
    })()
  }, [])

  const filteredJobPosts = useMemo(() => {
    const query = searchQuery.toLowerCase()

    return [...jobPosts]
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(query) ||
          post.companyName.toLowerCase().includes(query) ||
          post.secondaryTag.toLowerCase().includes(query)

        if (activeFilter === 'new') return matchesSearch && !!post.isNew
        return matchesSearch
      })
      .sort((a, b) => {
        if (activeFilter === 'latest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return 0
      })
  }, [jobPosts, searchQuery, activeFilter])

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <EmployerNavbar />
      <div className="flex">
        <EmployerSidebar activeItem="applicants" />

        {/* Main Content */}
        <div className="flex-1 bg-[#E6EBF4]">
          <div className="mx-auto max-w-[1240px] px-[32px] py-[34px]">
          {apiError && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {apiError}
            </div>
          )}
          <div className="mb-[18px] flex items-start justify-between gap-6">
            <div>
              <div className="flex items-start gap-4">
                <h1 className="text-[32px] font-bold leading-none tracking-[-0.02em] text-[#05060A]">
                  Applicants
                </h1>
              </div>
              <p className="mt-4 text-[14px] text-[#6B7280]">
                View and manage your job posts and track applicants for each position.
              </p>
            </div>

            <div className="relative pt-[2px]">
              <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-[30px] w-[282px] rounded-full border border-[#C9CED8] bg-white pl-[44px] pr-5 text-[12px] text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
              />
            </div>
          </div>

          <div className="mb-[12px] flex gap-[6px]">
            {([
              ['all', 'All'],
              ['new', 'New'],
              ['latest', 'Lastest'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className="h-[30px] rounded-[6px] border px-5 text-[12px] font-semibold transition-colors"
                style={{
                  borderColor: activeFilter === value ? '#2563EB' : '#D1D5DB',
                  backgroundColor: activeFilter === value ? '#FFFFFF' : '#F3F4F6',
                  color: activeFilter === value ? '#2563EB' : '#111827',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mb-[16px] text-[14px] font-semibold text-[#111827]">
            {filteredJobPosts.length} Total Job Post
          </p>

          {filteredJobPosts.length === 0 && (
            <div className="rounded-[12px] bg-white px-6 py-12 text-center text-[#6B7280] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              No job posts found matching your search.
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredJobPosts.map((post) => (
              <EmployerApplicantsOverviewCard key={post.id} post={post} />
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

