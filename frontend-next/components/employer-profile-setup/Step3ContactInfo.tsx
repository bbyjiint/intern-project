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

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
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

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8" style={{ color: '#0273B1', fontWeight: 700 }}>
        Contact Information
      </h2>

      <div className="space-y-6">
        {/* Phone Number */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Phone Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              defaultValue="+66"
              className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium w-full sm:w-auto"
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="company@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Website URL <span className="text-xs font-normal" style={{ color: '#A9B4CD' }}>(Optional)</span>
          </label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleChange('websiteUrl', e.target.value)}
            placeholder="https://www.example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Contact Name
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            placeholder="Enter contact person name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
