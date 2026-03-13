'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import { apiFetch } from '@/lib/api'

interface JobPostDetail {
  id: string
  jobTitle?: string
  locationProvince?: string | null
  locationDistrict?: string | null
  jobType?: string | null
  positionsAvailable?: number | null
  gpa?: string | null
  workplaceType?: string | null
  allowance?: number | null
  allowancePeriod?: 'MONTH' | 'WEEK' | 'DAY' | null
  noAllowance?: boolean | null
  jobDescription?: string | null
  jobSpecification?: string | null
  createdAt?: string
  ScreeningQuestions?: Array<{ id: string }>
  Company?: {
    companyName?: string | null
    logoURL?: string | null
  } | null
}

interface CompanyProfile {
  companyName?: string
  companyDescription?: string
  phoneNumber?: string
  email?: string
  contactName?: string
  addressDetails?: string
  subDistrict?: string
  district?: string
  province?: string
  postcode?: string
  companyLogo?: string
  logoURL?: string
  profileImage?: string
}

const formatPostedDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatWorkType = (value?: string | null) => {
  if (!value) return 'On-Site'
  if (value === 'ON_SITE' || value === 'on-site') return 'On-Site'
  if (value === 'HYBRID' || value === 'hybrid') return 'Hybrid'
  if (value === 'REMOTE' || value === 'remote') return 'Remote'
  return value
}

const formatJobType = (value?: string | null) => {
  if (!value) return 'AI Developer'
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatAllowance = (jobPost: JobPostDetail) => {
  if (jobPost.noAllowance) return 'No allowance'
  if (!jobPost.allowance) return '-'

  const periodMap: Record<string, string> = {
    MONTH: 'Month',
    WEEK: 'Week',
    DAY: 'Day',
  }

  return `${Number(jobPost.allowance).toLocaleString()} THB${jobPost.allowancePeriod ? ` / ${periodMap[jobPost.allowancePeriod] || jobPost.allowancePeriod}` : ''}`
}

const renderLines = (text?: string | null) => {
  const lines = (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return <p className="text-[13px] text-[#6B7280]">-</p>
  }

  return (
    <div className="space-y-[6px]">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="text-[12px] leading-[1.65] text-[#6B7280]">
          {line.startsWith('-') ? line : `- ${line}`}
        </p>
      ))}
    </div>
  )
}

export default function EmployerViewPostPage() {
  const params = useParams()
  const router = useRouter()
  const jobPostId = params?.id as string

  const [jobPost, setJobPost] = useState<JobPostDetail | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!jobPostId) return

      try {
        const [jobResp, companyResp] = await Promise.all([
          apiFetch<{ jobPost: JobPostDetail }>(`/api/job-posts/${jobPostId}`),
          apiFetch<{ profile: CompanyProfile }>(`/api/companies/profile`),
        ])

        setJobPost(jobResp.jobPost)
        setCompanyProfile(companyResp.profile || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job post')
      }
    }

    load()
  }, [jobPostId])

  const fullAddress = useMemo(() => {
    if (!companyProfile) return ''
    return [
      companyProfile.addressDetails,
      companyProfile.subDistrict,
      companyProfile.district,
      companyProfile.province,
      companyProfile.postcode,
      'Thailand',
    ]
      .filter(Boolean)
      .join(', ')
  }, [companyProfile])

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-[#F6F7FB]">
        <EmployerNavbar />
        <div className="flex">
          <EmployerSidebar activeItem="applicants" />
          <div className="flex flex-1 items-center justify-center bg-[#E6EBF4]">
            <p className="text-sm text-[#6B7280]">{error || 'Loading job post...'}</p>
          </div>
        </div>
      </div>
    )
  }

  const positionsAvailable = jobPost.positionsAvailable || 1
  const companyLogo = companyProfile?.companyLogo || companyProfile?.logoURL || companyProfile?.profileImage || jobPost.Company?.logoURL || ''
  const workType = formatWorkType(jobPost.workplaceType)

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <EmployerNavbar />
      <div className="flex">
        <EmployerSidebar activeItem="applicants" />

        <div className="flex-1 bg-[#E6EBF4]">
          <div className="layout-container layout-page">
            <h1 className="mb-[26px] text-[24px] font-bold tracking-[-0.02em] text-[#05060A]">
              Applicants &gt; View Post
            </h1>

            <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[minmax(0,1fr)_244px]">
              <div className="rounded-[10px] bg-white px-[38px] py-[30px] shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <div className="mb-[10px] flex items-center gap-2 text-[12px] text-[#9CA3AF]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatPostedDate(jobPost.createdAt)}</span>
                </div>

                <h2 className="text-[18px] font-bold text-[#111827]">{jobPost.jobTitle || 'Untitled Job Post'}</h2>
                <p className="mt-[3px] text-[12px] text-[#8B94A7]">
                  {companyProfile?.companyName || jobPost.Company?.companyName || 'Company Name'}
                </p>

                <div className="mt-[10px] flex gap-[6px]">
                  <span
                    className="rounded-[5px] px-[12px] py-[3px] text-[10px] font-semibold text-white"
                    style={{ backgroundColor: workType === 'Hybrid' ? '#3B82F6' : '#F4C14D' }}
                  >
                    {workType}
                  </span>
                  <span className="rounded-[5px] bg-[#E5E7EB] px-[12px] py-[3px] text-[10px] font-semibold text-[#4B5563]">
                    {formatJobType(jobPost.jobType)}
                  </span>
                </div>

                <div className="mt-[14px] space-y-[18px]">
                  <div>
                    <h3 className="text-[12px] font-bold text-[#111827]">
                      Number of positions available: {positionsAvailable}
                    </h3>
                  </div>

                  <div>
                    <h3 className="mb-[8px] text-[12px] font-bold text-[#111827]">Job description</h3>
                    {renderLines(jobPost.jobDescription)}
                  </div>

                  <div>
                    <h3 className="mb-[8px] text-[12px] font-bold text-[#111827]">Applicant qualifications</h3>
                    {renderLines(jobPost.jobSpecification)}
                  </div>

                  <div>
                    <h3 className="mb-[8px] text-[12px] font-bold text-[#111827]">GPA</h3>
                    <p className="text-[12px] text-[#6B7280]">{jobPost.gpa || 'Not specified'}</p>
                  </div>

                  <div>
                    <h3 className="mb-[8px] text-[12px] font-bold text-[#111827]">Allowance</h3>
                    <p className="text-[12px] text-[#6B7280]">{formatAllowance(jobPost)}</p>
                  </div>

                  <div>
                    <h3 className="mb-[8px] text-[12px] font-bold text-[#111827]">Preferred Location</h3>
                    <p className="text-[12px] text-[#6B7280]">
                      {jobPost.locationProvince || jobPost.locationDistrict || '-'}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-[8px] text-[12px] font-bold text-[#111827]">Working Days &amp; Hours</h3>
                    <p className="text-[12px] text-[#9CA3AF]">Monday-Friday, 9:30 AM - 4:00 PM</p>
                  </div>
                </div>

                <div className="mt-[22px] flex justify-end">
                  <button
                    onClick={() => router.back()}
                    className="rounded-[4px] border border-[#2563EB] bg-white px-[14px] py-[4px] text-[11px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8]"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="rounded-[10px] bg-white px-[24px] py-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <h2 className="text-center text-[16px] font-bold text-[#111827]">Job Poster</h2>

                <div className="mt-[16px] flex flex-col items-center text-center">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F3F4F7]">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyProfile?.companyName || 'Company'}
                        className="h-[46px] w-[46px] rounded-[4px] object-contain"
                      />
                    ) : (
                      <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[4px] bg-[#23356E] text-xs font-bold text-white">
                        {(companyProfile?.companyName || 'C').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-[14px] text-[13px] font-bold text-[#111827]">
                    {companyProfile?.companyName || jobPost.Company?.companyName || 'Company Name'}
                  </h3>
                  <p className="mt-[4px] text-[11px] text-[#9CA3AF]">{companyProfile?.email || '-'}</p>

                  <p className="mt-[16px] text-left text-[11px] leading-[1.7] text-[#6B7280]">
                    {companyProfile?.companyDescription || '-'}
                  </p>
                </div>

                <div className="mt-[18px] space-y-[16px]">
                  <div>
                    <h4 className="mb-[8px] text-[12px] font-bold text-[#111827]">Contact Information</h4>
                    <div className="space-y-[6px] text-[11px] text-[#4B5563]">
                      <p className="flex items-center gap-2">
                        <span className="text-[#2563EB]">✆</span>
                        <span>{companyProfile?.phoneNumber || '-'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#2563EB]">⌁</span>
                        <span>{companyProfile?.contactName || '-'}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-[8px] text-[12px] font-bold text-[#111827]">Address</h4>
                    <p className="text-[11px] leading-[1.65] text-[#6B7280]">{fullAddress || '-'}</p>
                    <div className="mt-[10px] overflow-hidden rounded-[4px] border border-[#E5E7EB]">
                      <iframe
                        title="Company location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress || 'Bangkok, Thailand')}&output=embed`}
                        className="h-[144px] w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
