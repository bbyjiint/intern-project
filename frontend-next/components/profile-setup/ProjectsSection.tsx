"use client";

import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { apiFetch } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Types
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Python", "Java", "C++", "SQL", "Tableau",
  "Figma", "Excel", "Power BI", "HTML/CSS",
];

export interface ProjectsSectionHandle {
  syncToDb: () => Promise<void>;
  validateAll: () => { valid: boolean; incompleteProjects: string[] };
}

interface ProjectsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
  onSkip?: () => void;
}

interface Project {
  id?: string;
  name: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  relatedSkills: string[];
  _status: "saved" | "new" | "edited" | "deleted";
  _aiTag?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// AIBadge
// ─────────────────────────────────────────────────────────────────────────────

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ml-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
      ✨ AI filled
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseDateValue(val: string): { month: number; year: number } | null {
  if (!val) return null;
  const m1 = val.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (m1) {
    const mi = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === m1[1].toLowerCase(),
    );
    if (mi !== -1) return { month: mi + 1, year: parseInt(m1[2]) };
  }
  const m2 = val.match(/^(\d{4})-(\d{2})$/);
  if (m2) return { month: parseInt(m2[2]), year: parseInt(m2[1]) };
  const m3 = val.match(/^(\d{1,2})\/(\d{4})$/);
  if (m3) return { month: parseInt(m3[1]), year: parseInt(m3[2]) };
  return null;
}

function toDisplayDate(val: string): string {
  const p = parseDateValue(val);
  if (!p) return val;
  return `${MONTH_NAMES[p.month - 1]} ${p.year}`;
}

function toInputString(val: string): string {
  const p = parseDateValue(val);
  if (!p) return "";
  return `${String(p.month).padStart(2, "0")}/${p.year}`;
}

function normaliseProject(p: any): Project {
  return {
    ...p,
    relatedSkills: p.relatedSkills ?? p.skills ?? [],
    startDate: toDisplayDate(p.startDate || ""),
    endDate: toDisplayDate(p.endDate || ""),
    _status: p._status ?? (p.id && !String(p.id).startsWith("local-") ? "saved" : "new"),
    _aiTag: p._aiTag ?? false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MonthYearPicker
// ─────────────────────────────────────────────────────────────────────────────

function MonthYearPicker({
  value,
  onChange,
  placeholder = "MM/YYYY",
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const [inputVal, setInputVal] = useState(toInputString(value));
  const [open, setOpen] = useState(false);
  const [calYear, setCalYear] = useState(
    () => parseDateValue(value)?.year ?? new Date().getFullYear(),
  );
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(toInputString(value));
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitInput = (raw: string) => {
    const p = parseDateValue(raw);
    if (p) {
      setInputVal(`${String(p.month).padStart(2, "0")}/${p.year}`);
      onChange(`${MONTH_NAMES[p.month - 1]} ${p.year}`);
    }
  };

  const selectMonth = (monthIndex: number) => {
    const display = `${MONTH_NAMES[monthIndex]} ${calYear}`;
    setInputVal(`${String(monthIndex + 1).padStart(2, "0")}/${calYear}`);
    onChange(display);
    setOpen(false);
  };

  const borderCls = hasError
    ? "border-red-500 ring-1 ring-red-400"
    : "border-gray-300 dark:border-slate-600";

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <input
          type="text"
          value={inputVal}
          readOnly
          placeholder={placeholder}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={(e) => commitInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitInput(inputVal)}
          className={`w-full px-4 py-3 pr-10 border rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderCls}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4" style={{ minWidth: 260 }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setCalYear((y) => y - 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600">
              <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-sm text-[#1C2D4F] dark:text-slate-200">{calYear}</span>
            <button type="button" onClick={() => setCalYear((y) => y + 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600">
              <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTH_NAMES.map((name, i) => {
              const p = parseDateValue(value);
              const isSelected = p && p.month === i + 1 && p.year === calYear;
              return (
                <button key={name} type="button" onClick={() => selectMonth(i)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-[#0273B1] text-white"
                      : "text-[#1C2D4F] dark:text-slate-200 hover:bg-[#E3F5FF] dark:hover:bg-slate-600"
                  }`}
                >{name}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProjectsSection
// ─────────────────────────────────────────────────────────────────────────────

const ProjectsSection = forwardRef<ProjectsSectionHandle, ProjectsSectionProps>(
  function ProjectsSection({ data, onUpdate, onSkip }, ref) {
    const [projects, setProjects] = useState<Project[]>(() =>
      (data.projects || []).map(normaliseProject),
    );
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [incompleteWarnings, setIncompleteWarnings] = useState<string[]>([]);

    const projectsRef = useRef<Project[]>(projects);
    useEffect(() => {
      projectsRef.current = projects;
    }, [projects]);

    const initializedRef = useRef(false);
    useEffect(() => {
      if (initializedRef.current) return;
      const incoming: any[] = data.projects || [];
      const hasRealData = incoming.length > 0 &&
        incoming.every((p) => p.id && !String(p.id).startsWith("local-"));
      if (!hasRealData) return;

      const normalised = incoming.map(normaliseProject);
      setProjects(normalised);
      projectsRef.current = normalised;
      initializedRef.current = true;
    }, [data.projects]);

    useImperativeHandle(ref, () => ({
      validateAll: () => {
        const visible = projectsRef.current.filter((p) => p._status !== "deleted");
        const incomplete = visible.filter(
          (p) =>
            !p.name?.trim() ||
            !p.role?.trim() ||
            !p.startDate ||
            !p.endDate ||
            !p.description?.trim() ||
            !p.relatedSkills || p.relatedSkills.length === 0
        );
        const names = incomplete.map((p) => p.name || "Untitled Project");
        if (names.length > 0) setIncompleteWarnings(names);
        return { valid: names.length === 0, incompleteProjects: names };
      },
      syncToDb: async () => {
        const current = [...projectsRef.current];
        const next = [...current];

        for (let i = 0; i < next.length; i++) {
          const p = next[i];
          const payload = {
            name: p.name,
            role: p.role,
            description: p.description || "",
            startDate: p.startDate || "",
            endDate: p.endDate || "",
            relatedSkills: p.relatedSkills || [],
          };

          if (p._status === "deleted") {
            if (p.id && !String(p.id).startsWith("local-")) {
              await apiFetch(`/api/candidates/projects/${p.id}`, { method: "DELETE" });
            }
            next[i] = { ...p, _status: "deleted" };
          } else if (p._status === "new" || String(p.id || "").startsWith("local-")) {
            const res = await apiFetch<{ project: any }>("/api/candidates/projects", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            next[i] = normaliseProject({ ...res.project, _status: "saved" });
          } else if (p._status === "edited" && p.id) {
            const res = await apiFetch<{ project: any }>(`/api/candidates/projects/${p.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            next[i] = normaliseProject({ ...res.project, _status: "saved" });
          }
        }

        const final = next.filter((p) => p._status !== "deleted");
        setProjects(final);
        projectsRef.current = final;
        onUpdate({ projects: final });
      },
    }));

    const notifyParent = (updated: Project[]) => {
      const visible = updated.filter((p) => p._status !== "deleted");
      onUpdate({ projects: visible });
    };

    const applyProjects = (updated: Project[], notify = true) => {
      setProjects(updated);
      projectsRef.current = updated;
      if (notify) notifyParent(updated);
    };

    const handleAdd = (project: Omit<Project, "_status" | "id">) => {
      const newProject: Project = {
        ...project,
        id: `local-${Date.now()}`,
        _status: "new",
        _aiTag: false,
      };
      applyProjects([newProject, ...projects]);
      setShowForm(false);
      setIncompleteWarnings([]);
    };

    const handleEdit = (index: number, project: Partial<Project>) => {
      const existing = projects[index];
      const updated = [...projects];
      updated[index] = {
        ...existing,
        ...project,
        _status: existing._status === "new" ? "new" : "edited",
        _aiTag: false,
      };
      applyProjects(updated);
      setEditingIndex(null);
      setIncompleteWarnings([]);
    };

    const handleDelete = (index: number) => {
      if (!confirm("Are you sure you want to delete this project?")) return;
      setIncompleteWarnings([]);
      const existing = projects[index];
      let updated: Project[];

      if (existing._status === "new" || String(existing.id || "").startsWith("local-")) {
        updated = projects.filter((_, i) => i !== index);
      } else {
        updated = [...projects];
        updated[index] = { ...existing, _status: "deleted" };
      }
      applyProjects(updated);
    };

    const visibleProjects = projects
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p._status !== "deleted");

    const aiProjectCount = visibleProjects.filter(({ p }) => p._aiTag).length;

    return (
      <div>
        {/* Header — Skip compact, top-right */}
        <div className="mb-3 flex items-start justify-between gap-2 md:mb-6">
          <div className="min-w-0 flex-1 pr-1">
            <h2 className="mb-0.5 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-2xl md:font-bold">
              Projects
            </h2>
            <p className="text-xs text-[#A9B4CD] dark:text-slate-400 md:text-sm">
              This step is optional — you can fill your profile information at any time.
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

        {/* Incomplete Warning Banner */}
        {incompleteWarnings.length > 0 && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-800 dark:bg-red-900/20 md:mb-5 md:gap-3 md:px-4 md:py-3 md:text-sm">
            <span className="text-base mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                กรุณาแก้ไขหรือลบ project ที่ข้อมูลไม่ครบ ก่อนบันทึก
              </p>
              <ul className="mt-1 list-disc list-inside text-red-500 dark:text-red-400">
                {incompleteWarnings.map((name, i) => (
                  <li key={i} className="text-xs">{name} — ต้องมี ชื่อ, role, วันที่, description, related skills</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* AI Autofill Banner */}
        {data._aiFilled_projects && aiProjectCount > 0 && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-700 dark:bg-indigo-900/20 md:mb-5 md:gap-3 md:px-4 md:py-3 md:text-sm">
            <span className="text-base mt-0.5">✨</span>
            <div>
              <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                AI autofilled {aiProjectCount} project{aiProjectCount > 1 ? "s" : ""} from your resume
              </p>
              <p className="mt-0.5 text-indigo-500 dark:text-indigo-400">
                Please review each project and edit if needed. Projects marked with ✨ AI filled were read from your resume.
              </p>
            </div>
          </div>
        )}

        {/* Project list */}
        <div className="space-y-3 md:space-y-4">
          {visibleProjects.map(({ p: project, i: realIndex }) =>
            editingIndex === realIndex ? (
              <ProjectForm
                key={project.id || realIndex}
                project={project}
                onSave={(p) => handleEdit(realIndex, p)}
                onCancel={() => setEditingIndex(null)}
              />
            ) : (
              <ProjectCard
                key={project.id || realIndex}
                project={project}
                onEdit={() => setEditingIndex(realIndex)}
                onDelete={() => handleDelete(realIndex)}
              />
            ),
          )}

          {showForm && (
            <ProjectForm
              project={null}
              onSave={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          )}

          {!showForm && editingIndex === null && (
            <button
              onClick={() => setShowForm(true)}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#0273B1] bg-white text-sm font-semibold text-[#0273B1] transition-colors hover:bg-[#F0F8FF] dark:border-blue-400 dark:bg-transparent dark:text-blue-400 dark:hover:bg-slate-700/50 md:h-11"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default ProjectsSection;

// ─────────────────────────────────────────────────────────────────────────────
// ProjectCard
// ─────────────────────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const skills = project.relatedSkills || [];
  const dateRange = [project.startDate, project.endDate].filter(Boolean).join(" - ");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 md:p-5">
      <div className="mb-1 flex flex-wrap items-center gap-1">
        <h4 className="text-sm font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-base md:font-bold">
          {project.name || "Project Name"} — {project.role || "Role"}
        </h4>
        {project._aiTag && <AIBadge />}
      </div>

      {dateRange ? (
        <p className="mb-2 text-xs text-gray-500 dark:text-slate-400 md:mb-3 md:text-sm">{dateRange}</p>
      ) : null}
      {project.description && (
        <p className="mb-3 text-xs leading-relaxed text-[#1C2D4F] dark:text-slate-300 md:mb-4 md:text-sm">
          {project.description}
        </p>
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, i) => (
            <span key={i} className="rounded-full bg-[#E3F5FF] px-2.5 py-0.5 text-xs font-medium text-[#0273B1] dark:bg-blue-900/30 dark:text-blue-400 md:px-3 md:py-1 md:text-sm">
              {skill}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onDelete}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 md:h-10 md:px-4 md:text-sm"
        >Delete</button>
        <button onClick={onEdit}
          className="h-9 rounded-lg bg-[#0273B1] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#025a8f] md:h-10 md:px-4 md:text-sm"
        >Edit</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProjectForm
// ─────────────────────────────────────────────────────────────────────────────

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const isEditing = !!project;

  const [fields, setFields] = useState({
    name: project?.name || "",
    role: project?.role || "",
    startDate: toDisplayDate(project?.startDate || ""),
    endDate: toDisplayDate(project?.endDate || ""),
    description: project?.description || "",
    relatedSkills: (project?.relatedSkills ?? []) as string[],
  });
  const [selectedSkill, setSelectedSkill] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const set = (field: string, value: any) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!fields.name.trim()) e.name = true;
    if (!fields.role.trim()) e.role = true;
    if (!fields.startDate) e.startDate = true;
    if (!fields.endDate) e.endDate = true;
    if (!fields.description.trim()) e.description = true;
    if (!fields.relatedSkills || fields.relatedSkills.length === 0) e.relatedSkills = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddSkill = () => {
    if (selectedSkill && !fields.relatedSkills.includes(selectedSkill)) {
      set("relatedSkills", [...fields.relatedSkills, selectedSkill]);
      setSelectedSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) =>
    set("relatedSkills", fields.relatedSkills.filter((s) => s !== skill));

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...fields });
  };

  const fieldBorder = (key: string) =>
    errors[key]
      ? "border-red-500 ring-1 ring-red-400"
      : "border-gray-300 dark:border-slate-600";

  const labelColor = (key: string) =>
    errors[key]
      ? "text-red-500"
      : "text-[#0273B1] dark:text-blue-400";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 md:p-6">
      <h4 className="mb-2 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:mb-4 md:text-lg md:font-bold">
        {isEditing ? "Edit Project" : "Add Project"}
        {isEditing && project?._aiTag && <AIBadge />}
      </h4>

      {Object.values(errors).some(Boolean) && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 md:mb-4 md:px-4 md:py-3 md:text-sm">
          Please fill in all required fields highlighted in red.
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
        {/* Name */}
        <div>
          <label className={`mb-1 block text-xs font-medium md:mb-2 ${labelColor("name")}`}>
            Project Name{errors.name && " *"}
          </label>
          <input type="text" placeholder="Project Name" value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3 ${fieldBorder("name")}`}
          />
        </div>

        {/* Role */}
        <div>
          <label className={`mb-1 block text-xs font-medium md:mb-2 ${labelColor("role")}`}>
            Role{errors.role && " *"}
          </label>
          <input type="text" placeholder="e.g. Web Developer" value={fields.role}
            onChange={(e) => set("role", e.target.value)}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3 ${fieldBorder("role")}`}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`mb-1 block text-xs font-medium md:mb-2 ${labelColor("startDate")}`}>
              Start Date{errors.startDate && " *"}
            </label>
            <MonthYearPicker value={fields.startDate} onChange={(v) => set("startDate", v)} hasError={errors.startDate} />
          </div>
          <div>
            <label className={`mb-1 block text-xs font-medium md:mb-2 ${labelColor("endDate")}`}>
              End Date{errors.endDate && " *"}
            </label>
            <MonthYearPicker value={fields.endDate} onChange={(v) => set("endDate", v)} hasError={errors.endDate} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={`mb-1 block text-xs font-medium md:mb-2 ${labelColor("description")}`}>
            Description{errors.description && " *"}
          </label>
          <textarea placeholder="Description about your project" value={fields.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3 ${fieldBorder("description")}`}
          />
        </div>

        {/* Skills */}
        <div>
          <label className={`mb-1 block text-xs font-medium md:mb-2 ${labelColor("relatedSkills")}`}>
            Related Skills{errors.relatedSkills && " *"}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 md:px-4 md:py-3"
              >
                <option value="">Select skill</option>
                {SKILL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button onClick={handleAddSkill}
              className="h-9 shrink-0 rounded-lg bg-[#E3F5FF] px-3 text-xs font-semibold text-[#0273B1] transition-colors hover:bg-[#0273B1] hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 md:h-10 md:px-4 md:text-sm"
            >Add</button>
          </div>
          {errors.relatedSkills && (
            <p className="text-xs mt-1 text-red-500 dark:text-red-400">กรุณาเพิ่มอย่างน้อย 1 skill</p>
          )}
          {fields.relatedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {fields.relatedSkills.map((skill, i) => (
                <span key={i} className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E3F5FF] dark:bg-blue-900/30 text-[#0273B1] dark:text-blue-400">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:opacity-60">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1 md:pt-2">
          <button onClick={onCancel}
            className="h-9 rounded-lg bg-gray-100 px-3 text-xs font-semibold text-[#1C2D4F] transition-colors hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 md:h-10 md:px-4 md:text-sm"
          >Cancel</button>
          <button onClick={handleSubmit}
            className="h-9 rounded-lg bg-[#0273B1] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#025a8f] md:h-10 md:px-4 md:text-sm"
          >{isEditing ? "Save Changes" : "Add Project"}</button>
        </div>
      </div>
    </div>
  );
}