'use client'

import { useRouter } from 'next/navigation'
import { ProfileData } from '@/hooks/useProfile'

interface PersonalInfoCardProps {
  profile: ProfileData
  onEdit: () => void
}

export default function PersonalInfoCard({ profile, onEdit }: PersonalInfoCardProps) {
  const router = useRouter()
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Personal Information
        </h2>
        <button
          onClick={() => router.push('/intern/profile-setup?step=1')}
          className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-colors"
          style={{ 
            borderColor: '#0273B1',
            color: '#0273B1',
            backgroundColor: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0F4F8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          Edit
        </button>
      </div>

      <div className="flex items-start gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold text-2xl"
              style={{ backgroundColor: '#0273B1' }}
            >
              {getInitials(profile.fullName)}
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
            {profile.fullName || 'No name provided'}
          </h3>
          
          <div className="space-y-1 mb-4 text-gray-700">
            {profile.phoneNumber && (
              <p>Phone: {profile.phoneNumber}</p>
            )}
            {profile.contactEmail && (
              <p>Email: {profile.contactEmail}</p>
            )}
          </div>

          {/* Bio/Summary */}
          <div className="mb-4">
            {profile.bio ? (
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic">No professional summary provided.</p>
            )}
          </div>

          {/* Introduction Video */}
          {profile.introductionVideo && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#0273B1' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <a 
                href={profile.introductionVideo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Introduction Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
