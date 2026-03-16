'use client'

import { useRouter } from 'next/navigation'
import { type Applicant } from './ApplicantCard'

export interface CandidateEducation {
  id?: string
  university: string
  educationLevel?: string | null
  degree?: string | null
  fieldOfStudy?: string | null
  yearOfStudy?: string | null
  gpa?: string | null
}

export interface CandidateProfile {
  id: string
  fullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  profileImage?: string | null
  internshipPeriod?: string | null
  bio?: string | null
  preferredPositions?: string[]
  preferredLocations?: string[]
  education?: CandidateEducation[]
  experience?: Array<{ id?: string }>
  projects?: Array<{ id?: string }>
  skills?: Array<{ name: string; level?: string; rating?: number }>
}

const MOCK_AI_JOB_MATCH = {
  position: { label: 'AI Developer', matched: true },
  education: { label: 'GPA > 3.50 - (Verified by Transcript)', matched: true },
  skills: [
    { label: 'Python - (Verified by Skill Test)', matched: true },
    { label: 'SQL - (Evidence by Certificate)', matched: true },
    { label: 'HTML - (Not Verified)', matched: false },
  ],
  project: { label: 'Dashboard Project (Relevant) - (File Uploaded)', matched: true },
}

const MOCK_AI_INSIGHT = [
  'Candidate has verified experience in Figma and completed a UI redesign project with GitHub activity.',
  'UX research knowledge is supported by certificate.',
  'Illustrator skill is present but not verified.',
]

function CheckIcon({ matched }: { matched: boolean }) {
  return matched ? (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white">
      <svg className="h-[10px] w-[10px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ) : (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#EF4444] text-white">
      <svg className="h-[10px] w-[10px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  )
}

function CircularProgress({ percentage, label }: { percentage: number; label: string }) {
  const norm = Math.max(0, Math.min(100, percentage))
  const size = 200
  const center = size / 2
  const totalSegments = 44
  const activeSegments = Math.round((norm / 100) * totalSegments)
  const outerRadius = 88
  const innerRadius = 74
  return (
    <div className="relative h-[220px] w-[220px]">
      <svg width="220" height="220" viewBox={`0 0 ${size} ${size}`}
        className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true">
        {Array.from({ length: totalSegments }).map((_, i) => {
          const angle = (-90 + (360 / totalSegments) * i) * (Math.PI / 180)
          return (
            <line key={i}
              x1={center + innerRadius * Math.cos(angle)} y1={center + innerRadius * Math.sin(angle)}
              x2={center + outerRadius * Math.cos(angle)} y2={center + outerRadius * Math.sin(angle)}
              stroke={i < activeSegments ? '#F5B942' : '#DCE4F2'}
              strokeWidth="6" strokeLinecap="round" />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[28px] font-medium leading-none text-[#1F2937]">{norm}%</p>
        <p className="mt-[8px] max-w-[120px] text-center text-[13px] leading-[1.3] text-[#4B5563]">{label}</p>
      </div>
    </div>
  )
}

interface ApplicantProfilePopupProps {
  applicant: Applicant
  profile: CandidateProfile | null
  jobMatch: number
  profileCompletion: number
  isLoading: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

export default function ApplicantProfilePopup({
  applicant, profile, jobMatch, profileCompletion, isLoading,
  onClose, onAccept, onDecline,
}: ApplicantProfilePopupProps) {
  const router = useRouter()
  const candidateId = profile?.id || applicant.candidateId

  // ✅ navigate ไปหน้า employer/candidate/[id] พร้อม scroll section
  const goToProfile = (section?: string) => {
    const url = `/employer/candidate/${candidateId}${section ? `?section=${section}` : ''}`
    router.push(url)
  }

  const primaryEducation = profile?.education?.[0]
  const displayName = profile?.fullName || applicant.name
  const displayPhone = profile?.phoneNumber || '-'
  const displayEmail = profile?.email || applicant.email
  const about = profile?.bio?.trim() || 'No description provided.'
  const positions = profile?.preferredPositions?.length ? profile.preferredPositions : applicant.preferredPositions || []
  const locations = profile?.preferredLocations?.length ? profile.preferredLocations : applicant.preferredLocations || []
  const internshipPeriod = profile?.internshipPeriod || applicant.internshipPeriod || '-'

  const educationLine1 = primaryEducation
    ? `${primaryEducation.university}${primaryEducation.yearOfStudy ? ` | Year ${primaryEducation.yearOfStudy}${String(primaryEducation.yearOfStudy).trim() ? ' (Currently studying)' : ''}` : ''}`
    : applicant.institution ? `${applicant.institution}${applicant.academicYear ? ` | Year ${applicant.academicYear}` : ''}` : '-'

  const educationLine2 = primaryEducation
    ? `${primaryEducation.degree || ''}${primaryEducation.fieldOfStudy ? `${primaryEducation.degree ? ' in ' : ''}${primaryEducation.fieldOfStudy}` : ''}${primaryEducation.gpa ? ` | GPA: ${primaryEducation.gpa}` : ''}`.trim()
    : applicant.fieldOfStudy || '-'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-5" onClick={onClose}>
      <div className="relative max-h-[92vh] w-full max-w-[940px] overflow-y-auto rounded-[18px] bg-white px-[32px] py-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button type="button" onClick={onClose}
          className="absolute right-[16px] top-[14px] text-[#4B5563] transition hover:text-[#111827]" aria-label="Close">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-[16px]">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt={displayName} className="h-[64px] w-[64px] rounded-full object-cover" />
            ) : (
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#3B82F6] text-[24px] font-semibold text-white">
                {applicant.initials}
              </div>
            )}
            <div className="pt-[6px]">
              <h2 className="text-[22px] font-bold leading-none text-black">{displayName}</h2>
              <p className="mt-[8px] text-[13px] text-[#97A0AF]">Phone: {displayPhone}</p>
              <p className="mt-[4px] text-[13px] text-[#97A0AF]">Email {displayEmail}</p>
              {isLoading && <p className="mt-[6px] text-[12px] text-[#6B7280]">Loading profile...</p>}
            </div>
          </div>
          {/* ✅ See Profile → ไปหน้า profile เต็ม ไม่มี section */}
          <button type="button" onClick={() => goToProfile()}
            className="mt-[10px] flex h-[36px] items-center justify-center rounded-[8px] border border-[#2563EB] bg-white px-[16px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]">
            See Profile
          </button>
        </div>

        {/* Body */}
        <div className="mt-[20px] border-t border-[#E5E7EB] pt-[18px]">
          <div>
            <h3 className="text-[14px] font-bold text-[#344164]">About Me</h3>
            <p className="mt-[6px] text-[13px] leading-[1.5] text-[#51617C]">{about}</p>
          </div>

          <div className="mt-[18px] grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Education</h3>
              <p className="mt-[6px] text-[13px] leading-[1.45] text-[#51617C]">{educationLine1}</p>
              <p className="mt-[2px] text-[13px] leading-[1.45] text-[#51617C]">{educationLine2 || '-'}</p>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Positions of Interest</h3>
              <div className="mt-[8px] flex flex-wrap gap-[6px]">
                {positions.length > 0
                  ? positions.map((p) => (
                    <span key={p} className="rounded-[6px] bg-[#E5E7EB] px-[12px] py-[4px] text-[12px] font-semibold text-[#374151]">{p}</span>
                  ))
                  : <p className="text-[13px] text-[#51617C]">-</p>}
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Internship Period</h3>
              <p className="mt-[6px] text-[13px] leading-[1.45] text-[#51617C]">{internshipPeriod}</p>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Preferred Locations</h3>
              <p className="mt-[6px] text-[13px] leading-[1.45] text-[#51617C]">{locations.length > 0 ? locations.join(', ') : '-'}</p>
            </div>
          </div>

          <div className="mt-[16px] flex justify-center gap-[48px]">
            <CircularProgress percentage={jobMatch} label="Job Match" />
            <CircularProgress percentage={profileCompletion} label="Profile Completion" />
          </div>

          {/* AI Job Match Section */}
          <div className="mt-[20px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-[20px] py-[16px]">
            <div className="mb-[14px] flex items-center gap-[6px]">
              <span className="text-[13px] font-bold text-[#2563EB]">AI</span>
              <h3 className="text-[13px] font-bold text-[#1F2937]">Job Match Section</h3>
              <span className="text-[14px] text-[#6B7280]">✦</span>
            </div>
            <div className="space-y-[10px] text-[12px]">
              <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                <span className="text-[#6B7280]">Position</span>
                <div className="flex items-center gap-[8px]">
                  <CheckIcon matched={MOCK_AI_JOB_MATCH.position.matched} />
                  <span className="text-[#374151]">{MOCK_AI_JOB_MATCH.position.label}</span>
                </div>
              </div>
              <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                <span className="text-[#6B7280]">Education</span>
                <div className="flex items-center justify-between gap-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <CheckIcon matched={MOCK_AI_JOB_MATCH.education.matched} />
                    <span className="text-[#374151]">{MOCK_AI_JOB_MATCH.education.label}</span>
                  </div>
                  {/* ✅ scroll ไป education */}
                  <button type="button" onClick={() => goToProfile('education')}
                    className="shrink-0 text-[11px] text-[#2563EB] hover:underline">
                    &gt;&gt; Go to Profile to see file
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-[90px_1fr] items-start gap-x-[12px]">
                <span className="pt-[2px] text-[#6B7280]">Skills</span>
                <div className="flex flex-col gap-[6px]">
                  {MOCK_AI_JOB_MATCH.skills.map((skill, i) => (
                    <div key={i} className="flex items-center justify-between gap-[8px]">
                      <div className="flex items-center gap-[8px]">
                        <CheckIcon matched={skill.matched} />
                        <span className="text-[#374151]">{skill.label}</span>
                      </div>
                      {/* ✅ scroll ไป skills (แสดงที่ skill สุดท้าย) */}
                      {i === MOCK_AI_JOB_MATCH.skills.length - 1 && (
                        <button type="button" onClick={() => goToProfile('skills')}
                          className="shrink-0 text-[11px] text-[#2563EB] hover:underline">
                          &gt;&gt; Go to Profile to see more Skill
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                <span className="text-[#6B7280]">Project</span>
                <div className="flex items-center justify-between gap-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <CheckIcon matched={MOCK_AI_JOB_MATCH.project.matched} />
                    <span className="text-[#374151]">{MOCK_AI_JOB_MATCH.project.label}</span>
                  </div>
                  {/* ✅ scroll ไป projects */}
                  <button type="button" onClick={() => goToProfile('projects')}
                    className="shrink-0 text-[11px] text-[#2563EB] hover:underline">
                    &gt;&gt; Go to Profile to see file
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="mt-[12px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-[20px] py-[16px]">
            <div className="mb-[10px] flex items-center gap-[6px]">
              <span className="text-[13px] font-bold text-[#2563EB]">AI</span>
              <h3 className="text-[13px] font-bold text-[#1F2937]">Insight</h3>
              <span className="text-[14px]">🔒</span>
            </div>
            <div className="space-y-[4px]">
              {MOCK_AI_INSIGHT.map((line, i) => (
                <p key={i} className="text-[12px] leading-[1.6] text-[#51617C]">{line}</p>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-[20px] flex items-center justify-between">
            <button type="button" onClick={onClose}
              className="flex h-[36px] items-center justify-center rounded-[8px] border border-[#D1D5DB] bg-white px-[20px] text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]">
              Back
            </button>
            <div className="flex items-center gap-[8px]">
              <button type="button" onClick={onDecline}
                className="flex h-[36px] items-center justify-center rounded-[8px] border border-[#EF4444] bg-white px-[20px] text-[13px] font-semibold text-[#EF4444] transition hover:bg-[#FEF2F2]">
                Decline
              </button>
              <button type="button" onClick={onAccept}
                className="flex h-[36px] items-center justify-center rounded-[8px] bg-[#2563EB] px-[20px] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]">
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function calculateProfileCompletion(profile: CandidateProfile | null): number {
  if (!profile) return 0
  const checks = [
    !!profile.profileImage, !!profile.bio?.trim(), !!profile.phoneNumber,
    !!profile.internshipPeriod, !!profile.education?.length, !!profile.skills?.length,
    !!profile.experience?.length, !!profile.projects?.length,
    !!profile.preferredPositions?.length, !!profile.preferredLocations?.length,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}