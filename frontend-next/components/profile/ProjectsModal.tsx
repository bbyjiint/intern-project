'use client'

import { useState, useEffect } from 'react'

export interface ProjectData {
  id?: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  skills: string[] // เปลี่ยนเป็น skills ให้ตรงกับหน้าหลัก
  githubUrl?: string
  projectUrl?: string
}

interface ProjectsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: ProjectData) => void // ลบ Promise<void> ออก เพื่อให้เรียกใช้แบบ Synchronous ได้ง่ายในการทำ Mockup
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

  // Reset or Set data when modal opens/changes mode
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
    onSave(formData) // สั่ง Save กลับไปที่หน้าหลัก
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

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Project Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Role</label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Start Date</label>
              <input
                type="text"
                placeholder="MM/YYYY"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">End Date</label>
              <input
                type="text"
                placeholder="MM/YYYY"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Description</label>
            <textarea
              rows={4}
              placeholder="Briefly describe your responsibilities and achievements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0273B1]">Related Skills</label>
            <div className="flex gap-2">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select skill</option>
                {AVAILABLE_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <button
                onClick={handleAddSkill}
                className="rounded-xl bg-[#E3F5FF] px-4 py-2 font-bold text-[#0273B1] hover:bg-[#0273B1] hover:text-white transition-all"
              >
                Add +
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-100">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 text-lg leading-none">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
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