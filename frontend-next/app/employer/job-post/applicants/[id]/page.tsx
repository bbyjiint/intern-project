'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import { apiFetch } from '@/lib/api'

type ApplicantStatus = 'new' | 'shortlisted' | 'reviewed' | 'rejected'
type ViewTab = 'all' | 'new' | 'job-match' | 'accepted' | 'declined'

interface Applicant {
  id: string
  candidateId: string
  name: string
  email: string
  initials: string
  appliedDate: string
  appliedAt?: string
  status: ApplicantStatus
  skills: string[]
  internshipPeriod?: string | null
  preferredPositions?: string[]
  preferredLocations?: string[]
  institution?: string | null
  academicYear?: string | null
  fieldOfStudy?: string | null
}

interface JobPost {
  id: string
  title: string
  companyName: string
  location: string
  workType: string
  jobDescription?: string | null
  jobSpecification?: string | null
  locationProvince?: string | null
  locationDistrict?: string | null
  jobType?: string | null
  state?: string | null
}

interface CandidateEducation {
  id?: string
  university: string
  educationLevel?: string | null
  degree?: string | null
  fieldOfStudy?: string | null
  yearOfStudy?: string | null
  gpa?: string | null
}

interface CandidateSkill {
  name: string
  level?: string
  rating?: number
}

interface CandidateProfile {
  id: string
  fullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  profileImage?: string | null
  internshipPeriod?: string | null
  bio?: string | null
  preferredPositions?: string[]
  preferredLocations?: string[]
  education?: CandidateEducation[]
  experience?: Array<{ id?: string }>
  projects?: Array<{ id?: string }>
  skills?: CandidateSkill[]
}

const mockApplicants: Applicant[] = [
  {
    id: '1',
    candidateId: '1',
    name: 'Ms. Jame Smith',
    email: 'jame.smith@example.com',
    initials: 'J',
    appliedDate: '1 hour ago',
    status: 'new',
    skills: ['AI Developer', 'Python', 'Machine Learning'],
    internshipPeriod: '25 January 2026 - 24 March 2026 (4 Month)',
    preferredPositions: ['Backend Developer', 'Software Engineer', 'AI Developer'],
    preferredLocations: ['Bangkok', 'Chiangmai'],
    institution: 'Mae Fah Luang University',
    academicYear: '4',
    fieldOfStudy: 'Computer Engineering',
  },
  {
    id: '2',
    candidateId: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    appliedDate: '5 hours ago',
    status: 'shortlisted',
    skills: ['React', 'TypeScript', 'Node.js'],
    internshipPeriod: '1 June 2026 - 31 August 2026 (3 Month)',
    preferredPositions: ['Frontend Developer', 'Software Engineer'],
    preferredLocations: ['Bangkok'],
    institution: 'Chulalongkorn University',
    academicYear: '3',
    fieldOfStudy: 'Computer Science',
  },
]

function normalizeText(value: string) {
  return value.toLowerCase().trim()
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9+#.-]+/i)
    .filter((part) => part.length > 2)
}

function formatDisplayDate(value?: string | null) {
  return value && value.trim() ? value : '-'
}

function parseInternshipPeriod(value?: string | null) {
  if (!value) {
    return { start: '', end: '', durationMonths: '' }
  }

  const dateMatches = value.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4}/g) || []
  const durationMatch = value.match(/(\d+)\s*(?:month|months)/i)

  return {
    start: dateMatches[0] || '',
    end: dateMatches[1] || '',
    durationMonths: durationMatch?.[1] || '',
  }
}

function toInputDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

function computeJobMatch(applicant: Applicant, jobPost: JobPost | null) {
  if (!jobPost) return 72

  const referenceText = [
    jobPost.title,
    jobPost.workType,
    jobPost.location,
    jobPost.jobType,
    jobPost.jobDescription,
    jobPost.jobSpecification,
    jobPost.locationProvince,
    jobPost.locationDistrict,
  ]
    .filter(Boolean)
    .join(' ')

  const referenceTokens = new Set(tokenize(referenceText))
  const fieldOfStudyTokens = tokenize(applicant.fieldOfStudy || '')

  const skillHits = applicant.skills.filter((skill) =>
    tokenize(skill).some((token) => referenceTokens.has(token) || normalizeText(referenceText).includes(token))
  ).length

  const preferredPositionHits = (applicant.preferredPositions || []).filter((position) =>
    normalizeText(referenceText).includes(normalizeText(position))
  ).length

  const preferredLocationHits = (applicant.preferredLocations || []).filter((location) =>
    normalizeText(referenceText).includes(normalizeText(location))
  ).length

  const fieldHit = fieldOfStudyTokens.some((token) => referenceTokens.has(token)) ? 1 : 0

  let score = 42
  score += applicant.skills.length > 0 ? Math.round((skillHits / applicant.skills.length) * 34) : 8
  score += applicant.preferredPositions?.length ? Math.round((preferredPositionHits / applicant.preferredPositions.length) * 14) : 4
  score += applicant.preferredLocations?.length ? Math.round((preferredLocationHits / applicant.preferredLocations.length) * 8) : 4
  score += fieldHit ? 6 : 0

  return Math.max(48, Math.min(98, score))
}

function calculateProfileCompletion(profile: CandidateProfile | null) {
  if (!profile) return 0

  const checks = [
    !!profile.profileImage,
    !!profile.bio && profile.bio.trim().length > 0,
    !!profile.phoneNumber,
    !!profile.internshipPeriod,
    !!profile.education && profile.education.length > 0,
    !!profile.skills && profile.skills.length > 0,
    !!profile.experience && profile.experience.length > 0,
    !!profile.projects && profile.projects.length > 0,
    !!profile.preferredPositions && profile.preferredPositions.length > 0,
    !!profile.preferredLocations && profile.preferredLocations.length > 0,
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function CircularProgress({
  percentage,
  label,
}: {
  percentage: number
  label: string
}) {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage))
  const size = 240
  const center = size / 2
  const totalSegments = 40
  const activeSegments = Math.round((normalizedPercentage / 100) * totalSegments)
  const outerRadius = 104
  const innerRadius = 86

  return (
    <div className="relative h-[270px] w-[270px]">
      <svg
        width="270"
        height="270"
        viewBox={`0 0 ${size} ${size}`}
        className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        {Array.from({ length: totalSegments }).map((_, index) => {
          const angle = (-90 + (360 / totalSegments) * index) * (Math.PI / 180)
          const x1 = center + innerRadius * Math.cos(angle)
          const y1 = center + innerRadius * Math.sin(angle)
          const x2 = center + outerRadius * Math.cos(angle)
          const y2 = center + outerRadius * Math.sin(angle)

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={index < activeSegments ? '#F5B942' : '#DCE4F2'}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[38px] font-medium leading-none text-[#1F2937]">{normalizedPercentage}%</p>
        <p className="mt-[8px] max-w-[160px] text-center text-[17px] leading-[1.15] text-[#4B5563]">{label}</p>
      </div>
    </div>
  )
}

function ApplicantProfilePopup({
  applicant,
  profile,
  jobMatch,
  profileCompletion,
  isLoading,
  onClose,
  onSeeProfile,
}: {
  applicant: Applicant
  profile: CandidateProfile | null
  jobMatch: number
  profileCompletion: number
  isLoading: boolean
  onClose: () => void
  onSeeProfile: () => void
}) {
  const primaryEducation = profile?.education?.[0]
  const displayName = profile?.fullName || applicant.name
  const displayPhone = profile?.phoneNumber || '-'
  const displayEmail = profile?.email || applicant.email
  const about = profile?.bio?.trim() || 'No description provided.'
  const positions = profile?.preferredPositions?.length ? profile.preferredPositions : applicant.preferredPositions || []
  const locations = profile?.preferredLocations?.length ? profile.preferredLocations : applicant.preferredLocations || []
  const internshipPeriod = profile?.internshipPeriod || applicant.internshipPeriod || '-'
  const educationLine1 = primaryEducation
    ? `${primaryEducation.university}${primaryEducation.yearOfStudy ? ` | Year ${primaryEducation.yearOfStudy}${String(primaryEducation.yearOfStudy).trim() ? ' (Currently studying)' : ''}` : ''}`
    : applicant.institution
    ? `${applicant.institution}${applicant.academicYear ? ` | Year ${applicant.academicYear}` : ''}`
    : '-'
  const educationLine2 = primaryEducation
    ? `${primaryEducation.degree || ''}${primaryEducation.fieldOfStudy ? `${primaryEducation.degree ? ' in ' : ''}${primaryEducation.fieldOfStudy}` : ''}${primaryEducation.gpa ? ` | GPA: ${primaryEducation.gpa}` : ''}`.trim()
    : applicant.fieldOfStudy || '-'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-5" onClick={onClose}>
      <div
        className="relative max-h-[92vh] w-full max-w-[1280px] overflow-y-auto rounded-[18px] bg-white px-[48px] py-[30px] shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[22px] top-[18px] text-[#4B5563] transition hover:text-[#111827]"
          aria-label="Close profile popup"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="flex items-start justify-between gap-8">
          <div className="flex items-start gap-[28px]">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={displayName}
                className="h-[108px] w-[108px] rounded-full object-cover"
              />
            ) : (
              <div className="flex h-[108px] w-[108px] items-center justify-center rounded-full bg-[#3B82F6] text-[40px] font-semibold text-white">
                {applicant.initials}
              </div>
            )}

            <div className="pt-[12px]">
              <h2 className="text-[40px] font-bold leading-none text-black">{displayName}</h2>
              <p className="mt-[16px] text-[18px] text-[#97A0AF]">Phone: {displayPhone}</p>
              <p className="mt-[6px] text-[18px] text-[#97A0AF]">Email {displayEmail}</p>
              {isLoading && <p className="mt-[10px] text-[14px] text-[#6B7280]">Loading profile...</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={onSeeProfile}
            className="mt-[20px] flex h-[48px] items-center justify-center rounded-[10px] border border-[#2563EB] bg-white px-[24px] text-[16px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            See Profile
          </button>
        </div>

        <div className="mt-[30px] border-t border-[#E5E7EB] pt-[24px]">
          <div>
            <h3 className="text-[20px] font-bold text-[#344164]">About Me</h3>
            <p className="mt-[10px] max-w-[1080px] text-[17px] leading-[1.5] text-[#51617C]">{about}</p>
          </div>

          <div className="mt-[26px] grid grid-cols-2 gap-x-[56px] gap-y-[20px]">
            <div>
              <h3 className="text-[20px] font-bold text-[#344164]">Education</h3>
              <p className="mt-[10px] text-[17px] leading-[1.45] text-[#51617C]">{educationLine1}</p>
              <p className="mt-[4px] text-[17px] leading-[1.45] text-[#51617C]">{educationLine2 || '-'}</p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#344164]">Positions of Interest</h3>
              <div className="mt-[12px] flex flex-wrap gap-[8px]">
                {positions.length > 0 ? (
                  positions.map((position) => (
                    <span
                      key={position}
                      className="rounded-[8px] bg-[#E5E7EB] px-[18px] py-[8px] text-[15px] font-semibold text-[#374151]"
                    >
                      {position}
                    </span>
                  ))
                ) : (
                  <p className="text-[17px] text-[#51617C]">-</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#344164]">Internship Period</h3>
              <p className="mt-[10px] text-[17px] leading-[1.45] text-[#51617C]">{internshipPeriod}</p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#344164]">Preferred Locations</h3>
              <p className="mt-[10px] text-[17px] leading-[1.45] text-[#51617C]">
                {locations.length > 0 ? locations.join(', ') : '-'}
              </p>
            </div>
          </div>

          <div className="mt-[16px] grid grid-cols-2 place-items-center gap-y-4">
            <CircularProgress percentage={jobMatch} label="Job Match" />
            <CircularProgress percentage={profileCompletion} label="Profile Completion" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ViewApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const jobPostId = params?.id as string

  const [jobPost, setJobPost] = useState<JobPost | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('')
  const [institutionFilter, setInstitutionFilter] = useState('')
  const [durationFilter, setDurationFilter] = useState('')
  const [internshipStartFilter, setInternshipStartFilter] = useState('')
  const [internshipEndFilter, setInternshipEndFilter] = useState('')
  const [activeTab, setActiveTab] = useState<ViewTab>('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [selectedApplicantProfile, setSelectedApplicantProfile] = useState<CandidateProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [messagingCandidateId, setMessagingCandidateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!jobPostId) return

      setLoading(true)

      try {
        const [applicantsData, jobPostData] = await Promise.all([
          apiFetch<{ jobPost: JobPost; applicants: Applicant[] }>(`/api/job-posts/${jobPostId}/applicants`),
          apiFetch<{ jobPost: any }>(`/api/job-posts/${jobPostId}`),
        ])

        setApplicants(applicantsData.applicants || [])
        setJobPost({
          ...applicantsData.jobPost,
          state: jobPostData.jobPost?.state || null,
          jobDescription: jobPostData.jobPost?.jobDescription || null,
          jobSpecification: jobPostData.jobPost?.jobSpecification || null,
          locationProvince: jobPostData.jobPost?.locationProvince || null,
          locationDistrict: jobPostData.jobPost?.locationDistrict || null,
          jobType: jobPostData.jobPost?.jobType || null,
        })
      } catch (error) {
        console.error('Failed to load applicants:', error)
        setApplicants(mockApplicants)
        setJobPost({
          id: jobPostId,
          title: 'AI Engineer',
          companyName: 'CompanyHub',
          location: 'Bangkok',
          workType: 'Open',
          state: 'PUBLISHED',
          jobDescription: 'AI engineer internship focused on LLM apps, backend APIs, and prompt workflows.',
          jobSpecification: 'Python, ML, backend, communication, problem solving.',
          locationProvince: 'Bangkok',
          locationDistrict: 'Pathum Wan',
          jobType: 'Internship',
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [jobPostId])

  const applicantScores = useMemo(() => {
    const scoreMap = new Map<string, number>()
    applicants.forEach((applicant) => {
      scoreMap.set(applicant.id, computeJobMatch(applicant, jobPost))
    })
    return scoreMap
  }, [applicants, jobPost])

  const positionOptions = useMemo(() => {
    return Array.from(
      new Set(
        applicants.flatMap((applicant) => applicant.preferredPositions || []).filter(Boolean)
      )
    )
  }, [applicants])

  const institutionOptions = useMemo(() => {
    return Array.from(new Set(applicants.map((applicant) => applicant.institution).filter(Boolean) as string[]))
  }, [applicants])

  const academicYearOptions = useMemo(() => {
    return Array.from(new Set(applicants.map((applicant) => applicant.academicYear).filter(Boolean) as string[]))
  }, [applicants])

  const filteredApplicants = useMemo(() => {
    const items = applicants.filter((applicant) => {
      const search = normalizeText(searchQuery)
      const period = parseInternshipPeriod(applicant.internshipPeriod)
      const score = applicantScores.get(applicant.id) || 0

      const matchesSearch =
        !search ||
        normalizeText(applicant.name).includes(search) ||
        normalizeText(applicant.email).includes(search) ||
        normalizeText(applicant.fieldOfStudy || '').includes(search)

      const matchesPosition =
        !positionFilter ||
        (applicant.preferredPositions || []).some((position) => position === positionFilter)

      const matchesAcademicYear = !academicYearFilter || applicant.academicYear === academicYearFilter
      const matchesInstitution = !institutionFilter || applicant.institution === institutionFilter
      const matchesDuration = !durationFilter || period.durationMonths.includes(durationFilter)
      const matchesStart = !internshipStartFilter || toInputDate(period.start) === internshipStartFilter
      const matchesEnd = !internshipEndFilter || toInputDate(period.end) === internshipEndFilter

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'new' && applicant.status === 'new') ||
        (activeTab === 'accepted' && (applicant.status === 'shortlisted' || applicant.status === 'reviewed')) ||
        (activeTab === 'declined' && applicant.status === 'rejected') ||
        (activeTab === 'job-match' && score >= 70)

      return (
        matchesSearch &&
        matchesPosition &&
        matchesAcademicYear &&
        matchesInstitution &&
        matchesDuration &&
        matchesStart &&
        matchesEnd &&
        matchesTab
      )
    })

    if (activeTab === 'job-match') {
      return [...items].sort((a, b) => (applicantScores.get(b.id) || 0) - (applicantScores.get(a.id) || 0))
    }

    return items
  }, [
    academicYearFilter,
    activeTab,
    applicantScores,
    applicants,
    durationFilter,
    institutionFilter,
    internshipEndFilter,
    internshipStartFilter,
    positionFilter,
    searchQuery,
  ])

  const tabCounts = useMemo(() => {
    return {
      all: applicants.length,
      new: applicants.filter((applicant) => applicant.status === 'new').length,
      'job-match': applicants.filter((applicant) => (applicantScores.get(applicant.id) || 0) >= 70).length,
      accepted: applicants.filter((applicant) => applicant.status === 'shortlisted' || applicant.status === 'reviewed').length,
      declined: applicants.filter((applicant) => applicant.status === 'rejected').length,
    }
  }, [applicantScores, applicants])

  const handleClearFilters = () => {
    setSearchQuery('')
    setPositionFilter('')
    setAcademicYearFilter('')
    setInstitutionFilter('')
    setDurationFilter('')
    setInternshipStartFilter('')
    setInternshipEndFilter('')
    setActiveTab('all')
  }

  const handleViewProfile = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setSelectedApplicantProfile(null)
    setProfileLoading(true)

    apiFetch<{ profile: CandidateProfile }>(`/api/candidates/${applicant.candidateId}`)
      .then((data) => {
        setSelectedApplicantProfile(data.profile || null)
      })
      .catch((error) => {
        console.error('Failed to load candidate profile:', error)
      })
      .finally(() => {
        setProfileLoading(false)
      })
  }

  const handleMessageCandidate = async (candidateId: string) => {
    setMessagingCandidateId(candidateId)
    try {
      const data = await apiFetch<{ conversation: { id: string } }>('/api/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ candidateId }),
      })
      router.push(`/employer/messages?conversationId=${encodeURIComponent(data.conversation.id)}`)
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.details?.includes('already exists')) {
        router.push('/employer/messages')
        return
      }

      console.error('Failed to start conversation:', error)
      alert(error.details || error.message || 'Failed to start conversation')
    } finally {
      setMessagingCandidateId(null)
    }
  }

  const closeProfilePopup = () => {
    setSelectedApplicant(null)
    setSelectedApplicantProfile(null)
    setProfileLoading(false)
  }

  if (loading && !jobPost) {
    return (
      <div className="min-h-screen bg-[#F6F7FB]">
        <EmployerNavbar />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
          <p className="text-sm text-[#6B7280]">Loading candidates...</p>
        </div>
      </div>
    )
  }

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-[#F6F7FB]">
        <EmployerNavbar />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
          <p className="text-sm text-[#6B7280]">Job post not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <EmployerNavbar />
      <div className="flex min-h-[calc(100vh-100px)]">
        <EmployerSidebar activeItem="applicants" />

        <div className="flex-1 bg-[#E6EBF4]">
          <div className="mx-auto max-w-[1240px] px-[32px] py-[34px]">
            <div className="mb-[18px] flex items-start justify-between gap-6">
              <div>
                <h1 className="text-[30px] font-bold leading-none text-black">Applicants &#8250; View Candidates</h1>
                <p className="mt-[14px] text-[22px] font-semibold text-[#1F2937]">{jobPost.title}</p>
              </div>

              <div className="flex items-center gap-[10px] pt-3">
                <button
                  type="button"
                  className={`h-[22px] rounded-[4px] px-[15px] text-[10px] font-semibold transition ${
                    jobPost.state !== 'CLOSED'
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[#2563EB] bg-white text-[#2563EB]'
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  className={`h-[22px] rounded-[4px] px-[15px] text-[10px] font-semibold transition ${
                    jobPost.state === 'CLOSED'
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[#2563EB] bg-white text-[#2563EB]'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>

            <div className="rounded-[10px] bg-white px-[24px] py-[16px] shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              <div className="grid grid-cols-1 gap-x-3 gap-y-3 lg:grid-cols-3">
                <div>
                  <label className="mb-[5px] block text-[12px] font-bold text-[#111827]">Search</label>
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search"
                      className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white pl-[34px] pr-3 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-[5px] block text-[12px] font-bold text-[#111827]">Position</label>
                  <select
                    value={positionFilter}
                    onChange={(event) => setPositionFilter(event.target.value)}
                    className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[12px] text-[#6B7280] outline-none"
                  >
                    <option value="">Position</option>
                    {positionOptions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-[5px] block text-[12px] font-bold text-[#111827]">Academic Year</label>
                  <select
                    value={academicYearFilter}
                    onChange={(event) => setAcademicYearFilter(event.target.value)}
                    className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[12px] text-[#6B7280] outline-none"
                  >
                    <option value="">Year</option>
                    {academicYearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-[5px] block text-[12px] font-bold text-[#111827]">Internship Period</label>
                    <input
                      type="date"
                      value={internshipStartFilter}
                      onChange={(event) => setInternshipStartFilter(event.target.value)}
                      className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[12px] text-[#6B7280] outline-none"
                    />
                  </div>
                  <div className="pt-[19px]">
                    <input
                      type="date"
                      value={internshipEndFilter}
                      onChange={(event) => setInternshipEndFilter(event.target.value)}
                      className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[12px] text-[#6B7280] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-[5px] block text-[12px] font-bold text-[#111827]">Duration</label>
                  <input
                    type="text"
                    value={durationFilter}
                    onChange={(event) => setDurationFilter(event.target.value)}
                    placeholder="Duration (Month)"
                    className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="mb-[5px] block text-[12px] font-bold text-[#111827]">Institution</label>
                  <select
                    value={institutionFilter}
                    onChange={(event) => setInstitutionFilter(event.target.value)}
                    className="h-[30px] w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[12px] text-[#6B7280] outline-none"
                  >
                    <option value="">Select Institution Name</option>
                    {institutionOptions.map((institution) => (
                      <option key={institution} value={institution}>
                        {institution}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-[12px] flex justify-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex h-[22px] items-center justify-center rounded-[4px] border border-[#D1D5DB] bg-white px-[26px] text-[10px] font-semibold text-[#111827] transition hover:bg-[#F8FAFC]"
                >
                  Clear Filter
                </button>
              </div>
            </div>

            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              {[
                { key: 'all', label: 'All' },
                { key: 'new', label: 'New' },
                { key: 'job-match', label: 'Job Match' },
                { key: 'accepted', label: 'Accept' },
                { key: 'declined', label: 'Decline' },
              ].map((tab) => {
                const isActive = activeTab === (tab.key as ViewTab)
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as ViewTab)}
                    className={`min-w-[85px] rounded-[6px] border px-[18px] py-[8px] text-[12px] font-semibold transition ${
                      isActive
                        ? 'border-[#2563EB] bg-white text-[#2563EB]'
                        : 'border-[#CBD5E1] bg-white text-[#374151] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-[16px]">
              <p className="text-[14px] font-semibold text-[#1F2937]">
                {filteredApplicants.length} Total Candidate{filteredApplicants.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-[16px] grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredApplicants.map((applicant) => {
                const score = applicantScores.get(applicant.id) || 0
                const statusLabel =
                  applicant.status === 'shortlisted'
                    ? 'Accepted'
                    : applicant.status === 'rejected'
                    ? 'Declined'
                    : applicant.status === 'reviewed'
                    ? 'Reviewed'
                    : 'New'

                return (
                  <div
                    key={applicant.id}
                    className="relative flex h-full min-h-[274px] flex-col rounded-[12px] bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]"
                  >
                    {applicant.status === 'new' && (
                      <div className="absolute right-[74px] top-[-11px] flex h-[24px] items-center rounded-[4px] bg-[#FB5F5F] px-[10px] text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(251,95,95,0.2)]">
                        1 New
                        <span className="absolute bottom-[-5px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#FB5F5F]" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-[14px]">
                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#3B82F6] text-[14px] font-semibold text-white">
                          {applicant.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-bold text-[#111827]">{applicant.name}</h3>
                          <p className="mt-[2px] truncate text-[10px] text-[#9CA3AF]">{applicant.email}</p>
                        </div>
                      </div>

                      <div
                        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(#F59E0B ${score}%, #E5E7EB ${score}% 100%)`,
                        }}
                      >
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#4B5563]">
                          {score}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-[10px] grid grid-cols-[92px_1fr] gap-y-[6px] text-[11px]">
                      <p className="text-[#9CA3AF]">Intern Period</p>
                      <p className="font-semibold text-[#111827]">{formatDisplayDate(applicant.internshipPeriod)}</p>

                      <p className="text-[#9CA3AF]">Institution</p>
                      <p className="font-semibold text-[#111827]">{formatDisplayDate(applicant.institution)}</p>

                      <p className="text-[#9CA3AF]">Academic Year</p>
                      <p className="font-semibold text-[#111827]">{formatDisplayDate(applicant.academicYear)}</p>

                      <p className="text-[#9CA3AF]">Field of Study</p>
                      <p className="font-semibold text-[#111827]">{formatDisplayDate(applicant.fieldOfStudy)}</p>

                      <p className="text-[#9CA3AF]">Preferred</p>
                      <p className="font-semibold text-[#111827]">
                        {applicant.preferredLocations?.length ? applicant.preferredLocations.join(', ') : '-'}
                      </p>
                    </div>

                    <div className="mt-[10px] flex flex-wrap gap-[6px]">
                      {(applicant.preferredPositions?.length ? applicant.preferredPositions : applicant.skills).slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-[4px] bg-[#F3F4F6] px-[10px] py-[4px] text-[10px] font-medium text-[#4B5563]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-[12px] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[#9CA3AF]">{applicant.appliedDate}</p>
                        <p className="mt-[3px] text-[10px] font-semibold text-[#4B5563]">{statusLabel}</p>
                      </div>

                      <div className="flex items-center gap-[6px]">
                        <button
                          type="button"
                          onClick={() => handleMessageCandidate(applicant.candidateId)}
                          disabled={messagingCandidateId === applicant.candidateId}
                          className="flex h-[22px] items-center justify-center rounded-[4px] border border-[#2563EB] bg-white px-[14px] text-[10px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] disabled:opacity-60"
                        >
                          {messagingCandidateId === applicant.candidateId ? 'Loading...' : 'Message'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewProfile(applicant)}
                          className="flex h-[22px] items-center justify-center rounded-[4px] border border-[#2563EB] bg-white px-[10px] text-[10px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8]"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!loading && filteredApplicants.length === 0 && (
              <div className="mt-6 rounded-[10px] bg-white px-6 py-10 text-center text-[14px] text-[#6B7280] shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                No candidates found for the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedApplicant && (
        <ApplicantProfilePopup
          applicant={selectedApplicant}
          profile={selectedApplicantProfile}
          jobMatch={applicantScores.get(selectedApplicant.id) || 0}
          profileCompletion={calculateProfileCompletion(selectedApplicantProfile)}
          isLoading={profileLoading}
          onClose={closeProfilePopup}
          onSeeProfile={() => router.push(`/employer/candidate/${encodeURIComponent(selectedApplicantProfile?.fullName || selectedApplicant.name)}`)}
        />
      )}
    </div>
  )
}
