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
  
  const stats = useMemo(() => {
    const skills = profile.skills || []
    const projects = profile.projects || []

    return {
      verifiedSkillTest: skills.filter(s => s.rating && s.rating > 7).length,
      verifiedCertificate: skills.filter(s => s.category === 'technical').length,
      notVerifiedSkills: skills.filter(s => !s.rating).length,
      projectUploaded: projects.filter(p => p.skills && p.skills.length > 0).length,
      projectNoFile: projects.filter(p => !p.skills || p.skills.length === 0).length,
    }
  }, [profile])

  const displayRoles = profile.positionsOfInterest?.length 
    ? profile.positionsOfInterest 
    : ['Candidate']

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100 relative">
        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-6 right-8 px-5 py-1.5 rounded-lg font-bold text-sm border border-blue-400 text-blue-500 hover:bg-blue-50 transition-all"
        >
          Edit
        </button>

        {/* Profile Header Section */}
        <div className="flex items-start gap-6 mb-6">
          <img
            src={profile.profileImage || "/api/placeholder/100/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover shadow-sm bg-slate-50"
          />
          <div className="pt-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {profile.fullName || 'Candidate Name'}
            </h2>
            <div className="flex flex-col text-slate-400 text-sm space-y-0.5">
              <span>Phone: {profile.phoneNumber || '-'}</span>
              <span>Email: {profile.contactEmail || '-'}</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-4xl">
          {profile.bio || "No description provided."}
        </p>

        {/* Positions Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {displayRoles.map((role, idx) => (
            <span key={idx} className="px-4 py-1.5 bg-[#E2E8F0] text-slate-700 text-xs font-bold rounded-md">
              {role}
            </span>
          ))}
        </div>

        {/* Profile Completion Bar */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-sm font-bold text-slate-900">Profile Completion:</span>
          <div className="bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full min-w-[70px] text-center">
            100/100
          </div>
        </div>

        {/* AI Validation Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h3 className="font-bold text-slate-800">AI Validation Status</h3>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#4ADE80] border border-[#DCFCE7] rounded-full text-xs font-bold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Verified
            </span>
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Education Row */}
            <div className="flex items-start gap-4">
              <span className="w-20 text-slate-400 font-medium text-sm pt-0.5">Education</span>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                Verified
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Skills Row */}
            <div className="flex items-start gap-4">
              <span className="w-20 text-slate-400 font-medium text-sm pt-0.5">Skills</span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  {stats.verifiedSkillTest} Verified By Skill Test
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  {stats.verifiedCertificate} Evidence By Certificate
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  {stats.notVerifiedSkills} Not Verified
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Project Row */}
            <div className="flex items-start gap-4">
              <span className="w-20 text-slate-400 font-medium text-sm pt-0.5">Project</span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  {stats.projectUploaded} File Uploaded
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  {stats.projectNoFile} No File Uploaded
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
        onSave={async () => {
          if (onRefresh) await onRefresh();
        }}
      />
    </>
  )
}