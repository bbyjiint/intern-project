'use client'

import { useState, useEffect } from 'react'

interface Step3ContactInfoProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step3ContactInfo({ data, onUpdate }: Step3ContactInfoProps) {
  const [formData, setFormData] = useState({
    phoneNumber: data.phoneNumber || '',
    email: data.email || '',
    websiteUrl: data.websiteUrl || '',
    contactName: data.contactName || '',
  })

  useEffect(() => {
    setFormData({
      phoneNumber: data.phoneNumber || '',
      email: data.email || '',
      websiteUrl: data.websiteUrl || '',
      contactName: data.contactName || '',
    })
  }, [data.phoneNumber, data.email, data.websiteUrl, data.contactName])

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const inputClass = "w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-[13px] text-[#1E293B] dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]"

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl text-[#0273B1] dark:text-white">
        Contact Information
      </h2>

      <div className="space-y-6">
        {/* Phone Number */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Phone Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              defaultValue="+66"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-slate-200 outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] sm:w-auto"
              style={{ minWidth: '100px' }}
            >
              <option value="+66">+66</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+81">+81</option>
            </select>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="Phone Number"
              className={`flex-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-[13px] text-[#1E293B] dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]`}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="company@example.com"
            className={inputClass}
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Website URL{' '}
            <span className="text-xs font-normal text-[#A9B4CD] dark:text-slate-500">(Optional)</span>
          </label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleChange('websiteUrl', e.target.value)}
            placeholder="https://www.example.com"
            className={inputClass}
          />
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Contact Name
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            placeholder="Enter contact person name"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}