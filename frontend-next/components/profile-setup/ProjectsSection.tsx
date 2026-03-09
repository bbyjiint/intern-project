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
    : "border-gray-300";

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputVal}
          placeholder={placeholder}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={(e) => commitInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitInput(inputVal)}
          className={`w-full px-4 py-3 pr-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderCls}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4" style={{ minWidth: 260 }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setCalYear((y) => y - 1)} className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-sm" style={{ color: "#1C2D4F" }}>{calYear}</span>
            <button type="button" onClick={() => setCalYear((y) => y + 1)} className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: isSelected ? "#0273B1" : "transparent", color: isSelected ? "#fff" : "#1C2D4F" }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#E3F5FF"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
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

    // Always keep ref in sync — prevents stale closure in syncToDb
    const projectsRef = useRef<Project[]>(projects);
    useEffect(() => {
      projectsRef.current = projects;
    }, [projects]);

    // Sync from parent only once when real DB data arrives
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
      // NOTE: do NOT call onUpdate here — this is a read-only sync, not a user edit
    }, [data.projects]);

    // ── syncToDb: persist all pending changes ────────────────────────────────

    useImperativeHandle(ref, () => ({
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

    // ── Local CRUD (optimistic, no API) ──────────────────────────────────────

    // FIX: notifyParent is only called on explicit user actions, not on init
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
      };
      applyProjects([newProject, ...projects]);
      setShowForm(false);
    };

    const handleEdit = (index: number, project: Partial<Project>) => {
      const existing = projects[index];
      const updated = [...projects];
      updated[index] = {
        ...existing,
        ...project,
        _status: existing._status === "new" ? "new" : "edited",
      };
      applyProjects(updated);
      setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
      if (!confirm("Are you sure you want to delete this project?")) return;
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

    return (
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1C2D4F", fontWeight: 700 }}>
              Projects
            </h2>
            <p className="text-sm" style={{ color: "#A9B4CD" }}>
              This step is optional — you can fill your profile information at any time.
            </p>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{ border: "2px solid #0273B1", color: "#0273B1", backgroundColor: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F0F4F8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              Skip &gt;
            </button>
          )}
        </div>

        {/* Project list */}
        <div className="space-y-4">
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
              className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              style={{ border: "2px dashed #0273B1", color: "#0273B1", backgroundColor: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F0F8FF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
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
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <h4 className="font-bold text-base mb-1" style={{ color: "#1C2D4F" }}>
        {project.name || "Project Name"} — {project.role || "Role"}
      </h4>
      <p className="text-sm mb-3" style={{ color: "#6B7280" }}>
        Role: {project.role || "—"}{dateRange ? ` | ${dateRange}` : ""}
      </p>
      {project.description && (
        <p className="text-sm mb-4" style={{ color: "#1C2D4F", lineHeight: "1.6" }}>
          {project.description}
        </p>
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#E3F5FF", color: "#0273B1" }}>
              {skill}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onDelete}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ backgroundColor: "white", border: "1.5px solid #D1D5DB", color: "#374151" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
        >Delete</button>
        <button onClick={onEdit}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "#0273B1" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#025a8f"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; }}
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
    relatedSkills: (project?.relatedSkills ?? project?.relatedSkills ?? []) as string[],
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
    errors[key] ? "border-red-500 ring-1 ring-red-400" : "border-gray-300";

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h4 className="text-lg font-bold mb-4" style={{ color: "#1C2D4F" }}>
        {isEditing ? "Edit Project" : "Add Project"}
      </h4>

      {Object.values(errors).some(Boolean) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please fill in all required fields highlighted in red.
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: errors.name ? "#EF4444" : "#0273B1" }}>
            Project Name{errors.name && " *"}
          </label>
          <input type="text" placeholder="Project Name" value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldBorder("name")}`}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: errors.role ? "#EF4444" : "#0273B1" }}>
            Role{errors.role && " *"}
          </label>
          <input type="text" placeholder="e.g. Web Developer" value={fields.role}
            onChange={(e) => set("role", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldBorder("role")}`}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: errors.startDate ? "#EF4444" : "#0273B1" }}>
              Start Date{errors.startDate && " *"}
            </label>
            <MonthYearPicker value={fields.startDate} onChange={(v) => set("startDate", v)} hasError={errors.startDate} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: errors.endDate ? "#EF4444" : "#0273B1" }}>
              End Date{errors.endDate && " *"}
            </label>
            <MonthYearPicker value={fields.endDate} onChange={(v) => set("endDate", v)} hasError={errors.endDate} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: errors.description ? "#EF4444" : "#0273B1" }}>
            Description{errors.description && " *"}
          </label>
          <textarea placeholder="Description about your project" value={fields.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${fieldBorder("description")}`}
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "#0273B1" }}>Related Skills</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
              >
                <option value="">Select skill</option>
                {SKILL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button onClick={handleAddSkill}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#E3F5FF", color: "#0273B1" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#E3F5FF"; e.currentTarget.style.color = "#0273B1"; }}
            >Add</button>
          </div>
          {fields.relatedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {fields.relatedSkills.map((skill, i) => (
                <span key={i} className="flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "#E3F5FF", color: "#0273B1" }}>
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:opacity-60">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel}
            className="px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ backgroundColor: "#F3F4F6", color: "#1C2D4F" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
          >Cancel</button>
          <button onClick={handleSubmit}
            className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: "#0273B1" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#025a8f"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; }}
          >{isEditing ? "Save Changes" : "Add Project"}</button>
        </div>
      </div>
    </div>
  );
}