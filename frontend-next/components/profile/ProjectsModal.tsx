'use client'

import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/api'

export interface ProjectData {
  id?: string
  name: string
  role?: string
  description?: string
  startDate?: string
  endDate?: string
  linkedToExperience?: string
  relatedSkills: string[]
  githubUrl?: string
  projectUrl?: string
}

interface ProjectsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: ProjectData) => void
  editingProject?: ProjectData | null
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseDateValue(val: string): { month: number; year: number } | null {
  if (!val) return null;
  const m1 = val.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (m1) {
    const mi = MONTH_NAMES.findIndex((m) => m.toLowerCase() === m1[1].toLowerCase());
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

// ─────────────────────────────────────────────────────────────────────────────
// MonthYearPicker (Dark Mode Supported)
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

  useEffect(() => { setInputVal(toInputString(value)); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
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
    : "border-gray-200 dark:border-gray-700";

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
          className={`w-full px-4 py-3 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${borderCls}`}
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-[110] mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200" style={{ minWidth: 280 }}>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setCalYear((y) => y - 1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-black text-gray-900 dark:text-white tracking-tight">{calYear}</span>
            <button type="button" onClick={() => setCalYear((y) => y + 1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTH_NAMES.map((name, i) => {
              const p = parseDateValue(value);
              const isSelected = p && p.month === i + 1 && p.year === calYear;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectMonth(i)}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
interface MasterSkill { id: string; name: string; }

export default function ProjectsModal({ isOpen, onClose, onSave, editingProject }: ProjectsModalProps) {
  const [formData, setFormData] = useState<ProjectData>({ name: '', role: '', startDate: '', endDate: '', description: '', relatedSkills: [], githubUrl: '', projectUrl: '' })
  const [selectedSkill, setSelectedSkill] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [availableSkills, setAvailableSkills] = useState<MasterSkill[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (editingProject) {
        setFormData({ ...editingProject, startDate: toDisplayDate(editingProject.startDate || ''), endDate: toDisplayDate(editingProject.endDate || ''), relatedSkills: editingProject.relatedSkills || (editingProject as any).skills || [] })
      } else {
        setFormData({ name: '', role: '', startDate: '', endDate: '', description: '', relatedSkills: [], githubUrl: '', projectUrl: '' })
      }
      setErrorMsg('')
    }
  }, [editingProject, isOpen])

  useEffect(() => {
    if (isOpen && availableSkills.length === 0) {
      const fetchMasterSkills = async () => {
        try {
          setIsLoadingSkills(true)
          const data = await apiFetch<{ skills: MasterSkill[] }>('/api/skills')
          setAvailableSkills(data.skills || [])
        } catch (error) { console.error(error) } finally { setIsLoadingSkills(false) }
      }
      fetchMasterSkills()
    }
  }, [isOpen, availableSkills.length])

  const handleAddSkill = () => {
    if (selectedSkill && !formData.relatedSkills.includes(selectedSkill)) {
      setFormData(prev => ({ ...prev, relatedSkills: [...prev.relatedSkills, selectedSkill] }))
      setSelectedSkill(''); setErrorMsg('')
    }
  }

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.role?.trim() || !formData.startDate?.trim() || !formData.endDate?.trim() || !formData.description?.trim()) {
      setErrorMsg('Please fill in all required fields.'); return
    }
    if (formData.relatedSkills.length === 0) {
      setErrorMsg('Please add at least one related skill.'); return
    }
    onSave({ ...formData, startDate: toDisplayDate(formData.startDate || ''), endDate: toDisplayDate(formData.endDate || '') })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide bg-white dark:bg-gray-900">
          {errorMsg && (
            <div className="p-4 mb-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Project Name *</label>
              <input
                type="text"
                placeholder="Ex. E-commerce Platform"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Role *</label>
              <input
                type="text"
                placeholder="Ex. Lead Frontend Developer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Start Date *</label>
              <MonthYearPicker value={formData.startDate || ''} onChange={(v) => setFormData(prev => ({ ...prev, startDate: v }))} />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">End Date *</label>
              <MonthYearPicker value={formData.endDate || ''} onChange={(v) => setFormData(prev => ({ ...prev, endDate: v }))} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Description *</label>
              <textarea
                rows={4}
                placeholder="Describe what you built and your achievements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Related Skills *</label>
              <div className="flex gap-3">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  disabled={isLoadingSkills}
                >
                  <option value="">{isLoadingSkills ? "Loading..." : "Select skill"}</option>
                  {availableSkills.map(skill => <option key={skill.id} value={skill.name}>{skill.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-xl bg-blue-50 dark:bg-blue-900/30 px-6 py-2 font-black text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs uppercase tracking-widest border border-blue-100 dark:border-blue-900/50"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.relatedSkills.map((skill) => (
                  <span key={skill} className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2 text-[11px] font-black text-gray-700 dark:text-gray-300 transition-all hover:border-red-200 dark:hover:border-red-900/30">
                    {skill}
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, relatedSkills: prev.relatedSkills.filter((s) => s !== skill) }))} className="text-gray-400 hover:text-red-500 text-lg leading-none">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/50">
          <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-blue-600 px-10 py-3 font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            {editingProject ? 'Update' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  )
}