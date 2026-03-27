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
  onView?: () => void;
}

const workTypeStyles: Record<string, string> = {
  Hybrid: "#3B82F6",
  "On-Site": "#F4C14D",
  Remote: "#F85454",
};

export default function EmployerApplicantsOverviewCard({
  post,
  onView,
}: EmployerApplicantsOverviewCardProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-gray-100 bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:min-h-[274px] sm:px-[20px] sm:py-[18px]">
      {post.isNew && (
        <div
          style={{
            position: "absolute",
            top: 14,
            left: -30,
            width: 110,
            backgroundColor: "#E84040",
            color: "white",
            fontSize: "12px",
            fontWeight: 700,
            textAlign: "center",
            padding: "5px 0",
            transform: "rotate(-45deg)",
            transformOrigin: "center",
            letterSpacing: "0.5px",
            boxShadow: "0 2px 6px rgba(232,64,64,0.4)",
          }}
        >
          New
        </div>
      )}

      <div className="mb-1.5 flex items-start justify-between gap-2 sm:mb-[9px] sm:gap-4">
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-[14px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F7] dark:bg-gray-700 sm:h-[48px] sm:w-[48px]">
            {post.companyLogoImage ? (
              <img
                src={post.companyLogoImage}
                alt={post.companyName}
                className="h-10 w-10 rounded-full object-cover sm:h-[48px] sm:w-[48px]"
              />
            ) : (
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[4px] bg-[#23356E] text-[8px] font-bold text-white sm:h-[31px] sm:w-[31px] sm:text-[9px]">
                {post.companyLogo}
              </div>
            )}
          </div>

          <div className="min-w-0 pt-px">
            <h2
              className="truncate text-[14px] font-bold leading-tight text-[#111827] dark:text-white sm:text-[15px]"
              title={post.companyName}
            >
              {post.companyName}
            </h2>
            <p className="truncate text-[11px] text-[#8B94A7] dark:text-[#e5e7eb] sm:mt-[2px] sm:text-[12px]">
              {post.companyEmail}
            </p>
          </div>
        </div>

        <span className="shrink-0 whitespace-nowrap pt-0.5 text-[11px] text-[#C2C8D3] dark:text-[#e5e7eb] sm:pt-[2px] sm:text-[12px]">
          {post.postedDate}
        </span>
      </div>

      <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-[#111827] dark:text-white sm:mb-[7px] sm:min-h-[34px] sm:text-[16px]">
        {post.title}
      </h3>

      <div className="mb-2 flex min-h-0 flex-wrap gap-1.5 sm:mb-[10px] sm:min-h-[30px] sm:gap-2">
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold text-white sm:rounded-[8px] sm:px-[14px] sm:py-[2px] sm:text-[12px]"
          style={{
            backgroundColor: workTypeStyles[post.workType] || "#94A3B8",
          }}
        >
          {post.workType}
        </span>
        {post.positions.slice(0, 3).map((pos) => (
          <span
            key={pos}
            className={`inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-[11px] font-semibold sm:rounded-[8px] sm:px-[14px] sm:py-[2px] sm:text-[12px] ${
              pos === post.positions[0]
                ? "bg-[#E5E7EB] text-[#4B5563] dark:bg-[#fef3c7] dark:text-[#b45309]"
                : "bg-[#E5E7EB] text-[#4B5563] dark:bg-gray-700 dark:text-slate-200"
            }`}
          >
            {pos}
          </span>
        ))}
        {post.positions.length > 3 && (
          <span
            className="group relative cursor-default rounded-md bg-[#E5E7EB] px-2 py-0.5 text-[11px] font-semibold text-[#4B5563] dark:bg-gray-700 dark:text-slate-200 sm:rounded-[8px] sm:px-[14px] sm:py-[5px] sm:text-[12px]"
            title={post.positions.slice(3).join(", ")}
          >
            ...
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[#1F2937] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {post.positions.slice(3).join(", ")}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-x-3 sm:gap-y-2">
        <p className="text-[11px] text-[#8B94A7] dark:text-[#7f7f7f] sm:text-[12px]">
          Preferred
        </p>
        <p className="min-w-0 text-[12px] leading-snug text-[#6B7280] dark:text-[#e5e7eb] sm:text-[13px]">
          {post.preferred}
        </p>
        <p className="text-[11px] text-[#8B94A7] dark:text-[#7f7f7f] sm:text-[12px]">
          Position available
        </p>
        <p className="text-[12px] text-[#6B7280] dark:text-[#e5e7eb] sm:text-[13px]">
          {post.applicantsCount}
        </p>
        <p className="text-[11px] text-[#8B94A7] dark:text-[#7f7f7f] sm:text-[12px]">
          Allowance
        </p>
        <p className="text-[12px] font-semibold leading-snug text-[#111827] dark:text-white sm:text-[13px]">
          {post.allowance}
        </p>
      </div>

      <div className="mt-3 flex flex-nowrap items-center justify-end gap-1.5 pt-1 sm:mt-auto sm:gap-2 sm:pt-[12px]">
        <Link
          href={`/employer/job-post/view/${post.id}`}
          className="flex h-9 min-w-0 shrink items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-3 text-[12px] font-semibold text-[#0273B1] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-[#7dd3fc] dark:hover:bg-gray-700 sm:h-[34px] sm:rounded-[8px] sm:px-[18px] sm:text-[13px]"
        >
          View<span className="hidden sm:inline"> Post</span>
        </Link>
        <Link
          href={`/employer/job-post/applicants/${post.id}`}
          onClick={() => onView?.()}
          className="flex h-9 min-w-0 shrink items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-3 text-[12px] font-semibold text-[#0273B1] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-[#7dd3fc] dark:hover:bg-gray-700 sm:h-[34px] sm:rounded-[8px] sm:px-[18px] sm:text-[13px]"
        >
          <span className="sm:hidden">Candidates</span>
          <span className="hidden sm:inline">View Candidates</span>
        </Link>
      </div>
    </div>
  );
}
