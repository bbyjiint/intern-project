'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

interface JobMatch {
  id: string
  jobTitle: string
  companyName: string
  companyInitial: string
  matchPercentage: number
  description: string
  location: string
  employmentType: string
  salary: string
  companyColor: string
}

export default function JobMatchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  
  const isAIAnalysisPage = pathname === '/intern/ai-analysis'
  const isJobMatchPage = pathname === '/intern/job-match' || pathname === '/intern/find-companies'
  const isCertificatesPage = pathname === '/intern/certificates'
  const isExperiencePage = pathname === '/intern/experience'
  const isProjectPage = pathname === '/intern/project'
  
  // Check if current page is one of the dropdown menu pages
  const isProfileDropdownPage = isAIAnalysisPage || isJobMatchPage || isCertificatesPage || isExperiencePage || isProjectPage

  // Keep dropdown open when navigating to dropdown menu pages
  useEffect(() => {
    if (isProfileDropdownPage) {
      setIsProfileDropdownOpen(true)
    }
  }, [isProfileDropdownPage])

  // Dropdown stays open when clicked - no auto-close on outside click

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        if (userData.user.role === 'COMPANY') {
          router.push('/employer/profile')
          return
        }
        
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to check auth:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('log in')) {
          router.push('/login')
        } else {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const loadJobMatches = async () => {
      try {
        // Try to fetch AI-recommended jobs
        const response = await apiFetch<{ jobs: JobMatch[] }>('/api/ai/job-matches')
        if (response.jobs) {
          setJobMatches(response.jobs)
        }
      } catch (error) {
        console.error('Failed to load job matches:', error)
        // Use mock data if API doesn't exist yet
        setJobMatches([
          {
            id: '1',
            jobTitle: 'Machine Learning Engineer',
            companyName: 'Tech Innovate',
            companyInitial: 'M',
            matchPercentage: 87,
            description: 'Strong match clue to your skills in Python, TensorFlow, and Machine Learning. Matches well with your analytics and problem-solving abilities.',
            location: 'San Francisco, CA',
            employmentType: 'Full-Time',
            salary: '$120k-$150k/year',
            companyColor: '#0273B1',
          },
          {
            id: '2',
            jobTitle: 'Data Scientist',
            companyName: 'DataWorks',
            companyInitial: 'D',
            matchPercentage: 78,
            description: 'Good fit based on your expertise in Python, SQL, data analysis, and mathematical skills.',
            location: 'New York, NY',
            employmentType: 'Full-Time',
            salary: '$110k-$140k/year',
            companyColor: '#4CAF50',
          },
          {
            id: '3',
            jobTitle: 'AI Researcher',
            companyName: 'Innovate AI',
            companyInitial: 'A',
            matchPercentage: 72,
            description: 'Potential match based on your knowledge of machine learning and mathematics. Consider gaining more research experience.',
            location: 'Seattle, WA',
            employmentType: 'Full-Time',
            salary: '$130k-$160k/year',
            companyColor: '#FF9800',
          },
          {
            id: '4',
            jobTitle: 'Software Engineer',
            companyName: 'CodeCrafters',
            companyInitial: 'C',
            matchPercentage: 68,
            description: 'Skills in Python and problem-solving suggested, but consider further developing your software engineering and mathematics.',
            location: 'Los Angeles, CA',
            employmentType: 'Full-Time',
            salary: '$100k-$130k/year',
            companyColor: '#FF9800',
          },
        ])
      }
    }

    if (!isLoading) {
      loadJobMatches()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6EBF4]">
        <InternNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E6EBF4]">
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
        <div className="layout-container layout-page flex-1">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
              Job Match
            </h1>
            <p className="text-gray-600">
              AI-recommended job positions tailored for you
            </p>
          </div>

          {/* Job Match Cards */}
          <div className="space-y-4">
            {jobMatches.map((job) => (
              <JobMatchCard key={job.id} job={job} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link href="/contact" className="hover:text-gray-700">
                Contact
              </Link>
              <Link href="/about" className="hover:text-gray-700">
                About Us
              </Link>
              <Link href="/privacy" className="hover:text-gray-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-700">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Job Match Card Component
function JobMatchCard({ job }: { job: JobMatch }) {
  const router = useRouter()
  const matchColor = job.matchPercentage >= 80 ? '#4CAF50' : '#FF9800'
  const borderColor = job.matchPercentage >= 80 ? '#4CAF50' : '#FF9800'
  const buttonBgColor = job.companyColor

  const handleViewDetails = () => {
    // Navigate to job details page
    router.push(`/intern/job-details/${job.id}`)
  }

  const handleApply = () => {
    // Navigate to apply page or open apply modal
    router.push(`/intern/apply/${job.id}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Company Icon */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
          style={{ backgroundColor: job.companyColor }}
        >
          {job.companyInitial}
        </div>

        {/* Job Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#1C2D4F' }}>
                {job.jobTitle}
              </h3>
              <p className="text-gray-600 text-sm">{job.companyName}</p>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: matchColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold" style={{ color: matchColor }}>
                {job.matchPercentage}% Match
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            {job.description}
          </p>

          {/* Job Details */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{job.employmentType}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{job.salary}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleViewDetails}
              className="px-6 py-2 rounded-lg font-medium border-2 transition-colors"
              style={{ 
                borderColor: borderColor,
                color: borderColor,
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              View Details
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: buttonBgColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
