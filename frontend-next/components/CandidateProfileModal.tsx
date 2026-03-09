'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface CandidateProfileModalProps {
  candidate: {
    id?: string
    name: string
    role: string
    university: string
    major: string
    graduationDate: string
    skills: string[]
    initials: string
    email?: string
    about?: string
  }
  onClose: () => void
}

export default function CandidateProfileModal({ candidate, onClose }: CandidateProfileModalProps) {
  const router = useRouter()
  const [isStartingConversation, setIsStartingConversation] = useState(false)

  const handleViewFullProfile = () => {
    router.push(`/employer/candidate/${encodeURIComponent(candidate.name)}`)
  }

  const handleStartConversation = async () => {
    if (!candidate.id) {
      alert('Candidate ID is required to start a conversation')
      return
    }

    setIsStartingConversation(true)
    try {
      const data = await apiFetch<{ conversation: any }>('/api/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: candidate.id,
        }),
      })
      router.push(`/employer/messages?conversationId=${encodeURIComponent(data.conversation.id)}`)
      onClose()
    } catch (error: any) {
      console.error('Error starting conversation:', error)

      if (error.message?.includes('already exists') || error.details?.includes('already exists')) {
        router.push('/employer/messages')
        onClose()
        return
      }

      const errorMessage = error.details || error.message || 'Unknown error'
      alert(`Failed to start conversation: ${errorMessage}`)
    } finally {
      setIsStartingConversation(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-[940px] rounded-[14px] bg-white px-10 pb-8 pt-7 shadow-[0_20px_60px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-[#6B7280] transition-colors hover:text-[#111827]"
          aria-label="Close candidate profile"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-[28px] font-semibold text-white">
              {candidate.initials}
            </div>
            <div className="pt-2">
              <h2 className="text-[18px] font-bold leading-none text-[#111827]">{candidate.name}</h2>
              <p className="mt-[10px] text-[12px] text-[#9CA3AF]">Phone: 089-123-4567</p>
              <p className="mt-[6px] text-[12px] text-[#9CA3AF]">
                Email {candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@example.com`}
              </p>
            </div>
          </div>

          <button
            onClick={handleViewFullProfile}
            className="mt-[18px] flex h-[28px] items-center justify-center rounded-[6px] border border-[#2563EB] bg-white px-[16px] text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8]"
          >
            See Profile
          </button>
        </div>

        <div className="mt-6 border-t border-[#E5E7EB] pt-6">
          <div>
            <h3 className="text-[14px] font-bold text-[#344164]">About Me</h3>
            <p className="mt-[8px] max-w-[820px] text-[12px] leading-[1.55] text-[#51617C]">
              {candidate.about || 'Passionate software engineering intern with a focus on full-stack development and data analysis. Eager to learn modern web technologies and contribute to impactful projects. Strong foundation in Python, JavaScript, and SQL with experience building RESTful APIs and interactive dashboards.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Education</h3>
              <p className="mt-[8px] text-[12px] leading-[1.45] text-[#51617C]">
                {candidate.university} | {candidate.graduationDate === 'Present' ? 'Currently studying' : candidate.graduationDate || 'Year 4'}
              </p>
              <p className="mt-[2px] text-[12px] leading-[1.45] text-[#51617C]">
                {candidate.major || 'Bachelor of Engineering'} | GPA: 3.50
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Positions of Interest</h3>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {candidate.skills.slice(0, 3).map((skill, index) => (
                  <span key={`${skill}-${index}`} className="rounded-[6px] bg-[#E5E7EB] px-[14px] py-[5px] text-[12px] font-semibold text-[#374151]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Internship Period</h3>
              <p className="mt-[8px] text-[12px] leading-[1.45] text-[#51617C]">5 January 2026 - 24 April 2026 (4 Month)</p>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-[#344164]">Preferred Locations</h3>
              <p className="mt-[8px] text-[12px] leading-[1.45] text-[#51617C]">{candidate.location || 'Bangkok, Chiangmai'}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-[8px]">
            <button
              onClick={onClose}
              className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#E5E7EB] px-[22px] text-[12px] font-semibold text-[#6B7280] transition hover:bg-[#D1D5DB]"
            >
              Back
            </button>
            <button
              onClick={handleStartConversation}
              disabled={isStartingConversation || !candidate.id}
              className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#2563EB] px-[20px] text-[12px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStartingConversation ? 'Loading...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

