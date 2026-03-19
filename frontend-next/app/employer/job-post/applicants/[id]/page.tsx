'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import { apiFetch } from '@/lib/api'
import { useTheme } from '@/components/ThemeProvider'

import ApplicantCard, { type Applicant } from '@/components/job-post/ApplicantCard'
import ApplicantFilters, { type ViewTab } from '@/components/job-post/ApplicantFilters'
import ApplicantProfilePopup, {
  type CandidateProfile,
  calculateProfileCompletion,
} from '@/components/job-post/ApplicantProfilePopup'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface University {
  id: string
  name: string
  thname: string | null
  code: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(value: string) {
  return value.toLowerCase().trim()
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9+#.-]+/i)
    .filter((part) => part.length > 2)
}

function computeJobMatch(applicant: Applicant, jobPost: JobPost | null): number {
  if (!jobPost) return 72
  const referenceText = [
    jobPost.title, jobPost.workType, jobPost.location, jobPost.jobType,
    jobPost.jobDescription, jobPost.jobSpecification,
    jobPost.locationProvince, jobPost.locationDistrict,
  ].filter(Boolean).join(' ')
  const referenceTokens = new Set(tokenize(referenceText))
  const fieldTokens = tokenize(applicant.fieldOfStudy || '')
  const skillHits = applicant.skills.filter((s) =>
    tokenize(s).some((t) => referenceTokens.has(t) || normalizeText(referenceText).includes(t))
  ).length
  const posHits = (applicant.preferredPositions || []).filter((p) =>
    normalizeText(referenceText).includes(normalizeText(p))
  ).length
  const locHits = (applicant.preferredLocations || []).filter((l) =>
    normalizeText(referenceText).includes(normalizeText(l))
  ).length
  const fieldHit = fieldTokens.some((t) => referenceTokens.has(t)) ? 1 : 0
  let score = 42
  score += applicant.skills.length > 0 ? Math.round((skillHits / applicant.skills.length) * 34) : 8
  score += applicant.preferredPositions?.length ? Math.round((posHits / applicant.preferredPositions.length) * 14) : 4
  score += applicant.preferredLocations?.length ? Math.round((locHits / applicant.preferredLocations.length) * 8) : 4
  score += fieldHit ? 6 : 0
  return Math.max(48, Math.min(98, score))
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockApplicants: Applicant[] = [
  {
    id: '1', candidateId: '1', name: 'Ms. Jame Smith', email: 'jame.smith@example.com',
    initials: 'J', appliedDate: '1 hour ago', status: 'new',
    skills: ['AI Developer', 'Python', 'Machine Learning'],
    internshipPeriod: '25 January 2026 - 24 March 2026 (4 Month)',
    preferredPositions: ['Backend Developer', 'Software Engineer', 'AI Developer'],
    preferredLocations: ['Bangkok', 'Chiangmai'],
    institution: 'Mae Fah Luang University', academicYear: '4', fieldOfStudy: 'Computer Engineering',
    profileImage: null,
  },
  {
    id: '2', candidateId: '2', name: 'John Doe', email: 'john.doe@example.com',
    initials: 'JD', appliedDate: '5 hours ago', status: 'shortlisted',
    skills: ['React', 'TypeScript', 'Node.js'],
    internshipPeriod: '1 June 2026 - 31 August 2026 (3 Month)',
    preferredPositions: ['Frontend Developer', 'Software Engineer'],
    preferredLocations: ['Bangkok'],
    institution: 'Chulalongkorn University', academicYear: '3', fieldOfStudy: 'Computer Science',
    profileImage: null,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const jobPostId = params?.id as string

  const [jobPost, setJobPost] = useState<JobPost | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [stateUpdating, setStateUpdating] = useState(false)

  // ✅ AI scores state
  const [aiScores, setAiScores] = useState<Map<string, number>>(new Map())
  const [scoresLoading, setScoresLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('')
  const [institutionFilter, setInstitutionFilter] = useState('')
  const [durationFilter, setDurationFilter] = useState('')
  const [internshipStartFilter, setInternshipStartFilter] = useState('')
  const [internshipEndFilter, setInternshipEndFilter] = useState('')
  const [activeTab, setActiveTab] = useState<ViewTab>('all')

  const [universities, setUniversities] = useState<University[]>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<CandidateProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [messagingCandidateId, setMessagingCandidateId] = useState<string | null>(null)

  // ✅ fetch AI scores
  const fetchAIScores = async (applicantList: Applicant[], jpId: string) => {
    if (applicantList.length === 0) return
    setScoresLoading(true)
    try {
      const ids = applicantList.map((a) => a.candidateId).join(',')
      const data = await apiFetch<{ scores: Record<string, number> }>(
        `/api/candidates/applicant-match-scores?jobPostId=${jpId}&candidateIds=${ids}`
      )
      const map = new Map<string, number>()
      applicantList.forEach((a) => {
        const s = data.scores[a.candidateId]
        if (s !== undefined) map.set(a.id, s)
      })
      setAiScores(map)
    } catch (e) {
      console.error('Failed to fetch AI scores:', e)
    } finally {
      setScoresLoading(false)
    }
  }

  // ─── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!jobPostId) return
      setLoading(true)
      try {
        const [applicantsData, jobPostData] = await Promise.all([
          apiFetch<{ jobPost: JobPost; applicants: Applicant[] }>(`/api/job-posts/${jobPostId}/applicants`),
          apiFetch<{ jobPost: any }>(`/api/job-posts/${jobPostId}`),
        ])
        const loadedApplicants = applicantsData.applicants || []
        setApplicants(loadedApplicants)
        setJobPost({
          ...applicantsData.jobPost,
          state: jobPostData.jobPost?.state || null,
          jobDescription: jobPostData.jobPost?.jobDescription || null,
          jobSpecification: jobPostData.jobPost?.jobSpecification || null,
          locationProvince: jobPostData.jobPost?.locationProvince || null,
          locationDistrict: jobPostData.jobPost?.locationDistrict || null,
          jobType: jobPostData.jobPost?.jobType || null,
        })
        fetchAIScores(loadedApplicants, jobPostId)
      } catch {
        setApplicants(mockApplicants)
        setJobPost({
          id: jobPostId, title: 'AI Engineer', companyName: 'CompanyHub',
          location: 'Bangkok', workType: 'Open', state: 'PUBLISHED',
          jobDescription: 'AI engineer internship.', jobSpecification: 'Python, ML.',
          locationProvince: 'Bangkok', locationDistrict: 'Pathum Wan', jobType: 'Internship',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobPostId])

  useEffect(() => {
    ;(async () => {
      setUniversitiesLoading(true)
      try {
        const data = await apiFetch<{ universities: University[] }>('/api/universities')
        setUniversities(data.universities || [])
      } catch {
        setUniversities([])
      } finally {
        setUniversitiesLoading(false)
      }
    })()
  }, [])

  // ─── Derived ────────────────────────────────────────────────────────────────
  const applicantScores = useMemo(() => {
    const map = new Map<string, number>()
    applicants.forEach((a) => {
      const ai = aiScores.get(a.id)
      map.set(a.id, ai !== undefined ? ai : computeJobMatch(a, jobPost))
    })
    return map
  }, [applicants, jobPost, aiScores])

  const positionOptions = useMemo(() =>
    Array.from(new Set(applicants.flatMap((a) => a.preferredPositions || []).filter(Boolean))),
    [applicants])

  const filteredApplicants = useMemo(() => {
    const q = normalizeText(searchQuery)
    const items = applicants.filter((a) => {
      const score = applicantScores.get(a.id) || 0
      const matchSearch = !q ||
        normalizeText(a.name).includes(q) ||
        normalizeText(a.email).includes(q) ||
        normalizeText(a.fieldOfStudy || '').includes(q)
      const matchPosition = !positionFilter || (a.preferredPositions || []).some((p) => p === positionFilter)
      const matchYear = !academicYearFilter || (a.academicYear ?? '').toLowerCase().includes(academicYearFilter.toLowerCase())
      const matchInstitution = !institutionFilter || a.institution === institutionFilter
      const matchDuration = !durationFilter || (() => {
        const m = (a.internshipPeriod ?? '').match(/\((\d+)\s*Month/i)
        return m ? parseInt(m[1]) === parseInt(durationFilter) : false
      })()

      const parsedDates = (() => {
        const raw = a.internshipPeriod ?? ''
        const iso = raw.match(/(\d{4}-\d{2}-\d{2})\s*[-–]\s*(\d{4}-\d{2}-\d{2})/)
        if (iso) return { start: iso[1], end: iso[2] }
        const long = raw.match(/(\d{1,2}\s+\w+\s+\d{4})\s*[-–]\s*(\d{1,2}\s+\w+\s+\d{4})/)
        if (long) {
          const fmt = (d: Date) => isNaN(d.getTime()) ? '' :
            `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          return { start: fmt(new Date(long[1])), end: fmt(new Date(long[2])) }
        }
        return { start: '', end: '' }
      })()

      const matchStart = !internshipStartFilter || !parsedDates.start || parsedDates.start >= internshipStartFilter
      const matchEnd = !internshipEndFilter || !parsedDates.end || parsedDates.end <= internshipEndFilter
      const matchTab =
        activeTab === 'all' ||
        (activeTab === 'new' && a.status === 'new') ||
        (activeTab === 'accepted' && (a.status === 'shortlisted' || a.status === 'reviewed')) ||
        (activeTab === 'declined' && a.status === 'rejected') ||
        (activeTab === 'job-match' && score >= 70)

      return matchSearch && matchPosition && matchYear && matchInstitution &&
        matchDuration && matchStart && matchEnd && matchTab
    })
    if (activeTab === 'job-match') {
      return [...items].sort((a, b) => (applicantScores.get(b.id) || 0) - (applicantScores.get(a.id) || 0))
    }
    return items
  }, [academicYearFilter, activeTab, applicantScores, applicants, durationFilter,
    institutionFilter, internshipEndFilter, internshipStartFilter, positionFilter, searchQuery])

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchQuery(''); setPositionFilter(''); setAcademicYearFilter('')
    setInstitutionFilter(''); setDurationFilter('')
    setInternshipStartFilter(''); setInternshipEndFilter('')
    setActiveTab('all')
  }

  const handleToggleState = async (targetState: 'PUBLISHED' | 'CLOSED') => {
    if (!jobPost || stateUpdating) return
    if (jobPost.state === targetState) return
    setStateUpdating(true)
    setJobPost((prev) => prev ? { ...prev, state: targetState } : prev)
    try {
      await apiFetch(`/api/job-posts/${jobPostId}`, {
        method: 'PATCH',
        body: JSON.stringify({ state: targetState }),
      })
    } catch (e) {
      console.error('Failed to update job post state:', e)
      setJobPost((prev) => prev ? { ...prev, state: jobPost.state } : prev)
    } finally {
      setStateUpdating(false)
    }
  }

  const handleMarkViewed = async (applicantId: string) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId && a.status === 'new' ? { ...a, status: 'reviewed' } : a
      )
    )
    try {
      await apiFetch(`/api/job-posts/${jobPostId}/applicants/${applicantId}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'reviewed' }),
      })
    } catch (e) { console.error(e) }
  }

  const handleViewProfile = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setSelectedProfile(null)
    setProfileLoading(true)
    apiFetch<{ profile: CandidateProfile }>(`/api/candidates/${applicant.candidateId}`)
      .then((data) => setSelectedProfile(data.profile || null))
      .catch(console.error)
      .finally(() => setProfileLoading(false))
  }

  const handleMessageCandidate = async (candidateId: string) => {
    setMessagingCandidateId(candidateId)
    try {
      const data = await apiFetch<{ conversation: { id: string } }>('/api/messages/conversations', {
        method: 'POST', body: JSON.stringify({ candidateId }),
      })
      router.push(`/employer/messages?conversationId=${encodeURIComponent(data.conversation.id)}`)
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.details?.includes('already exists')) {
        router.push('/employer/messages'); return
      }
      alert(error.details || error.message || 'Failed to start conversation')
    } finally {
      setMessagingCandidateId(null)
    }
  }

  const handleAccept = async () => {
    if (!selectedApplicant) return
    try {
      await apiFetch(`/api/job-posts/${jobPostId}/applicants/${selectedApplicant.id}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'shortlisted' }),
      })
      setApplicants((prev) =>
        prev.map((a) => a.id === selectedApplicant.id ? { ...a, status: 'shortlisted' } : a)
      )
    } catch (e) { console.error(e) }
    finally { closePopup() }
  }

  const handleDecline = async () => {
    if (!selectedApplicant) return
    try {
      await apiFetch(`/api/job-posts/${jobPostId}/applicants/${selectedApplicant.id}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'rejected' }),
      })
      setApplicants((prev) =>
        prev.map((a) => a.id === selectedApplicant.id ? { ...a, status: 'rejected' } : a)
      )
    } catch (e) { console.error(e) }
    finally { closePopup() }
  }

  const closePopup = () => {
    setSelectedApplicant(null); setSelectedProfile(null); setProfileLoading(false)
  }

  // ─── Loading / Not Found ─────────────────────────────────────────────────────
  if (loading && !jobPost) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] transition-colors dark:bg-[#121316]">
        <EmployerNavbar />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Loading candidates...</p>
        </div>
      </div>
    )
  }

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] transition-colors dark:bg-[#121316]">
        <EmployerNavbar />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Job post not found.</p>
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#F6F7FB] transition-colors dark:bg-[#121316]"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #121316 0%, #262626 100%)'
          : undefined,
      }}
    >
      <EmployerNavbar />
      <div className="flex min-h-[calc(100vh-100px)]">
        <EmployerSidebar activeItem="applicants" />

        <div className="flex-1 bg-[#E6EBF4] transition-colors dark:bg-transparent">
          <div className="layout-container layout-page">

            {/* Header */}
            <div className="mb-[18px] flex items-start justify-between gap-6">
              <div>
                <h1 className="text-[30px] font-bold leading-none text-black dark:text-[#009df3]">Applicants › View Candidates</h1>
                <p className="mt-[14px] text-[22px] font-semibold text-[#1F2937] dark:text-white">{jobPost.title}</p>
              </div>
              <div className="flex items-center gap-[10px] pt-3">
                <button
                  type="button" disabled={stateUpdating}
                  onClick={() => handleToggleState('PUBLISHED')}
                  className={`h-[34px] rounded-[6px] px-[20px] text-[13px] font-semibold transition disabled:opacity-60 ${
                    jobPost.state !== 'CLOSED'
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#F0F4F8] dark:bg-[#fefefe] dark:text-[#2563eb] dark:hover:bg-[#fefefe]'
                  }`}
                >Open</button>
                <button
                  type="button" disabled={stateUpdating}
                  onClick={() => handleToggleState('CLOSED')}
                  className={`h-[34px] rounded-[6px] px-[20px] text-[13px] font-semibold transition disabled:opacity-60 ${
                    jobPost.state === 'CLOSED'
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#F0F4F8] dark:bg-[#fefefe] dark:text-[#2563eb] dark:hover:bg-[#fefefe]'
                  }`}
                >Closed</button>
              </div>
            </div>

            {/* Filters + Tabs */}
            <ApplicantFilters
              searchQuery={searchQuery}
              positionFilter={positionFilter}
              academicYearFilter={academicYearFilter}
              institutionFilter={institutionFilter}
              durationFilter={durationFilter}
              internshipStartFilter={internshipStartFilter}
              internshipEndFilter={internshipEndFilter}
              activeTab={activeTab}
              positionOptions={positionOptions}
              universities={universities}
              universitiesLoading={universitiesLoading}
              totalCount={filteredApplicants.length}
              onSearchChange={setSearchQuery}
              onPositionChange={setPositionFilter}
              onAcademicYearChange={setAcademicYearFilter}
              onInstitutionChange={setInstitutionFilter}
              onDurationChange={setDurationFilter}
              onInternshipStartChange={setInternshipStartFilter}
              onInternshipEndChange={setInternshipEndFilter}
              onTabChange={setActiveTab}
              onClearFilters={handleClearFilters}
            />

            {/* Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplicants.map((applicant) => (
                <ApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  score={scoresLoading && !aiScores.has(applicant.id)
                    ? -1
                    : applicantScores.get(applicant.id) || 0}
                  isMessaging={messagingCandidateId === applicant.candidateId}
                  onMessage={() => handleMessageCandidate(applicant.candidateId)}
                  onViewProfile={() => handleViewProfile(applicant)}
                  onMarkViewed={() => handleMarkViewed(applicant.id)}
                />
              ))}
            </div>

            {!loading && filteredApplicants.length === 0 && (
              <div className="mt-6 rounded-[10px] bg-white px-6 py-10 text-center text-[14px] text-[#6B7280] shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors dark:bg-[#070e12] dark:text-[#7f7f7f] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] dark:ring-1 dark:ring-[#d1d5db]">
                No candidates found for the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Popup — ส่ง jobPostId ให้ popup เรียก AI analysis */}
      {selectedApplicant && (
        <ApplicantProfilePopup
          key={selectedApplicant.candidateId}
          applicant={selectedApplicant}
          profile={selectedProfile}
          jobMatch={applicantScores.get(selectedApplicant.id) || 0}
          profileCompletion={calculateProfileCompletion(selectedProfile)}
          isLoading={profileLoading}
          jobPostId={jobPostId}
          onClose={closePopup}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </div>
  )
}