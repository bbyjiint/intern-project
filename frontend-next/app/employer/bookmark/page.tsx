'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebarShell from '@/components/EmployerSidebarShell'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'
import { POSITION_OPTIONS } from '@/constants/positionOptions'

type Candidate = {
  id: string
  name: string
  role: string
  university: string
  major: string | null
  graduationDate: string | null
  skills: string[]
  preferredPositions?: string[]
  internshipPeriod?: string | null
  yearOfStudy?: string | null
  createdAt?: string | null
  profileImage?: string | null
  initials: string
  email?: string
  location?: string | null
  about?: string
}

const ACADEMIC_YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

function parseInternshipDates(period: string | null | undefined): { start: string; end: string } | null {
  if (!period) return null
  const match = period.match(
    /(\d{1,2}\s+\w+\s+\d{4})\s*[-–]\s*(\d{1,2}\s+\w+\s+\d{4})/
  )
  if (!match) return null
  const startD = new Date(match[1])
  const endD = new Date(match[2])
  if (isNaN(startD.getTime()) || isNaN(endD.getTime())) return null
  const toYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return { start: toYMD(startD), end: toYMD(endD) }
}

export default function BookmarkPage() {
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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [apiCandidates, setApiCandidates] = useState<Candidate[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const positionOptions = POSITION_OPTIONS

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (searchQuery.trim()) n++
    if (position) n++
    if (academicYear) n++
    if (startDate) n++
    if (endDate) n++
    if (duration) n++
    if (university) n++
    return n
  }, [searchQuery, position, academicYear, startDate, endDate, duration, university])

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/bookmark')
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
        const data = await apiFetch<{ candidates: any[] }>(`/api/bookmarks`)
        const normalized: Candidate[] = (data.candidates || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.role,
          university: c.university,
          major: c.major ?? null,
          graduationDate: c.graduationDate ?? null,
          skills: Array.isArray(c.skills) ? c.skills : [],
          preferredPositions: Array.isArray(c.preferredPositions) ? c.preferredPositions : [],
          internshipPeriod: c.internshipPeriod ?? null,
          yearOfStudy: c.yearOfStudy ?? null,
          createdAt: c.createdAt ?? null,
          profileImage: c.profileImage ?? null,
          initials: c.initials,
          email: c.email ?? null,
          location: c.location ?? null,
          about: c.about ?? '',
        }))
        setApiCandidates(normalized)
        setBookmarkedCandidates(new Set(normalized.map((c) => c.id)))
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to load bookmarks')
        setApiCandidates([])
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

  const handleBookmark = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    const isCurrentlyBookmarked = bookmarkedCandidates.has(candidateId)
    const newBookmarks = new Set(bookmarkedCandidates)
    try {
      if (isCurrentlyBookmarked) {
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'DELETE' })
        newBookmarks.delete(candidateId)
        setApiCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      } else {
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'POST' })
        newBookmarks.add(candidateId)
      }
      setBookmarkedCandidates(newBookmarks)
    } catch (err) {
      console.error('Failed to update bookmark:', err)
    }
  }

  const handleCardClick = (candidate: Candidate) => setSelectedCandidate(candidate)

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

  const filteredCandidates = apiCandidates.filter((candidate) => {
    const matchesSearch =
      !searchQuery ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPosition = !position ||
      String(candidate.role || '').toLowerCase() === position.toLowerCase()

    const matchesAcademicYear = !academicYear ||
      (candidate.yearOfStudy ?? '').toLowerCase().includes(academicYear.toLowerCase())

    const matchesUniversity = !university || university === 'All Universities' ||
      candidate.university === university

    const matchesDuration = !duration || (() => {
      const match = (candidate.internshipPeriod ?? '').match(/\((\d+)\s*Month/i)
      if (!match) return true
      return parseInt(match[1]) === parseInt(duration)
    })()

    const parsed = parseInternshipDates(candidate.internshipPeriod)
    const matchesStartDate = !startDate || !parsed || parsed.start >= startDate
    const matchesEndDate = !endDate || !parsed || parsed.end <= endDate

    return matchesSearch && matchesPosition && matchesAcademicYear &&
      matchesUniversity && matchesDuration && matchesStartDate && matchesEndDate
  })

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortMode === 'latest') {
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    }
    return 0
  })

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#E6EBF4] transition-colors duration-300 dark:bg-gray-950">
      <EmployerNavbar />
      <EmployerSidebarShell activeItem="bookmark">
        <div className="layout-container layout-page min-w-0 flex-1 overflow-y-auto px-2 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 md:pt-8">
          <div>
            {apiError && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-500/10 dark:text-yellow-300">
                {apiError}
              </div>
            )}

            <div className="mb-8">
              <h1 className="mb-4 text-2xl font-bold text-[#111827] dark:text-white md:mb-6 md:text-[32px]">Bookmark</h1>

              {/* Filter Card — same as Find Candidates */}
              <div className="min-w-0 rounded-2xl border border-gray-100 bg-white px-2.5 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-none sm:rounded-[16px] sm:px-6 sm:py-5">
                <button
                  type="button"
                  className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-left transition-colors hover:bg-[#ECEFF3] dark:bg-gray-900/50 dark:hover:bg-gray-900 md:hidden"
                  onClick={() => setMobileFiltersOpen((o) => !o)}
                  aria-expanded={mobileFiltersOpen}
                >
                  <span className="text-sm font-semibold text-[#111827] dark:text-white">
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-600 transition-transform dark:text-gray-400 ${mobileFiltersOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
                  <p className="mb-3 hidden text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb] md:block">Filters</p>

                  <div className="mb-3 grid min-w-0 grid-cols-2 gap-2 sm:mb-4 sm:gap-3 lg:mb-4 lg:grid-cols-3 lg:gap-4">
                    <div className="col-span-2 min-w-0 lg:col-span-1">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Search</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 md:left-3">
                          <svg className="h-4 w-4 text-[#9CA3AF] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Name, skills…"
                          className="h-10 min-h-[40px] w-full rounded-lg border border-[#D1D5DB] bg-white pl-8 pr-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 md:h-[42px] md:rounded-[8px] md:pl-9 md:pr-3"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Position</label>
                      <SearchableDropdown
                        options={positionOptions.map((p) => ({ value: p, label: p }))}
                        value={position}
                        onChange={setPosition}
                        placeholder="Position"
                        className="w-full"
                        allOptionLabel="All Positions"
                        variant="applicants"
                        compact
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">
                        <span className="md:hidden">Year</span>
                        <span className="hidden md:inline">Academic Year</span>
                      </label>
                      <div className="relative">
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="h-10 min-h-[40px] w-full appearance-none rounded-lg border border-[#D1D5DB] bg-white px-2 pr-8 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white md:h-[42px] md:rounded-[8px] md:px-3 md:pr-9"
                        >
                          <option value="">Year</option>
                          {ACADEMIC_YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 md:right-3">
                          <svg className="h-4 w-4 text-[#6B7280] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 grid min-w-0 grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] xl:items-end xl:gap-3">
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">
                        <span className="md:hidden">Start</span>
                        <span className="hidden md:inline">Internship start</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-10 min-h-[40px] w-full min-w-0 max-w-full rounded-lg border border-[#D1D5DB] bg-white px-1.5 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:[color-scheme:dark] md:h-[42px] md:rounded-[8px] md:px-3"
                      />
                    </div>

                    <div className="hidden items-center justify-center pb-[2px] text-[16px] text-[#9CA3AF] dark:text-[#757575] xl:flex">–</div>

                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px] xl:invisible xl:mb-1.5">
                        <span className="md:hidden">End</span>
                        <span className="hidden md:inline">Internship end</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-10 min-h-[40px] w-full min-w-0 max-w-full rounded-lg border border-[#D1D5DB] bg-white px-1.5 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:[color-scheme:dark] md:h-[42px] md:rounded-[8px] md:px-3"
                      />
                    </div>

                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Duration</label>
                      <input
                        type="number"
                        min="0"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Months"
                        className="h-10 min-h-[40px] w-full rounded-lg border border-[#D1D5DB] bg-white px-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 md:h-[42px] md:rounded-[8px] md:px-3"
                      />
                    </div>

                    <div className="col-span-2 min-w-0 sm:col-span-2 xl:col-span-1">
                      <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Institution</label>
                      {universitiesLoading ? (
                        <div className="flex h-10 min-h-[40px] w-full items-center rounded-lg border border-[#D1D5DB] bg-gray-50 px-2.5 dark:border-gray-700 dark:bg-gray-900/50 md:h-[42px] md:rounded-[8px] md:px-3">
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
                          placeholder="University"
                          className="w-full"
                          allOptionLabel="All Universities"
                          variant="applicants"
                          compact
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-stretch sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="h-10 min-h-[40px] w-full rounded-lg border border-[#D1D5DB] bg-white px-4 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-700 sm:h-[38px] sm:w-auto sm:rounded-[8px] sm:px-5"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* All / Latest + count */}
            <div className="mb-6 flex min-w-0 flex-wrap items-center gap-2">
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

            <p className="mb-[16px] text-[14px] font-semibold text-[#1F2937] dark:text-[#ffffff]">
              {sortedCandidates.length} Total Candidate{sortedCandidates.length === 1 ? '' : 's'}
            </p>

            {sortedCandidates.length === 0 ? (
              <div className="rounded-[12px] border border-gray-100 bg-white px-6 py-10 text-center text-gray-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                {bookmarkedCandidates.size === 0
                  ? 'No bookmarked candidates yet. Start bookmarking candidates to see them here.'
                  : 'No candidates found matching your search criteria.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    {...candidate}
                    isBookmarked={bookmarkedCandidates.has(candidate.id)}
                    onBookmark={(e) => handleBookmark(e, candidate.id)}
                    onClick={() => handleCardClick(candidate)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </EmployerSidebarShell>

      {selectedCandidate && (
        <CandidateProfileModal
          candidate={{
            ...selectedCandidate,
            major: selectedCandidate.major ?? '',
            graduationDate: selectedCandidate.graduationDate ?? '',
          }}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}