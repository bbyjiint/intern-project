'use client'

import { useState, useEffect } from 'react'

interface Step1GeneralInfoProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step1GeneralInfo({ data, onUpdate }: Step1GeneralInfoProps) {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    companyDescription: data.companyDescription || '',
    businessType: data.businessType || '',
    companySize: data.companySize || '',
  })

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    setFormData({
      companyName: data.companyName || '',
      companyDescription: data.companyDescription || '',
      businessType: data.businessType || '',
      companySize: data.companySize || '',
    })
  }, [data.companyName, data.companyDescription, data.businessType, data.companySize])

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8" style={{ color: '#0273B1', fontWeight: 700 }}>
        General Information
      </h2>

      <div className="space-y-8">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Example: ABC Corporation"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-xs font-medium mb-4" style={{ color: '#0273B1' }}>
            Business Type
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="private"
                checked={formData.businessType === 'private'}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-5 h-5 mr-3 cursor-pointer appearance-none rounded-full border-2 transition-all"
                style={{
                  borderColor: formData.businessType === 'private' ? '#0273B1' : '#E5E7EB',
                  backgroundColor: formData.businessType === 'private' ? '#0273B1' : '#E5E7EB',
                  backgroundImage: formData.businessType === 'private' 
                    ? 'radial-gradient(circle, white 30%, transparent 30%)' 
                    : 'none',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <span className="text-sm" style={{ color: '#1C2D4F' }}>
                Private Company
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="state-owned"
                checked={formData.businessType === 'state-owned'}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-5 h-5 mr-3 cursor-pointer appearance-none rounded-full border-2 transition-all"
                style={{
                  borderColor: formData.businessType === 'state-owned' ? '#0273B1' : '#E5E7EB',
                  backgroundColor: formData.businessType === 'state-owned' ? '#0273B1' : '#E5E7EB',
                  backgroundImage: formData.businessType === 'state-owned' 
                    ? 'radial-gradient(circle, white 30%, transparent 30%)' 
                    : 'none',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <span className="text-sm" style={{ color: '#1C2D4F' }}>
                State-owned enterprise
              </span>
            </label>
          </div>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Company Size (Number of employees)
          </label>
          <select
            value={formData.companySize}
            onChange={(e) => handleChange('companySize', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select company size</option>
            <option value="less-than-10">Less than 10 people</option>
            <option value="10-50">10-50 people</option>
            <option value="51-200">51-200 people</option>
            <option value="201-500">201-500 people</option>
            <option value="501-1000">501-1000 people</option>
            <option value="more-than-1000">More than 1000 people</option>
          </select>
        </div>

        {/* Company Description */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Company Description
          </label>
          <textarea
            value={formData.companyDescription}
            onChange={(e) => handleChange('companyDescription', e.target.value)}
            placeholder="Describe your company, its mission, and what makes it unique"
            rows={5}
            maxLength={2000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="text-right text-xs mt-1" style={{ color: '#A9B4CD' }}>
            {formData.companyDescription.length}/2,000
          </div>
        </div>
      </div>
    </div>
  )
}
