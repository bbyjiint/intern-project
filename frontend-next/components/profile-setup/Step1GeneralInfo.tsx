'use client'

import { useState } from 'react'

interface Step1GeneralInfoProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step1GeneralInfo({ data, onUpdate }: Step1GeneralInfoProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    location: data.location || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    aboutYou: data.aboutYou || '',
  })

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#1C2D4F', fontWeight: 700 }}>
        General Information
      </h2>

      <div className="space-y-8">
        {/* Full Name + Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#1C2D4F' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Example: Bongkotch Petkheak"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#1C2D4F' }}>
              Your Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Example: Bangkok"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contact Section - Visual Group */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <label className="block text-xs font-medium mb-4" style={{ color: '#1C2D4F' }}>
            Contact
          </label>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#A9B4CD' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#A9B4CD' }}>
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue="+66"
                  className="w-20 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="Phone Number"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* About You - Secondary Section */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#1C2D4F' }}>
            About You
          </label>
          <p className="text-xs mb-3" style={{ color: '#A9B4CD' }}>
            Describe yourself, focusing on experiences or qualities relevant to the position.
          </p>
          
          {/* Rich Text Toolbar */}
          <div className="flex gap-2 mb-2 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
            <button className="p-2 hover:bg-gray-200 rounded" title="Bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 rounded" title="Italic">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m-4 4h8" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 rounded" title="Underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19h14M5 7h14M8 13h8M8 17h8" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button className="p-2 hover:bg-gray-200 rounded" title="Bullet List">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 rounded" title="Numbered List">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </button>
          </div>

          {/* Text Area - Reduced Height */}
          <textarea
            value={formData.aboutYou}
            onChange={(e) => handleChange('aboutYou', e.target.value)}
            placeholder="Write a brief overview of yourself"
            rows={5}
            maxLength={2000}
            className="w-full px-4 py-3 border border-gray-300 rounded-b-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          
          {/* Character Counter */}
          <div className="text-right text-xs mt-1" style={{ color: '#A9B4CD' }}>
            {formData.aboutYou.length}/2,000
          </div>
        </div>
      </div>
    </div>
  )
}
