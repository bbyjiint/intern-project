'use client'

import { useState, useEffect } from 'react'

interface Step1JobDetailsProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step1JobDetails({ data, onUpdate }: Step1JobDetailsProps) {
  const [localData, setLocalData] = useState(data || {
    jobTitle: '',
    locationProvince: '',
    locationDistrict: '',
    jobType: '',
    workplaceType: 'on-site',
    allowance: '',
    allowancePeriod: 'Month',
    noAllowance: false,
    jobPostStatus: 'urgent',
  })

  useEffect(() => {
    onUpdate(localData)
  }, [localData, onUpdate])

  const handleChange = (field: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Job Details
      </h2>

      {/* Job Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title
        </label>
        <input
          type="text"
          value={localData.jobTitle || ''}
          onChange={(e) => handleChange('jobTitle', e.target.value)}
          placeholder="Example: UX/UI Designer"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={localData.locationProvince || ''}
            onChange={(e) => handleChange('locationProvince', e.target.value)}
            placeholder="Bangkok"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            value={localData.locationDistrict || ''}
            onChange={(e) => handleChange('locationDistrict', e.target.value)}
            placeholder="Silom"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Type
        </label>
        <input
          type="text"
          value={localData.jobType || ''}
          onChange={(e) => handleChange('jobType', e.target.value)}
          placeholder="Information and Communication Technology (ICT)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Workplace Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Workplace Type
        </label>
        <div className="flex gap-2">
          {['on-site', 'hybrid', 'remote'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('workplaceType', type)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                localData.workplaceType === type
                  ? 'text-white'
                  : 'text-gray-700 border-2 border-gray-300'
              }`}
              style={{
                backgroundColor: localData.workplaceType === type ? '#0273B1' : 'white',
              }}
            >
              {type === 'on-site' ? 'On-site' : type === 'hybrid' ? 'Hybrid' : 'Remote'}
            </button>
          ))}
        </div>
      </div>

      {/* Allowance */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowance
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">฿</span>
          <input
            type="text"
            value={localData.allowance || ''}
            onChange={(e) => handleChange('allowance', e.target.value)}
            placeholder="Example: 5,000"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={localData.noAllowance}
          />
          <span className="text-gray-600">/</span>
          <select
            value={localData.allowancePeriod || 'Month'}
            onChange={(e) => handleChange('allowancePeriod', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={localData.noAllowance}
          >
            <option value="Month">Month</option>
            <option value="Week">Week</option>
            <option value="Day">Day</option>
          </select>
        </div>
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localData.noAllowance || false}
              onChange={(e) => handleChange('noAllowance', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">No Allowance</span>
          </label>
        </div>
      </div>

      {/* Job Post Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Post Status
        </label>
        <div className="flex gap-2">
          {['urgent', 'not-urgent'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleChange('jobPostStatus', status)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                localData.jobPostStatus === status
                  ? 'text-white'
                  : 'text-gray-700 border-2 border-gray-300'
              }`}
              style={{
                backgroundColor: localData.jobPostStatus === status ? '#0273B1' : 'white',
              }}
            >
              {status === 'urgent' ? 'Urgent' : 'Not Urgent'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
