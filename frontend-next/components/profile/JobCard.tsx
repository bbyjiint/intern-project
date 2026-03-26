"use client";

import React from "react";

export interface JobPostData {
  id: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string | null;
  location: string;
  workType: string;
  roleType: string;
  positions?: string[];
  applicants: number;
  allowance: string;
  timeAgo?: string;
  status?: "Applied" | "Accept" | "Decline" | null;
  isBookmarked?: boolean;
  matchPercentage?: number;
}

interface JobCardProps {
  job: JobPostData;
  onBookmarkClick?: (id: string) => void;
  onMenuClick?: (id: string) => void;
  onClick?: (id: string) => void;
  showActions?: boolean;
}

const workTypeStyles: Record<string, string> = {
  Hybrid: "#3B82F6",
  "On-Site": "#F59E0B",
  "On-site": "#F59E0B",
  Remote: "#EF4444",
};

export default function JobCard({
  job,
  onBookmarkClick,
  onMenuClick,
  onClick,
  showActions = false,
}: JobCardProps) {
  const renderCompanyLogo = () => {
    if (job.companyLogo && job.companyLogo.startsWith("http")) {
      return (
        <img
          src={job.companyLogo}
          alt={job.companyName}
          className="h-[48px] w-[48px] rounded-full object-cover"
        />
      );
    }
    return (
      <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[4px] bg-[#23356E] dark:bg-sky-900 text-[10px] font-bold text-white">
        {job.companyName.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div
      className={`group relative flex h-full min-h-[274px] flex-col rounded-[12px] bg-white dark:bg-slate-800 px-[20px] py-[18px] shadow-sm border border-slate-100 dark:border-slate-700 transition-shadow duration-200 hover:shadow-[0_0px_15px_rgba(0,0,0,0.10)] ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={() => onClick && onClick(job.id)}
    >
      {/* Top Row */}
      <div className="mb-[12px] flex items-start justify-between gap-2">
        <div className="flex items-start gap-[14px]">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
            {renderCompanyLogo()}
          </div>
          <div className="min-w-0 pt-[2px]">
            <h3
              className="truncate text-[15px] font-bold leading-tight text-slate-900 dark:text-slate-50"
              title={job.companyName}
            >
              {job.companyName}
            </h3>
            <p className="mt-[2px] truncate text-[12px] text-slate-500 dark:text-slate-400">
              {job.companyEmail}
            </p>
          </div>
        </div>

        {/* Status Badge + Bookmark */}
        <div className="flex items-center gap-2 shrink-0">
          {job.status && (
            <span
              className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                job.status === "Accept"
                  ? "border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                  : job.status === "Decline"
                    ? "border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
                    : "border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10"
              }`}
            >
              {job.status}
            </span>
          )}
          {onBookmarkClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkClick(job.id);
              }}
              className={`shrink-0 p-1 rounded-full transition-colors ${
                job.isBookmarked
                  ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30"
                  : "text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500"
              }`}
            >
              <svg
                className={`w-5 h-5 ${job.isBookmarked ? "fill-current" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Job Title */}
      <h2 className="mb-[10px] text-[17px] font-bold leading-snug text-slate-900 dark:text-white">
        {job.jobTitle}
      </h2>

      {/* Tags */}
      <div className="mb-[18px] flex flex-wrap gap-[6px]">
        <span
          className="rounded-[6px] px-[12px] py-[3px] text-[11px] font-bold text-white shadow-sm"
          style={{ backgroundColor: workTypeStyles[job.workType] || "#94A3B8" }}
        >
          {job.workType}
        </span>
        {(job.positions && job.positions.length > 0
          ? job.positions
          : job.roleType
            ? [job.roleType]
            : []
        )
          .slice(0, 3)
          .map((pos) => (
            <span
              key={pos}
              className="rounded-[6px] bg-slate-100 dark:bg-slate-700 px-[12px] py-[3px] text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-600"
            >
              {pos}
            </span>
          ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-[130px_1fr] gap-y-[10px] items-baseline">
        <span className="text-[12px] text-[#7C869A] dark:text-[#7f7f7f]">
          Preferred
        </span>
        <span className="text-[13px] font-semibold text-[#111827] dark:text-[#e5e7eb]">
          {job.location}
        </span>

        <span className="text-[12px] text-[#7C869A] dark:text-[#7f7f7f]">
          Applicants
        </span>
        <span className="text-[13px] font-semibold text-[#111827] dark:text-[#e5e7eb]">
          {job.applicants} Persons
        </span>

        <span className="text-[12px] text-[#7C869A] dark:text-[#7f7f7f]">
          Allowance
        </span>
        <span className="text-[13px] font-semibold text-[#111827] dark:text-[#e5e7eb]">
          {job.allowance}
        </span>
      </div>

      {/* Footer */}
      {job.timeAgo && (
        <div className="mt-auto flex justify-end pt-[14px] border-t border-slate-50 dark:border-slate-700/50">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {job.timeAgo}
          </span>
        </div>
      )}
    </div>
  );
}
