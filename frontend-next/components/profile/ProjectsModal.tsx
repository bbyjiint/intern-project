'use client'

import { useState, useEffect, useRef } from 'react'

export interface ProjectData {
  id?: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  skills: string[]
  githubUrl?: string
  projectUrl?: string
}

interface ProjectsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: ProjectData) => void
  editingProject?: ProjectData | null
}

const AVAILABLE_SKILLS = ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'SQL', 'Tableau', 'Figma']

export default function ProjectsModal({ isOpen, onClose, onSave, editingProject }: ProjectsModalProps) {
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    skills: [],
    githubUrl: '',
    projectUrl: '',
  })
  const [selectedSkill, setSelectedSkill] = useState('')
  const [errorMsg, setErrorMsg] = useState('') // State สำหรับเก็บข้อความแจ้งเตือน

  // สร้าง Ref สำหรับเรียกเปิดปฏิทิน
  const startPickerRef = useRef<HTMLInputElement>(null)
  const endPickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingProject) {
      setFormData(editingProject)
    } else {
      setFormData({
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        skills: [],
        githubUrl: '',
        projectUrl: '',
      })
    }
    setErrorMsg('') // ล้างข้อความ Error ทุกครั้งที่เปิด Modal ขึ้นมาใหม่
  }, [editingProject, isOpen])

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
    if (selectedSkill && !formData.skills.includes(selectedSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, selectedSkill] })
      setSelectedSkill('')
      setErrorMsg('') // ล้าง Error เมื่อมีการเพิ่มข้อมูล
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) })
  }

  const handleSubmit = () => {
    // Validation: ตรวจสอบว่าทุกช่อง (ยกเว้น URL) ต้องไม่เป็นค่าว่าง
    if (
      !formData.name.trim() || 
      !formData.role.trim() || 
      !formData.startDate.trim() || 
      !formData.endDate.trim() || 
      !formData.description.trim()
    ) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    // Validation: ตรวจสอบว่ามี Skill อย่างน้อย 1 อัน
    if (formData.skills.length === 0) {
      setErrorMsg('Please add at least one related skill.')
      return
    }

    setErrorMsg('') // ล้าง Error
    onSave(formData) // สั่ง Save กลับไปที่หน้าหลัก
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* แสดงข้อความ Error สีแดง ถ้ามี */}
          {errorMsg && (
            <div className="p-3 mb-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"></path></svg>
              {errorMsg}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Project Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setErrorMsg('')
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Web developer"
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value })
                setErrorMsg('')
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="relative group">
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  maxLength={7}
                  value={formData.startDate}
                  onChange={(e) => handleDateInput(e, 'startDate')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                
                {/* ไอคอนปฏิทินที่คลิกได้ */}
                <div 
                  className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer hover:bg-gray-50 rounded-r-xl transition-colors"
                  onClick={() => startPickerRef.current?.showPicker()} // สั่งเปิดปฏิทิน
                >
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Hidden Date Picker */}
                <input
                  ref={startPickerRef}
                  type="month"
                  value={formatToMonthValue(formData.startDate)}
                  onChange={(e) => handleDateInput(e, 'startDate')}
                  className="absolute opacity-0 pointer-events-none right-0 bottom-0 w-0 h-0"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="relative group">
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  maxLength={7}
                  value={formData.endDate}
                  onChange={(e) => handleDateInput(e, 'endDate')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                
                <div 
                  className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer hover:bg-gray-50 rounded-r-xl transition-colors"
                  onClick={() => endPickerRef.current?.showPicker()}
                >
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <input
                  ref={endPickerRef}
                  type="month"
                  value={formatToMonthValue(formData.endDate)}
                  onChange={(e) => handleDateInput(e, 'endDate')}
                  className="absolute opacity-0 pointer-events-none right-0 bottom-0 w-0 h-0"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Description about your project"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                setErrorMsg('')
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Related Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">
              Related Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none text-sm text-gray-500 bg-white"
              >
                <option value="">Select skill</option>
                {AVAILABLE_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-[#E3F5FF] px-4 py-2 font-bold text-[#0273B1] hover:bg-[#0273B1] hover:text-white transition-all text-sm shrink-0"
              >
                ADD
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-[12px] font-bold text-[#0273B1]">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 text-sm">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 font-bold text-gray-400 border border-gray-200 bg-white hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-[#0273B1] px-8 py-2.5 font-bold text-white shadow-lg shadow-blue-100 hover:bg-[#025a8f] transition-all"
          >
            {editingProject ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </div>
    </div>
  )
}