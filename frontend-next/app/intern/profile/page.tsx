'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Menu } from 'lucide-react'

export default function InternProfilePage() {
  const router = useRouter()
  const { profileData, isLoading, completionPercentage, refetch } = useProfile()
  const [currentDate, setCurrentDate] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    setCurrentDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`)
  }, [])

  // ตรวจสอบสิทธิ์ (Logic เดิม)
  useEffect(() => {
    const checkRole = async () => {
      try {
        const { apiFetch } = await import('@/lib/api')
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        if (userData.user.role === 'COMPANY') { router.push('/employer/profile'); return }
        if (!userData.user.role) { router.push('/role-selection'); return }
      } catch (error) { console.error(error) }
    }
    checkRole()
  }, [router])

  return (
    <div className="h-screen flex flex-col bg-[#E6EBF4] dark:bg-gray-950 overflow-hidden">
      <InternNavbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
          
          {/* FAB: ปุ่มเมนูตามแบบในรูปภาพ (สีขาว, ไอคอนเข้ม, เงาฟุ้ง) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
          >
            <Menu size={28} strokeWidth={2.5} />
          </button>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 animate-pulse">Loading profile...</p>
              </div>
            ) : !profileData ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="text-slate-600 mb-6">No profile data found.</p>
                <button onClick={() => router.push('/intern/profile-setup')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Setup Profile</button>
              </div>
            ) : (
              <>
                <ProfileHeader
                  fullName={profileData.fullName || 'User'}
                  currentDate={currentDate}
                  completionPercentage={completionPercentage}
                />

                <div className="grid grid-cols-1 gap-6">
                  <PersonalInfoCard profile={profileData} onRefresh={refetch} completionPercentage={completionPercentage} />
                  <ResumeSection resumeData={profileData.resume} onRefresh={refetch} />
                  <EducationSection education={profileData.education || []} onAdd={() => {}} onEdit={() => {}} onRefresh={refetch} />
                  <ProjectsSection projects={profileData.projects || []} onRefresh={refetch} />
                  <SkillsSection skills={profileData.skills || []} certificates={profileData.certificates || []} projects={profileData.projects || []} onRefresh={refetch} />
                  <CertificatesSection />
                </div>
                
                {/* Space for FAB on mobile */}
                <div className="h-24 lg:hidden" />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}