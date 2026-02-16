'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'
import { Project } from '@/hooks/useProfile'

export default function ProjectPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('All Tech')
  const [profileData, setProfileData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(false)
  
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

  const loadProjects = useCallback(async () => {
    setDataLoading(true)
    try {
      const data = await apiFetch<{ profile: any }>('/api/candidates/profile')
      setProfileData(data.profile)
      setProjects(data.profile?.projects || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
      setProjects([])
    } finally {
      setDataLoading(false)
    }
  }, [])

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
        loadProjects()
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
  }, [router, loadProjects])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const getInitials = (name?: string) => {
    if (!name) return 'JD'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'JD'
    const first = parts[0]?.[0] ?? 'J'
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1]
    return (first + (second ?? 'D')).toUpperCase()
  }

  // Extract all unique technologies from projects
  const allTechnologies = Array.from(
    new Set(
      projects.flatMap((project) => project.skills || [])
    )
  ).sort()

  // Filter projects based on selected technology
  const filteredProjects = selectedTechFilter === 'All Tech'
    ? projects
    : projects.filter((project) => project.skills?.includes(selectedTechFilter))

  // Featured projects (first 3-4 projects)
  const featuredProjects = projects.slice(0, 4)

  // Don't return early - keep layout visible

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
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
                  {profileData?.fullName || 'John Doe'}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {profileData?.desiredPosition || 'Software Engineer Intern'}
                </p>
                <p className="text-gray-700 max-w-3xl">
                  {profileData?.bio || profileData?.aboutYou || 'Aspiring software engineer with hands-on experience in developing data-driven applications. Skilled in Python, SQL, and Tableau.'}
                </p>
              </div>

              {/* Featured Projects Section */}
              {!dataLoading && featuredProjects.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
                Featured Projects
              </h2>
              <div className="space-y-6">
                {featuredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Project Icon */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        {getInitials(project.name)}
                      </div>

                      {/* Project Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold mb-1" style={{ color: '#1C2D4F' }}>
                              {project.name}
                              {project.role && ` · ${project.role}`}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.linkedToExperience || 'Software Engineering Intern'}
                            </p>
                          </div>
                          {(project.startDate || project.endDate) && (
                            <div className="text-sm text-gray-600 text-right">
                              {formatDate(project.startDate)} - {formatDate(project.endDate) || 'Present'}
                            </div>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-gray-700 mb-3">{project.description}</p>
                        )}
                        {project.skills && project.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{ backgroundColor: '#E3F2FD', color: '#0273B1' }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1C2D4F' }}>
                All Projects
              </h2>
              <Link
                href="/intern/certificates"
                className="text-sm font-medium flex items-center space-x-1"
                style={{ color: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#0273B1'
                }}
              >
                <span>All Certificates</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedTechFilter('All Tech')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTechFilter === 'All Tech'
                    ? 'text-white'
                    : 'text-gray-700 bg-white border border-gray-300'
                }`}
                style={{
                  backgroundColor: selectedTechFilter === 'All Tech' ? '#0273B1' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (selectedTechFilter !== 'All Tech') {
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTechFilter !== 'All Tech') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                All Tech
              </button>
              {allTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setSelectedTechFilter(tech)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTechFilter === tech
                      ? 'text-white'
                      : 'text-gray-700 bg-white border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: selectedTechFilter === tech ? '#0273B1' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTechFilter !== tech) {
                      e.currentTarget.style.backgroundColor = '#F0F4F8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTechFilter !== tech) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {tech}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 flex items-center space-x-1"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F4F8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>All Types</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Projects List */}
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading projects...</p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-600 mb-4">No projects found.</p>
                <button
                  onClick={() => router.push('/intern/profile')}
                  className="px-4 py-2 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: '#0273B1' }}
                >
                  Add Your First Project
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Project Icon */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        {getInitials(project.name)}
                      </div>

                      {/* Project Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold mb-1" style={{ color: '#1C2D4F' }}>
                              {project.name}
                              {project.role && ` · ${project.role}`}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.linkedToExperience || 'Software Engineering Intern'}
                            </p>
                          </div>
                          {(project.startDate || project.endDate) && (
                            <div className="text-sm text-gray-600 text-right">
                              {formatDate(project.startDate)} - {formatDate(project.endDate) || 'Present'}
                            </div>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-gray-700 mb-3">{project.description}</p>
                        )}
                        {project.skills && project.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{ backgroundColor: '#E3F2FD', color: '#0273B1' }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
