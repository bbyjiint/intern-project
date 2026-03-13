import React from "react";

export interface JobPostData {
  id: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string;
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
  "On-Site": "#F4C14D",
  "On-site": "#F4C14D",
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
          className="h-[31px] w-[31px] rounded-[4px] object-contain"
        />
      );
    }
    return (
      <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[4px] bg-[#23356E] text-[9px] font-bold text-white">
        {job.companyName.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div
      className={`relative flex h-full min-h-[274px] flex-col rounded-[12px] bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={() => onClick && onClick(job.id)}
    >
      {/* Top Row */}
      <div className="mb-[9px] flex items-start justify-between gap-2">
        <div className="flex items-start gap-[14px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-[#F3F4F7]">
            {renderCompanyLogo()}
          </div>
          <div className="min-w-0 pt-[1px] max-w-[150px]">
            <h3
              className="truncate text-[15px] font-bold leading-tight text-[#111827]"
              title={job.companyName}
            >
              {job.companyName}
            </h3>
            <p className="mt-[2px] text-[12px] text-[#8B94A7]">
              {job.companyEmail}
            </p>
          </div>
        </div>

        {/* Status Badge + Bookmark มุมบนขวา */}
        <div className="flex items-center gap-2 shrink-0 mt-1">
          {job.status && (
            <span
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-semibold ${
                job.status === "Accept"
                  ? "border-green-400 text-green-500 bg-green-50"
                  : job.status === "Decline"
                    ? "border-red-400 text-red-500 bg-red-50"
                    : "border-blue-400 text-blue-500 bg-blue-50"
              }`}
            >
              {job.status === "Accept" && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {job.status === "Decline" && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {job.status === "Applied" && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {job.status}
            </span>
          )}
          {onBookmarkClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkClick(job.id);
              }}
              className={`shrink-0 pt-[2px] ${job.isBookmarked ? "text-gray-800" : "text-gray-300"} hover:text-gray-600 transition-colors`}
            >
              <svg
                className={`w-5 h-5 ${job.isBookmarked ? "fill-current" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
      <h2 className="mb-[4px] min-h-[34px] text-[16px] font-bold leading-snug text-[#111827]">
        {job.jobTitle}
      </h2>

      {/* Tags */}
      <div className="mb-[16px] flex min-h-[30px] flex-wrap gap-[8px]">
        <span
          className="rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold text-white inline-flex items-center"
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
              className="rounded-[8px] bg-[#E5E7EB] px-[14px] py-[2px] text-[12px] font-semibold text-[#4B5563] inline-flex items-center"
            >
              {pos}
            </span>
          ))}
        {job.positions && job.positions.length > 3 && (
          <span
            className="group relative rounded-[8px] bg-[#E5E7EB] px-[14px] py-[2px] text-[12px] font-semibold text-[#4B5563] cursor-default"
            title={job.positions.slice(3).join(", ")}
          >
            ...
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[#1F2937] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {job.positions.slice(3).join(", ")}
            </span>
          </span>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-[150px_1fr] gap-y-[8px]">
        <p className="text-[12px] text-[#8B94A7]">Preferred</p>
        <p className="text-[13px] text-[#6B7280]">{job.location}</p>
        <p className="text-[12px] text-[#8B94A7]">Number of applicants</p>
        <p className="text-[13px] text-[#6B7280]">{job.applicants}</p>
        <p className="text-[12px] text-[#8B94A7]">Allowance</p>
        <p className="text-[13px] font-semibold text-[#111827]">
          {job.allowance}
        </p>
      </div>

      {/* Footer: เวลา มุมล่างขวา */}
      {job.timeAgo && (
        <div className="mt-auto flex justify-end pt-[12px]">
          <span className="text-[12px] text-[#C2C8D3]">{job.timeAgo}</span>
        </div>
      )}
    </div>
  );
}
