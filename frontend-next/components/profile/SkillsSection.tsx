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
}: SkillsSectionProps) {
  const router = useRouter();

  const certSkillNames = new Set(certificates.flatMap((c) => c.tags || []));
  const projectSkillNames = new Set(
    projects.flatMap((p) => (p as any).relatedSkills || (p as any).skills || [])
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

  const YellowCheck = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 flex-shrink-0 shadow-sm">
      <svg className="w-2.5 h-2.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );

  const GreenCheck = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0 shadow-sm">
      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );

  const RedX = () => (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 flex-shrink-0 shadow-sm">
      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );

  const SkillItem = ({ skill }: { skill: Skill }) => {
    let percentage = 33.33;
    let colorClass = "bg-emerald-500";
    let textClass = "text-emerald-600 dark:text-emerald-400";

    if (skill.rating === 2 || skill.level === "Intermediate") {
      percentage = 66.66;
      colorClass = "bg-blue-500";
      textClass = "text-blue-600 dark:text-blue-400";
    } else if (skill.rating === 3 || skill.level === "Advanced") {
      percentage = 100;
      colorClass = "bg-violet-500";
      textClass = "text-violet-600 dark:text-violet-400";
    }

    const hasCertEvidence = certSkillNames.has(skill.name);
    const hasProjectEvidence = projectSkillNames.has(skill.name);
    const isVerified = skill.status?.toUpperCase() === "VERIFIED";

    return (
      <div className="mb-7 last:mb-0">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-y-2">
          <span className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight">{skill.name}</span>
          <div className="flex items-center gap-2 text-[11px] flex-wrap justify-end font-bold uppercase tracking-wider">
            {!isVerified ? (
              <>
                <Link href="/intern/skills" className="text-blue-600 dark:text-blue-400 hover:underline decoration-2 underline-offset-2">
                  Verify Skill
                </Link>
                <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
                {hasCertEvidence || hasProjectEvidence ? (
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <YellowCheck />
                    {hasCertEvidence && hasProjectEvidence ? "Evidence: All" : hasCertEvidence ? "Evidence: Cert" : "Evidence: Proj"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <RedX /> Not Verified
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <GreenCheck /> Verified By Test
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5 p-[2px]">
          <div className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${colorClass}`} style={{ width: `${percentage}%` }} />
          {/* Grids */}
          <div className="absolute inset-0 flex pointer-events-none">
            <div className="h-full w-1/3 border-r border-white/20 dark:border-slate-900/40" />
            <div className="h-full w-1/3 border-r border-white/20 dark:border-slate-900/40" />
          </div>
        </div>

        <p className={`text-[11px] font-black uppercase tracking-widest ${textClass}`}>
          Level: {skill.level || (percentage <= 33.33 ? "Beginner" : percentage <= 66.66 ? "Intermediate" : "Advanced")}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 mb-6 border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Skills</h2>
        </div>

        <button
          onClick={() => router.push("/intern/skills")}
          className="px-5 py-2.5 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          + Add/Edit Skills
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Technical Skills */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Technical Skills
          </h3>
          {technicalSkills.length > 0 ? (
            technicalSkills.map((s) => <SkillItem key={s.id} skill={s} />)
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic text-sm text-center py-4 font-medium underline underline-offset-4 decoration-dotted">
              No technical skills added
            </p>
          )}
        </div>

        {/* Business Skills */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Business / Soft Skills
          </h3>
          {businessSkills.length > 0 ? (
            businessSkills.map((s) => <SkillItem key={s.id} skill={s} />)
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic text-sm text-center py-4 font-medium underline underline-offset-4 decoration-dotted">
              No business skills added
            </p>
          )}
        </div>

        {/* Other Skills */}
        {otherSkills.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" /> Other Skills
            </h3>
            {otherSkills.map((s) => <SkillItem key={s.id} skill={s} />)}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/intern/skills"
          className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:gap-3 transition-all group"
        >
          Go to Skills Page
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}