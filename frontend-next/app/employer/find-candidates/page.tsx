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
    about: 'Passionate data science intern with expertise in machine learning and deep learning. Experienced in building predictive models and analyzing large datasets.',
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
    about: 'Creative UX design intern focused on creating intuitive and user-friendly interfaces. Passionate about design thinking and user research.',
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
    about: 'Software engineering intern specializing in backend development and cloud infrastructure. Experienced with microservices architecture.',
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
    about: 'Data science intern with strong analytical skills and experience in statistical modeling. Passionate about turning data into actionable insights.',
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
    about: 'Marketing intern with expertise in digital marketing and content strategy. Experienced in SEO optimization and social media management.',
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
    about: 'Passionate software engineering intern focused on full-stack development. Eager to learn modern web technologies and contribute to impactful projects.',
  },
]

export default function FindCandidatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('All Positions')
  const [university, setUniversity] = useState('')
  const [department, setDepartment] = useState('All Departments')
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set()) // Using candidate IDs
  const [sortBy, setSortBy] = useState('Name')
  const [viewMode, setViewMode] = useState<'all' | 'shortlist'>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null)
  const [apiCandidates, setApiCandidates] = useState<typeof mockCandidates | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [candidatesLoading, setCandidatesLoading] = useState(true)
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
      setCandidatesLoading(true)
      setApiError(null)
      try {
        const data = await apiFetch<{ candidates: typeof mockCandidates }>(`/api/candidates`)
        setApiCandidates(data.candidates)
      } catch (err) {
        // If not logged in / wrong role, keep mock list but show message.
        setApiError(err instanceof Error ? err.message : 'Failed to load candidates')
        setApiCandidates(null)
      } finally {
        setCandidatesLoading(false)
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
    setUniversity('')
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
    const matchesUniversity = university === '' || university === 'All Universities' || candidate.university === university
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
        <EmployerSidebar />

        {/* Main Content */}
        <div className="flex-1">
          <div className="layout-container layout-page">
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
              {candidatesLoading ? (
                <div className="py-20">
                  <LoadingSpinner size="lg" text="Loading candidates..." />
                </div>
              ) : (
                <>
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
