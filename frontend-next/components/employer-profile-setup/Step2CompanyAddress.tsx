'use client'

import { useState } from 'react'

interface Step2CompanyAddressProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step2CompanyAddress({ data, onUpdate }: Step2CompanyAddressProps) {
  const [formData, setFormData] = useState({
    addressDetails: data.addressDetails || '',
    subDistrict: data.subDistrict || '',
    district: data.district || '',
    province: data.province || '',
    postcode: data.postcode || '',
  })

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8" style={{ color: '#0273B1', fontWeight: 700 }}>
        Company Address
      </h2>

      <div className="space-y-6">
        {/* Address Details */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Address Details
          </label>
          <p className="text-xs mb-3" style={{ color: '#A9B4CD' }}>
            (Example: Number, Building, Street etc.)
          </p>
          <textarea
            value={formData.addressDetails}
            onChange={(e) => handleChange('addressDetails', e.target.value)}
            placeholder="Enter your company address details"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Sub-District */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Sub-District
          </label>
          <input
            type="text"
            value={formData.subDistrict}
            onChange={(e) => handleChange('subDistrict', e.target.value)}
            placeholder="Enter sub-district"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            District
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => handleChange('district', e.target.value)}
            placeholder="Enter district"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Province and Postcode Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Province */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Province
            </label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="Enter province"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Postcode */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Postcode
            </label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => handleChange('postcode', e.target.value)}
              placeholder="Enter postcode"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
