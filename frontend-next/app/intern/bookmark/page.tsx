'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import InternNavbar from '@/components/InternNavbar'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

interface BookmarkedJob {
  id: string
  jobTitle: string
  companyName: string
  companyLogo: string
  location: string
  workType: string
  skills: string[]
  description: string
  postedDate: string
  status?: 'viewed' | 'interviewed' | 'accepted' | 'rejected'
  isApplied?: boolean
}

const mockJobs: BookmarkedJob[] = [
  {
    id: '1',
    jobTitle: 'Internship - UX/UI Designer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Hybrid',
    skills: ['Figma and Adobe Illustrator', 'Understanding of UX', 'Ability to work with developers'],
    description: 'We are looking for a UX/UI Designer Intern to support the design of user-centered digital experiences and collaborate with cross-functional teams.',
    postedDate: '5 January 2026',
    status: 'viewed',
    isApplied: true,
  },
  {
    id: '2',
    jobTitle: 'Internship - Market Research Analyst',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Hybrid',
    skills: [
      'Data collection and analysis (Quantitative & Qualitative)',
      'Understanding of market trends and consumer behavior',
      'Ability to synthesize insights into clear reports and presentations',
      'Ability to work with cross-functional teams (e.g. marketing, product, strategy)',
    ],
    description: 'We are looking for a Market Research Analyst Intern to support market and consumer research, analyze data to generate actionable insights, and collaborate with cross-functional teams to support business and strategic decisions.',
    postedDate: '3 January 2026',
    status: 'accepted',
    isApplied: true,
  },
  {
    id: '3',
    jobTitle: 'Software Engineering Intern',
    companyName: 'Tech Corp',
    companyLogo: 'TC',
    location: 'Bangkok',
    workType: 'Remote',
    skills: ['React', 'Node.js', 'TypeScript'],
    description: 'Join our engineering team to build innovative web applications.',
    postedDate: '2 January 2026',
    isApplied: false,
  },
]

export default function InternBookmarkPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('')
  const [company, setCompany] = useState('')
  const [statusApplied, setStatusApplied] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  
  const isAIAnalysisPage = pathname === '/intern/ai-analysis'
  const isJobMatchPage = pathname === '/intern/job-match' || pathname === '/intern/find-companies'
  const isCertificatesPage = pathname === '/intern/certificates'
  const isExperiencePage = pathname === '/intern/experience'
  const isProjectPage = pathname === '/intern/project'
  const [statusNotApplied, setStatusNotApplied] = useState(false)
  
  // Check if current page is one of the dropdown menu pages
  const isProfileDropdownPage = isAIAnalysisPage || isJobMatchPage || isCertificatesPage || isExperiencePage || isProjectPage

  // Keep dropdown open when navigating to dropdown menu pages
  useEffect(() => {
    if (isProfileDropdownPage) {
      setIsProfileDropdownOpen(true)
    }
  }, [isProfileDropdownPage])

  // Dropdown stays open when clicked - no auto-close on outside click
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set())
  const [jobs, setJobs] = useState<BookmarkedJob[]>(mockJobs)

  // Load bookmarked jobs from API (fallback to localStorage for legacy demo)
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<{ jobs: BookmarkedJob[] }>(`/api/intern/job-bookmarks/jobs`)
        const ids = new Set((data.jobs || []).map((j) => j.id))
        setJobs(data.jobs || [])
        setBookmarkedJobs(ids)
        return
      } catch (e) {
        console.error('Failed to load bookmarked jobs from API, falling back to localStorage:', e)
      }

      const savedBookmarks = localStorage.getItem('internBookmarkedJobs')
      if (savedBookmarks) {
        try {
          const bookmarks = JSON.parse(savedBookmarks)
          setBookmarkedJobs(new Set(bookmarks))
        } catch (e) {
          console.error('Failed to parse bookmarked jobs:', e)
        }
      }

      const savedJobs = localStorage.getItem('internBookmarkedJobsList')
      if (savedJobs) {
        try {
          setJobs(JSON.parse(savedJobs))
        } catch (e) {
          console.error('Failed to parse jobs:', e)
        }
      }
    }

    load()
  }, [])

  // Save bookmarked jobs to localStorage (legacy demo sync)
  useEffect(() => {
    if (bookmarkedJobs.size > 0) {
      localStorage.setItem('internBookmarkedJobs', JSON.stringify(Array.from(bookmarkedJobs)))
    } else {
      localStorage.removeItem('internBookmarkedJobs')
    }
  }, [bookmarkedJobs])

  const handleBookmark = async (id: string) => {
    const newBookmarks = new Set(bookmarkedJobs)
    if (newBookmarks.has(id)) {
      try {
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: 'DELETE' })
      } catch (e) {
        console.error('Failed to remove bookmark:', e)
      }
      newBookmarks.delete(id)
    } else {
      try {
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: 'POST' })
      } catch (e) {
        console.error('Failed to bookmark:', e)
      }
      newBookmarks.add(id)
    }
    setBookmarkedJobs(newBookmarks)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setPosition('')
    setCompany('')
    setStatusApplied(false)
    setStatusNotApplied(false)
  }

  // Filter: Only show bookmarked jobs
  const bookmarkedJobsList = jobs.filter((job) => bookmarkedJobs.has(job.id))

  // Apply search and filter
  const filteredJobs = bookmarkedJobsList.filter((job) => {
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPosition = !position || job.jobTitle.toLowerCase().includes(position.toLowerCase())
    const matchesCompany = !company || job.companyName.toLowerCase().includes(company.toLowerCase())
    
    let matchesStatus = true
    if (statusApplied && !statusNotApplied) {
      matchesStatus = job.isApplied === true
    } else if (statusNotApplied && !statusApplied) {
      matchesStatus = job.isApplied === false || !job.isApplied
    } else if (statusApplied && statusNotApplied) {
      matchesStatus = true // Show all if both checked
    }

    return matchesSearch && matchesPosition && matchesCompany && matchesStatus
  })

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'viewed':
        return { bg: '#E3F2FD', text: '#0273B1', border: '#0273B1' }
      case 'interviewed':
        return { bg: '#E3F2FD', text: '#0273B1', border: '#0273B1' }
      case 'accepted':
        return { bg: '#E8F5E9', text: '#2E7D32', border: '#2E7D32' }
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828', border: '#C62828' }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            {/* Profile with Dropdown */}
            <div className="profile-dropdown-container">
              <button
                onClick={() => {
                  router.push('/intern/profile')
                }}
                className="w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
                style={{ 
                  color: pathname === '/intern/profile' ? 'white' : '#1C2D4F',
                  backgroundColor: pathname === '/intern/profile' ? '#0273B1' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/intern/profile') {
                    e.currentTarget.style.color = '#0273B1'
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/intern/profile') {
                    e.currentTarget.style.color = '#1C2D4F'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Profile</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Open dropdown and keep it open - don't toggle
                    setIsProfileDropdownOpen(true)
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </button>
              
              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link
                    href="/intern/ai-analysis"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isAIAnalysisPage ? 'white' : '#1C2D4F',
                      backgroundColor: isAIAnalysisPage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isAIAnalysisPage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAIAnalysisPage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>AI Analysis</span>
                  </Link>
                  <Link
                    href="/intern/job-match"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isJobMatchPage ? 'white' : '#1C2D4F',
                      backgroundColor: isJobMatchPage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isJobMatchPage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isJobMatchPage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Job Match</span>
                  </Link>
                  <Link
                    href="/intern/certificates"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isCertificatesPage ? 'white' : '#1C2D4F',
                      backgroundColor: isCertificatesPage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCertificatesPage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCertificatesPage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Certificates</span>
                  </Link>
                  <Link
                    href="/intern/experience"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isExperiencePage ? 'white' : '#1C2D4F',
                      backgroundColor: isExperiencePage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isExperiencePage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExperiencePage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Experience</span>
                  </Link>
                  <Link
                    href="/intern/project"
                    className="block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3"
                    style={{ 
                      color: isProjectPage ? 'white' : '#1C2D4F',
                      backgroundColor: isProjectPage ? '#0273B1' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isProjectPage) {
                        e.currentTarget.style.backgroundColor = '#F0F4F8'
                        e.currentTarget.style.color = '#0273B1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProjectPage) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#1C2D4F'
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Project</span>
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/intern/applied"
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
              <span className="font-medium">Applied</span>
            </Link>
            <Link
              href="/intern/bookmark"
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
            {/* Header */}
            <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#0273B1' }}>
                Bookmark
              </h1>
              <p className="text-gray-600">View and manage job you've saved for later</p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skills, or keywords..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Position"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company Name"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Checkboxes */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statusApplied}
                      onChange={(e) => setStatusApplied(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Applied</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statusNotApplied}
                      onChange={(e) => setStatusNotApplied(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Not Applied</span>
                  </label>
                </div>
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
                  className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#0273B1' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#025a8f'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0273B1'
                  }}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Company Count */}
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700">
                {filteredJobs.length} companies found
              </p>
            </div>

            {/* Job Listings */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {bookmarkedJobs.size === 0
                  ? 'No bookmarked jobs yet. Start bookmarking jobs to see them here.'
                  : 'No jobs found matching your search criteria.'}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => {
                  const statusColor = getStatusColor(job.status)
                  return (
                    <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-16 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{job.companyLogo}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.jobTitle}</h3>
                            <p className="text-gray-600 mb-2">{job.companyName}</p>
                            <p className="text-gray-600">
                              {job.location} ({job.workType})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleBookmark(job.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <svg
                              className={`w-5 h-5 ${bookmarkedJobs.has(job.id) ? 'fill-blue-600 text-blue-600' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                          {statusColor && (
                            <span
                              className="px-4 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                                border: `1px solid ${statusColor.border}`,
                              }}
                            >
                              {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {job.skills.map((skill, index) => (
                            <li key={index} className="text-sm">
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4">{job.description}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">{job.postedDate}</p>
                        <button
                          className="px-6 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                          style={{ backgroundColor: '#0273B1' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#025a8f'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0273B1'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
