'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import InternNavbar from '@/components/InternNavbar'
import { useProfile, ProfileData } from '@/hooks/useProfile'
import ProfileHeader from '@/components/profile/ProfileHeader'
import PersonalInfoCard from '@/components/profile/PersonalInfoCard'
import EducationSection from '@/components/profile/EducationSection'
import ExperienceSection from '@/components/profile/ExperienceSection'
import ProjectsSection from '@/components/profile/ProjectsSection'
import SkillsSection from '@/components/profile/SkillsSection'
import EditProfileDrawer from '@/components/profile/EditProfileDrawer'

type EditSection = 
  | 'personal'
  | 'education'
  | 'experience'
  | 'project'
  | 'skill'

export default function InternProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { profileData, isLoading, completionPercentage, refetch } = useProfile()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editSection, setEditSection] = useState<EditSection | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState('')
  
  const isJobMatchPage = pathname === '/intern/job-match' || pathname === '/intern/find-companies'

  useEffect(() => {
    // Set current date
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const dayName = days[now.getDay()]
    const day = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    
    setCurrentDate(`${dayName}, ${day} ${month} ${year}`)
  }, [])

  useEffect(() => {
    // Check user role
    const checkRole = async () => {
      try {
        const { apiFetch } = await import('@/lib/api')
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        if (userData.user.role === 'COMPANY') {
          router.push('/employer/profile')
          return
        }
        
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }
      } catch (error) {
        console.error('Failed to check role:', error)
      }
    }

    checkRole()
  }, [router])

  const handleEdit = (section: EditSection, id: string | null = null) => {
    setEditSection(section)
    setEditingId(id)
    setEditDrawerOpen(true)
  }

  const handleAdd = (section: EditSection) => {
    setEditSection(section)
    setEditingId(null)
    setEditDrawerOpen(true)
  }

  const handleSave = () => {
    refetch()
    setEditDrawerOpen(false)
    setEditSection(null)
    setEditingId(null)
  }

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
            {/* Profile with Dropdown */}
            <div>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
                style={{ backgroundColor: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-white">Profile</span>
                </div>
                <svg 
                  className={`w-4 h-4 text-white transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
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
                </div>
              )}
            </div>

            <Link
              href="/intern/ai-analysis"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="font-medium">AI Analysis</span>
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
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <ProfileHeader 
            fullName={profileData.fullName || 'User'}
            currentDate={currentDate}
            completionPercentage={completionPercentage}
          />

          {/* Personal Information */}
          <PersonalInfoCard 
            profile={profileData}
            onEdit={() => handleEdit('personal')}
          />

          {/* Education */}
          <EducationSection
            education={profileData.education || []}
            onAdd={() => handleAdd('education')}
            onEdit={(id) => handleEdit('education', id)}
          />

          {/* Experience */}
          <ExperienceSection
            experience={profileData.experience || []}
            onAdd={() => handleAdd('experience')}
            onEdit={(id) => handleEdit('experience', id)}
          />

          {/* Projects */}
          <ProjectsSection
            projects={profileData.projects || []}
            onAdd={() => handleAdd('project')}
            onEdit={(id) => handleEdit('project', id)}
          />

          {/* Skills */}
          <SkillsSection
            skills={profileData.skills || []}
            onAdd={() => handleAdd('skill')}
            onEdit={(id) => handleEdit('skill', id)}
          />
        </div>
      </div>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer
        isOpen={editDrawerOpen}
        section={editSection}
        editingId={editingId}
        profileData={profileData}
        onClose={() => {
          setEditDrawerOpen(false)
          setEditSection(null)
          setEditingId(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}
