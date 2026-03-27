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
      className="relative flex h-full min-h-0 flex-col rounded-[12px] border border-gray-100 bg-white px-2.5 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:px-5 sm:py-[18px] md:px-[20px]"
      onClick={onClick}
    >
      <button
        onClick={(event) => {
          event.stopPropagation()
          onBookmark?.(event)
        }}
        className="absolute right-2 top-2 z-10 text-gray-300 transition-colors hover:text-blue-600 dark:text-[#7f7f7f] dark:hover:text-[#2563eb] sm:right-5 sm:top-5"
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

      <div className="flex items-start gap-2.5 pr-7 sm:gap-4 sm:pr-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2563eb] text-[15px] font-semibold leading-none text-white sm:h-[54px] sm:w-[54px] sm:text-[24px]">
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
        <div className="min-w-0 flex-1 pt-px">
          <h3 className="break-words text-[15px] font-bold leading-tight text-[#111827] dark:text-white sm:text-[18px]">
            {name}
          </h3>
          <p className="mt-0.5 break-all text-[10px] leading-tight text-[#8B94A7] dark:text-[#e5e7eb] sm:break-normal sm:text-[12px]">
            {email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`}
          </p>
        </div>
      </div>

      <div className="mt-2.5 space-y-1.5 text-[10px] leading-tight sm:mt-[18px] sm:grid sm:grid-cols-[minmax(88px,auto)_minmax(0,1fr)] sm:gap-x-2 sm:gap-y-[10px] sm:space-y-0 sm:text-[12px] sm:leading-normal">
        <div className="flex flex-col gap-px sm:contents">
          <p className="shrink-0 text-[#7C869A] dark:text-[#7f7f7f]">Intern Period</p>
          <p className="line-clamp-2 break-words font-semibold text-[#111827] dark:text-[#e5e7eb] sm:line-clamp-none">{internshipPeriod || '-'}</p>
        </div>
        <div className="flex flex-col gap-px sm:contents">
          <p className="shrink-0 text-[#7C869A] dark:text-[#7f7f7f]">Institution</p>
          <p
            className="line-clamp-2 break-words font-semibold text-[#111827] dark:text-[#e5e7eb] sm:line-clamp-none"
            title={university || undefined}
          >
            {university || '-'}
          </p>
        </div>
        <div className="flex flex-col gap-px sm:contents">
          <p className="shrink-0 text-[#7C869A] dark:text-[#7f7f7f]">Academic Year</p>
          <p className="break-words font-semibold text-[#111827] dark:text-[#e5e7eb]">{yearOfStudy || '-'}</p>
        </div>
        <div className="flex flex-col gap-px sm:contents">
          <p className="shrink-0 text-[#7C869A] dark:text-[#7f7f7f]">Field of Study</p>
          <p className="line-clamp-2 break-words font-semibold text-[#111827] dark:text-[#e5e7eb] sm:line-clamp-none">{major || '-'}</p>
        </div>
        <div className="flex flex-col gap-px sm:contents">
          <p className="shrink-0 text-[#7C869A] dark:text-[#7f7f7f]">Preferred location</p>
          <p className="break-words font-semibold text-[#111827] dark:text-[#e5e7eb]">{location || '-'}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1 sm:mt-[18px] sm:gap-2">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex max-w-full min-w-0 items-center truncate rounded bg-[#E5E7EB] px-1.5 py-px text-[10px] font-semibold text-[#4B5563] dark:bg-gray-700 dark:text-slate-200 sm:rounded-[8px] sm:px-[14px] sm:py-[2px] sm:text-[12px]"
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="inline-flex items-center rounded bg-[#E5E7EB] px-1.5 py-px text-[10px] font-semibold text-[#4B5563] dark:bg-gray-700 dark:text-slate-200 sm:rounded-[8px] sm:px-[14px] sm:py-[2px] sm:text-[12px]">
            +{tags.length - 3} more
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-2 sm:pt-[12px]">
        <p className="min-w-0 flex-1 truncate text-[10px] leading-tight text-[#C2C8D3] dark:text-[#e5e7eb] sm:text-[12px]">
          {timeAgo(createdAt)}
        </p>

        <div className="flex min-w-0 shrink-0 gap-1.5 sm:gap-[6px]">
          <button
            type="button"
            onClick={handleMessage}
            disabled={!id || isMessaging}
            className="flex h-8 min-w-0 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-2.5 text-[11px] font-semibold leading-none text-[#2563EB] transition hover:bg-[#F0F4F8] disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700 sm:h-[34px] sm:rounded-[8px] sm:px-[18px] sm:text-[13px]"
          >
            {isMessaging ? 'Loading...' : 'Message'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onClick?.()
            }}
            className="flex h-8 min-w-0 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-2.5 text-[11px] font-semibold leading-none text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700 sm:h-[34px] sm:rounded-[8px] sm:px-[18px] sm:text-[13px]"
          >
            <span className="sm:hidden">Profile</span>
            <span className="hidden sm:inline">View Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}