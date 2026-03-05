'use client'

import { useState, useEffect } from 'react'

interface Certificate {
  id?: string
  name: string
  description?: string
  issuedBy?: string
  date?: string
  tags?: string[]
  file?: File | null
}

interface CertificatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (certificate: Certificate) => void
  editingCertificate?: Certificate | null
}

export default function CertificatesModal({
  isOpen,
  onClose,
  onSave,
  editingCertificate,
}: CertificatesModalProps) {
  const [formData, setFormData] = useState<Certificate>({
    name: '',
    description: '',
    issuedBy: '',
    date: '',
    tags: [],
  })
  const [selectedSkill, setSelectedSkill] = useState('')

  // อัปเดตข้อมูลเมื่อมีการแก้ไข
  useEffect(() => {
    if (editingCertificate) {
      setFormData(editingCertificate)
    } else {
      setFormData({ name: '', description: '', issuedBy: '', date: '', tags: [] })
    }
  }, [editingCertificate, isOpen])

  if (!isOpen) return null

  const handleAddSkill = () => {
    if (selectedSkill && !formData.tags?.includes(selectedSkill)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), selectedSkill],
      })
      setSelectedSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((skill) => skill !== skillToRemove),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {editingCertificate ? 'Edit Certificate' : 'Add Certificate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Certificate Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Certificate Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Certificate Name"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Describe what this certification covers or the skills you gained."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Issued By & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Issued By</label>
              <input
                type="text"
                placeholder="e.g., Company name, Organization Name"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.issuedBy}
                onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Completion Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Related Skills */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Related Skills</label>
            <div className="flex gap-2">
              <select
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-500"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">Select skill</option>
                <option value="UI Design">UI Design</option>
                <option value="UX Design">UX Design</option>
                <option value="Figma">Figma</option>
                <option value="React">React</option>
              </select>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
              >
                ADD +
              </button>
            </div>
            {/* Display Skills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-xs font-bold"
                >
                  {tag}
                  <button onClick={() => removeSkill(tag)} className="hover:text-blue-800">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Upload File Section */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Certificate File</label>
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-pointer group">
              <input type="file" className="hidden" id="cert-upload" />
              <label htmlFor="cert-upload" className="cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 font-bold mb-1">Drag and drop your file here</p>
                <button className="text-white bg-blue-600 px-6 py-1.5 rounded-lg text-sm font-bold my-2">
                  Select File
                </button>
                <p className="text-gray-400 text-xs">PDF or DOCX format. Max size: 5 MB</p>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
          >
            {editingCertificate ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}