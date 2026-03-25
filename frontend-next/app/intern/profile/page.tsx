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
  
  // เพิ่ม State สำหรับคุม Sidebar บนมือถือ
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <InternNavbar />

      {/* ปุ่มเปิด Sidebar สำหรับมือถือ (จะแสดงเฉพาะจอเล็ก) */}
      <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <span className="ml-3 font-bold text-slate-800 dark:text-white">Menu</span>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* ส่ง props ไปคุมการเปิดปิด */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 overflow-y-auto w-full">
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl py-6 sm:py-8">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 dark:border-gray-800 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
                </div>
              </div>
            ) : !profileData ? (
              <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No profile data found. Please complete your profile setup.</p>
                  <button
                    onClick={() => router.push('/intern/profile-setup')}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Go to Profile Setup
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20"> 
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}