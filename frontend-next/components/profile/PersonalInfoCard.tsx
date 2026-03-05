'use client'

import { useState, useMemo } from 'react'
import { ProfileData } from '@/hooks/useProfile'
import PersonalModal from './PersonalModal'

interface PersonalInfoCardProps {
  profile: ProfileData
  onRefresh?: () => void
}

export default function PersonalInfoCard({ profile, onRefresh }: PersonalInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // คำนวณข้อมูลสมมติจาก profile data จริงๆ
  const stats = useMemo(() => {
    const skills = profile.skills || []
    const projects = profile.projects || []

    return {
      verifiedSkillTest: skills.filter(s => s.rating && s.rating > 7).length,
      verifiedCertificate: skills.filter(s => s.category === 'technical').length, // สมมติ logic
      notVerifiedSkills: skills.filter(s => !s.rating).length,
      projectUploaded: projects.filter(p => p.skills && p.skills.length > 0).length,
      projectNoFile: projects.filter(p => !p.skills || p.skills.length === 0).length,
    }
  }, [profile])

  const jobRoles = ['Backend Developer', 'Software Engineer', 'AI Developer']

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100 relative">
        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-6 right-8 px-5 py-1.5 rounded-lg font-bold text-sm border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        >
          Edit
        </button>

        {/* Profile Header */}
        <div className="flex items-start gap-8 mb-6">
          <img
            src={profile.profileImage || "/api/placeholder/100/100"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="pt-2">
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              {profile.fullName || 'Candidate Name'}
            </h2>
            <div className="flex flex-col text-slate-400 text-sm font-medium space-y-0.5">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                Phone: {profile.phoneNumber || '-'}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Email: {profile.contactEmail || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-slate-600 text-[15px] leading-relaxed mb-6 max-w-3xl">
          {profile.bio || "No description provided."}
        </p>

        {/* Job Roles */}
        <div className="flex flex-wrap gap-2 mb-8">
          {jobRoles.map(role => (
            <span key={role} className="px-4 py-1.5 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider border border-slate-100">
              {role}
            </span>
          ))}
        </div>

        {/* Completion Bar */}
        <div className="flex items-center gap-3 mb-8">
          <span className="font-bold text-slate-800 text-sm">Profile Completion:</span>
          <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-sm">
            100/100
          </div>
        </div>

        {/* AI Validation Status Card */}
        <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">AI Validation Status</h3>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] rounded-full text-[10px] font-black uppercase tracking-wide">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Verified
            </span>
          </div>

          <div className="space-y-5">
            {/* Education */}
            <div className="flex items-start border-b border-slate-200/60 pb-4">
              <span className="w-32 text-slate-500 font-bold text-sm">Education</span>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <span className="text-green-500 text-xs">●</span> Verified
              </div>
            </div>

            {/* Skills */}
            <div className="flex items-start border-b border-slate-200/60 pb-4">
              <span className="w-32 text-slate-500 font-bold text-sm">Skills</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <span className="text-green-500 text-xs">●</span> {stats.verifiedSkillTest} Verified By Skill Test
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <span className="text-green-500 text-xs">●</span> {stats.verifiedCertificate} Verified By Certificate
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <span className="text-red-500 text-xs">●</span> {stats.notVerifiedSkills} Not Verified
                </div>
              </div>
            </div>

            {/* Project */}
            <div className="flex items-start">
              <span className="w-32 text-slate-500 font-bold text-sm">Project</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <span className="text-green-500 text-xs">●</span> {stats.projectUploaded} File Uploaded
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <span className="text-red-500 text-xs">●</span> {stats.projectNoFile} No File Uploaded
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PersonalModal
        isOpen={isModalOpen}
        profile={profile}
        onClose={() => setIsModalOpen(false)}
        onSave={() => onRefresh?.()}
      />
    </>
  )
}