'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import SearchableDropdown from '@/components/SearchableDropdown'
import LoadingSpinner from '@/components/LoadingSpinner'
import { apiFetch } from '@/lib/api'
import { POSITION_OPTIONS } from '@/constants/positionOptions'

const mockCandidates = [
  {
    id: 'mock-1',
    name: 'Alex Patel',
    role: 'Data Science Intern',
    university: 'Georgia Tech',
    major: 'Data Science',
    graduationDate: 'Aug 2024',
    location: 'Georgia',
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'SQL'],
    initials: 'AP',
    email: 'alex.patel@company.com',
    about: 'Passionate data science intern with expertise in machine learning and deep learning.',
  },
  {
    id: 'mock-2',
    name: 'Amanda Wong',
    role: 'UX Design Intern',
    university: 'Stanford University',
    major: 'Design',
    graduationDate: 'Apr 2024',
    location: 'California',
    skills: ['Adobe XD', 'UI Design', 'Wireframing', 'Figma'],
    initials: 'AW',
    email: 'amanda.wong@company.com',
    about: 'Creative UX design intern focused on creating intuitive and user-friendly interfaces.',
  },
  {
    id: 'mock-3',
    name: 'David Kim',
    role: 'Software Engineering Intern',
    university: 'UCLA',
    major: 'Engineering',
    graduationDate: 'Jan 2025',
    location: 'California',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    initials: 'DK',
    email: 'david.kim@company.com',
    about: 'Software engineering intern specializing in backend development and cloud infrastructure.',
  },
  {
    id: 'mock-4',
    name: 'Emily Chen',
    role: 'Data Science Intern',
    university: 'Stanford University',
    major: 'Data Science',
    graduationDate: 'Jun 2024',
    location: 'California',
    skills: ['Python', 'R', 'Machine Learning', 'Pandas'],
    initials: 'EC',
    email: 'emily.chen@company.com',
    about: 'Data science intern with strong analytical skills and experience in statistical modeling.',
  },
  {
    id: 'mock-5',
    name: 'Jessica Martinez',
    role: 'Marketing Intern',
    university: 'University of Washington',
    major: 'Marketing',
    graduationDate: 'May 2024',
    location: 'Washington',
    skills: ['Content Marketing', 'SEO', 'Social Media', 'Analytics'],
    initials: 'JM',
    email: 'jessica.martinez@company.com',
    about: 'Marketing intern with expertise in digital marketing and content strategy.',
  },
  {
    id: 'mock-6',
    name: 'John Smith',
    role: 'Software Engineering Intern',
    university: 'UC Berkeley',
    major: 'Engineering',
    graduationDate: 'Jan 2024',
    location: 'California',
    skills: ['Python', 'JavaScript', 'React', 'Node.js'],
    initials: 'JS',
    email: 'john.smith@company.com',
    about: 'Passionate software engineering intern focused on full-stack development.',
  },
]

const ACADEMIC_YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

// Parse internshipPeriod string like "1 March 2026 - 7 March 2026 (0 Month)"
// Returns YYYY-MM-DD strings to avoid timezone issues when comparing with date input values
function parseInternshipDates(period: string | null | undefined): { start: string; end: string } | null {
  if (!period) return null
  const match = period.match(
    /(\d{1,2}\s+\w+\s+\d{4})\s*[-–]\s*(\d{1,2}\s+\w+\s+\d{4})/
  )
  if (!match) return null
  const startD = new Date(match[1])
  const endD = new Date(match[2])
  if (isNaN(startD.getTime()) || isNaN(endD.getTime())) return null
  // Convert to YYYY-MM-DD (local date string) for safe string comparison
  const toYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return { start: toYMD(startD), end: toYMD(endD) }
}

export default function FindCandidatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState('')
  const [university, setUniversity] = useState('')
  const [sortMode, setSortMode] = useState<'all' | 'latest'>('all')
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set())
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null)
  const [apiCandidates, setApiCandidates] = useState<typeof mockCandidates | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [candidatesLoading, setCandidatesLoading] = useState(true)
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/find-companies')
          return
        }
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }
      } catch (error) {
        console.error('Failed to check user role:', error)
        router.push('/login')
      }
    }
    checkRole()
  }, [router])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiFetch<{ candidates: Array<{ id: string }> }>(`/api/bookmarks`)
        setBookmarkedCandidates(new Set(data.candidates.map((c) => c.id)))
      } catch (err) {
        console.error('Failed to load bookmarks:', err)
        const savedBookmarks = localStorage.getItem('bookmarkedCandidates')
        if (savedBookmarks) {
          try { setBookmarkedCandidates(new Set(JSON.parse(savedBookmarks))) } catch {}
        }
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      setCandidatesLoading(true)
      setApiError(null)
      try {
        const data = await apiFetch<{ candidates: typeof mockCandidates }>(`/api/candidates`)
        setApiCandidates(data.candidates)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to load candidates')
        setApiCandidates(null)
      } finally {
        setCandidatesLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      setUniversitiesLoading(true)
      try {
        const data = await apiFetch<{ universities: Array<{ id: string; name: string; thname: string | null; code: string | null }> }>(
          `/api/universities`
        )
        setUniversities(data.universities || [])
      } catch (err) {
        console.error('Failed to load universities:', err)
        setUniversities([])
      } finally {
        setUniversitiesLoading(false)
      }
    })()
  }, [])

  const candidates = useMemo(() => {
    return apiCandidates && apiCandidates.length > 0 ? apiCandidates : mockCandidates
  }, [apiCandidates])
  // Use a stable master list so dropdown options are consistent.
  const positionOptions = POSITION_OPTIONS

  const handleBookmark = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    const isCurrentlyBookmarked = bookmarkedCandidates.has(candidateId)
    const newBookmarks = new Set(bookmarkedCandidates)
    try {
      if (isCurrentlyBookmarked) {
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'DELETE' })
        newBookmarks.delete(candidateId)
      } else {
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'POST' })
        newBookmarks.add(candidateId)
      }
      setBookmarkedCandidates(newBookmarks)
    } catch (err) {
      console.error('Failed to update bookmark:', err)
    }
  }

  const handleCardClick = (candidate: typeof mockCandidates[0]) => {
    setSelectedCandidate(candidate)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setPosition('')
    setAcademicYear('')
    setStartDate('')
    setEndDate('')
    setDuration('')
    setUniversity('')
    setSortMode('all')
  }

  const filteredCandidates = candidates.filter((candidate: any) => {
    // Search
    const matchesSearch =
      !searchQuery ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    // Position
    const matchesPosition = !position ||
      String(candidate.role || '').toLowerCase() === position.toLowerCase()

    // Academic Year
    const matchesAcademicYear = !academicYear ||
      (candidate.yearOfStudy ?? '').toLowerCase().includes(academicYear.toLowerCase())

    // Institution
    const matchesUniversity = !university || university === 'All Universities' ||
      candidate.university === university

    // Duration
    const matchesDuration = !duration || (() => {
      const match = (candidate.internshipPeriod ?? '').match(/\((\d+)\s*Month/i)
      if (!match) return true
      return parseInt(match[1]) === parseInt(duration)
    })()

    // Internship Period — compare as YYYY-MM-DD strings (safe, no timezone issues)
    const parsed = parseInternshipDates(candidate.internshipPeriod)

    const matchesStartDate = !startDate || (() => {
      if (!parsed) return true
      // candidate start must be on or after the filter startDate
      return parsed.start >= startDate
    })()

    const matchesEndDate = !endDate || (() => {
      if (!parsed) return true
      // candidate end must be on or before the filter endDate
      return parsed.end <= endDate
    })()

    return matchesSearch && matchesPosition && matchesAcademicYear &&
      matchesUniversity && matchesDuration && matchesStartDate && matchesEndDate
  })

  const sortedCandidates = [...filteredCandidates].sort((a: any, b: any) => {
    if (sortMode === 'latest') {
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <EmployerNavbar />
      <div className="flex flex-1">
        <EmployerSidebar />

        <div className="layout-container layout-page flex-1 overflow-y-auto">
          <div className="py-8">
            {apiError && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-500/10 dark:text-yellow-300">
                {apiError}
              </div>
            )}

            <div className="mb-8">
              <h1 className="mb-6 text-[32px] font-bold text-[#111827] dark:text-white">Find Candidates</h1>

              {/* Filter Card */}
              <div className="rounded-[16px] border border-gray-100 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">

                {/* Row 1: Search | Position | Academic Year */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Search */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Search</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-[#9CA3AF] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Position</label>
                    <SearchableDropdown
                      options={positionOptions.map((p) => ({ value: p, label: p }))}
                      value={position}
                      onChange={setPosition}
                      placeholder="Position"
                      className="w-full"
                      allOptionLabel="All Positions"
                      variant="applicants"
                    />
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Academic Year</label>
                    <div className="relative">
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="h-[42px] w-full appearance-none rounded-[8px] border border-[#D1D5DB] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                      >
                        <option value="">Year</option>
                        {ACADEMIC_YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-[#6B7280] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Internship Period | Duration | Institution */}
                <div className="mb-4 grid grid-cols-[1fr_16px_1fr_1fr_2fr] items-end gap-3">
                  {/* Start Date */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Internship Period</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:[color-scheme:dark]"
                    />
                  </div>

                  {/* Dash */}
                  <div className="flex items-center justify-center pb-[2px] text-[16px] text-[#9CA3AF] dark:text-[#757575]">–</div>

                  {/* End Date */}
                  <div>
                    <label className="invisible mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">End</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:[color-scheme:dark]"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Duration</label>
                    <input
                      type="number"
                      min="0"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Duration (Month)"
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500"
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Institution</label>
                    {universitiesLoading ? (
                      <div className="flex h-[42px] w-full items-center rounded-[8px] border border-[#D1D5DB] bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900/50">
                        <span className="text-[13px] text-[#9CA3AF] dark:text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <SearchableDropdown
                        options={universities.map((uni) => ({
                          value: uni.name,
                          label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                          code: uni.code,
                        }))}
                        value={university}
                        onChange={setUniversity}
                        placeholder="Select Institution Name"
                        className="w-full"
                        allOptionLabel="All Universities"
                        variant="applicants"
                      />
                    )}
                  </div>
                </div>

                {/* Clear Filter */}
                <div className="flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-5 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* All / Latest tabs + count */}
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => setSortMode('all')}
                className={`h-[36px] rounded-[8px] border px-5 text-[14px] font-semibold transition-colors ${
                  sortMode === 'all'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] dark:bg-white dark:text-[#2563EB]'
                    : 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSortMode('latest')}
                className={`h-[36px] rounded-[8px] border px-5 text-[14px] font-semibold transition-colors ${
                  sortMode === 'latest'
                    ? 'border-[#2563EB] bg-white text-[#2563EB] dark:bg-white dark:text-[#2563EB]'
                    : 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
                }`}
              >
                Latest
              </button>
            </div>

            <p className="mb-2 text-[16px] font-semibold text-[#111827] dark:text-white">
              {sortedCandidates.length} Total Candidate
            </p>

            {/* Results */}
            <div className="pt-4">
              {candidatesLoading ? (
                <div className="py-20">
                  <LoadingSpinner size="lg" text="Loading candidates..." />
                </div>
              ) : (
                <>
                  {sortedCandidates.length === 0 && (
                    <div className="py-10 text-center text-gray-500 dark:text-[#7f7f7f]">
                      No candidates found matching your criteria.
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id || candidate.name}
                        {...candidate}
                        variant="find-candidates"
                        isBookmarked={bookmarkedCandidates.has(candidate.id || candidate.name)}
                        onBookmark={(e) => handleBookmark(e, candidate.id || candidate.name)}
                        onClick={() => handleCardClick(candidate)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedCandidate && (
        <CandidateProfileModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  )
}