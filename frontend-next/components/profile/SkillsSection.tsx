"use client";

import { Skill, Certificate, Project } from "@/hooks/useProfile";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SkillsSectionProps {
  skills: Skill[];
  certificates?: Certificate[];
  projects?: Project[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onRefresh?: () => void;
}

export default function SkillsSection({
  skills,
  certificates = [],
  projects = [],
  onAdd,
  onEdit,
  onRefresh,
}: SkillsSectionProps) {
  const router = useRouter();

  const certSkillNames = new Set(certificates.flatMap((c) => c.tags || []));
  const projectSkillNames = new Set(
    projects.flatMap(
      (p) => (p as any).relatedSkills || (p as any).skills || [],
    ),
  );

  const technicalSkills = skills.filter((s) => {
    const cat = (s.category || "").toUpperCase();
    return cat.includes("TECH") || cat === "";
  });

  const businessSkills = skills.filter((s) => {
    const cat = (s.category || "").toUpperCase();
    return cat.includes("BUSI") || cat.includes("SOFT");
  });

  const otherSkills = skills.filter((s) => {
    const cat = (s.category || "").toUpperCase();
    return (
      !cat.includes("TECH") &&
      cat !== "" &&
      !cat.includes("BUSI") &&
      !cat.includes("SOFT")
    );
  });

  // ── ไอคอนวงกลมสีเหลือง (w-4 h-4) ──
  const YellowCheck = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FFC456] flex-shrink-0">
      <svg
        className="w-2.5 h-2.5 text-white"
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
  );

  // ── ไอคอนวงกลมสีเขียว (w-4 h-4) ──
  const GreenCheck = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#B2CD6D] flex-shrink-0">
      <svg
        className="w-2.5 h-2.5 text-white"
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
  );

  // ── ไอคอนวงกลมสีแดง (w-4 h-4) ──
  const RedX = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-400 flex-shrink-0">
      <svg
        className="w-2.5 h-2.5 text-white"
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

  const SkillItem = ({ skill }: { skill: Skill }) => {
    let percentage = 33.33;
    let color = "#68B383";

    if (skill.rating === 2 || skill.level === "Intermediate") {
      percentage = 66.66;
      color = "#3B82F6";
    } else if (skill.rating === 3 || skill.level === "Advanced") {
      percentage = 100;
      color = "#8B5CF6";
    }

    const hasCertEvidence = certSkillNames.has(skill.name);
    const hasProjectEvidence = projectSkillNames.has(skill.name);
    const isVerified = skill.status?.toUpperCase() === "VERIFIED";

    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-y-1">
          <span className="font-bold text-gray-900">{skill.name}</span>
          <div className="flex items-center gap-2 text-xs flex-wrap justify-end">
            {!isVerified ? (
              <>
                <Link
                  href="/intern/skills"
                  className="text-blue-600 hover:underline font-medium"
                >
                  &gt;&gt; Click here to Verified Skill
                </Link>
                {hasCertEvidence && hasProjectEvidence ? (
                  <span className="flex items-center gap-1 text-[#6B7280] font-medium">
                    <YellowCheck />
                    Evidence By Project & Certificate
                  </span>
                ) : hasCertEvidence ? (
                  <span className="flex items-center gap-1 text-[#6B7280] font-medium">
                    <YellowCheck />
                    Evidence By Certificate
                  </span>
                ) : hasProjectEvidence ? (
                  <span className="flex items-center gap-1 text-[#6B7280] font-medium">
                    <YellowCheck />
                    Evidence By Project
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#6B7280] font-medium">
                    <RedX />
                    Not Verified
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-[#6B7280] font-medium">
                <GreenCheck />
                Verified By Skill Test
              </span>
            )}
          </div>
        </div>

        <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1 flex">
          <div className="absolute inset-0 flex">
            <div className="h-full w-1/3 border-r border-white/50 z-20"></div>
            <div className="h-full w-1/3 border-r border-white/50 z-20"></div>
            <div className="h-full w-1/3 z-20"></div>
          </div>
          <div
            className="h-full rounded-full transition-all duration-500 relative z-10"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>

        <p className="text-[12px] font-medium mt-1" style={{ color: color }}>
          Level:{" "}
          {skill.level ||
            (percentage <= 33.33
              ? "Beginner"
              : percentage <= 66.66
                ? "Intermediate"
                : "Advanced")}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900">Skills</h2>
        </div>

        <button
          onClick={() => router.push("/intern/skills")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-100 active:scale-95"
        >
          + Add/Edit Skills
        </button>
      </div>

      <div className="space-y-4">
        {/* Technical Skills */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Technical Skills
          </h3>
          {technicalSkills.length > 0 ? (
            technicalSkills.map((s) => <SkillItem key={s.id} skill={s} />)
          ) : (
            <p className="text-gray-400 italic text-sm text-center">
              No technical skills added
            </p>
          )}
        </div>

        {/* Business Skills */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Business / Soft Skills
          </h3>
          {businessSkills.length > 0 ? (
            businessSkills.map((s) => <SkillItem key={s.id} skill={s} />)
          ) : (
            <p className="text-gray-400 italic text-sm text-center">
              No business skills added
            </p>
          )}
        </div>

        {/* Other Skills */}
        {otherSkills.length > 0 && (
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Other Skills
            </h3>
            {otherSkills.map((s) => (
              <SkillItem key={s.id} skill={s} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-gray-50 pt-4">
        <Link
          href="/intern/skills"
          className="text-blue-600 font-bold text-sm inline-flex items-center gap-2 hover:underline group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          Go to Skills Page
        </Link>
      </div>
    </div>
  );
}