'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

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
      candidate.role.toLowerCase().includes(position.toLowerCase())

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
    <div className="min-h-screen bg-[#E6EBF4]">
      <EmployerNavbar />
      <div className="flex">
        <EmployerSidebar activeItem="bookmark" />

        <div className="flex-1">
          <div className="layout-container layout-page">
            {apiError && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                {apiError}
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#111827] mb-6">Bookmark</h1>

              {/* Filter Card */}
              <div className="rounded-[16px] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">

                {/* Row 1: Search | Position | Academic Year */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Search</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Position</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Position"
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Academic Year</label>
                    <div className="relative">
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="h-[42px] w-full appearance-none rounded-[8px] border border-[#D1D5DB] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8]"
                      >
                        <option value="">Year</option>
                        {ACADEMIC_YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Internship Period | Duration | Institution */}
                <div className="mb-4 grid grid-cols-[1fr_16px_1fr_1fr_2fr] items-end gap-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Internship Period</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light]"
                    />
                  </div>

                  <div className="flex items-center justify-center pb-[2px] text-[#9CA3AF] text-[16px]">–</div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] invisible">End</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Duration</label>
                    <input
                      type="number"
                      min="0"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Duration (Month)"
                      className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">Institution</label>
                    {universitiesLoading ? (
                      <div className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-gray-50 flex items-center px-3">
                        <span className="text-[13px] text-[#9CA3AF]">Loading...</span>
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
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-5 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>

            {/* All / Latest + count */}
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setSortMode('all')}
                className={`h-[36px] rounded-[8px] border px-5 text-[14px] font-semibold transition-colors ${
                  sortMode === 'all'
                    ? 'border-[#2563EB] bg-white text-[#2563EB]'
                    : 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSortMode('latest')}
                className={`h-[36px] rounded-[8px] border px-5 text-[14px] font-semibold transition-colors ${
                  sortMode === 'latest'
                    ? 'border-[#2563EB] bg-white text-[#2563EB]'
                    : 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827]'
                }`}
              >
                Latest
              </button>
            </div>

            <p className="mb-4 text-[16px] font-semibold text-[#111827]">
              {sortedCandidates.length} Total Candidate
            </p>

            {sortedCandidates.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
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
      </div>

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