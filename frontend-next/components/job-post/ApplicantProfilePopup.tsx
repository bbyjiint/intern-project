"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { type Applicant } from "./ApplicantCard";

export interface CandidateEducation {
  id?: string;
  university: string;
  educationLevel?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  yearOfStudy?: string | null;
  gpa?: string | null;
}

export interface CandidateProfile {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  internshipPeriod?: string | null;
  bio?: string | null;
  preferredPositions?: string[];
  preferredLocations?: string[];
  education?: CandidateEducation[];
  experience?: Array<{ id?: string }>;
  projects?: Array<{ id?: string }>;
  skills?: Array<{
    name: string;
    level?: string;
    rating?: number;
    status?: string;
  }>;
  gender?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
}

interface AIMatchItem {
  matched: boolean;
  label: string;
}

interface AIAnalysis {
  position: AIMatchItem;
  education: AIMatchItem;
  skills: AIMatchItem[];
  project: AIMatchItem;
  insight: string[];
}

function CheckIcon({ matched }: { matched: boolean }) {
  return matched ? (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white">
      <svg
        className="h-[10px] w-[10px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </span>
  ) : (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#EF4444] text-white">
      <svg
        className="h-[10px] w-[10px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </span>
  );
}

function CircularProgress({
  percentage,
  label,
}: {
  percentage: number;
  label: string;
}) {
  const norm = Math.max(0, Math.min(100, percentage));
  const size = 200;
  const center = size / 2;
  const totalSegments = 44;
  const activeSegments = Math.round((norm / 100) * totalSegments);
  const outerRadius = 88;
  const innerRadius = 74;
  return (
    <div className="relative h-[220px] w-[220px]">
      <svg
        width="220"
        height="220"
        viewBox={`0 0 ${size} ${size}`}
        className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        {Array.from({ length: totalSegments }).map((_, i) => {
          const angle = (-90 + (360 / totalSegments) * i) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={center + innerRadius * Math.cos(angle)}
              y1={center + innerRadius * Math.sin(angle)}
              x2={center + outerRadius * Math.cos(angle)}
              y2={center + outerRadius * Math.sin(angle)}
              stroke={
                i < activeSegments
                  ? norm >= 80
                    ? "#22C55E"
                    : norm >= 50
                      ? "#F5B942"
                      : "#EF4444"
                  : "#DCE4F2"
              }
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[28px] font-medium leading-none text-[#1F2937]">
          {norm}%
        </p>
        <p className="mt-[8px] max-w-[120px] text-center text-[13px] leading-[1.3] text-[#4B5563]">
          {label}
        </p>
      </div>
    </div>
  );
}

function AIAnalysisSkeleton() {
  return (
    <div className="space-y-[10px]">
      {[90, 110, 80, 100].map((w, i) => (
        <div key={i} className="flex items-center gap-[12px]">
          <div className="h-[18px] w-[18px] rounded-full bg-[#E5E7EB] animate-pulse shrink-0" />
          <div
            className="h-[12px] rounded bg-[#E5E7EB] animate-pulse"
            style={{ width: `${w}px` }}
          />
        </div>
      ))}
    </div>
  );
}

interface ApplicantProfilePopupProps {
  applicant: Applicant;
  profile: CandidateProfile | null;
  jobMatch: number;
  profileCompletion: number;
  isLoading: boolean;
  jobPostId?: string;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ApplicantProfilePopup({
  applicant,
  profile,
  jobMatch,
  profileCompletion,
  isLoading,
  jobPostId,
  onClose,
  onAccept,
  onDecline,
}: ApplicantProfilePopupProps) {
  const router = useRouter();
  const candidateId = profile?.id || applicant.candidateId;

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  // ✅ forceRefresh flag — toggle เพื่อ trigger useEffect ใหม่
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    if (!profile?.id || !jobPostId) return;

    const fetchAnalysis = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        // ✅ ถ้า forceRefresh ให้ลบ cache ฝั่ง DB ก่อน แล้วค่อยดึงใหม่
        const url = forceRefresh
          ? `/api/candidates/applicant-job-analysis?jobPostId=${jobPostId}&candidateId=${profile.id}&refresh=true`
          : `/api/candidates/applicant-job-analysis?jobPostId=${jobPostId}&candidateId=${profile.id}`;
        const data = await apiFetch<{ analysis: AIAnalysis }>(url);
        setAiAnalysis(data.analysis);
      } catch (e) {
        console.error("Failed to fetch AI analysis:", e);
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    };

    fetchAnalysis();
  }, [profile?.id, jobPostId, forceRefresh]);

  useEffect(() => {
    setAiAnalysis(null);
    setAiError(false);
    setForceRefresh(false);
  }, [applicant.candidateId]);

  const handleReanalyze = () => {
    setAiAnalysis(null);
    setAiError(false);
    setForceRefresh((prev) => !prev); // ✅ toggle เพื่อ trigger useEffect
  };

  const goToProfile = (section?: string) => {
    const url = `/employer/candidate/${candidateId}${section ? `?section=${section}` : ""}`;
    router.push(url);
  };

  const primaryEducation = profile?.education?.[0];
  const displayName = profile?.fullName || applicant.name;
  const displayPhone = profile?.phoneNumber || "-";
  const displayEmail = profile?.email || applicant.email;
  const about = profile?.bio?.trim() || "No description provided.";
  const positions = profile?.preferredPositions?.length
    ? profile.preferredPositions
    : applicant.preferredPositions || [];
  const locations = profile?.preferredLocations?.length
    ? profile.preferredLocations
    : applicant.preferredLocations || [];
  const internshipPeriod =
    profile?.internshipPeriod || applicant.internshipPeriod || "-";

  const educationLine1 = primaryEducation
    ? `${primaryEducation.university}${primaryEducation.yearOfStudy ? ` | Year ${primaryEducation.yearOfStudy}${String(primaryEducation.yearOfStudy).trim() ? " (Currently studying)" : ""}` : ""}`
    : applicant.institution
      ? `${applicant.institution}${applicant.academicYear ? ` | Year ${applicant.academicYear}` : ""}`
      : "-";

  const educationLine2 = primaryEducation
    ? `${primaryEducation.degree || ""}${primaryEducation.fieldOfStudy ? `${primaryEducation.degree ? " in " : ""}${primaryEducation.fieldOfStudy}` : ""}${primaryEducation.gpa ? ` | GPA: ${primaryEducation.gpa}` : ""}`.trim()
    : applicant.fieldOfStudy || "-";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-[940px] overflow-y-auto rounded-[18px] bg-white px-[32px] py-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.18)] transition-colors dark:bg-slate-950 dark:shadow-none dark:ring-1 dark:ring-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[16px] top-[14px] text-[#4B5563] transition hover:text-[#111827] dark:text-slate-400 dark:hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M6 6l12 12M18 6 6 18"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-[16px]">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={displayName}
                className="h-[64px] w-[64px] rounded-full object-cover"
              />
            ) : (
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#3B82F6] text-[24px] font-semibold text-white">
                {applicant.initials}
              </div>
            )}
            <div className="pt-[6px]">
              <h2 className="text-[22px] font-bold leading-none text-black dark:text-white">
                {displayName}
              </h2>
              <p className="mt-[8px] text-[13px] text-[#97A0AF] dark:text-slate-400">
                Phone: {displayPhone}
              </p>
              <p className="mt-[4px] text-[13px] text-[#97A0AF] dark:text-slate-400">
                Email {displayEmail}
              </p>
              {isLoading && (
                <p className="mt-[6px] text-[12px] text-[#6B7280] dark:text-slate-400">
                  Loading profile...
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToProfile()}
            className="mt-[10px] flex h-[36px] items-center justify-center rounded-[8px] border border-[#2563EB] bg-white px-[16px] text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
          >
            See Profile
          </button>
        </div>

        {/* Body */}
        <div className="mt-[20px] border-t border-[#E5E7EB] pt-[18px] dark:border-slate-800">
          <div>
            <h3 className="text-[14px] font-bold text-[#344164] dark:text-slate-200">About Me</h3>
            <p className="mt-[6px] text-[13px] leading-[1.5] text-[#51617C] dark:text-slate-400">
              {about}
            </p>
          </div>

          <div className="mt-[18px] grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-slate-200">
                Education
              </h3>
              <p className="mt-[6px] text-[13px] leading-[1.45] text-[#51617C] dark:text-slate-400">
                {educationLine1}
              </p>
              <p className="mt-[2px] text-[13px] leading-[1.45] text-[#51617C] dark:text-slate-400">
                {educationLine2 || "-"}
              </p>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-slate-200">
                Positions of Interest
              </h3>
              <div className="mt-[8px] flex flex-wrap gap-[6px]">
                {positions.length > 0 ? (
                  positions.map((p) => (
                    <span
                      key={p}
                      className="rounded-[6px] bg-[#E5E7EB] px-[12px] py-[4px] text-[12px] font-semibold text-[#374151] dark:bg-slate-800 dark:text-slate-300"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <p className="text-[13px] text-[#51617C] dark:text-slate-400">-</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-slate-200">
                Internship Period
              </h3>
              <p className="mt-[6px] text-[13px] leading-[1.45] text-[#51617C] dark:text-slate-400">
                {internshipPeriod}
              </p>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-slate-200">
                Preferred Locations
              </h3>
              <p className="mt-[6px] text-[13px] leading-[1.45] text-[#51617C] dark:text-slate-400">
                {locations.length > 0 ? locations.join(", ") : "-"}
              </p>
            </div>
          </div>

          {/* Circular progress */}
          <div className="mt-[16px] flex justify-center gap-[48px]">
            <CircularProgress percentage={jobMatch} label="Job Match" />
            <CircularProgress
              percentage={profileCompletion}
              label="Profile Completion"
            />
          </div>

          {/* AI Job Match Section */}
          <div className="mt-[20px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-[20px] py-[16px] dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-[14px] flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <span className="text-[13px] font-bold text-[#2563EB]">AI</span>
                <h3 className="text-[13px] font-bold text-[#1F2937] dark:text-slate-200">
                  Job Match Section
                </h3>
                <span className="text-[14px] text-[#6B7280] dark:text-slate-400">✦</span>
              </div>
              <button
                type="button"
                onClick={handleReanalyze}
                disabled={aiLoading}
                className="flex items-center gap-[4px] rounded-[6px] border border-[#2563EB] bg-white px-[10px] py-[4px] text-[11px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
              >
                <svg
                  className={`h-[11px] w-[11px] ${aiLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Re-analyze
              </button>
            </div>

            {(aiLoading || (isLoading && !aiAnalysis)) && (
              <AIAnalysisSkeleton />
            )}

            {aiError && !aiLoading && (
              <p className="text-[12px] text-[#EF4444]">
                Could not load AI analysis. Please try again.
              </p>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="space-y-[10px] text-[12px]">
                <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                  <span className="text-[#6B7280] dark:text-slate-400">Position</span>
                  <div className="flex items-center gap-[8px]">
                    <CheckIcon matched={aiAnalysis.position.matched} />
                    <span className="text-[#374151] dark:text-slate-200">
                      {aiAnalysis.position.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                  <span className="text-[#6B7280] dark:text-slate-400">Education</span>
                  <div className="flex items-center justify-between gap-[8px]">
                    <div className="flex items-center gap-[8px]">
                      <CheckIcon matched={aiAnalysis.education.matched} />
                      <span className="text-[#374151] dark:text-slate-200">
                        {aiAnalysis.education.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToProfile("education")}
                      className="shrink-0 text-[11px] text-[#2563EB] hover:underline dark:text-blue-400"
                    >
                      &gt;&gt; Go to Profile to see file
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[90px_1fr] items-start gap-x-[12px]">
                  <span className="pt-[2px] text-[#6B7280] dark:text-slate-400">Skills</span>
                  <div className="flex flex-col gap-[6px]">
                    {aiAnalysis.skills.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-[8px]"
                      >
                        <div className="flex items-center gap-[8px]">
                          <CheckIcon matched={skill.matched} />
                          <span className="text-[#374151] dark:text-slate-200">{skill.label}</span>
                        </div>
                        {i === aiAnalysis.skills.length - 1 && (
                          <button
                            type="button"
                            onClick={() => goToProfile("skills")}
                            className="shrink-0 text-[11px] text-[#2563EB] hover:underline dark:text-blue-400"
                          >
                            &gt;&gt; Go to Profile to see more Skill
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[90px_1fr] items-center gap-x-[12px]">
                  <span className="text-[#6B7280] dark:text-slate-400">Project</span>
                  <div className="flex items-center justify-between gap-[8px]">
                    <div className="flex items-center gap-[8px]">
                      <CheckIcon matched={aiAnalysis.project.matched} />
                      <span className="text-[#374151] dark:text-slate-200">
                        {aiAnalysis.project.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToProfile("projects")}
                      className="shrink-0 text-[11px] text-[#2563EB] hover:underline dark:text-blue-400"
                    >
                      &gt;&gt; Go to Profile to see file
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!jobPostId && !aiLoading && (
              <p className="text-[12px] text-[#9CA3AF]">
                Job post information not available for analysis.
              </p>
            )}
          </div>

          {/* AI Insight */}
          <div className="mt-[12px] rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-[20px] py-[16px] dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-[10px] flex items-center gap-[6px]">
              <span className="text-[13px] font-bold text-[#2563EB]">AI</span>
              <h3 className="text-[13px] font-bold text-[#1F2937] dark:text-slate-200">Insight</h3>
              <span className="text-[14px]">🔒</span>
            </div>
            {(aiLoading || (isLoading && !aiAnalysis)) && (
              <div className="space-y-[6px]">
                {[200, 160, 180].map((w, i) => (
                  <div
                    key={i}
                    className="h-[12px] rounded bg-[#E5E7EB] animate-pulse"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="space-y-[4px]">
                {aiAnalysis.insight.map((line, i) => (
                  <p
                    key={i}
                    className="text-[12px] leading-[1.6] text-[#51617C] dark:text-slate-400"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}

            {aiError && !aiLoading && (
              <p className="text-[12px] text-[#9CA3AF]">
                Insight not available.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-[20px] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[36px] items-center justify-center rounded-[8px] border border-[#D1D5DB] bg-white px-[20px] text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Back
            </button>
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={onDecline}
                className="flex h-[36px] items-center justify-center rounded-[8px] border border-[#EF4444] bg-white px-[20px] text-[13px] font-semibold text-[#EF4444] transition hover:bg-[#FEF2F2] dark:bg-slate-900 dark:hover:bg-red-500/10"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="flex h-[36px] items-center justify-center rounded-[8px] bg-[#2563EB] px-[20px] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function calculateProfileCompletion(
  profile: CandidateProfile | null,
): number {
  if (!profile) return 0;
  const checks = [
    !!profile.profileImage,
    !!profile.fullName?.split(" ")[0]?.trim(),
    !!profile.fullName?.split(" ").slice(1).join(" ")?.trim(),
    !!profile.gender,
    !!profile.dateOfBirth,
    !!profile.nationality,
    !!profile.bio?.trim(),
    !!profile.email,
    !!profile.phoneNumber,
    !!profile.preferredPositions?.length,
    !!profile.preferredLocations?.length,
    !!profile.internshipPeriod,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
