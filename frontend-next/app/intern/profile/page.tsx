'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

export default function InternProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check user role first
    const checkRoleAndLoadProfile = async () => {
      try {
        // Check user role first
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // If user has COMPANY role, redirect to employer pages
        if (userData.user.role === 'COMPANY') {
          router.push('/employer/profile')
          return
        }
        
        // If user has no role, redirect to role selection
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }

        // User has CANDIDATE role, proceed to load profile
        const data = await apiFetch<{ profile: any }>('/api/candidates/profile')
        setProfileData(data.profile)
        
        // Also save to localStorage for backward compatibility
        localStorage.setItem('internProfileData', JSON.stringify(data.profile))
        setIsLoading(false)
      } catch (error: any) {
        console.error('Failed to load profile data:', error)
        
        // If 403 Forbidden, it's a role mismatch - redirect based on error message
        if (error.status === 403) {
          const errorMessage = error.message || ''
          if (errorMessage.includes('COMPANY role')) {
            router.push('/employer/profile')
            return
          }
        }
        
        // If 404, profile doesn't exist yet - that's okay
        if (error.status === 404) {
          setProfileData(null)
          setIsLoading(false)
        } else {
          // Fallback to localStorage if API fails
          const savedData = localStorage.getItem('internProfileData')
          if (savedData) {
            try {
              setProfileData(JSON.parse(savedData))
            } catch (e) {
              console.error('Failed to parse profile data:', e)
            }
          }
          setIsLoading(false)
        }
      }
    }
    
    checkRoleAndLoadProfile()
    // Set current date
    updateDate()
  }, [router])

  const updateDate = () => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const dayName = days[now.getDay()]
    const day = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    
    setCurrentDate(`${dayName}, ${day} ${month} ${year}`)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        const updatedData = { ...profileData!, profileImage: imageUrl }
        setProfileData(updatedData)
        localStorage.setItem('internProfileData', JSON.stringify(updatedData))
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('profileImageUpdated'))
        ;(async () => {
          try {
            await apiFetch('/api/candidates/profile', {
              method: 'PUT',
              body: JSON.stringify({ profileImage: imageUrl }),
            })
          } catch (error) {
            console.error('Failed to save profile image:', error)
          }
        })()
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'I'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const goToStep = (step: number) => {
    router.push(`/intern/profile-setup?step=${step}`)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate)
    const end = endDate ? formatDate(endDate) : 'Present'
    return `${start} - ${end}`
  }

  const getSkillLevel = (level: string) => {
    const levels: Record<string, { label: string; description: string; width: string }> = {
      beginner: { label: 'Beginner', description: 'Learning basics, needs guidance', width: '33%' },
      intermediate: { label: 'Intermediate', description: 'Can work independently', width: '66%' },
      advanced: { label: 'Advanced', description: 'Can mentor others', width: '100%' },
    }
    return levels[level] || levels.beginner
  }

  const technicalSkills = profileData?.skills?.filter((s: any) => s.category === 'technical') || []
  const businessSkills = profileData?.skills?.filter((s: any) => s.category === 'business') || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InternNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InternNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No profile data found. Please complete your profile setup.</p>
            <button
              onClick={() => router.push('/intern/profile-setup')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Profile Setup
            </button>
          </div>
        </div>
      </div>
    )
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
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-white">Profile</span>
            </Link>
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
        <div className="flex-1" style={{ background: 'linear-gradient(to bottom, #E3F2FD 0%, #FFFFFF 300px)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
              Welcome, {profileData?.fullName || 'Intern'}!
            </h1>
            <p className="text-sm text-gray-500">{currentDate}</p>
          </div>

          {/* Profile Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        <span className="text-white font-semibold text-xl">
                          {getInitials(profileData?.fullName || 'Intern')}
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-bold text-gray-900 mb-1 cursor-pointer"
                    onClick={() => goToStep(1)}
                  >
                    {profileData?.fullName || 'Intern Name'}
                  </h2>
                  <p
                    className="text-gray-600 mb-3 cursor-pointer"
                    onClick={() => goToStep(1)}
                  >
                    {profileData?.email || 'email@example.com'}
                  </p>
                  <p
                    className="text-gray-700 leading-relaxed cursor-pointer"
                    onClick={() => goToStep(1)}
                  >
                    {profileData?.professionalSummary || profileData?.aboutYou || 'No professional summary provided.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => goToStep(1)}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  backgroundColor: 'white',
                  border: '2px solid #0273B1',
                  color: '#0273B1'
                }}
              >
                Edit
              </button>
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-bold cursor-pointer"
                style={{ color: '#1C2D4F' }}
                onClick={() => goToStep(2)}
              >
                Education
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToStep(2)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: '#0273B1' }}
                >
                  + Add Education
                </button>
                <button
                  onClick={() => goToStep(2)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            {profileData?.education && profileData.education.length > 0 ? (
              profileData.education.map((edu: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0 cursor-pointer" onClick={() => goToStep(2)}>
                  <p className="font-semibold text-gray-900">{edu.university || 'University Name'}</p>
                  <p className="text-gray-700">
                    {edu.degree || 'Degree'} | GPA: {edu.gpa || 'N/A'}/4.0 | {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                  {edu.coursework && edu.coursework.length > 0 && (
                    <p className="text-gray-600 mt-1">
                      Relevant Coursework: {edu.coursework.join(', ')}
                    </p>
                  )}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="mt-2">
                      {edu.achievements.map((achievement: string, i: number) => (
                        <p key={i} className="text-gray-600">{achievement}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No education information provided.</p>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-bold cursor-pointer"
                style={{ color: '#1C2D4F' }}
                onClick={() => goToStep(3)}
              >
                Experience
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToStep(3)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: '#0273B1' }}
                >
                  + Add Experience
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            {profileData?.experience && profileData.experience.length > 0 ? (
              profileData.experience.map((exp: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0 cursor-pointer" onClick={() => goToStep(3)}>
                  <p className="font-semibold text-gray-900">{exp.position || 'Position'} ({exp.companyName || 'Company'})</p>
                  <p className="text-gray-700">
                    {exp.department || 'Department'} | {formatDateRange(exp.startDate, exp.endDate)} {exp.manager ? `| Manager: ${exp.manager}` : ''}
                  </p>
                  {exp.description && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                      {exp.description.split('\n').map((line: string, i: number) => (
                        line.trim() && <li key={i}>{line.trim()}</li>
                      ))}
                    </ul>
                  )}
                  {exp.linkedProjects && exp.linkedProjects.length > 0 && (
                    <p className="text-blue-600 mt-2 cursor-pointer hover:underline">
                      → {exp.linkedProjects.length} Projects linked to this experience
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No experience information provided.</p>
            )}
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-bold cursor-pointer"
                style={{ color: '#1C2D4F' }}
                onClick={() => goToStep(2)}
              >
                Projects
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToStep(2)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: '#0273B1' }}
                >
                  + Add Project
                </button>
                <button
                  onClick={() => goToStep(2)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            {profileData?.projects && profileData.projects.length > 0 ? (
              profileData.projects.map((project: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0 cursor-pointer" onClick={() => goToStep(2)}>
                  <p className="font-semibold text-gray-900">{project.name || 'Project Name'} - {project.role || 'Role'}</p>
                  {project.linkedTo && (
                    <p className="text-gray-600 text-sm">
                      Linked to: {project.linkedTo} | {formatDateRange(project.startDate, project.endDate)}
                    </p>
                  )}
                  <p className="text-gray-700 mt-2">{project.description || 'No description provided.'}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.technologies.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No projects provided.</p>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-bold cursor-pointer"
                style={{ color: '#1C2D4F' }}
                onClick={() => goToStep(3)}
              >
                Skills
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/intern/profile-setup?step=3')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: '#0273B1' }}
                >
                  + Add Skill
                </button>
                <button
                  onClick={() => router.push('/intern/profile-setup?step=3')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            
            {/* Technical Skills */}
            {technicalSkills.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>Technical Skills</h4>
                <div className="space-y-4">
                  {technicalSkills.map((skill: any, index: number) => {
                    const level = getSkillLevel(skill.level || 'beginner')
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{skill.name || 'Skill Name'}</span>
                          <span className="text-sm text-gray-600">{level.label} | {level.description}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: level.width }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Business Skills */}
            {businessSkills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>Business Skills</h4>
                <div className="space-y-4">
                  {businessSkills.map((skill: any, index: number) => {
                    const level = getSkillLevel(skill.level || 'beginner')
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{skill.name || 'Skill Name'}</span>
                          <span className="text-sm text-gray-600">{level.label} | {level.description}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: level.width }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {technicalSkills.length === 0 && businessSkills.length === 0 && (
              <p className="text-gray-500">No skills provided.</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
