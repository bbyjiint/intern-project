"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import SearchableDropdown from "@/components/SearchableDropdown";
import { apiFetch } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

interface Skill {
  name: string;
  category: "technical" | "business" | string;
  level: "beginner" | "intermediate" | "advanced" | string;
  usedIn?: { educationIds?: number[]; projectIds?: number[] };
  _aiTag?: boolean;
}

interface Step3Props {
  data: any;
  onUpdate: (data: any) => void;
  onSkip?: () => void;
}

const LEVEL_CONFIG = {
  beginner: {
    label: "Beginner",
    desc: "Learning basics, needs guidance",
    color: "#10B981",
    bg: "#F0FDF4",
    darkBg: "rgba(16,185,129,0.15)",
    border: "border-green-500",
    bars: [true, false, false],
  },
  intermediate: {
    label: "Intermediate",
    desc: "Can work independently",
    color: "#3B82F6",
    bg: "#EFF6FF",
    darkBg: "rgba(59,130,246,0.15)",
    border: "border-blue-500",
    bars: [true, true, false],
  },
  advanced: {
    label: "Advanced",
    desc: "Can mentor others",
    color: "#9333EA",
    bg: "#F3E8FF",
    darkBg: "rgba(147,51,234,0.15)",
    border: "border-purple-500",
    bars: [true, true, true],
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// AIBadge
// ─────────────────────────────────────────────────────────────────────────────

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ml-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
      ✨ AI filled
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step3SkillsProjects
// ─────────────────────────────────────────────────────────────────────────────

export default function Step3SkillsProjects({
  data,
  onUpdate,
  onSkip,
}: Step3Props) {
  const [skills, setSkills] = useState<Skill[]>(data.skills || []);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    const incoming = data.skills || [];
    if (incoming.length === 0) return;
    setSkills(incoming);
    initializedRef.current = true;
  }, [data.skills]);

  const applySkills = (updated: Skill[]) => {
    setSkills(updated);
    onUpdate({ skills: updated });
  };

  const handleAdd = (skill: Skill) => {
    applySkills([...skills, skill]);
    setShowForm(false);
  };
  const handleEdit = (index: number, skill: Skill) => {
    const u = [...skills];
    u[index] = skill;
    applySkills(u);
    setEditingIndex(null);
  };
  const handleDelete = (index: number) => {
    applySkills(skills.filter((_, i) => i !== index));
  };

  const technical = skills.filter((s) => s.category === "technical");
  const business = skills.filter((s) => s.category === "business");

  const aiSkillsNeedingReview = skills.filter(
    (s) => s._aiTag && !s.level,
  ).length;

  return (
    <div>
      {/* Header — Skip compact, top-right */}
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-6">
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="mb-0.5 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-2xl md:font-bold">
            Skills
          </h2>
          <p className="text-xs text-[#A9B4CD] dark:text-slate-400 md:text-sm">
            This step is optional — you can fill your profile information at any
            time.
          </p>
        </div>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 rounded-md border border-[#0273B1] bg-white px-2 py-1 text-xs font-semibold leading-none text-[#0273B1] transition-colors hover:bg-[#F0F4F8] dark:border-blue-400 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
          >
            Skip &gt;
          </button>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 md:p-6">
        {showForm || editingIndex !== null ? (
          <SkillForm
            skill={editingIndex !== null ? skills[editingIndex] : null}
            education={data.education}
            projects={data.projects}
            onSave={(skill) =>
              editingIndex !== null
                ? handleEdit(editingIndex, skill)
                : handleAdd(skill)
            }
            onCancel={() => {
              setShowForm(false);
              setEditingIndex(null);
            }}
          />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between md:mb-5">
              <h3 className="text-sm font-semibold text-[#0273B1] dark:text-blue-400 md:text-lg md:font-bold">
                Skills
              </h3>
              <button
                onClick={() => setShowForm(true)}
                className="h-9 rounded-lg bg-[#E3F5FF] px-3 text-xs font-semibold text-[#0273B1] transition-colors hover:bg-[#0273B1] hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 md:h-10 md:px-4 md:text-sm"
              >
                + Add Skill
              </button>
            </div>

            {/* AI Autofill Banner */}
            {data._aiFilled_skills && skills.length > 0 && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-700 dark:bg-indigo-900/20 md:mb-5 md:gap-3 md:px-4 md:py-3 md:text-sm">
                <span className="text-base mt-0.5">✨</span>
                <div>
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                    AI autofilled {skills.length} skill
                    {skills.length > 1 ? "s" : ""} from your resume
                  </p>
                  {aiSkillsNeedingReview > 0 ? (
                    <p className="mt-0.5 text-indigo-500 dark:text-indigo-400">
                      {aiSkillsNeedingReview} skill
                      {aiSkillsNeedingReview > 1 ? "s" : ""} still need
                      {aiSkillsNeedingReview === 1 ? "s" : ""} a proficiency
                      level — click <strong>Edit</strong> to set it.
                    </p>
                  ) : (
                    <p className="mt-0.5 text-indigo-500 dark:text-indigo-400">
                      Please review and adjust proficiency levels as needed.
                    </p>
                  )}
                </div>
              </div>
            )}

            <SkillGroup
              title="Technical Skills"
              skills={technical}
              allSkills={skills}
              education={data.education}
              projects={data.projects}
              onEdit={(i) => setEditingIndex(i)}
              onDelete={handleDelete}
            />

            <div className="mt-4 md:mt-6">
              <SkillGroup
                title="Business Skills"
                skills={business}
                allSkills={skills}
                education={data.education}
                projects={data.projects}
                onEdit={(i) => setEditingIndex(i)}
                onDelete={handleDelete}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillGroup
// ─────────────────────────────────────────────────────────────────────────────

function SkillGroup({
  title,
  skills,
  allSkills,
  education,
  projects,
  onEdit,
  onDelete,
}: {
  title: string;
  skills: Skill[];
  allSkills: Skill[];
  education: any[];
  projects: any[];
  onEdit: (i: number) => void;
  onDelete: (i: number) => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-[#1C2D4F] dark:text-slate-200 md:mb-3 md:text-base">
        {title}
      </h4>
      {skills.length === 0 ? (
        <p className="text-xs text-[#A9B4CD] dark:text-slate-500 md:text-sm">
          No {title.toLowerCase()} added yet.
        </p>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {skills.map((skill) => {
            const originalIndex = allSkills.indexOf(skill);
            return (
              <SkillItem
                key={originalIndex}
                skill={skill}
                education={education}
                projects={projects}
                onEdit={() => onEdit(originalIndex)}
                onDelete={() => onDelete(originalIndex)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillItem
// ─────────────────────────────────────────────────────────────────────────────

function SkillItem({
  skill,
  education,
  projects,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  education: any[];
  projects: any[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg = LEVEL_CONFIG[skill.level as keyof typeof LEVEL_CONFIG];

  const linkedToText = (() => {
    const { educationIds = [], projectIds = [] } = skill.usedIn || {};
    const items: string[] = [];
    educationIds.forEach((i: number) => {
      const e = education?.[i];
      if (e) items.push(e.university || e.institution || `Education ${i + 1}`);
    });
    projectIds.forEach((i: number) => {
      const p = projects?.[i];
      if (p) items.push(p.name || `Project ${i + 1}`);
    });
    return items.length > 0 ? items.join(", ") : null;
  })();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700 md:p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <span className="text-sm font-semibold text-[#1C2D4F] dark:text-slate-100">
              {skill.name}
            </span>
            {skill._aiTag && <AIBadge />}
          </div>

          {linkedToText && (
            <div className="text-xs mb-2 text-[#A9B4CD] dark:text-slate-400">
              Linked to: {linkedToText}
            </div>
          )}

          {cfg ? (
            <>
              <div className="flex gap-1 mb-1">
                {cfg.bars.map((filled, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${!filled ? "bg-gray-200 dark:bg-slate-500" : ""}`}
                    style={filled ? { backgroundColor: cfg.color } : undefined}
                  />
                ))}
              </div>
              <div className="text-xs text-[#A9B4CD] dark:text-slate-400">
                {cfg.label} — {cfg.desc}
              </div>
            </>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
              ⚠ Proficiency level not set — click Edit to add
            </div>
          )}
        </div>

        <div className="ml-2 flex shrink-0 gap-1.5 md:ml-4 md:gap-2">
          <button
            onClick={onEdit}
            className="h-8 rounded border border-[#0273B1] bg-white px-2 text-xs font-semibold text-[#0273B1] transition-colors hover:bg-[#E3F5FF] dark:border-blue-400 dark:bg-slate-600 dark:text-blue-400 dark:hover:bg-blue-900/30 md:h-9 md:px-3 md:text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="h-8 rounded border border-red-400 bg-white px-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-50 dark:bg-slate-600 dark:hover:bg-red-900/20 md:h-9 md:px-3 md:text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillForm
// ─────────────────────────────────────────────────────────────────────────────

function SkillForm({
  skill,
  education,
  projects,
  onSave,
  onCancel,
}: {
  skill: Skill | null;
  education: any[];
  projects: any[];
  onSave: (skill: Skill) => void;
  onCancel: () => void;
}) {
  const isEditing = !!skill;

  const [fields, setFields] = useState<Skill>({
    name: skill?.name || "",
    category: skill?.category || "",
    level: skill?.level || "",
    usedIn: skill?.usedIn || { educationIds: [], projectIds: [] },
    _aiTag: skill?._aiTag || false,
  });
  const [allSkills, setAllSkills] = useState<{ id: string; name: string; category?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch<{ skills: { id: string; name: string }[] }>(
          "/api/skills",
        );
        if (!cancelled) setAllSkills(res.skills || []);
      } catch {
        if (!cancelled) setAllSkills([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: keyof Skill, value: any) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const toggleLinked = (type: "educationIds" | "projectIds", index: number) => {
    const current = fields.usedIn?.[type] || [];
    const updated = current.includes(index)
      ? current.filter((id: number) => id !== index)
      : [...current, index];
    setFields((prev) => ({
      ...prev,
      usedIn: { ...prev.usedIn, [type]: updated },
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    set("category", e.target.value);
    set("name", ""); 
  };

  const filteredSkills = useMemo(() => {
    if (!fields.category) return [];
    return allSkills.filter(s => 
      !s.category || s.category.toLowerCase() === fields.category.toLowerCase()
    );
  }, [allSkills, fields.category]);

  const handleSubmit = () => {
    if (!fields.name || !fields.category || !fields.level) return;
    onSave({ ...fields, _aiTag: isEditing ? false : fields._aiTag });
  };

  return (
    <div>
      <h4 className="mb-3 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:mb-6 md:text-lg md:font-bold">
        {isEditing ? "Edit Skill" : "Add Skill"}
        {isEditing && skill?._aiTag && <AIBadge />}
      </h4>

      <div className="space-y-4 md:space-y-6">
        {/* Skill Name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#0273B1] dark:text-blue-400 md:mb-2">
            Skill Name
          </label>
          {!fields.category ? (
            <div className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-500 md:px-4 md:py-3">
              Loading skills...
            </div>
          ) : (
            <SearchableDropdown
              options={filteredSkills.map((s) => ({
                value: s.name,
                label: s.name,
              }))}
              value={fields.name}
              onChange={(v: any) => set("name", v)}
              placeholder="Select skill"
              className="w-full"
              allOptionLabel="Select skill"
            />
          )}
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#0273B1] dark:text-blue-400 md:mb-2">
            Category
          </label>
          <div className="relative">
            <select
              value={fields.category}
              onChange={handleCategoryChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
            >
              <option value="" disabled>Select category</option>
              <option value="technical">Technical Skills</option>
              <option value="business">Business Skills</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Proficiency Level */}
        <div>
          <label className="mb-2 block text-xs font-medium text-[#0273B1] dark:text-blue-400 md:mb-3">
            Proficiency Level
          </label>
          <div className="space-y-2 md:space-y-3">
            {(
              Object.entries(LEVEL_CONFIG) as [
                string,
                (typeof LEVEL_CONFIG)[keyof typeof LEVEL_CONFIG],
              ][]
            ).map(([key, cfg], num) => {
              const isSelected = fields.level === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("level", key)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all md:p-4 ${isSelected ? cfg.border : "border-gray-200 dark:border-slate-600"}`}
                  style={{ backgroundColor: isSelected ? cfg.bg : undefined }}
                  // Apply darkBg via inline style only when selected in dark mode isn't possible purely via Tailwind with dynamic colors,
                  // so we rely on the light bg + Tailwind dark overlay
                >
                  <div className="mb-1.5 flex items-center gap-2 md:mb-2 md:gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold text-white md:h-10 md:w-10 md:text-lg"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {num + 1}
                    </div>
                    <span className="text-sm font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-base">
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {cfg.bars.map((filled, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${!filled ? "bg-gray-200 dark:bg-slate-500" : ""}`}
                        style={
                          filled ? { backgroundColor: cfg.color } : undefined
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 md:text-sm">
                    {cfg.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 md:pt-6">
        <button
          onClick={onCancel}
          className="h-9 rounded-lg bg-white px-4 text-xs font-semibold text-[#1C2D4F] transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 md:h-10 md:px-6 md:text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="h-9 rounded-lg bg-[#0273B1] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#025a8f] md:h-10 md:px-6 md:text-sm"
        >
          {isEditing ? "Save Changes" : "Add Skill"}
        </button>
      </div>
    </div>
  );
}
