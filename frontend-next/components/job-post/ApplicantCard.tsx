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
  score: number;
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

export default function ApplicantCard({
  applicant,
  score,
  isMessaging,
  onMessage,
  onViewProfile,
  onMarkViewed,
}: ApplicantCardProps) {
  return (
    <div className="relative flex h-full min-h-[274px] flex-col rounded-[12px] bg-white px-[20px] py-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
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
            <div className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-[24px] font-semibold text-white">
              {applicant.initials}
            </div>
          )}
          <div className="min-w-0 pt-[2px]">
            <h3 className="truncate text-[18px] font-bold leading-tight text-[#111827]">
              {applicant.name}
            </h3>
            <p className="mt-[4px] truncate text-[12px] text-[#8B94A7]">
              {applicant.email}
            </p>
          </div>
        </div>
        <div
          className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#F59E0B ${score}%, #E5E7EB ${score}% 100%)`,
          }}
        >
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#4B5563]">
            {score}%
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="mt-[18px] grid grid-cols-[132px_1fr] gap-y-[10px] text-[12px]">
        <p className="text-[#7C869A]">Intern Period</p>
        <p className="font-semibold text-[#111827]">
          {formatInternshipPeriod(applicant.internshipPeriod)}
        </p>
        <p className="text-[#7C869A]">Institution</p>
        <p className="font-semibold text-[#111827]">
          {formatDisplayDate(applicant.institution)}
        </p>
        <p className="text-[#7C869A]">Academic Year</p>
        <p className="font-semibold text-[#111827]">
          {formatDisplayDate(applicant.academicYear)}
        </p>
        <p className="text-[#7C869A]">Field of Study</p>
        <p className="font-semibold text-[#111827]">
          {formatDisplayDate(applicant.fieldOfStudy)}
        </p>
        <p className="text-[#7C869A]">Preferred</p>
        <p className="font-semibold text-[#111827]">
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
          .map((item) => (
            <span
              key={item}
              className="rounded-[8px] bg-[#E5E7EB] px-[14px] py-[2px] text-[12px] font-semibold text-[#374151] inline-flex items-center"
            >
              {item}
            </span>
          ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-[12px]">
        <p className="text-[12px] text-[#C2C8D3]">{applicant.appliedDate}</p>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={onMessage}
            disabled={isMessaging}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#2563EB] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] disabled:opacity-60"
          >
            {isMessaging ? "Loading..." : "Message"}
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkViewed?.();
              onViewProfile();
            }}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-[#2563EB] bg-white px-[18px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8]"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}