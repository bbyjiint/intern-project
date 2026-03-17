"use client";

import { useState, useMemo, useEffect } from "react";
import { ProfileData } from "@/hooks/useProfile";
import PersonalModal from "./PersonalModal";

interface PersonalInfoCardProps {
  profile: ProfileData;
  onRefresh?: () => void;
}

export default function PersonalInfoCard({
  profile,
  onRefresh,
}: PersonalInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const stats = useMemo(() => {
    const skills = profile.skills || [];
    const projects = profile.projects || [];
    const certificates = profile.certificates || [];

    const educationVerified = false;

    const certSkillNames = new Set(certificates.flatMap((c) => c.tags || []));
    const projectSkillNames = new Set(
      projects.flatMap((p) => (p as any).relatedSkills || (p as any).skills || []),
    );

    // 1. คำนวณจำนวน Skill ที่สอบผ่านแล้ว
    const verifiedSkillTest = skills.filter(
      (s) => s.status?.toUpperCase() === "VERIFIED"
    ).length;

    const verifiedCertificate = skills.filter((s) =>
      certSkillNames.has(s.name),
    ).length;

    const verifiedProject = skills.filter((s) =>
      projectSkillNames.has(s.name),
    ).length;

    // 2. อัปเดตเงื่อนไข Not Verified (ต้องไม่มีทั้ง ใบเซอร์, โปรเจกต์ และไม่ได้สอบผ่าน)
    const notVerifiedSkills = skills.filter(
      (s) => 
        !certSkillNames.has(s.name) && 
        !projectSkillNames.has(s.name) && 
        s.status?.toUpperCase() !== "VERIFIED"
    ).length;

    const projectUploaded = projects.filter((p) => !!(p as any).fileUrl || !!(p as any).githubUrl || !!(p as any).projectUrl).length; // อัปเดตนับรวม github/link ด้วย
    const projectNoFile = projects.length - projectUploaded;

    const badgeStatus =
      educationVerified && verifiedCertificate > 0 && projectUploaded > 0
        ? "Verified"
        : educationVerified || verifiedCertificate > 0 || projectUploaded > 0 || verifiedSkillTest > 0
          ? "Partially Verified"
          : "Not Verified";

    return {
      verifiedSkillTest,
      verifiedCertificate,
      verifiedProject,
      notVerifiedSkills,
      projectUploaded,
      projectNoFile,
      educationVerified,
      badgeStatus,
    };
  }, [profile]);

  // แสดงชื่อย่อจาก fullName เช่น "Natnicha Inkongngam" → "NI"
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  const hasProfileImage = !!profile.profileImage;
  const initials = getInitials(profile.fullName || "");

  // เปลี่ยนจาก "Candidate" เป็น "Position of interest"
  const displayRoles = profile.preferredPositions?.length
    ? profile.preferredPositions
    : ["+ Position of interest"];

  const prefix = profile.gender?.toLowerCase() === "female" ? "Ms." : "Mr.";

  const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
    Verified: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", border: "border-[#DCFCE7]" },
    "Partially Verified": { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", border: "border-[#FEF3C7]" },
    "Not Verified": { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", border: "border-[#FEE2E2]" },
  };
  const badge = badgeStyles[stats.badgeStatus];

  const GreenCheck = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#B2CD6D] flex-shrink-0 ml-0.5">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );

  const YellowCheck = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FFC456] flex-shrink-0 ml-0.5">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );

  const RedX = () => (
    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100 relative">
        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-6 right-8 px-5 py-1.5 rounded-lg font-bold text-sm border border-blue-400 text-blue-500 hover:bg-blue-50 transition-all"
        >
          Edit
        </button>

        {/* Profile Header Section */}
        <div className="flex items-start gap-6 mb-6">
          {/* แสดงชื่อย่อถ้าไม่มีรูปโปรไฟล์ */}
          {hasProfileImage ? (
            <img
              src={
                profile.profileImage!.startsWith("http")
                  ? profile.profileImage!
                  : `http://localhost:5001${profile.profileImage}`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover shadow-sm bg-slate-50 flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-600 text-white text-2xl font-bold shadow-sm select-none">
              {initials || "?"}
            </div>
          )}

          <div className="pt-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {profile.fullName
                ? `${prefix} ${profile.fullName}`
                : "Candidate Name"}
            </h2>
            <div className="flex flex-col text-slate-400 text-sm space-y-0.5">
              <span>
                Phone:{" "}
                {(() => {
                  const digits = (profile.phoneNumber || "")
                    .replace(/\D/g, "")
                    .slice(0, 10);
                  if (digits.length > 6)
                    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
                  if (digits.length > 3)
                    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
                  return digits || "-";
                })()}
              </span>
              <span>Email: {profile.contactEmail || "-"}</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-4xl">
          {profile.bio || "No description provided."}
        </p>

        {/* Position of interest Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {displayRoles.map((role, idx) => (
            <span
              key={idx}
              className="px-4 py-1.5 bg-[#E2E8F0] text-slate-700 text-xs font-bold rounded-md"
            >
              {role}
            </span>
          ))}
        </div>

        {/* Profile Completion Bar */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-sm font-bold text-slate-900">
            Profile Completion:
          </span>
          <div className="bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full min-w-[70px] text-center">
            100/100
          </div>
        </div>

        {/* AI Validation Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h3 className="font-bold text-slate-800">AI Validation Status</h3>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 ${badge.bg} ${badge.text} border ${badge.border} rounded-full text-xs font-bold`}
            >
              {stats.badgeStatus === "Not Verified" ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {stats.badgeStatus}
            </span>
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Education Row */}
            <div className="flex items-start gap-4">
              <span className="w-20 text-slate-400 font-medium text-sm pt-0.5">
                Education
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {stats.educationVerified ? (
                  <><GreenCheck /> Verified</>
                ) : (
                  <><RedX /> Not Verified</>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Skills Row */}
            <div className="flex items-start gap-4">
              <span className="w-20 text-slate-400 font-medium text-sm pt-0.5">
                Skills
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GreenCheck />
                  {stats.verifiedSkillTest} Verified By Skill Test
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <YellowCheck />
                  {stats.verifiedCertificate} Evidence By Certificate
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <YellowCheck />
                  {stats.verifiedProject} Evidence By Project
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <RedX />
                  {stats.notVerifiedSkills} Not Verified
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Project Row */}
            <div className="flex items-start gap-4">
              <span className="w-20 text-slate-400 font-medium text-sm pt-0.5">
                Project
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GreenCheck />
                  {stats.projectUploaded} File Uploaded
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <RedX />
                  {stats.projectNoFile} No File Uploaded
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PersonalModal
        isOpen={isModalOpen}
        profile={profile}
        onClose={() => setIsModalOpen(false)}
        onSave={async () => {
          if (onRefresh) await onRefresh();
        }}
      />
    </>
  );
}