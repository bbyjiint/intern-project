"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface CandidateProfileModalProps {
  candidate: {
    id?: string;
    name: string;
    role: string;
    university: string;
    major: string;
    graduationDate: string;
    skills: string[];
    preferredPositions?: string[];
    initials: string;
    email?: string;
    about?: string;
    phoneNumber?: string | null;
    internshipPeriod?: string | null;
    preferredLocations?: string[];
    location?: string | null;
    profileImage?: string | null;
    yearOfStudy?: string | null;
    gpa?: string | null;
    degreeName?: string | null;
    isCurrent?: boolean;
  };
  onClose: () => void;
}

export default function CandidateProfileModal({
  candidate,
  onClose,
}: CandidateProfileModalProps) {
  const router = useRouter();
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  const handleViewFullProfile = () => {
    if (!candidate.id) return;
    router.push(`/employer/candidate/${candidate.id}`);
  };

  const handleStartConversation = async () => {
    if (!candidate.id) {
      alert("Candidate ID is required to start a conversation");
      return;
    }

    setIsStartingConversation(true);
    try {
      const data = await apiFetch<{ conversation: any }>(
        "/api/messages/conversations",
        {
          method: "POST",
          body: JSON.stringify({
            candidateId: candidate.id,
          }),
        },
      );
      router.push(
        `/employer/messages?conversationId=${encodeURIComponent(data.conversation.id)}`,
      );
      onClose();
    } catch (error: any) {
      console.error("Error starting conversation:", error);

      if (
        error.message?.includes("already exists") ||
        error.details?.includes("already exists")
      ) {
        router.push("/employer/messages");
        onClose();
        return;
      }

      const errorMessage = error.details || error.message || "Unknown error";
      alert(`Failed to start conversation: ${errorMessage}`);
    } finally {
      setIsStartingConversation(false);
    }
  };

  // ดึง preferredLocations ทั้งหมดมาแสดง
  const locationDisplay =
    candidate.preferredLocations && candidate.preferredLocations.length > 0
      ? candidate.preferredLocations.join(", ")
      : candidate.location || "-";

  // แสดง preferredPositions ถ้ามี ถ้าไม่มีค่อย fallback ไป skills
  const positionTags =
    candidate.preferredPositions && candidate.preferredPositions.length > 0
      ? candidate.preferredPositions
      : candidate.skills;

  // Education บรรทัด 1: University | Year X (Currently studying) หรือ graduationDate
  const eduLine1 = `${candidate.university} | ${
    candidate.isCurrent
      ? `Year ${candidate.yearOfStudy || "-"} (Currently studying)`
      : candidate.yearOfStudy
        ? `Year ${candidate.yearOfStudy}`
        : candidate.graduationDate || "-"
  }`;

  // Education บรรทัด 2: DegreeName in FieldOfStudy | GPA: X.XX
  const degreeDisplay =
    candidate.degreeName &&
    candidate.major &&
    candidate.degreeName !== candidate.major
      ? `${candidate.degreeName} in ${candidate.major}`
      : candidate.degreeName || candidate.major || "-";
  const eduLine2 = candidate.gpa
    ? `${degreeDisplay} | GPA: ${candidate.gpa}`
    : degreeDisplay;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[min(92dvh,900px)] w-full max-w-[940px] overflow-y-auto overscroll-contain rounded-t-2xl border border-gray-100 bg-white px-4 pb-6 pt-6 shadow-[0_20px_60px_rgba(15,23,42,0.22)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:rounded-[14px] sm:px-6 sm:pb-8 sm:pt-7 md:px-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#111827] dark:text-[#e5e7eb] dark:hover:bg-white/10 dark:hover:text-white sm:right-4 sm:top-3"
          aria-label="Close candidate profile"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pr-10">
          <div className="flex min-w-0 items-start gap-3 sm:gap-5">
            {/* Profile Image */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-xl font-semibold text-white dark:bg-[#2563eb] sm:h-[84px] sm:w-[84px] sm:text-[28px]">
              {candidate.profileImage ? (
                <img
                  src={candidate.profileImage}
                  alt={candidate.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[#6B7280] dark:text-white">{candidate.initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5 sm:pt-2">
              <h2 className="text-base font-bold leading-snug text-[#111827] dark:text-white sm:text-[18px] sm:leading-none">
                {candidate.name}
              </h2>
              {candidate.phoneNumber && (
                <p className="mt-2 break-words text-[13px] leading-relaxed text-[#9CA3AF] dark:text-[#e5e7eb] sm:mt-[10px] sm:text-[12px]">
                  Phone: {candidate.phoneNumber}
                </p>
              )}
              <p className="mt-1.5 break-all text-[13px] leading-relaxed text-[#9CA3AF] dark:text-[#e5e7eb] sm:mt-[6px] sm:text-[12px]">
                Email{" "}
                {candidate.email ||
                  `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@example.com`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleViewFullProfile}
            className="flex h-10 w-full shrink-0 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700 sm:mt-[18px] sm:h-[32px] sm:w-auto sm:rounded-[6px] sm:px-4 sm:text-[12px]"
          >
            See Profile
          </button>
        </div>

        <div className="mt-5 border-t border-[#E5E7EB] pt-5 dark:border-[#e5e7eb] sm:mt-6 sm:pt-6">
          <div>
            <h3 className="text-[15px] font-bold text-[#344164] dark:text-white sm:text-[14px]">
              About Me
            </h3>
            <p className="mt-2 max-w-[820px] text-[13px] leading-relaxed text-[#51617C] dark:text-[#e5e7eb] sm:mt-[8px] sm:text-[12px] sm:leading-[1.55]">
              {candidate.about || "-"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:mt-6 sm:grid-cols-2">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[#344164] dark:text-white sm:text-[14px]">
                Education
              </h3>
              <p className="mt-2 break-words text-[13px] leading-relaxed text-[#51617C] dark:text-[#e5e7eb] sm:mt-[8px] sm:text-[12px] sm:leading-[1.45]">
                {eduLine1}
              </p>
              <p className="mt-1 break-words text-[13px] leading-relaxed text-[#51617C] dark:text-[#e5e7eb] sm:mt-[2px] sm:text-[12px] sm:leading-[1.45]">
                {eduLine2}
              </p>
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[#344164] dark:text-white sm:text-[14px]">
                Positions of Interest
              </h3>
              <div className="mt-2 flex flex-wrap gap-2 sm:mt-[10px] sm:gap-[8px]">
                {positionTags.length > 0 ? (
                  positionTags.slice(0, 5).map((pos, index) => (
                    <span
                      key={`${pos}-${index}`}
                      className="rounded-md px-3 py-1.5 text-[12px] font-semibold bg-[#E5E7EB] text-[#374151] dark:bg-gray-700 dark:text-slate-200 sm:rounded-[6px] sm:px-[14px] sm:py-[5px]"
                    >
                      {pos}
                    </span>
                  ))
                ) : (
                  <p className="text-[12px] text-[#51617C] dark:text-[#7f7f7f]">-</p>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[#344164] dark:text-white sm:text-[14px]">
                Internship Period
              </h3>
              <p className="mt-2 break-words text-[13px] leading-relaxed text-[#51617C] dark:text-[#e5e7eb] sm:mt-[8px] sm:text-[12px] sm:leading-[1.45]">
                {candidate.internshipPeriod || "-"}
              </p>
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[#344164] dark:text-white sm:text-[14px]">
                Preferred Locations
              </h3>
              <p className="mt-2 break-words text-[13px] leading-relaxed text-[#51617C] dark:text-[#e5e7eb] sm:mt-[8px] sm:text-[12px] sm:leading-[1.45]">
                {locationDisplay}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-[8px] sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-[#E5E7EB] px-5 text-[13px] font-semibold text-[#6B7280] transition hover:bg-[#D1D5DB] dark:bg-gray-700 dark:text-slate-200 dark:hover:bg-gray-600 sm:h-[32px] sm:w-auto sm:rounded-[6px] sm:px-[22px] sm:text-[12px]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleStartConversation}
              disabled={isStartingConversation || !candidate.id}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[32px] sm:w-auto sm:rounded-[6px] sm:px-[20px] sm:text-[12px]"
            >
              {isStartingConversation ? "Loading..." : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
