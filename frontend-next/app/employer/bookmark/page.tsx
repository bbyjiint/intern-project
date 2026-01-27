'use client'

import { useEffect, useMemo, useState } from 'react'
import EmployerNavbar from '@/components/EmployerNavbar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import Link from 'next/link'

const mockCandidates = [
  {
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

export default function BookmarkPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [position, setPosition] = useState('')
  const [university, setUniversity] = useState('')
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set())
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null)

  // Load bookmarked candidates from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedCandidates')
    if (savedBookmarks) {
      try {
        const bookmarks = JSON.parse(savedBookmarks)
        setBookmarkedCandidates(new Set(bookmarks))
      } catch (e) {
        console.error('Failed to parse bookmarked candidates:', e)
      }
    }
  }, [])

  // Save bookmarked candidates to localStorage
  useEffect(() => {
    if (bookmarkedCandidates.size > 0) {
      localStorage.setItem('bookmarkedCandidates', JSON.stringify(Array.from(bookmarkedCandidates)))
    } else {
      localStorage.removeItem('bookmarkedCandidates')
    }
  }, [bookmarkedCandidates])

  const handleBookmark = (e: React.MouseEvent, name: string) => {
    e.stopPropagation()
    const newBookmarks = new Set(bookmarkedCandidates)
    if (newBookmarks.has(name)) {
      newBookmarks.delete(name)
    } else {
      newBookmarks.add(name)
    }
    setBookmarkedCandidates(newBookmarks)
  }

  const handleCardClick = (candidate: typeof mockCandidates[0]) => {
    setSelectedCandidate(candidate)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setAcademicYear('')
    setPosition('')
    setUniversity('')
  }

  // Filter: Only show bookmarked candidates
  const bookmarkedCandidatesList = mockCandidates.filter((candidate) =>
    bookmarkedCandidates.has(candidate.name)
  )

  // Apply search and filter
  const filteredCandidates = bookmarkedCandidatesList.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const year = candidate.graduationDate.split(' ')[1] || ''
    const matchesAcademicYear = !academicYear || year.includes(academicYear)
    const matchesPosition = !position || candidate.role.toLowerCase().includes(position.toLowerCase())
    const matchesUniversity = !university || candidate.university.toLowerCase().includes(university.toLowerCase())

    return matchesSearch && matchesAcademicYear && matchesPosition && matchesUniversity
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
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
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
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
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
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Job Post</span>
            </Link>
            <Link
              href="/employer/bookmark"
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium text-white">Bookmark</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Bookmark</h1>

              {/* Search Bar */}
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

              {/* Filter Fields */}
              <div className="flex flex-wrap gap-4 mb-4">
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="Years"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Position"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="University"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
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

            {/* Intern Count */}
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700">
                {filteredCandidates.length} intern{filteredCandidates.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Candidates Grid */}
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {bookmarkedCandidates.size === 0
                  ? 'No bookmarked candidates yet. Start bookmarking candidates to see them here.'
                  : 'No candidates found matching your search criteria.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.name}
                    {...candidate}
                    isBookmarked={bookmarkedCandidates.has(candidate.name)}
                    onBookmark={(e) => handleBookmark(e, candidate.name)}
                    onClick={() => handleCardClick(candidate)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCandidate && (
        <CandidateProfileModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  )
}
