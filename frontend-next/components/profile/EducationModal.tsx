'use client'

import { useState, useEffect } from 'react'
import { Education } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'
import SearchableDropdown from '@/components/SearchableDropdown'

interface EducationModalProps {
  isOpen: boolean
  education: Education | null
  onClose: () => void
  onSave: () => void
}

export default function EducationModal({ isOpen, education, onClose, onSave }: EducationModalProps) {
  const [formData, setFormData] = useState({
    school: education?.universityName || '',
    degree: education?.degreeName || '',
    major: education?.educationLevel || '',
    graduationMonth: '',
    graduationYear: '',
    gpa: education?.gpa?.toString() || '',
    relevantCoursework: education?.relevantCoursework?.join(', ') || '',
    additionalDetails: education?.achievements?.join('\n') || '',
  })

  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i)

  // Load universities from API
  useEffect(() => {
    if (isOpen) {
      ;(async () => {
        setUniversitiesLoading(true)
        try {
          const data = await apiFetch<{ universities: Array<{ id: string; name: string; thname: string | null; code: string | null }> }>(
            `/api/universities`
          )
          setUniversities(data.universities || [])
        } catch (err) {
          console.error('Failed to load universities:', err)
          setUniversities([])
        } finally {
          setUniversitiesLoading(false)
        }
      })()
    }
  }, [isOpen])

  // Initialize form data when education changes
  useEffect(() => {
    if (education) {
      const endDate = education.endDate ? new Date(education.endDate) : null
      setFormData({
        school: education.universityName || '',
        degree: education.degreeName || '',
        major: education.educationLevel || '',
        graduationMonth: endDate ? months[endDate.getMonth()] : '',
        graduationYear: endDate ? endDate.getFullYear().toString() : '',
        gpa: education.gpa?.toString() || '',
        relevantCoursework: education.relevantCoursework?.join(', ') || '',
        additionalDetails: education.achievements?.join('\n') || '',
      })
    } else {
      setFormData({
        school: '',
        degree: '',
        major: '',
        graduationMonth: '',
        graduationYear: '',
        gpa: '',
        relevantCoursework: '',
        additionalDetails: '',
      })
    }
  }, [education, isOpen])

  const handleSave = async () => {
    if (!formData.school || !formData.degree || !formData.major) {
      alert('Please fill in all required fields (School, Degree, Major)')
      return
    }

    setIsSaving(true)
    try {
      // Parse GPA - handle formats like "3.8 / 4.0" or just "3.8"
      let gpaValue: number | undefined = undefined
      if (formData.gpa) {
        const gpaMatch = formData.gpa.match(/(\d+\.?\d*)/)
        if (gpaMatch) {
          gpaValue = parseFloat(gpaMatch[1])
        }
      }

      const graduationDate = formData.graduationYear && formData.graduationMonth
        ? `${formData.graduationYear}-${String(months.indexOf(formData.graduationMonth) + 1).padStart(2, '0')}-01`
        : null

      // Map degree to education level (BACHELOR, MASTERS, PHD)
      let educationLevel = 'BACHELOR'
      const degreeLower = formData.degree.toLowerCase()
      if (degreeLower.includes('master') || degreeLower.includes('mba') || degreeLower.includes('ms') || degreeLower.includes('m.s')) {
        educationLevel = 'MASTERS'
      } else if (degreeLower.includes('phd') || degreeLower.includes('doctorate') || degreeLower.includes('ph.d') || degreeLower.includes('d.phil')) {
        educationLevel = 'PHD'
      }

      const educationData = {
        universityName: formData.school,
        degreeName: formData.degree,
        educationLevel: educationLevel,
        gpa: gpaValue,
        endDate: graduationDate,
        isCurrent: !formData.graduationYear,
        relevantCoursework: formData.relevantCoursework 
          ? formData.relevantCoursework.split(',').map(c => c.trim()).filter(c => c)
          : [],
        achievements: formData.additionalDetails
          ? formData.additionalDetails.split('\n').map(a => a.trim()).filter(a => a)
          : [],
      }

      if (education?.id) {
        // Update existing education
        await apiFetch(`/api/candidates/education/${education.id}`, {
          method: 'PUT',
          body: JSON.stringify(educationData),
        })
      } else {
        // Create new education
        await apiFetch('/api/candidates/education', {
          method: 'POST',
          body: JSON.stringify(educationData),
        })
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Failed to save education:', error)
      alert(error.message || 'Failed to save education')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {education ? 'Edit Education' : 'Add Education'}
            </h2>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School <span className="text-red-500">*</span>
            </label>
            {universitiesLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading universities...</span>
              </div>
            ) : (
              <SearchableDropdown
                options={universities.map((uni) => ({
                  value: uni.name,
                  label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                  code: uni.code,
                }))}
                value={formData.school}
                onChange={(value) => setFormData({ ...formData, school: value })}
                placeholder="Search by name or code..."
                className="w-full"
                allOptionLabel="Select University"
              />
            )}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="e.g. Bachelor of Science"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Major <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Graduation Year
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={formData.graduationMonth}
                  onChange={(e) => setFormData({ ...formData, graduationMonth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  placeholder="Year"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* GPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPA
            </label>
            <input
              type="text"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              placeholder="e.g. 3.8 / 4.0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Relevant Coursework */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relevant Coursework
            </label>
            <textarea
              value={formData.relevantCoursework}
              onChange={(e) => setFormData({ ...formData, relevantCoursework: e.target.value })}
              placeholder="e.g. Data Structures, Algorithms, Database Systems, Machine Learning"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              placeholder="Enter each detail on a new line (e.g., Dean's List: Fall 2022, Spring 2023)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Each line will be displayed as a bullet point</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#0273B1' }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#025a8f'
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#0273B1'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
