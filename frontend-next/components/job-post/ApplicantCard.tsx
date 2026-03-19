"use client";

export type ApplicantStatus = "new" | "shortlisted" | "reviewed" | "rejected";

export interface Applicant {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  initials: string;
  appliedDate: string;
  appliedAt?: string;
  status: ApplicantStatus;
  skills: string[];
  internshipPeriod?: string | null;
  preferredPositions?: string[];
  preferredLocations?: string[];
  institution?: string | null;
  academicYear?: string | null;
  fieldOfStudy?: string | null;
  profileImage?: string | null;
}

interface ApplicantCardProps {
  applicant: Applicant;
  score: number; // -1 = loading
  isMessaging: boolean;
  onMessage: () => void;
  onViewProfile: () => void;
  onMarkViewed?: () => void;
}

function formatInternshipPeriod(raw: string | null | undefined): string {
  if (!raw) return "-";
  const match = raw.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
  if (!match) return raw;
  const start = new Date(match[1]);
  const end = new Date(match[2]);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return raw;
  const months = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${fmt.format(start)} - ${fmt.format(end)} (${months} Month)`;
}

function formatDisplayDate(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export default function ApplicantCard({
  applicant,
  score,
  isMessaging,
  onMessage,
  onViewProfile,
  onMarkViewed,
}: ApplicantCardProps) {
  const isLoading = score === -1;
  const r = 20;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative flex h-full min-h-[274px] flex-col rounded-[12px] border border-gray-100 bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      {applicant.status === "new" && (
        <div className="absolute right-[74px] top-[-11px] flex h-[24px] items-center rounded-[4px] bg-[#FB5F5F] px-[10px] text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(251,95,95,0.2)]">
          1 New
          <span className="absolute bottom-[-5px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#FB5F5F]" />
        </div>
      )}

      {/* Name + Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-[14px]">
          {applicant.profileImage ? (
            <img
              src={applicant.profileImage}
              alt={applicant.name}
              className="h-[54px] w-[54px] flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[24px] font-semibold text-white">
              {applicant.initials}
            </div>
          )}
          <div className="min-w-0 pt-[2px]">
            <h3 className="truncate text-[18px] font-bold leading-tight text-[#111827] dark:text-white">
              {applicant.name}
            </h3>
            <p className="mt-[4px] truncate text-[12px] text-[#8B94A7] dark:text-[#e5e7eb]">
              {applicant.email}
            </p>
          </div>
        </div>

        {/* ✅ Score Circle — SVG arc เหมือน JobMatchCard */}
        {isLoading ? (
          <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[20px] w-[20px] animate-spin rounded-full border-[2px] border-[#D1D5DB] border-t-[#6B7280]" />
            </div>
          </div>
        ) : (
          <div className="relative h-[52px] w-[52px] shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle
                cx="26" cy="26" r={r}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              <circle
                cx="26" cy="26" r={r}
                fill="none"
                stroke={getScoreColor(score)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${score === 100 ? circumference : (score / 100) * (circumference - 8)} ${circumference}`}
                strokeDashoffset={0}
                transform="rotate(-90 26 26)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#374151]">
              {score}%
            </div>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="mt-[18px] grid grid-cols-[132px_1fr] gap-y-[10px] text-[12px]">
        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Intern Period</p>
        <p className="font-semibold text-[#111827] dark:text-white">
          {formatInternshipPeriod(applicant.internshipPeriod)}
        </p>
        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Institution</p>
        <p className="font-semibold text-[#111827] dark:text-white">
          {formatDisplayDate(applicant.institution)}
        </p>
        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Academic Year</p>
        <p className="font-semibold text-[#111827] dark:text-white">
          {formatDisplayDate(applicant.academicYear)}
        </p>
        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Field of Study</p>
        <p className="font-semibold text-[#111827] dark:text-white">
          {formatDisplayDate(applicant.fieldOfStudy)}
        </p>
        <p className="text-[#7C869A] dark:text-[#7f7f7f]">Preferred</p>
        <p className="font-semibold text-[#111827] dark:text-white">
          {applicant.preferredLocations?.length
            ? applicant.preferredLocations.join(", ")
            : "-"}
        </p>
      </div>

      {/* Tags */}
      <div className="mt-[18px] flex flex-wrap gap-[8px]">
        {(applicant.preferredPositions?.length
          ? applicant.preferredPositions
          : applicant.skills
        )
          .slice(0, 3)
          .map((item, index) => (
            <span
              key={item}
              className={`inline-flex items-center rounded-[8px] px-[14px] py-[2px] text-[12px] font-semibold ${
                index === 0
                  ? 'bg-[#E5E7EB] text-[#374151] dark:bg-[#fef3c7] dark:text-[#b45309]'
                  : 'bg-[#E5E7EB] text-[#374151] dark:bg-gray-700 dark:text-slate-200'
              }`}
            >
              {item}
            </span>
          ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-[12px]">
        <p className="text-[12px] text-[#C2C8D3] dark:text-[#e5e7eb]">{applicant.appliedDate}</p>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={onMessage}
            disabled={isMessaging}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            {isMessaging ? "Loading..." : "Message"}
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkViewed?.();
              onViewProfile();
            }}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}