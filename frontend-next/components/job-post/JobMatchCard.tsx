'use client'

export interface JobMatchPost {
  id: string
  jobTitle: string
  companyName: string
  companyEmail: string
  companyLogo?: string | null
  workplaceType: string
  positions: string[]
  locationProvince?: string | null
  positionsAvailable?: number | null
  allowance?: number | null
  allowancePeriod?: string | null
  noAllowance?: boolean
  score?: number
  isBookmarked?: boolean
}

function formatAllowance(
  allowance: number | null | undefined,
  allowancePeriod: string | null | undefined,
  noAllowance?: boolean
): string {
  if (noAllowance) return 'No allowance'
  if (!allowance) return 'Not specified'
  const periodMap: Record<string, string> = { MONTH: 'Month', WEEK: 'Week', DAY: 'Day' }
  const period = allowancePeriod ? periodMap[allowancePeriod] || allowancePeriod : null
  if (period) return `${allowance.toLocaleString()} THB/${period}`
  return `${allowance.toLocaleString()} THB`
}

// ← ใช้สีเดียวกับ JobCard.tsx
const workTypeStyles: Record<string, string> = {
  HYBRID: '#3B82F6',
  Hybrid: '#3B82F6',
  ON_SITE: '#F4C14D',
  'On-Site': '#F4C14D',
  'On-site': '#F4C14D',
  REMOTE: '#EF4444',
  Remote: '#EF4444',
}

function workplaceLabel(type: string): string {
  if (type === 'ON_SITE') return 'On-Site'
  if (type === 'HYBRID') return 'Hybrid'
  if (type === 'REMOTE') return 'Remote'
  return type
}

interface JobMatchCardProps {
  post: JobMatchPost
  onBookmark?: (id: string, next: boolean) => void
  onDetail?: () => void
  onApply?: () => void
}

export default function JobMatchCard({ post, onBookmark, onDetail, onApply }: JobMatchCardProps) {
  const score = post.score ?? 80
  const circumference = 2 * Math.PI * 15
  const dashArray = `${(score / 100) * circumference} ${circumference}`
  const dashOffset = circumference * 0.25

  const renderLogo = () => {
    if (post.companyLogo && post.companyLogo.startsWith('http')) {
      return (
        <img
          src={post.companyLogo}
          alt={post.companyName}
          className="h-[31px] w-[31px] rounded-[4px] object-contain"
        />
      )
    }
    return (
      <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[4px] bg-[#23356E] text-[9px] font-bold text-white">
        {post.companyName.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-[274px] flex-col rounded-[12px] bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">

      {/* Header */}
      <div className="mb-[9px] flex items-start justify-between gap-2">
        <div className="flex items-start gap-[14px]">
          {/* ← โลโก้กลม เหมือน JobCard */}
          <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-[#F3F4F7]">
            {renderLogo()}
          </div>
          <div className="min-w-0 pt-[1px] max-w-[150px]">
            <h3 className="truncate text-[15px] font-bold leading-tight text-[#111827]" title={post.companyName}>
              {post.companyName}
            </h3>
            <p className="mt-[2px] text-[12px] text-[#8B94A7]">{post.companyEmail}</p>
          </div>
        </div>

        {/* Score ring + Bookmark */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <div className="relative h-[38px] w-[38px]">
            <svg width="38" height="38" viewBox="0 0 38 38">
              <circle cx="19" cy="19" r="15" fill="none" stroke="#E5E7EB" strokeWidth="4" />
              <circle
                cx="19" cy="19" r="15" fill="none"
                stroke="#F59E0B" strokeWidth="4"
                strokeDasharray={dashArray}
                strokeDashoffset={-dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-[#4B5563]">
              {score}%
            </div>
          </div>
          <button
            type="button"
            onClick={() => onBookmark?.(post.id, !post.isBookmarked)}
            className={`shrink-0 pt-[2px] transition-colors ${post.isBookmarked ? 'text-gray-800' : 'text-gray-300'} hover:text-gray-600`}
            aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg
              className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Job title */}
      <h2 className="mb-[4px] min-h-[34px] text-[16px] font-bold leading-snug text-[#111827]">
        {post.jobTitle}
      </h2>

      {/* Tags ← สีเดียวกับ JobCard */}
      <div className="mb-[16px] flex min-h-[30px] flex-wrap gap-[8px]">
        <span
          className="rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold text-white inline-flex items-center"
          style={{ backgroundColor: workTypeStyles[post.workplaceType] || '#94A3B8' }}
        >
          {workplaceLabel(post.workplaceType)}
        </span>
        {post.positions.slice(0, 3).map((pos) => (
          <span
            key={pos}
            className="rounded-[8px] bg-[#E5E7EB] px-[14px] py-[2px] text-[12px] font-semibold text-[#4B5563] inline-flex items-center"
          >
            {pos}
          </span>
        ))}
      </div>

      {/* Info grid ← style เดียวกับ JobCard */}
      <div className="grid grid-cols-[150px_1fr] gap-y-[8px]">
        <p className="text-[12px] text-[#8B94A7]">Preferred</p>
        <p className="text-[13px] text-[#6B7280]">{post.locationProvince || '-'}</p>

        <p className="text-[12px] text-[#8B94A7]">Number of applicants</p>
        <p className="text-[13px] text-[#6B7280]">{post.positionsAvailable ?? '-'}</p>

        <p className="text-[12px] text-[#8B94A7]">Allowance</p>
        <p className="text-[13px] font-semibold text-[#111827]">
          {formatAllowance(post.allowance, post.allowancePeriod, post.noAllowance)}
        </p>
      </div>

      {/* Footer buttons */}
      <div className="mt-auto flex gap-2 pt-[14px]">
        <button
          type="button"
          onClick={onDetail}
          className="flex h-[34px] flex-1 items-center justify-center rounded-[8px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
        >
          Detail
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex h-[34px] flex-1 items-center justify-center rounded-[8px] border border-[#2563EB] bg-white text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8]"
        >
          Apply
        </button>
      </div>
    </div>
  )
}