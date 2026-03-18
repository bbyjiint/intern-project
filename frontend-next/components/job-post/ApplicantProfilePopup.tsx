'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
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
  skills?: Array<{ name: string; level?: string; rating?: number; status?: string }>
  gender?: string | null
  dateOfBirth?: string | null
  nationality?: string | null
}

// ─── AI Analysis Types ────────────────────────────────────────────────────────

interface AIMatchItem {
  matched: boolean
  label: string
}

interface AIAnalysis {
  position: AIMatchItem
  education: AIMatchItem
  skills: AIMatchItem[]
  project: AIMatchItem
  insight: string[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Skeleton loader for AI section ──────────────────────────────────────────

function AIAnalysisSkeleton() {
  return (
    <div className="space-y-[10px]">
      {[90, 110, 80, 100].map((w, i) => (
        <div key={i} className="flex items-center gap-[12px]">
          <div className="h-[18px] w-[18px] rounded-full bg-[#E5E7EB] animate-pulse shrink-0" />
          <div className={`h-[12px] rounded bg-[#E5E7EB] animate-pulse`} style={{ width: `${w}px` }} />
        </div>
      ))}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ApplicantProfilePopupProps {
  applicant: Applicant
  profile: CandidateProfile | null
  jobMatch: number
  profileCompletion: number
  isLoading: boolean
  jobPostId?: string
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApplicantProfilePopup({
  applicant, profile, jobMatch, profileCompletion, isLoading,
  jobPostId, onClose, onAccept, onDecline,
}: ApplicantProfilePopupProps) {
  const router = useRouter()
  const candidateId = profile?.id || applicant.candidateId

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(false)

  // ✅ เรียก AI analysis เมื่อ profile โหลดเสร็จและมี jobPostId
  useEffect(() => {
    if (!profile?.id || !jobPostId || aiAnalysis) return

    const fetchAnalysis = async () => {
      setAiLoading(true)
      setAiError(false)
      try {
        const data = await apiFetch<{ analysis: AIAnalysis }>(
          `/api/candidates/applicant-job-analysis?jobPostId=${jobPostId}&candidateId=${profile.id}`
        )
        setAiAnalysis(data.analysis)
      } catch (e) {
        console.error('Failed to fetch AI analysis:', e)
        setAiError(true)
      } finally {
        setAiLoading(false)
      }
    }

    fetchAnalysis()
  }, [profile?.id, jobPostId])

  // reset เมื่อเปิด popup ใหม่
  useEffect(() => {
    setAiAnalysis(null)
    setAiError(false)
  }, [applicant.candidateId])

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
      <div
        className="relative max-h-[92vh] w-full max-w-[940px] overflow-y-auto rounded-[18px] bg-white px-[32px] py-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
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

          {/* Circular progress */}
          <div className="mt-[16px] flex justify-center gap-[48px]">
            <CircularProgress percentage={jobMatch} label="Job Match" />
            <CircularProgress percentage={profileCompletion} label="Profile Completion" />
          </div>

          {/* ✅ AI Job Match Section — Real Data */}
          <div className="mt-[20px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-[20px] py-[16px]">
            <div className="mb-[14px] flex items-center gap-[6px]">
              <span className="text-[13px] font-bold text-[#2563EB]">AI</span>
              <h3 className="text-[13px] font-bold text-[#1F2937]">Job Match Section</h3>
              <span className="text-[14px] text-[#6B7280]">✦</span>
            </div>

            {/* Loading state */}
            {(aiLoading || (isLoading && !aiAnalysis)) && <AIAnalysisSkeleton />}

            {/* Error state */}
            {aiError && !aiLoading && (
              <p className="text-[12px] text-[#EF4444]">Could not load AI analysis. Please try again.</p>
            )}

            {/* ✅ Real AI data */}
            {aiAnalysis && !aiLoading && (
              <div className="space-y-[10px] text-[12px]">
                {/* Position */}
                <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                  <span className="text-[#6B7280]">Position</span>
                  <div className="flex items-center gap-[8px]">
                    <CheckIcon matched={aiAnalysis.position.matched} />
                    <span className="text-[#374151]">{aiAnalysis.position.label}</span>
                  </div>
                </div>

                {/* Education */}
                <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                  <span className="text-[#6B7280]">Education</span>
                  <div className="flex items-center justify-between gap-[8px]">
                    <div className="flex items-center gap-[8px]">
                      <CheckIcon matched={aiAnalysis.education.matched} />
                      <span className="text-[#374151]">{aiAnalysis.education.label}</span>
                    </div>
                    <button type="button" onClick={() => goToProfile('education')}
                      className="shrink-0 text-[11px] text-[#2563EB] hover:underline">
                      &gt;&gt; Go to Profile to see file
                    </button>
                  </div>
                </div>

                {/* Skills */}
                <div className="grid grid-cols-[90px_1fr] items-start gap-x-[12px]">
                  <span className="pt-[2px] text-[#6B7280]">Skills</span>
                  <div className="flex flex-col gap-[6px]">
                    {aiAnalysis.skills.map((skill, i) => (
                      <div key={i} className="flex items-center justify-between gap-[8px]">
                        <div className="flex items-center gap-[8px]">
                          <CheckIcon matched={skill.matched} />
                          <span className="text-[#374151]">{skill.label}</span>
                        </div>
                        {i === aiAnalysis.skills.length - 1 && (
                          <button type="button" onClick={() => goToProfile('skills')}
                            className="shrink-0 text-[11px] text-[#2563EB] hover:underline">
                            &gt;&gt; Go to Profile to see more Skill
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project */}
                <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                  <span className="text-[#6B7280]">Project</span>
                  <div className="flex items-center justify-between gap-[8px]">
                    <div className="flex items-center gap-[8px]">
                      <CheckIcon matched={aiAnalysis.project.matched} />
                      <span className="text-[#374151]">{aiAnalysis.project.label}</span>
                    </div>
                    <button type="button" onClick={() => goToProfile('projects')}
                      className="shrink-0 text-[11px] text-[#2563EB] hover:underline">
                      &gt;&gt; Go to Profile to see file
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* No jobPostId fallback */}
            {!jobPostId && !aiLoading && (
              <p className="text-[12px] text-[#9CA3AF]">Job post information not available for analysis.</p>
            )}
          </div>

          {/* ✅ AI Insight — Real Data */}
          <div className="mt-[12px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-[20px] py-[16px]">
            <div className="mb-[10px] flex items-center gap-[6px]">
              <span className="text-[13px] font-bold text-[#2563EB]">AI</span>
              <h3 className="text-[13px] font-bold text-[#1F2937]">Insight</h3>
              <span className="text-[14px]">🔒</span>
            </div>

            {/* Loading */}
            {(aiLoading || (isLoading && !aiAnalysis)) && (
              <div className="space-y-[6px]">
                {[200, 160, 180].map((w, i) => (
                  <div key={i} className="h-[12px] rounded bg-[#E5E7EB] animate-pulse" style={{ width: `${w}px` }} />
                ))}
              </div>
            )}

            {/* Real insight */}
            {aiAnalysis && !aiLoading && (
              <div className="space-y-[4px]">
                {aiAnalysis.insight.map((line, i) => (
                  <p key={i} className="text-[12px] leading-[1.6] text-[#51617C]">{line}</p>
                ))}
              </div>
            )}

            {/* Error */}
            {aiError && !aiLoading && (
              <p className="text-[12px] text-[#9CA3AF]">Insight not available.</p>
            )}
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
    !!profile.profileImage,
    !!profile.fullName?.split(' ')[0]?.trim(),
    !!profile.fullName?.split(' ').slice(1).join(' ')?.trim(),
    !!profile.gender,
    !!profile.dateOfBirth,
    !!profile.nationality,
    !!profile.bio?.trim(),
    !!profile.email,
    !!profile.phoneNumber,
    !!(profile.preferredPositions?.length),
    !!(profile.preferredLocations?.length),
    !!profile.internshipPeriod,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}