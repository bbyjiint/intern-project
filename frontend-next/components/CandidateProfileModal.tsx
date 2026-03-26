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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[940px] rounded-[14px] border border-gray-100 bg-white px-10 pb-8 pt-7 shadow-[0_20px_60px_rgba(15,23,42,0.22)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-[#6B7280] transition-colors hover:text-[#111827] dark:text-[#e5e7eb] dark:hover:text-white"
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

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Profile Image */}
            <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-[28px] font-semibold text-white dark:bg-[#2563eb]">
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
            <div className="pt-2">
              <h2 className="text-[18px] font-bold leading-none text-[#111827] dark:text-white">
                {candidate.name}
              </h2>
              {candidate.phoneNumber && (
                <p className="mt-[10px] text-[12px] text-[#9CA3AF] dark:text-[#e5e7eb]">
                  Phone: {candidate.phoneNumber}
                </p>
              )}
              <p className="mt-[6px] text-[12px] text-[#9CA3AF] dark:text-[#e5e7eb]">
                Email{" "}
                {candidate.email ||
                  `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@example.com`}
              </p>
            </div>
          </div>

          <button
            onClick={handleViewFullProfile}
            className="mt-[18px] flex h-[28px] items-center justify-center rounded-[6px] border border-[#d1d5db] bg-white px-[16px] text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#F0F4F8] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            See Profile
          </button>
        </div>

        <div className="mt-6 border-t border-[#E5E7EB] pt-6 dark:border-[#e5e7eb]">
          <div>
            <h3 className="text-[14px] font-bold text-[#344164] dark:text-white">About Me</h3>
            <p className="mt-[8px] max-w-[820px] text-[12px] leading-[1.55] text-[#51617C] dark:text-[#e5e7eb]">
              {candidate.about || "-"}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-white">
                Education
              </h3>
              <p className="mt-[8px] text-[12px] leading-[1.45] text-[#51617C] dark:text-[#e5e7eb]">
                {eduLine1}
              </p>
              <p className="mt-[2px] text-[12px] leading-[1.45] text-[#51617C] dark:text-[#e5e7eb]">
                {eduLine2}
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-white">
                Positions of Interest
              </h3>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {positionTags.length > 0 ? (
                  positionTags.slice(0, 5).map((pos, index) => (
                    <span
                      key={`${pos}-${index}`}
                      className="rounded-[6px] px-[14px] py-[5px] text-[12px] font-semibold bg-[#E5E7EB] text-[#374151] dark:bg-gray-700 dark:text-slate-200"
                    >
                      {pos}
                    </span>
                  ))
                ) : (
                  <p className="text-[12px] text-[#51617C] dark:text-[#7f7f7f]">-</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-white">
                Internship Period
              </h3>
              <p className="mt-[8px] text-[12px] leading-[1.45] text-[#51617C] dark:text-[#e5e7eb]">
                {candidate.internshipPeriod || "-"}
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-[#344164] dark:text-white">
                Preferred Locations
              </h3>
              <p className="mt-[8px] text-[12px] leading-[1.45] text-[#51617C] dark:text-[#e5e7eb]">
                {locationDisplay}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-[8px]">
            <button
              onClick={onClose}
              className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#E5E7EB] px-[22px] text-[12px] font-semibold text-[#6B7280] transition hover:bg-[#D1D5DB] dark:bg-gray-700 dark:text-slate-200 dark:hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleStartConversation}
              disabled={isStartingConversation || !candidate.id}
              className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#2563EB] px-[20px] text-[12px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStartingConversation ? "Loading..." : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
