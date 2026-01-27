'use client'

import { useEffect, useState, useMemo } from 'react'
import InternNavbar from '@/components/InternNavbar'
import Link from 'next/link'

interface JobApplication {
  id: string
  jobTitle: string
  companyName: string
  companyLogo: string
  location: string
  workType: string
  skills: string[]
  description: string
  appliedDate: string
  status: 'viewed' | 'interviewed' | 'accepted' | 'rejected'
  isBookmarked?: boolean
}

const mockApplications: JobApplication[] = [
  {
    id: '1',
    jobTitle: 'Internship - UX/UI Designer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Hybrid',
    skills: ['Figma and Adobe Illustrator', 'Understanding of UX', 'Ability to work with developers'],
    description: 'We are looking for a UX/UI Designer Intern to support the design of user-centered digital experiences and collaborate with cross-functional teams.',
    appliedDate: '5 January 2026',
    status: 'viewed',
    isBookmarked: false,
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
    appliedDate: '3 January 2026',
    status: 'accepted',
    isBookmarked: false,
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
    appliedDate: '2 January 2026',
    status: 'interviewed',
    isBookmarked: true,
  },
  {
    id: '4',
    jobTitle: 'Data Science Intern',
    companyName: 'Data Analytics Inc.',
    companyLogo: 'DA',
    location: 'Bangkok',
    workType: 'On-site',
    skills: ['Python', 'Machine Learning', 'SQL'],
    description: 'Work on data analysis and machine learning projects.',
    appliedDate: '1 January 2026',
    status: 'rejected',
    isBookmarked: false,
  },
]

export default function InternAppliedPage() {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications)
  const [statusFilter, setStatusFilter] = useState<'all' | 'viewed' | 'interviewed' | 'accepted' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load applications from localStorage if available
    const savedApplications = localStorage.getItem('internApplications')
    if (savedApplications) {
      try {
        setApplications(JSON.parse(savedApplications))
      } catch (e) {
        console.error('Failed to load applications:', e)
      }
    } else {
      // Save mock data to localStorage
      localStorage.setItem('internApplications', JSON.stringify(mockApplications))
    }
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [applications, statusFilter, searchQuery])

  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      viewed: applications.filter((a) => a.status === 'viewed').length,
      interviewed: applications.filter((a) => a.status === 'interviewed').length,
      accepted: applications.filter((a) => a.status === 'accepted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    }
  }, [applications])

  const getStatusColor = (status: string) => {
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
        return { bg: '#F5F5F5', text: '#616161', border: '#616161' }
    }
  }

  const handleBookmark = (id: string) => {
    const application = applications.find(app => app.id === id)
    if (!application) return
    
    const newBookmarkedStatus = !application.isBookmarked
    
    const updated = applications.map((app) =>
      app.id === id ? { ...app, isBookmarked: newBookmarkedStatus } : app
    )
    setApplications(updated)
    localStorage.setItem('internApplications', JSON.stringify(updated))
    
    // Also update bookmarked jobs list for bookmark page
    const savedBookmarks = localStorage.getItem('internBookmarkedJobs')
    const bookmarkedJobs = savedBookmarks ? new Set(JSON.parse(savedBookmarks)) : new Set<string>()
    
    if (newBookmarkedStatus) {
      // Add to bookmarks
      bookmarkedJobs.add(id)
      
      // Also save job details to bookmark page
      const savedJobs = localStorage.getItem('internBookmarkedJobsList')
      const jobsList = savedJobs ? JSON.parse(savedJobs) : []
      const jobExists = jobsList.find((job: any) => job.id === id)
      if (!jobExists) {
        jobsList.push({
          id: application.id,
          jobTitle: application.jobTitle,
          companyName: application.companyName,
          companyLogo: application.companyLogo,
          location: application.location,
          workType: application.workType,
          skills: application.skills,
          description: application.description,
          postedDate: application.appliedDate,
          status: application.status,
          isApplied: true,
        })
        localStorage.setItem('internBookmarkedJobsList', JSON.stringify(jobsList))
      }
    } else {
      // Remove from bookmarks
      bookmarkedJobs.delete(id)
    }
    localStorage.setItem('internBookmarkedJobs', JSON.stringify(Array.from(bookmarkedJobs)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            <Link
              href="/intern/profile"
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
              href="/intern/applied"
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium text-white">Applied</span>
            </Link>
            <Link
              href="/intern/bookmark"
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
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0273B1' }}>
              Applied
            </h1>
            <p className="text-gray-600">View and track your recent job applications.</p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Link
                href="/intern/find-companies"
                className="px-6 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                Find Post
              </Link>
            </div>

            <p className="text-gray-700 mb-4">{filteredApplications.length} companies found</p>

            {/* Status Filter Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-700'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => setStatusFilter('viewed')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'viewed'
                    ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-700'
                    : 'bg-white text-blue-600 hover:text-blue-700'
                }`}
              >
                Viewed ({statusCounts.viewed})
              </button>
              <button
                onClick={() => setStatusFilter('interviewed')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'interviewed'
                    ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-700'
                    : 'bg-white text-blue-600 hover:text-blue-700'
                }`}
              >
                Interviewed ({statusCounts.interviewed})
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'accepted'
                    ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-700'
                    : 'bg-white text-green-600 hover:text-green-700'
                }`}
              >
                Accepted ({statusCounts.accepted})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'rejected'
                    ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-700'
                    : 'bg-white text-red-600 hover:text-red-700'
                }`}
              >
                Rejected ({statusCounts.rejected})
              </button>
            </div>
          </div>

          {/* Job Application Cards */}
          <div className="space-y-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No applications found matching your criteria.
              </div>
            ) : (
              filteredApplications.map((application) => {
                const statusColor = getStatusColor(application.status)
                return (
                  <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{application.companyLogo}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                            <p className="text-gray-600">{application.companyName}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {application.location} ({application.workType})
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleBookmark(application.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <svg
                            className={`w-5 h-5 ${application.isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
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
                        <span
                          className="px-4 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                          }}
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {application.skills.map((skill, index) => (
                          <li key={index} className="text-sm">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4">{application.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
