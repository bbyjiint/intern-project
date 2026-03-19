import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface CandidateCardProps {
  id?: string
  name: string
  role: string
  university: string
  major: string | null
  graduationDate: string | null
  email?: string
  location?: string | null
  skills: string[]
  preferredPositions?: string[]
  internshipPeriod?: string | null
  yearOfStudy?: string | null
  createdAt?: string | null
  profileImage?: string | null
  initials: string
  variant?: string
  isBookmarked?: boolean
  onBookmark?: (e: React.MouseEvent) => void
  onClick?: () => void
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  return 'Just now'
}

export default function CandidateCard({
  id,
  name,
  role,
  university,
  major,
  graduationDate,
  email,
  location,
  skills,
  preferredPositions = [],
  internshipPeriod,
  yearOfStudy,
  createdAt,
  profileImage,
  initials,
  isBookmarked = false,
  onBookmark,
  onClick,
}: CandidateCardProps) {
  const router = useRouter()
  const [isMessaging, setIsMessaging] = useState(false)

  const handleMessage = async (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!id || isMessaging) return

    setIsMessaging(true)
    try {
      const data = await apiFetch<{ conversation: { id: string } }>('/api/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ candidateId: id }),
      })
      router.push(`/employer/messages?conversationId=${encodeURIComponent(data.conversation.id)}`)
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.details?.includes('already exists')) {
        router.push('/employer/messages')
      } else {
        console.error('Failed to start conversation:', error)
      }
    } finally {
      setIsMessaging(false)
    }
  }

  const tags = preferredPositions.length > 0 ? preferredPositions : skills

  return (
    <div
      className="relative flex h-full min-h-[274px] flex-col rounded-[12px] border border-gray-100 bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
      onClick={onClick}
    >
      <button
        onClick={(event) => {
          event.stopPropagation()
          onBookmark?.(event)
        }}
        className="absolute right-5 top-5 z-10 text-gray-300 transition-colors hover:text-blue-600 dark:text-[#7f7f7f] dark:hover:text-[#2563eb]"
        type="button"
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark candidate'}
      >
        <svg
          className={`h-5 w-5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2563eb] text-[24px] font-semibold text-white">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 pt-[2px]">
          <h3 className="truncate text-[18px] font-bold leading-tight text-[#111827] dark:text-white">{name}</h3>
          <p className="mt-[4px] truncate text-[12px] text-[#8B94A7] dark:text-[#e5e7eb]">
            {email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`}
          </p>
        </div>
      </div>

      <div className="mt-[18px] grid grid-cols-[132px_1fr] gap-y-[10px] text-[12px]">
        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Intern Period</p>
        <p className="font-semibold text-[#111827] dark:text-[#e5e7eb]">{internshipPeriod || '-'}</p>

        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Institution</p>
        <p className="font-semibold text-[#111827] dark:text-[#e5e7eb]">{university || '-'}</p>

        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Academic Year</p>
        <p className="font-semibold text-[#111827] dark:text-[#e5e7eb]">{yearOfStudy || '-'}</p>

        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Field of Study</p>
        <p className="font-semibold text-[#111827] dark:text-[#e5e7eb]">{major || '-'}</p>

        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Preferred</p>
        <p className="font-semibold text-[#111827] dark:text-[#e5e7eb]">{location || '-'}</p>
      </div>

      <div className="mt-[18px] flex min-h-[30px] flex-wrap gap-[8px]">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold ${
              index === 0
                ? 'bg-[#E5E7EB] text-[#4B5563] dark:bg-[#fef3c7] dark:text-[#b45309]'
                : 'bg-[#E5E7EB] text-[#4B5563] dark:bg-gray-700 dark:text-slate-200'
            }`}
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="inline-flex items-center rounded-[8px] bg-[#E5E7EB] px-[14px] py-[2px] text-[12px] font-semibold text-[#4B5563] dark:bg-gray-700 dark:text-slate-200">
            +{tags.length - 3} more
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-[12px]">
        <p className="text-[12px] text-[#C2C8D3] dark:text-[#e5e7eb]">{timeAgo(createdAt)}</p>

        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={handleMessage}
            disabled={!id || isMessaging}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            {isMessaging ? 'Loading...' : 'Message'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onClick?.()
            }}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  )
}