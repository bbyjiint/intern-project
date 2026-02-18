'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmployerNavbar from '@/components/EmployerNavbar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import { apiFetch } from '@/lib/api'

interface Candidate {
  id: string
  name: string
  role: string
  university: string
  major: string
  graduationDate: string
  skills: string[]
  initials: string
  email?: string
  about?: string
}

interface CompanyPreference {
  id: string
  label: string
  role: string
  mustHave: string[]
  niceToHave: string[]
}

const COMPANY_PREFERENCES_MOCK: CompanyPreference[] = [
  {
    id: 'data-science-intern',
    label: 'Data Science Intern',
    role: 'Data Science Intern',
    mustHave: ['Python', 'TensorFlow', 'Deep Learning'],
    niceToHave: ['SQL', 'Data Visualization'],
  },
  {
    id: 'ux-design-intern',
    label: 'UX Design Intern',
    role: 'UX Design Intern',
    mustHave: ['UX Design', 'Wireframing', 'User Research'],
    niceToHave: ['Prototyping', 'UI Design', 'Figma'],
  },
  {
    id: 'software-engineering-intern',
    label: 'Software Engineering Intern',
    role: 'Software Engineering Intern',
    mustHave: ['JavaScript', 'React', 'Node.js'],
    niceToHave: ['TypeScript', 'REST API', 'Testing'],
  },
]

function computeMockMatchScore(skills: string[], preference: CompanyPreference | null): number {
  if (!preference) return 0

  const lowerSkills = skills.map((s) => s.toLowerCase())

  const requiredMatches = preference.mustHave.filter((req) =>
    lowerSkills.some(
      (s) =>
        s.includes(req.toLowerCase()) ||
        req.toLowerCase().includes(s)
    )
  ).length

  const niceMatches = preference.niceToHave.filter((req) =>
    lowerSkills.some(
      (s) =>
        s.includes(req.toLowerCase()) ||
        req.toLowerCase().includes(s)
    )
  ).length

  if (requiredMatches === 0 && niceMatches === 0) {
    return 40
  }

  const requiredCoverage =
    preference.mustHave.length > 0 ? requiredMatches / preference.mustHave.length : 0
  const niceCoverage =
    preference.niceToHave.length > 0 ? niceMatches / preference.niceToHave.length : 0

  const score = 40 + requiredCoverage * 40 + niceCoverage * 20
  return Math.round(Math.min(100, score))
}

export default function EmployerBookmarkPage() {
  const router = useRouter()
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set())
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string>(
    COMPANY_PREFERENCES_MOCK[0]?.id
  )

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')

        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/dashboard')
          return
        }

        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }
      } catch (error) {
        router.push('/login')
      }
    }

    checkRole()
  }, [router])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiFetch<{ candidates: Candidate[] }>('/api/bookmarks')
        const list = data.candidates || []
        setCandidates(list)
        setBookmarkedCandidates(new Set(list.map((c) => c.id)))
        setApiError(null)
      } catch (error: any) {
        setApiError(error?.message || 'Failed to load bookmarked candidates')
        setCandidates([])
      }
    })()
  }, [])

  const activePreference = useMemo(() => {
    return (
      COMPANY_PREFERENCES_MOCK.find((p) => p.id === selectedPreferenceId) ||
      COMPANY_PREFERENCES_MOCK[0] ||
      null
    )
  }, [selectedPreferenceId])

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return candidates
    return candidates.filter((candidate) => {
      const inName = candidate.name.toLowerCase().includes(query)
      const inRole = candidate.role.toLowerCase().includes(query)
      const inUniversity = candidate.university.toLowerCase().includes(query)
      const inSkills = candidate.skills.some((skill) =>
        skill.toLowerCase().includes(query)
      )
      return inName || inRole || inUniversity || inSkills
    })
  }, [candidates, searchQuery])

  const handleBookmark = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    const isCurrentlyBookmarked = bookmarkedCandidates.has(candidateId)
    const newBookmarks = new Set(bookmarkedCandidates)

    try {
      if (isCurrentlyBookmarked) {
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'DELETE' })
        newBookmarks.delete(candidateId)
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      } else {
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'POST' })
        newBookmarks.add(candidateId)
      }
      setBookmarkedCandidates(newBookmarks)
    } catch (error) {
      console.error('Failed to update bookmark:', error)
    }
  }

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="flex">
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            <Link
              href="/employer/profile"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              href="/employer/dashboard"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium">Applicants</span>
            </Link>
            <Link
              href="/employer/job-post"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">Job Post</span>
            </Link>
            <Link
              href="/employer/bookmark"
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span className="font-medium text-white">Bookmark</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {apiError && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {apiError}
            </div>
          )}

          <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookmark</h1>
              <p className="text-gray-600">
                Review bookmarked interns and see how well they match your company requirements.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 w-full max-w-md">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">
                  Company Requirements (Mock)
                </h2>
                <span className="text-xs text-gray-400">Used for AI matching demo</span>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Position
                </label>
                <select
                  value={selectedPreferenceId}
                  onChange={(e) => setSelectedPreferenceId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {COMPANY_PREFERENCES_MOCK.map((pref) => (
                    <option key={pref.id} value={pref.id}>
                      {pref.label}
                    </option>
                  ))}
                </select>
              </div>
              {activePreference && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Must-have skills</p>
                    <div className="flex flex-wrap gap-1">
                      {activePreference.mustHave.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Nice-to-have skills</p>
                    <div className="flex flex-wrap gap-1">
                      {activePreference.niceToHave.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded-full text-[11px] font-medium bg-yellow-50 text-yellow-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, skills, or university"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700">
              {filteredCandidates.length} interns found
            </p>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {bookmarkedCandidates.size === 0
                ? 'No bookmarked candidates yet.'
                : 'No candidates found matching your search criteria.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => {
                const matchScore = computeMockMatchScore(
                  candidate.skills,
                  activePreference
                )
                
                // Mock data generation for demo visualization (matching the design request)
                const nameLen = candidate.name.length
                const mockInternshipPeriod = [
                    '2 March 2026 - 26 Feb 2027 (12 เดือน)', 
                    '20 October 2026 - 30 November 2026 (1 เดือน)', 
                    '9 April 2026 - 10 August 2026 (4 เดือน)'
                ][nameLen % 3]
                
                const mockWorkType = ['สหกิจ', 'ฝึกงาน', 'Co-op'][nameLen % 3]
                const mockYear = ['3', '4'][nameLen % 2]
                const mockProvince = ['กรุงเทพ', 'ภูเก็ต', 'เชียงใหม่'][nameLen % 3]

                return (
                  <CandidateCard
                    key={candidate.id || candidate.name}
                    {...candidate}
                    isBookmarked={bookmarkedCandidates.has(candidate.id || candidate.name)}
                    onBookmark={(e) => handleBookmark(e, candidate.id || candidate.name)}
                    onClick={() => handleCardClick(candidate)}
                    matchScore={matchScore}
                    matchLabel="AI Matching Score"
                    internshipPeriod={mockInternshipPeriod}
                    workType={mockWorkType}
                    year={mockYear}
                    province={mockProvince}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

