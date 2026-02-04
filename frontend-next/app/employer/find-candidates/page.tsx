'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mockCandidates = [
  {
    id: 'mock-1',
    name: 'Alex Patel',
    role: 'Data Science Intern',
    university: 'Georgia Tech',
    major: 'Data Science',
    graduationDate: 'Aug 2024',
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'SQL'],
    initials: 'AP',
    email: 'alex.patel@company.com',
    about: 'Passionate data science intern with expertise in machine learning and deep learning. Experienced in building predictive models and analyzing large datasets.',
  },
  {
    id: 'mock-2',
    name: 'Amanda Wong',
    role: 'UX Design Intern',
    university: 'Stanford University',
    major: 'Design',
    graduationDate: 'Apr 2024',
    skills: ['Adobe XD', 'UI Design', 'Wireframing', 'Figma'],
    initials: 'AW',
    email: 'amanda.wong@company.com',
    about: 'Creative UX design intern focused on creating intuitive and user-friendly interfaces. Passionate about design thinking and user research.',
  },
  {
    id: 'mock-3',
    name: 'David Kim',
    role: 'Software Engineering Intern',
    university: 'UCLA',
    major: 'Engineering',
    graduationDate: 'Jan 2025',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    initials: 'DK',
    email: 'david.kim@company.com',
    about: 'Software engineering intern specializing in backend development and cloud infrastructure. Experienced with microservices architecture.',
  },
  {
    id: 'mock-4',
    name: 'Emily Chen',
    role: 'Data Science Intern',
    university: 'Stanford University',
    major: 'Data Science',
    graduationDate: 'Jun 2024',
    skills: ['Python', 'R', 'Machine Learning', 'Pandas'],
    initials: 'EC',
    email: 'emily.chen@company.com',
    about: 'Data science intern with strong analytical skills and experience in statistical modeling. Passionate about turning data into actionable insights.',
  },
  {
    id: 'mock-5',
    name: 'Jessica Martinez',
    role: 'Marketing Intern',
    university: 'University of Washington',
    major: 'Marketing',
    graduationDate: 'May 2024',
    skills: ['Content Marketing', 'SEO', 'Social Media', 'Analytics'],
    initials: 'JM',
    email: 'jessica.martinez@company.com',
    about: 'Marketing intern with expertise in digital marketing and content strategy. Experienced in SEO optimization and social media management.',
  },
  {
    id: 'mock-6',
    name: 'John Smith',
    role: 'Software Engineering Intern',
    university: 'UC Berkeley',
    major: 'Engineering',
    graduationDate: 'Jan 2024',
    skills: ['Python', 'JavaScript', 'React', 'Node.js'],
    initials: 'JS',
    email: 'john.smith@company.com',
    about: 'Passionate software engineering intern focused on full-stack development. Eager to learn modern web technologies and contribute to impactful projects.',
  },
]

export default function FindCandidatesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('All Positions')
  const [university, setUniversity] = useState('All Universities')
  const [department, setDepartment] = useState('All Departments')
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set()) // Using candidate IDs
  const [sortBy, setSortBy] = useState('Name')
  const [viewMode, setViewMode] = useState<'all' | 'shortlist'>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null)
  const [apiCandidates, setApiCandidates] = useState<typeof mockCandidates | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)

  // Check user role and redirect if necessary
  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // If user has CANDIDATE role, redirect to intern pages
        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/find-companies')
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

  // Load bookmarked candidates from API
  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiFetch<{ candidates: Array<{ id: string }> }>(`/api/bookmarks`)
        const bookmarkIds = new Set(data.candidates.map((c) => c.id))
        setBookmarkedCandidates(bookmarkIds)
      } catch (err) {
        console.error('Failed to load bookmarks:', err)
        // Fallback to localStorage for backward compatibility
        const savedBookmarks = localStorage.getItem('bookmarkedCandidates')
        if (savedBookmarks) {
          try {
            const bookmarks = JSON.parse(savedBookmarks)
            setBookmarkedCandidates(new Set(bookmarks))
          } catch (e) {
            console.error('Failed to parse bookmarked candidates:', e)
          }
        }
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiFetch<{ candidates: typeof mockCandidates }>(`/api/candidates`)
        setApiCandidates(data.candidates)
      } catch (err) {
        // If not logged in / wrong role, keep mock list but show message.
        setApiError(err instanceof Error ? err.message : 'Failed to load candidates')
        setApiCandidates(null)
      }
    })()
  }, [])

  // Load universities from API
  useEffect(() => {
    ;(async () => {
      setUniversitiesLoading(true)
      try {
        // Load all universities (no search query for initial load)
        const data = await apiFetch<{ universities: Array<{ id: string; name: string; thname: string | null; code: string | null }> }>(
          `/api/universities`
        )
        setUniversities(data.universities || [])
        console.log(`Loaded ${data.universities?.length || 0} universities`)
      } catch (err) {
        console.error('Failed to load universities:', err)
        // If API fails, keep empty array - dropdown will just be empty
        setUniversities([])
      } finally {
        setUniversitiesLoading(false)
      }
    })()
  }, [])

  const candidates = useMemo(() => {
    return apiCandidates && apiCandidates.length > 0 ? apiCandidates : mockCandidates
  }, [apiCandidates])

  // Note: Bookmarks are now saved via API calls, not localStorage

  const handleBookmark = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    const isCurrentlyBookmarked = bookmarkedCandidates.has(candidateId)
    const newBookmarks = new Set(bookmarkedCandidates)

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'DELETE' })
        newBookmarks.delete(candidateId)
      } else {
        // Add bookmark
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'POST' })
        newBookmarks.add(candidateId)
      }
      setBookmarkedCandidates(newBookmarks)
    } catch (err) {
      console.error('Failed to update bookmark:', err)
      // Show error to user (you might want to add a toast notification here)
    }
  }

  const handleCardClick = (candidate: typeof mockCandidates[0]) => {
    setSelectedCandidate(candidate)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setPosition('All Positions')
    setUniversity('All Universities')
    setDepartment('All Departments')
  }

  const filteredCandidates = candidates.filter((candidate) => {
    if (viewMode === 'shortlist' && !bookmarkedCandidates.has(candidate.id)) {
      return false
    }

    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesPosition = position === 'All Positions' || candidate.role.includes(position)
    const matchesUniversity = university === 'All Universities' || candidate.university === university
    const matchesDepartment = department === 'All Departments' || candidate.major.includes(department)

    return matchesSearch && matchesPosition && matchesUniversity && matchesDepartment
  })

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'Name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy === 'University') {
      return a.university.localeCompare(b.university)
    } else if (sortBy === 'Position') {
      return a.role.localeCompare(b.role)
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Job Post</span>
            </Link>
            <Link
              href="/employer/bookmark"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">Bookmark</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {apiError && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                {apiError}
              </div>
            )}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Candidates</h1>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skills, or keywords..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Positions">All Positions</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UX Design">UX Design</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <SearchableDropdown
                  options={universities.map((uni) => ({
                    value: uni.name,
                    label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                    code: uni.code,
                  }))}
                  value={university}
                  onChange={setUniversity}
                  placeholder="Search by name or code..."
                  className="min-w-[200px]"
                  allOptionLabel="All Universities"
                />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Filters
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-6">
              <div className="mb-6 flex justify-between items-center">
                <p className="text-lg font-medium text-gray-700">
                  {sortedCandidates.length} intern{sortedCandidates.length !== 1 ? 's' : ''} found
                </p>
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('all')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        viewMode === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => setViewMode('shortlist')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        viewMode === 'shortlist'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      Shortlist
                    </button>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Name">Sort by Name</option>
                    <option value="University">Sort by University</option>
                    <option value="Position">Sort by Position</option>
                  </select>
                </div>
              </div>

              {sortedCandidates.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No candidates found matching your criteria.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
