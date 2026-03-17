'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import InternNavbar from '@/components/InternNavbar'
import { useProfile } from '@/hooks/useProfile'
import ProfileHeader from '@/components/profile/ProfileHeader'
import PersonalInfoCard from '@/components/profile/PersonalInfoCard'
import EducationSection from '@/components/profile/EducationSection'
import ResumeSection from '@/components/profile/ResumeSection'
import ProjectsSection from '@/components/profile/ProjectsSection'
import SkillsSection from '@/components/profile/SkillsSection'
import CertificatesSection from '@/components/profile/CertificatesSection'
import Sidebar from '@/components/InternSidebar'

export default function InternProfilePage() {
  const router = useRouter()
  const pathname = usePathname()

  const { profileData, isLoading, completionPercentage, refetch } = useProfile()

  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    setCurrentDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`)
  }, [])

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { apiFetch } = await import('@/lib/api')
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        if (userData.user.role === 'COMPANY') { router.push('/employer/profile'); return }
        if (!userData.user.role) { router.push('/role-selection'); return }
      } catch (error) {
        console.error('Failed to check role:', error)
      }
    }
    checkRole()
  }, [router])

  return (
    <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="layout-container layout-page flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-gray-500">Loading profile...</p>
                </div>
              </div>
            ) : !profileData ? (
              <div className="flex items-center justify-center min-h-[60vh]">
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
            ) : (
              <>
                <ProfileHeader
                  fullName={profileData.fullName || 'User'}
                  currentDate={currentDate}
                  completionPercentage={completionPercentage}
                />

                <PersonalInfoCard
                  profile={profileData}
                  onRefresh={refetch}
                  completionPercentage={completionPercentage}
                />

                <ResumeSection
                  resumeData={profileData.resume}
                  onRefresh={refetch}
                />

                <EducationSection
                  education={profileData.education || []}
                  onAdd={() => {}}
                  onEdit={() => {}}
                  onRefresh={refetch}
                />

                <ProjectsSection
                  projects={profileData.projects || []}
                  onRefresh={refetch}
                />

                <SkillsSection
                  skills={profileData.skills || []}
                  certificates={profileData.certificates || []}
                  projects={profileData.projects || []}
                  onRefresh={refetch}
                />

                <CertificatesSection />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}