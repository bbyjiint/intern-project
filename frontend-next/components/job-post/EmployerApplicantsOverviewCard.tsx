"use client";

import Link from "next/link";

export interface EmployerApplicantsOverviewCardData {
  id: string;
  title: string;
  companyName: string;
  companyEmail: string;
  companyLogo: string;
  companyLogoImage?: string;
  workType: string;
  positions: string[];
  preferred: string;
  applicantsCount: number;
  allowance: string;
  postedDate: string;
  isNew?: boolean;
}

interface EmployerApplicantsOverviewCardProps {
  post: EmployerApplicantsOverviewCardData;
  onView?: () => void; // ✅ เพิ่ม prop
}

const workTypeStyles: Record<string, string> = {
  Hybrid: "#3B82F6",
  "On-Site": "#F4C14D",
  Remote: "#F85454",
};

export default function EmployerApplicantsOverviewCard({
  post,
  onView, // ✅ รับ prop
}: EmployerApplicantsOverviewCardProps) {
  return (
    <div className="relative flex h-full min-h-[274px] flex-col rounded-[12px] border border-gray-100 bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      {post.isNew && (
        <div className="absolute right-[14px] top-[-11px] rounded-[6px] bg-[#FF5A5F] px-[10px] py-[3px] text-[11px] font-semibold text-white shadow-sm">
          1 New
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#FF5A5F]" />
        </div>
      )}

      <div className="mb-[9px] flex items-start justify-between gap-4">
        <div className="flex items-start gap-[14px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-[#F3F4F7] dark:bg-gray-700">
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
            <h3 className="truncate text-[15px] font-bold leading-tight text-[#111827] dark:text-white" title={post.companyName}>
              {post.companyName}
            </h3>
            <p className="mt-[2px] text-[12px] text-[#8B94A7] dark:text-[#e5e7eb]">
              {post.companyEmail}
            </p>
          </div>
        </div>
      </div>

      <h2 className="mb-[7px] min-h-[34px] text-[16px] font-bold leading-snug text-[#111827] dark:text-white">
        {post.title}
      </h2>

      <div className="mb-[10px] flex min-h-[30px] flex-wrap gap-[8px]">
        <span
          className="rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold text-white inline-flex items-center"
          style={{
            backgroundColor: workTypeStyles[post.workType] || "#94A3B8",
          }}
        >
          {post.workType}
        </span>
        {post.positions.slice(0, 3).map((pos) => (
          <span
            key={pos}
            className={`inline-flex items-center rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold ${
              pos === post.positions[0]
                ? 'bg-[#E5E7EB] text-[#4B5563] dark:bg-[#fef3c7] dark:text-[#b45309]'
                : 'bg-[#E5E7EB] text-[#4B5563] dark:bg-gray-700 dark:text-slate-200'
            }`}
          >
            {pos}
          </span>
        ))}
        {post.positions.length > 3 && (
          <span
            className="group relative cursor-default rounded-[8px] bg-[#E5E7EB] px-[14px] py-[5px] text-[12px] font-semibold text-[#4B5563] dark:bg-gray-700 dark:text-slate-200"
            title={post.positions.slice(3).join(", ")}
          >
            ...
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[#1F2937] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {post.positions.slice(3).join(", ")}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-[150px_1fr] gap-y-[8px]">
        <p className="text-[12px] text-[#8B94A7] dark:text-[#7f7f7f]">Preferred</p>
        <p className="text-[13px] text-[#6B7280] dark:text-[#e5e7eb]">{post.preferred}</p>
        <p className="text-[12px] text-[#8B94A7] dark:text-[#7f7f7f]">Position available</p>
        <p className="text-[13px] text-[#6B7280] dark:text-[#e5e7eb]">{post.applicantsCount}</p>
        <p className="text-[12px] text-[#8B94A7] dark:text-[#7f7f7f]">Allowance</p>
        <p className="text-[13px] font-semibold text-[#111827] dark:text-white">
          {post.allowance}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-[12px]">
        <span className="text-[12px] text-[#C2C8D3] dark:text-[#e5e7eb]">{post.postedDate}</span>

        <div className="flex items-center gap-[6px]">
          <Link
            href={`/employer/job-post/view/${post.id}`}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            View Post
          </Link>
          {/* ✅ กด View Candidates → เรียก onView() ก่อน navigate */}
          <Link
            href={`/employer/job-post/applicants/${post.id}`}
            onClick={() => onView?.()}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            View Candidates
          </Link>
        </div>
      </div>
    </div>
  );
}