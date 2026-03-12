'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import EmployerJobPostCard, { type EmployerJobPostCardData } from '@/components/job-post/EmployerJobPostCard'
import CreateJobPostModal, { type CreateJobPostModalValues } from '@/components/job-post/CreateJobPostModal'
import { apiFetch } from '@/lib/api'

interface JobPost extends EmployerJobPostCardData {
  createdAt: string
}

const mockJobPosts: JobPost[] = [
  {
    id: '1',
    title: 'Internship - UX/UI Designer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TR',
    companyEmail: 'info@trinitythai.com',
    location: 'Bangkok',
    workType: 'Hybrid',
    secondaryTag: 'UX/UI Designer',
    applicantsCount: 0,
    allowance: 'No allowance',
    postedDate: '4 days ago',
    isOpen: true,
    createdAt: new Date().toISOString(),
  },
]

export default function JobPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [jobPosts, setJobPosts] = useState<JobPost[]>(mockJobPosts)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'latest' | 'open' | 'closed'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreatingJobPost, setIsCreatingJobPost] = useState(false)
  const [createJobPostError, setCreateJobPostError] = useState<string | null>(null)
  const [jobPostActionError, setJobPostActionError] = useState<string | null>(null)
  const [togglingPostId, setTogglingPostId] = useState<string | null>(null)

  const getRelativeTimeLabel = (value: string) => {
    const createdAt = new Date(value)
    const now = new Date()
    const diffMs = Math.max(now.getTime() - createdAt.getTime(), 0)
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const toTitleCase = (value: string) =>
    value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const formatWorkTypeLabel = (value: string | null | undefined) =>
    value === 'ON_SITE'
      ? 'On-Site'
      : value === 'HYBRID'
      ? 'Hybrid'
      : value === 'REMOTE'
      ? 'Remote'
      : value === 'on-site'
      ? 'On-Site'
      : value === 'hybrid'
      ? 'Hybrid'
      : value === 'remote'
      ? 'Remote'
      : 'On-Site'

  const loadJobPosts = useCallback(async () => {
    try {
      const [postsResp, companyResp] = await Promise.all([
        apiFetch<{ jobPosts: any[] }>('/api/job-posts'),
        apiFetch<{ profile: { companyName?: string; email?: string; companyLogo?: string; logoURL?: string; profileImage?: string } }>('/api/companies/profile'),
      ])

      const companyName = companyResp?.profile?.companyName || 'Company Name'
      const companyEmail = companyResp?.profile?.email || 'info@trinitythai.com'
      const companyLogoImage =
        companyResp?.profile?.companyLogo || companyResp?.profile?.logoURL || companyResp?.profile?.profileImage || ''

      const formatted = await Promise.all(
        (postsResp.jobPosts || []).map(async (post: any) => {
          const workplaceType =
            post.workplaceType === 'ON_SITE'
              ? 'On-Site'
              : post.workplaceType === 'HYBRID'
              ? 'Hybrid'
              : post.workplaceType === 'REMOTE'
              ? 'Remote'
              : 'On-Site'

          const createdAt = post.createdAt || post.updatedAt || new Date().toISOString()
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
            companyLogo: companyName.substring(0, 2).toUpperCase(),
            companyLogoImage,
            companyEmail,
            location: post.locationProvince || post.locationDistrict || 'Bangkok',
            workType: workplaceType,
            secondaryTag: post.jobType ? toTitleCase(post.jobType) : 'AI Developer',
            applicantsCount,
            allowance,
            postedDate: getRelativeTimeLabel(createdAt),
            isOpen: post.state !== 'CLOSED',
            createdAt,
          } as JobPost
        })
      )

      setJobPosts(formatted.length > 0 ? formatted : [])
    } catch (e) {
      console.error('Failed to load job posts from API, falling back to mock/local:', e)

      const savedJobPosts = localStorage.getItem('jobPosts')
      if (savedJobPosts) {
        try {
          const posts = JSON.parse(savedJobPosts)
          const formattedPosts = posts.map((post: any) => {
            const createdAt = post.createdAt || new Date().toISOString()
            return {
              id: post.id || Date.now().toString(),
              title: post.jobTitle || post.title || 'Untitled Job Post',
              companyName: post.companyName || 'Company Name',
              companyLogo: (post.companyName || 'Company').substring(0, 2).toUpperCase(),
              companyLogoImage: post.companyLogoImage || post.companyLogo || '',
              companyEmail: post.companyEmail || 'info@trinitythai.com',
              location: post.locationProvince || post.location || 'Bangkok',
              workType:
                post.workplaceType === 'on-site'
                  ? 'On-Site'
                  : post.workplaceType === 'hybrid'
                  ? 'Hybrid'
                  : post.workplaceType === 'remote'
                  ? 'Remote'
                  : 'On-Site',
              secondaryTag: post.jobType ? toTitleCase(post.jobType) : 'AI Developer',
              applicantsCount: post.applicantsCount || 0,
              allowance: post.allowance ? `${post.allowance} THB` : 'No allowance',
              postedDate: getRelativeTimeLabel(createdAt),
              isOpen: post.state !== 'CLOSED',
              createdAt,
            } as JobPost
          })
          setJobPosts(formattedPosts.length > 0 ? formattedPosts : mockJobPosts)
          return
        } catch (err) {
          console.error('Failed to parse job posts localStorage fallback:', err)
        }
      }

      setJobPosts(mockJobPosts)
    }
  }, [])

  useEffect(() => {
    loadJobPosts()
  }, [loadJobPosts])

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true)
    }
  }, [searchParams])

  useEffect(() => {
    const handleOpenModal = () => {
      setCreateJobPostError(null)
      setShowCreateModal(true)
    }

    window.addEventListener('openCreateJobPostModal', handleOpenModal)
    return () => {
      window.removeEventListener('openCreateJobPostModal', handleOpenModal)
    }
  }, [])

  const filteredJobPosts = jobPosts
    .filter((post) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        post.title.toLowerCase().includes(query) ||
        post.companyName.toLowerCase().includes(query)

      if (activeFilter === 'open') return matchesSearch && post.isOpen
      if (activeFilter === 'closed') return matchesSearch && !post.isOpen
      return matchesSearch
    })
    .sort((a, b) => {
      if (activeFilter === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

  const handleDeleteClick = (post: JobPost) => {
    setJobToDelete(post)
    setShowDeleteModal(true)
  }

  const handleToggleStatus = async (post: JobPost) => {
    if (togglingPostId === post.id) return

    const nextIsOpen = !post.isOpen
    const nextState = nextIsOpen ? 'PUBLISHED' : 'CLOSED'

    setJobPostActionError(null)
    setTogglingPostId(post.id)
    setJobPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, isOpen: nextIsOpen } : item)))

    try {
      const response = await apiFetch<{
        success: boolean
        jobPost?: {
          state?: string | null
        } | null
      }>(`/api/job-posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ state: nextState }),
      })

      const resolvedIsOpen = response.jobPost?.state ? response.jobPost.state !== 'CLOSED' : nextIsOpen
      setJobPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, isOpen: resolvedIsOpen } : item)))
    } catch (error) {
      console.error('Failed to toggle job post status:', error)
      setJobPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, isOpen: post.isOpen } : item)))
      setJobPostActionError(error instanceof Error ? error.message : 'Failed to update job post status')
    } finally {
      setTogglingPostId((current) => (current === post.id ? null : current))
    }
  }

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return
    try {
      await apiFetch(`/api/job-posts/${jobToDelete.id}`, { method: 'DELETE' })
      setJobPosts((prev) => prev.filter((p) => p.id !== jobToDelete.id))
    } catch (e) {
      console.error('Failed to delete job post:', e)
    } finally {
      setShowDeleteModal(false)
      setJobToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setJobToDelete(null)
  }

  const handleOpenCreateModal = () => {
    setCreateJobPostError(null)
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    if (searchParams.get('create') === '1') {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/employer/job-post')
      }
    }
  }

  const handleCreateJobPost = async (values: CreateJobPostModalValues) => {
    if (isCreatingJobPost) return
    setIsCreatingJobPost(true)
    setCreateJobPostError(null)

    try {
      const response = await apiFetch<{
        success: boolean
        jobPost: {
          id: string
          jobTitle?: string | null
          workplaceType?: string | null
          jobType?: string | null
          allowance?: number | null
          noAllowance?: boolean | null
          state?: string | null
          createdAt?: string | null
          updatedAt?: string | null
          locationProvince?: string | null
          locationDistrict?: string | null
          Company?: {
            companyName?: string | null
            logoURL?: string | null
          } | null
        }
      }>('/api/job-posts', {
        method: 'POST',
        body: JSON.stringify({
          jobTitle: values.jobTitle,
          workplaceType: values.workplaceType,
          jobType: 'Internship',
          allowance: values.allowance.replace(/,/g, '').trim(),
          allowancePeriod: values.allowancePeriod,
          gpa: values.gpa.trim(),
          noAllowance: !values.allowance.trim(),
          jobPostStatus: 'urgent',
          jobDescription: values.jobDescription,
          jobSpecification: values.jobSpecification,
          locationProvince: '',
          locationDistrict: '',
          state: 'PUBLISHED',
        }),
      })

      const createdPost = response.jobPost
      const companyName = createdPost.Company?.companyName || jobPosts[0]?.companyName || 'Company Name'
      const companyLogoImage = createdPost.Company?.logoURL || jobPosts[0]?.companyLogoImage || ''
      const companyEmail = jobPosts[0]?.companyEmail || 'info@trinitythai.com'
      const createdAt = createdPost.createdAt || createdPost.updatedAt || new Date().toISOString()
      const createdAllowance =
        createdPost.noAllowance || !createdPost.allowance
          ? 'No allowance'
          : `${Number(createdPost.allowance).toLocaleString()} THB`

      const optimisticPost: JobPost = {
        id: createdPost.id,
        title: createdPost.jobTitle || values.jobTitle || 'Untitled Job Post',
        companyName,
        companyLogo: companyName.substring(0, 2).toUpperCase(),
        companyLogoImage,
        companyEmail,
        location: createdPost.locationProvince || createdPost.locationDistrict || 'Bangkok',
        workType: formatWorkTypeLabel(createdPost.workplaceType),
        secondaryTag: createdPost.jobType ? toTitleCase(createdPost.jobType) : 'Internship',
        applicantsCount: 0,
        allowance: createdAllowance,
        postedDate: 'just now',
        isOpen: createdPost.state !== 'CLOSED',
        createdAt,
      }

      setJobPosts((prev) => {
        const next = [optimisticPost, ...prev.filter((post) => post.id !== optimisticPost.id)]
        return next
      })

      void loadJobPosts()
      handleCloseCreateModal()
    } catch (error) {
      console.error('Failed to create job post:', error)
      setCreateJobPostError(error instanceof Error ? error.message : 'Failed to create job post')
    } finally {
      setIsCreatingJobPost(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <EmployerNavbar />
      <div className="flex min-h-[calc(100vh-100px)]">
        <EmployerSidebar activeItem="job-post" />

        <div className="flex-1 bg-[#E6EBF4]">
          <div className="layout-container layout-page">
            {jobPostActionError && (
              <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B91C1C]">
                {jobPostActionError}
              </div>
            )}

            {createJobPostError && (
              <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B91C1C]">
                {createJobPostError}
              </div>
            )}

            <div className="mb-[18px] flex items-start justify-between gap-6">
              <div>
                <h1 className="text-[32px] font-bold leading-none tracking-[-0.02em] text-[#05060A]">
                  Your Job Posts
                </h1>
                <p className="mt-4 text-[14px] text-[#6B7280]">
                  Create, manage, and update the status of your job posts.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-[4px]">
                <div className="relative">
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
                    className="h-[38px] w-[356px] rounded-full border border-[#C9CED8] bg-white pl-[50px] pr-5 text-[14px] text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex h-[38px] items-center justify-center rounded-full border border-[#2563EB] bg-white px-6 text-[14px] font-semibold text-[#2563EB] transition hover:bg-[#EEF4FF]"
                >
                  + Create Job Post
                </button>
              </div>
            </div>

            <div className="mb-[16px] flex gap-[6px]">
              {([
                ['all', 'All'],
                ['latest', 'Lastest'],
                ['open', 'Open'],
                ['closed', 'Closed'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className="h-[36px] rounded-[7px] border px-6 text-[14px] font-semibold transition-colors"
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

            <p className="mb-[16px] text-[16px] font-semibold text-[#111827]">
              {filteredJobPosts.length} Total Job Post
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredJobPosts.map((post) => (
                <EmployerJobPostCard
                  key={post.id}
                  post={post}
                  isTogglePending={togglingPostId === post.id}
                  onToggleStatus={() => void handleToggleStatus(post)}
                  onDelete={() => handleDeleteClick(post)}
                />
              ))}
            </div>

            {filteredJobPosts.length === 0 && (
              <div className="rounded-[12px] bg-white px-6 py-12 text-center text-[#6B7280] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                No job posts found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[18px] bg-white p-8 shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 22h20L12 2z" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">!</span>
                </div>
              </div>
            </div>

            <h2 className="mb-3 text-center text-xl font-bold text-gray-900">Delete this job post?</h2>
            <p className="mb-6 text-center text-gray-600">
              This action will permanently delete this job post and remove all associated applicants.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateJobPostModal
        isOpen={showCreateModal}
        isSubmitting={isCreatingJobPost}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateJobPost}
      />
    </div>
  )
}
