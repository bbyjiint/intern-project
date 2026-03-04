'use client'

import { useRouter } from 'next/navigation'
import { ProfileData } from '@/hooks/useProfile'

interface PersonalInfoCardProps {
  profile: ProfileData
  onEdit: () => void
}

export default function PersonalInfoCard({ profile, onEdit }: PersonalInfoCardProps) {
  const router = useRouter()
  
  // ข้อมูลสมมติสำหรับแสดงผลตามรูปภาพ (หากใน profileData ยังไม่มีค่าเหล่านี้)
  const jobRoles = ['Backend Developer', 'Software Engineer', 'AI Developer']

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-100 relative">
      {/* Edit Button - Top Right */}
      <button
        onClick={() => router.push('/intern/profile-setup?step=1')}
        className="absolute top-6 right-8 px-5 py-1.5 rounded-lg font-bold text-sm border transition-colors"
        style={{ borderColor: '#4285F4', color: '#4285F4' }}
      >
        Edit
      </button>

      {/* Main Info Section */}
      <div className="flex items-start gap-8 mb-6">
        <div className="flex-shrink-0">
          <img
            src={profile.profileImage || "/api/placeholder/100/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover shadow-sm"
          />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#000' }}>
            {profile.fullName || 'Ms. Jane Smith'}
          </h2>
          <div className="text-gray-400 text-sm space-y-0.5">
            <p>Phone: {profile.phoneNumber || '089-123-4567'}</p>
            <p>Email: {profile.contactEmail || 'Jane.smith@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Bio / Summary */}
      <div className="mb-6">
        <p className="text-gray-600 text-[15px] leading-relaxed">
          {profile.bio || "Third-year Computer Engineering student with a strong interest in backend development and AI systems. Experienced in building REST APIs using Node.js and developing machine learning models with Python. Passionate about problem-solving and continuous learning."}
        </p>
      </div>

      {/* Job Role Badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        {jobRoles.map((role) => (
          <span key={role} className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md">
            {role}
          </span>
        ))}
      </div>

      {/* Profile Completion */}
      <div className="flex items-center gap-4 mb-8">
        <span className="font-bold text-gray-800">Profile Completion:</span>
        <div className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
          100/100
        </div>
      </div>

      {/* AI Validation Status Section */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">AI Validation Status</h3>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        </div>

        <div className="space-y-6">
          {/* Education */}
          <div className="flex border-b border-gray-100 pb-4">
            <span className="w-32 text-gray-500 font-medium">Education</span>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500">●</span> Verified
            </div>
          </div>

          {/* Skills */}
          <div className="flex border-b border-gray-100 pb-4">
            <span className="w-32 text-gray-500 font-medium">Skills</span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">●</span> 2 Verified By Skill Test
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">●</span> 2 Verified By Certificate
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-red-500">●</span> 2 Not Verified
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="flex">
            <span className="w-32 text-gray-500 font-medium">Project</span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">●</span> 2 File Uploaded
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-red-500">●</span> 3 No File Uploaded
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}