'use client'

export interface EmployerJobPostCardData {
  id: string
  title: string
  companyName: string
  companyLogo: string
  companyLogoImage?: string
  companyEmail: string
  location: string
  workType: string
  secondaryTag: string
  applicantsCount: number
  allowance: string
  postedDate: string
  isOpen: boolean
}

interface EmployerJobPostCardProps {
  post: EmployerJobPostCardData
  onToggleStatus: () => void
  onDelete: () => void
  onEdit: () => void
  isTogglePending?: boolean
}

const workTypeStyles: Record<string, string> = {
  'On-Site': '#F4C14D',
  Hybrid: '#3B82F6',
  Remote: '#F4C14D',
}

export default function EmployerJobPostCard({
  post,
  onToggleStatus,
  onDelete,
  onEdit,
  isTogglePending = false,
}: EmployerJobPostCardProps) {
  return (
    <div className="flex h-full min-h-[274px] flex-col rounded-[12px] bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <div className="mb-[9px] flex items-start justify-between gap-4">
        <div className="flex items-start gap-[14px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-[#F3F4F7]">
            {post.companyLogoImage ? (
              <img
                src={post.companyLogoImage}
                alt={post.companyName}
                className="h-[31px] w-[31px] rounded-[4px] object-contain"
              />
            ) : (
              <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[4px] bg-[#23356E] text-[9px] font-bold text-white">
                {post.companyLogo}
              </div>
            )}
          </div>

          <div className="min-w-0 pt-[1px]">
            <h2 className="truncate text-[15px] font-bold leading-tight text-[#111827]">
              {post.companyName}
            </h2>
            <p className="mt-[2px] text-[12px] text-[#8B94A7]">{post.companyEmail}</p>
          </div>
        </div>

        <span className="shrink-0 pt-[2px] text-[12px] text-[#C2C8D3]">{post.postedDate}</span>
      </div>

      <h3 className="mb-[7px] min-h-[34px] text-[16px] font-bold leading-snug text-[#111827]">
        {post.title}
      </h3>

      <div className="mb-[10px] flex min-h-[30px] flex-wrap gap-[8px]">
        <span
          className="rounded-[8px] px-[14px] py-[5px] text-[12px] font-semibold text-white"
          style={{ backgroundColor: workTypeStyles[post.workType] || '#94A3B8' }}
        >
          {post.workType}
        </span>
        <span className="rounded-[8px] bg-[#E5E7EB] px-[14px] py-[5px] text-[12px] font-semibold text-[#4B5563]">
          {post.secondaryTag}
        </span>
      </div>

      <div className="grid grid-cols-[150px_1fr] gap-y-[8px]">
        <p className="text-[12px] text-[#8B94A7]">Preferred</p>
        <p className="text-[13px] text-[#6B7280]">{post.location}</p>
        <p className="text-[12px] text-[#8B94A7]">Number of applicants</p>
        <p className="text-[13px] text-[#6B7280]">{post.applicantsCount}</p>
        <p className="text-[12px] text-[#8B94A7]">Allowance</p>
        <p className="text-[13px] font-semibold text-[#111827]">{post.allowance}</p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-[12px]">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={post.isOpen}
            onChange={onToggleStatus}
            disabled={isTogglePending}
            className="peer sr-only"
            aria-label={post.isOpen ? 'Open post' : 'Closed post'}
          />
          <div className="h-[24px] w-[44px] rounded-full bg-[#D1D5DB] transition-colors duration-200 peer-checked:bg-[#2563EB] peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
          <div className="absolute left-[2px] top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.18)] transition-transform duration-200 peer-checked:translate-x-5" />
        </label>

        <div className="flex items-center gap-4">
          <button
            className="text-[#374151] transition hover:text-red-600"
            onClick={onDelete}
            aria-label="Delete job post"
          >
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-7 4v6m4-6v6m4-6v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#2563EB] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8]"
          >
            Edit Post
          </button>
        </div>
      </div>
    </div>
  )
}
