"use client";

export interface JobMatchPost {
  id: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string | null;
  workplaceType: string;
  positions: string[];
  locationProvince?: string | null;
  positionsAvailable?: number | null;
  allowance?: number | null;
  allowancePeriod?: string | null;
  noAllowance?: boolean;
  score?: number;
  isBookmarked?: boolean;
}

function formatAllowance(
  allowance: number | null | undefined,
  allowancePeriod: string | null | undefined,
  noAllowance?: boolean,
): string {
  if (noAllowance) return "No allowance";
  if (!allowance) return "Not specified";
  const periodMap: Record<string, string> = {
    MONTH: "Month",
    WEEK: "Week",
    DAY: "Day",
  };
  const period = allowancePeriod
    ? periodMap[allowancePeriod] || allowancePeriod
    : null;
  if (period) return `${allowance.toLocaleString()} THB/${period}`;
  return `${allowance.toLocaleString()} THB`;
}

const workTypeStyles: Record<string, string> = {
  HYBRID: "#3B82F6",
  Hybrid: "#3B82F6",
  ON_SITE: "#F4C14D",
  "On-Site": "#F4C14D",
  "On-site": "#F4C14D",
  REMOTE: "#EF4444",
  Remote: "#EF4444",
};

function workplaceLabel(type: string): string {
  if (type === "ON_SITE") return "On-Site";
  if (type === "HYBRID") return "Hybrid";
  if (type === "REMOTE") return "Remote";
  return type;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

interface JobMatchCardProps {
  post: JobMatchPost;
  onBookmark?: (id: string, next: boolean) => void;
  onDetail?: () => void;
  onApply?: () => void;
}

export default function JobMatchCard({
  post,
  onBookmark,
  onDetail,
  onApply,
}: JobMatchCardProps) {
  const score = post.score ?? 80;
  const r = 20;
  const circumference = 2 * Math.PI * r;

  const renderLogo = () => {
    if (post.companyLogo && post.companyLogo.startsWith("http")) {
      return (
        <img
          src={post.companyLogo}
          alt={post.companyName}
          className="h-[48px] w-[48px] rounded-full object-cover"
        />
      );
    }
    return (
      <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[4px] bg-[#23356E] text-[9px] font-bold text-white">
        {post.companyName.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="relative flex h-full min-h-[274px] flex-col rounded-[12px] bg-white dark:bg-slate-800 px-[20px] py-[18px] shadow-sm border border-slate-100 dark:border-slate-700 transition-shadow duration-200 hover:shadow-[0_0px_15px_rgba(0,0,0,0.10)] cursor-pointer">
      {/* Header */}
      <div className="mb-[9px] flex items-start justify-between gap-2">
        <div className="flex items-start gap-[14px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-[#F3F4F7] dark:bg-slate-700">
            {renderLogo()}
          </div>
          <div className="min-w-0 pt-[1px] max-w-[150px]">
            <h3
              className="truncate text-[15px] font-bold leading-tight text-[#111827] dark:text-white"
              title={post.companyName}
            >
              {post.companyName}
            </h3>
            <p className="mt-[2px] text-[12px] text-[#8B94A7]">
              {post.companyEmail}
            </p>
          </div>
        </div>

        {/* Score ring + Bookmark */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <div className="relative h-[52px] w-[52px] shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r={r}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              <circle
                cx="26"
                cy="26"
                r={r}
                fill="none"
                stroke={getScoreColor(score)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${score === 100 ? circumference : (score / 100) * (circumference - 8)} ${circumference}`}
                strokeDashoffset={0}
                transform="rotate(-90 26 26)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#374151] dark:text-slate-200">
              {score}%
            </div>
          </div>

          <button
            type="button"
            onClick={() => onBookmark?.(post.id, !post.isBookmarked)}
            className={`shrink-0 pt-[2px] transition-colors ${post.isBookmarked ? "text-gray-800 dark:text-white" : "text-gray-300 dark:text-slate-600"} hover:text-gray-600 dark:hover:text-slate-300`}
            aria-label={post.isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <svg
              className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`}
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
        </div>
      </div>

      {/* Job title */}
      <h2 className="mb-[4px] min-h-[34px] text-[16px] font-bold leading-snug text-[#111827] dark:text-white">
        {post.jobTitle}
      </h2>

      {/* Tags */}
      <div className="mb-[16px] flex min-h-[30px] flex-wrap gap-[8px]">
        <span
          className="rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold text-white inline-flex items-center"
          style={{
            backgroundColor: workTypeStyles[post.workplaceType] || "#94A3B8",
          }}
        >
          {workplaceLabel(post.workplaceType)}
        </span>
        {post.positions.slice(0, 3).map((pos) => (
          <span
            key={pos}
            className="rounded-[8px] bg-[#E5E7EB] dark:bg-slate-700 px-[14px] py-[2px] text-[12px] font-semibold text-[#4B5563] dark:text-slate-300 inline-flex items-center"
          >
            {pos}
          </span>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-[150px_1fr] gap-y-[8px]">
        <p className="text-[12px] text-[#8B94A7]">Preferred location</p>
        <p className="text-[13px] text-[#6B7280] dark:text-slate-400">
          {post.locationProvince || "-"}
        </p>

        <p className="text-[12px] text-[#8B94A7]">Number of applicants</p>
        <p className="text-[13px] text-[#6B7280] dark:text-slate-400">
          {post.positionsAvailable ?? "-"}
        </p>

        <p className="text-[12px] text-[#8B94A7]">Allowance</p>
        <p className="text-[13px] font-semibold text-[#111827] dark:text-white">
          {formatAllowance(
            post.allowance,
            post.allowancePeriod,
            post.noAllowance,
          )}
        </p>
      </div>

      {/* Footer buttons */}
      <div className="mt-auto flex gap-2 pt-[14px]">
        <button
          type="button"
          onClick={onDetail}
          className="flex h-[34px] flex-1 items-center justify-center rounded-[8px] border border-[#D1D5DB] dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] font-semibold text-[#374151] dark:text-slate-200 transition hover:bg-[#F9FAFB] dark:hover:bg-slate-600"
        >
          Detail
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex h-[34px] flex-1 items-center justify-center rounded-[8px] border border-[#2563EB] bg-white dark:bg-slate-700 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:hover:bg-slate-600"
        >
          Apply
        </button>
      </div>
    </div>
  );
}