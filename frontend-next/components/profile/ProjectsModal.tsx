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
  relatedSkills: string[] // เปลี่ยนจาก skills เป็น relatedSkills
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
// Date helpers (ดึงมาจาก ProjectsSection เพื่อให้ Format ตรงกัน)
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
// MonthYearPicker (copied from ProjectsSection)
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
                <button
                  key={name}
                  type="button"
                  onClick={() => selectMonth(i)}
                  className={`p-2 text-sm rounded hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                    isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface MasterSkill {
  id: string;
  name: string;
}

export default function ProjectsModal({ isOpen, onClose, onSave, editingProject }: ProjectsModalProps) {
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    relatedSkills: [],
    githubUrl: '',
    projectUrl: '',
  })
  const [selectedSkill, setSelectedSkill] = useState('')
  const [errorMsg, setErrorMsg] = useState('') // State สำหรับเก็บข้อความแจ้งเตือน

  const [availableSkills, setAvailableSkills] = useState<MasterSkill[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)

  // สร้าง Ref สำหรับเรียกเปิดปฏิทิน
  const startPickerRef = useRef<HTMLInputElement>(null)
  const endPickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (editingProject) {
        setFormData({
          ...editingProject,
            startDate: toDisplayDate(editingProject.startDate || ''),
            endDate: toDisplayDate(editingProject.endDate || ''),
          relatedSkills: editingProject.relatedSkills || (editingProject as any).skills || [],
        })
      } else {
        setFormData({
          name: '',
          role: '',
          startDate: '',
          endDate: '',
          description: '',
          relatedSkills: [],
          githubUrl: '',
          projectUrl: '',
        })
      }
      setSelectedSkill('')
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
        } catch (error) {
          console.error("Failed to fetch master skills:", error)
        } finally {
          setIsLoadingSkills(false)
        }
      }
      fetchMasterSkills()
    }
  }, [isOpen, availableSkills.length])

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
    setErrorMsg(''); // ล้าง Error เมื่อมีการพิมพ์/เลือกวันที่

    const rawValue = e.target.value;

    if (rawValue.includes('-')) {
      const [year, month] = rawValue.split('-');
      setFormData({ ...formData, [field]: `${month}/${year}` });
      return;
    }

    let value = rawValue.replace(/\D/g, '')
    if (value.length > 6) value = value.slice(0, 6)

    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`
    }
    setFormData({ ...formData, [field]: value })
  }

  const formatToMonthValue = (dateStr: string) => {
    if (dateStr.includes('/')) {
      const [m, y] = dateStr.split('/');
      if (y && m && y.length === 4) return `${y}-${m.padStart(2, '0')}`;
    }
    return '';
  }

  if (!isOpen) return null

  const handleAddSkill = () => {
    if (selectedSkill && !formData.relatedSkills.includes(selectedSkill)) {
      setFormData(prev => ({ 
        ...prev, 
        relatedSkills: [...prev.relatedSkills, selectedSkill] 
      }))
      setSelectedSkill('')
      setErrorMsg('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ 
      ...prev, 
      relatedSkills: prev.relatedSkills.filter((s) => s !== skill) 
    }))
  }

  const handleSubmit = () => {
    // 1. ตรวจสอบฟิลด์บังคับ
    if (
      !formData.name.trim() || 
      !formData.role?.trim() || 
      !formData.startDate?.trim() ||
      !formData.endDate?.trim() ||
      !formData.description?.trim()
    ) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    // 2. ตรวจสอบ Format วันที่ก่อนบันทึก
    const startP = parseDateValue(formData.startDate);
    const endP = parseDateValue(formData.endDate);
    if (!startP || !endP) {
      setErrorMsg('Please enter a valid date (MM/YYYY).')
      return
    }

    if (formData.relatedSkills.length === 0) {
      setErrorMsg('Please add at least one related skill.')
      return
    }

    // 3. เตรียม Data ส่งกลับ (แปลงเป็น DisplayDate "Jan 2024" ตาม ProjectsSection)
    const dataToSave: ProjectData = {
      ...formData,
      startDate: toDisplayDate(formData.startDate || ''),
      endDate: toDisplayDate(formData.endDate || ''),
    }

    onSave(dataToSave)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-bold text-[#1C2D4F]">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {errorMsg && (
            <div className="p-3 mb-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"></path></svg>
              {errorMsg}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Project Name *</label>
            <input
              type="text"
              placeholder="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 outline-none text-gray-700"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Role *</label>
            <input
              type="text"
              placeholder="e.g., Web developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 outline-none text-gray-700"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Start Date *</label>
              <MonthYearPicker 
                value={formData.startDate || ''} 
                onChange={(v) => setFormData(prev => ({ ...prev, startDate: v }))} 
              />
            </div>

            <div className="relative">
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">End Date *</label>
              <MonthYearPicker 
                value={formData.endDate || ''} 
                onChange={(v) => setFormData(prev => ({ ...prev, endDate: v }))} 
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Description *</label>
            <textarea
              rows={4}
              placeholder="Description about your project"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 outline-none resize-none text-gray-700"
            />
          </div>

          {/* Related Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Related Skills *</label>
            <div className="flex gap-2">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none text-sm text-gray-500 bg-white"
                disabled={isLoadingSkills}
              >
                <option value="">{isLoadingSkills ? "Loading skills..." : "Select skill"}</option>
                {availableSkills.map(skill => (
                  <option key={skill.id} value={skill.name}>{skill.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-[#E3F5FF] px-6 py-2 font-bold text-[#0273B1] hover:bg-[#0273B1] hover:text-white transition-all text-sm"
              >
                ADD
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.relatedSkills.map((skill) => (
                <span key={skill} className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-[12px] font-bold text-[#0273B1]">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t p-6 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl px-6 py-2.5 font-bold text-gray-400 border border-gray-200 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-[#0273B1] px-8 py-2.5 font-bold text-white shadow-lg hover:bg-[#025a8f] transition-all"
          >
            {editingProject ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </div>
    </div>
  )
}