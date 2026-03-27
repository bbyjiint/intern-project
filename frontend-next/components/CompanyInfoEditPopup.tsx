'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface CompanyInfoEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  initialData: {
    companyName: string
    companyDescription: string
    businessType: string
    companySize: string
    profileImage?: string
  }
}

export default function CompanyInfoEditPopup({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CompanyInfoEditPopupProps) {
  const [formData, setFormData] = useState({
    companyName: initialData.companyName || '',
    companyDescription: initialData.companyDescription || '',
    businessType: initialData.businessType || '',
    companySize: initialData.companySize || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        companyName: initialData.companyName || '',
        companyDescription: initialData.companyDescription || '',
        businessType: initialData.businessType || '',
        companySize: initialData.companySize || '',
      })
    }
  }, [isOpen, initialData])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      alert('Company Name is required')
      return
    }
    if (!formData.companySize) {
      alert('Company Size is required')
      return
    }
    if (!formData.businessType) {
      alert('Business Type is required')
      return
    }
    if (!formData.companyDescription.trim()) {
      alert('Company Description is required')
      return
    }

    setIsSaving(true)
    try {
      await apiFetch('/api/companies/profile', {
        method: 'PUT',
        body: JSON.stringify({
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          businessType: formData.businessType,
          companySize: formData.companySize,
        }),
      })

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Failed to save company information:', error)
      alert(error.message || 'Failed to save company information')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="relative w-full max-w-[700px] rounded-[14px] bg-white shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700">

        {/* Header */}
        <div className="border-b border-[#E5E7EB] px-[24px] py-[18px] dark:border-gray-700">
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-white">Company Information</h2>
        </div>

        {/* Content */}
        <div className="px-[24px] py-[22px]">
          <div className="space-y-[16px]">

              {/* Company Name */}
              <div>
                <label className="mb-[5px] block text-[14px] font-semibold text-[#253858] dark:text-[#e5e7eb]">
                  Company Name<span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Company Name"
                  className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-white px-[14px] text-[14px] text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* Company Size */}
              <div>
                <label className="mb-[5px] block text-[14px] font-semibold text-[#253858] dark:text-[#e5e7eb]">
                  Company Size<span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleChange('companySize', e.target.value)}
                  className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-white px-[14px] text-[14px] text-[#64748B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
                >
                  <option value="" className="dark:bg-gray-800">Select company size</option>
                  <option value="less-than-10" className="dark:bg-gray-800">Less than 10 people</option>
                  <option value="10-50" className="dark:bg-gray-800">10-50 people</option>
                  <option value="51-200" className="dark:bg-gray-800">51-200 people</option>
                  <option value="201-500" className="dark:bg-gray-800">201-500 people</option>
                  <option value="501-1000" className="dark:bg-gray-800">501-1000 people</option>
                  <option value="more-than-1000" className="dark:bg-gray-800">More than 1000 people</option>
                </select>
              </div>

              {/* Business Type */}
              <div>
                <label className="mb-[5px] block text-[14px] font-semibold text-[#253858] dark:text-[#e5e7eb]">
                  Business Type<span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex flex-col gap-y-2 pt-[1px]">
                  <label className="flex cursor-pointer items-center gap-[10px] text-[14px] text-[#6B7280] dark:text-gray-400">
                    <input
                      type="radio"
                      name="businessType"
                      value="private"
                      checked={formData.businessType === 'private'}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      className="h-[14px] w-[14px]"
                      style={{ accentColor: '#0273B1' }}
                    />
                    <span>Private Company</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-[10px] text-[14px] text-[#6B7280] dark:text-gray-400">
                    <input
                      type="radio"
                      name="businessType"
                      value="state-owned"
                      checked={formData.businessType === 'state-owned'}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      className="h-[14px] w-[14px]"
                      style={{ accentColor: '#0273B1' }}
                    />
                    <span>State-owned enterprise</span>
                  </label>
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label className="mb-[5px] block text-[14px] font-semibold text-[#253858] dark:text-[#e5e7eb]">
                  Company Description<span className="text-[#EF4444]">*</span>
                </label>
                <p className="mb-[8px] text-[13px] leading-[1.4] text-[#6B7280] dark:text-gray-400">
                  Provide a brief overview of your company, including industry, services, and key strengths.
                </p>
                <textarea
                  value={formData.companyDescription}
                  onChange={(e) => handleChange('companyDescription', e.target.value)}
                  placeholder="Describe your company, industry focus, and core services"
                  rows={4}
                  maxLength={2000}
                  className="min-h-[100px] w-full resize-none rounded-[6px] border border-[#D1D5DB] bg-white px-[14px] py-[10px] text-[14px] text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
                />
              </div>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="border-t border-[#E5E7EB] px-[24px] py-[18px] flex justify-end gap-3 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[6px] border border-[#D1D5DB] bg-white px-[18px] py-[8px] text-[14px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[6px] bg-[#0273B1] px-[18px] py-[8px] text-[14px] font-semibold text-white transition hover:bg-[#0263A1] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}