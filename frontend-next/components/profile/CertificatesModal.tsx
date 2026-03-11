'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from "@/lib/api";

export interface ModalCertificate {
  id?: string
  name: string
  description?: string
  issuedBy?: string
  date?: string
  tags?: string[]
  file?: File | null
}

interface MasterSkill {
  id: string;
  name: string;
}

interface CertificatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (certificate: ModalCertificate) => void
  editingCertificate?: ModalCertificate | null
}

export default function CertificatesModal({
  isOpen,
  onClose,
  onSave,
  editingCertificate,
}: CertificatesModalProps) {
  const [formData, setFormData] = useState<ModalCertificate>({
    name: '',
    description: '',
    issuedBy: '',
    date: '',
    tags: [],
    file: null,
  })
  const [selectedSkill, setSelectedSkill] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [availableSkills, setAvailableSkills] = useState<MasterSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        setIsLoadingSkills(true);
        try {
          const data = await apiFetch<{ skills: MasterSkill[] }>('/api/skills');
          setAvailableSkills(data.skills || []);
        } catch (error) {
          console.error("Failed to fetch master skills:", error);
        } finally {
          setIsLoadingSkills(false);
        }
      };
      fetchSkills();
    }
  }, [isOpen]);

  // อัปเดตข้อมูลเมื่อมีการแก้ไข และล้าง Error
  useEffect(() => {
    if (editingCertificate) {
      setFormData({
        ...editingCertificate,
        file: null, // รีเซ็ตไฟล์ใหม่เมื่อเปิด Modal
      })
    } else {
      setFormData({ name: '', description: '', issuedBy: '', date: '', tags: [], file: null })
    }
    setErrorMsg('')
    setSelectedSkill('') // รีเซ็ต Dropdown ด้วย
  }, [editingCertificate, isOpen])

  if (!isOpen) return null

  const handleAddSkill = () => {
    if (selectedSkill && !formData.tags?.includes(selectedSkill)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), selectedSkill],
      })
      setSelectedSkill('')
      setErrorMsg('') // ล้าง Error
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] })
      setErrorMsg('') // ล้าง Error เมื่อเลือกไฟล์
    }
  }

  const handleSubmit = () => {
    // 1. ตรวจสอบช่อง Text ทั่วไป
    if (
      !formData.name?.trim() ||
      !formData.description?.trim() ||
      !formData.issuedBy?.trim() ||
      !formData.date?.trim()
    ) {
      setErrorMsg("Please fill in all required text fields.")
      return
    }

    // 2. ตรวจสอบ Related Skills (ต้องมีอย่างน้อย 1 อัน)
    if (!formData.tags || formData.tags.length === 0) {
      setErrorMsg("Please add at least one related skill.")
      return
    }

    // 3. ตรวจสอบ Upload File
    if (!formData.file) {
      setErrorMsg("Please upload a certificate file.")
      return
    }

    setErrorMsg('') // ไม่มี Error ให้ล้างทิ้งแล้ว Save
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {editingCertificate ? 'Edit Certificate' : 'Add Certificate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* แสดงข้อความ Error สีแดง ถ้ามี */}
          {errorMsg && (
            <div className="p-3 mb-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"></path>
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Certificate Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Certificate Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Certificate Name"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setErrorMsg('')
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe what this certification covers or the skills you gained."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                setErrorMsg('')
              }}
            />
          </div>

          {/* Issued By & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Issued By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Company name, Organization Name"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.issuedBy}
                onChange={(e) => {
                  setFormData({ ...formData, issuedBy: e.target.value })
                  setErrorMsg('')
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Completion Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  placeholder="DD Month YYYY"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value })
                    setErrorMsg('')
                  }}
                />
              </div>
            </div>
          </div>

          {/* Related Skills */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Related Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                className={`flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-500 ${isLoadingSkills ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                disabled={isLoadingSkills}
              >
                <option value="">{isLoadingSkills ? 'Loading skills...' : 'Select skill'}</option>
                {/* 2. วนลูปแสดงผล Skill ที่ดึงมาจาก DB */}
                {availableSkills.map((skill) => (
                  <option key={skill.id} value={skill.name}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
              >
                Skill +
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
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Upload Certificate File <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer group
              ${formData.file ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'}`}
            >
              <input 
                type="file" 
                className="hidden" 
                id="cert-upload" 
                onChange={handleFileChange}
                accept=".pdf,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="cert-upload" className="cursor-pointer block w-full h-full">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    {formData.file ? (
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 font-bold mb-1">
                  {formData.file ? formData.file.name : 'Drag and drop your file here'}
                </p>
                <div className={`inline-block px-6 py-1.5 rounded-lg text-sm font-bold my-2
                  ${formData.file ? 'bg-white text-green-600 border border-green-200' : 'text-white bg-blue-600'}`}>
                  {formData.file ? 'Change File' : 'Select File'}
                </div>
                {!formData.file && <p className="text-gray-400 text-xs">PDF or DOCX format. Max size: 5 MB</p>}
              </label>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
          >
            {editingCertificate ? 'Save Changes' : 'Add Certificate'}
          </button>
        </div>
      </div>
    </div>
  )
}