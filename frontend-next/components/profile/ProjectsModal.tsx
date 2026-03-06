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
  }, [editingProject, isOpen])

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
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
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) })
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.role) {
      alert('Please fill in Project Name and Role')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8">
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
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Project Name</label>
            <input
              type="text"
              placeholder="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Role</label>
            <input
              type="text"
              placeholder="e.g., Web developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="relative group">
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Start Date</label>
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
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">End Date</label>
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
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Description</label>
            <textarea
              rows={4}
              placeholder="Description about your project"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Related Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Related Skills</label>
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