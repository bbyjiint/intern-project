'use client'

import { useState, useEffect } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

interface Step1JobDetailsProps {
  data: any
  onUpdate: (data: any) => void
}

interface Province {
  id: string
  name: string
  thname: string | null
  code: string | null
}

interface District {
  id: string
  name: string
  thname: string | null
  code: string | null
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
    provinceId: '',
    districtId: '',
  })

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [districtsLoading, setDistrictsLoading] = useState(false)

  // Sync localData when data prop changes (e.g., when editing existing job post)
  useEffect(() => {
    if (data) {
      setLocalData((prev: any) => ({
        ...prev,
        ...data,
        provinceId: data.provinceId || prev.provinceId || '',
        districtId: data.districtId || prev.districtId || '',
      }))
    }
  }, [data?.jobTitle, data?.locationProvince, data?.locationDistrict, data?.jobType, data?.workplaceType, data?.allowance, data?.allowancePeriod, data?.noAllowance, data?.jobPostStatus])

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setProvincesLoading(true)
      try {
        const response = await apiFetch<{ provinces: Province[] }>('/api/addresses/provinces')
        setProvinces(response.provinces || [])
      } catch (err) {
        console.error('Failed to load provinces:', err)
        setProvinces([])
      } finally {
        setProvincesLoading(false)
      }
    }
    loadProvinces()
  }, [])

  // Auto-match province ID from province name when provinces are loaded
  useEffect(() => {
    if (provinces.length > 0 && localData.locationProvince && !localData.provinceId) {
      const matchedProvince = provinces.find(
        (p) => p.name.toLowerCase() === localData.locationProvince.toLowerCase() ||
               p.thname?.toLowerCase() === localData.locationProvince.toLowerCase()
      )
      if (matchedProvince) {
        setLocalData((prev: any) => ({ ...prev, provinceId: matchedProvince.id }))
      }
    }
  }, [provinces, localData.locationProvince, localData.provinceId])

  // Load districts when province is selected
  useEffect(() => {
    if (localData.provinceId) {
      const loadDistricts = async () => {
        setDistrictsLoading(true)
        try {
          const response = await apiFetch<{ districts: District[] }>(
            `/api/addresses/districts?provinceId=${localData.provinceId}`
          )
          setDistricts(response.districts || [])
        } catch (err) {
          console.error('Failed to load districts:', err)
          setDistricts([])
        } finally {
          setDistrictsLoading(false)
        }
      }
      loadDistricts()
    } else {
      setDistricts([])
      // Clear district selection when province is cleared
      if (localData.districtId || localData.locationDistrict) {
        setLocalData((prev: any) => ({ ...prev, districtId: '', locationDistrict: '' }))
      }
    }
  }, [localData.provinceId])

  // Auto-match district ID from district name when districts are loaded
  useEffect(() => {
    if (districts.length > 0 && localData.locationDistrict && !localData.districtId) {
      const matchedDistrict = districts.find(
        (d) => d.name.toLowerCase() === localData.locationDistrict.toLowerCase() ||
               d.thname?.toLowerCase() === localData.locationDistrict.toLowerCase()
      )
      if (matchedDistrict) {
        setLocalData((prev: any) => ({ ...prev, districtId: matchedDistrict.id }))
      }
    }
  }, [districts, localData.locationDistrict, localData.districtId])

  useEffect(() => {
    onUpdate(localData)
  }, [localData, onUpdate])

  const handleChange = (field: string, value: any) => {
    setLocalData((prev: any) => {
      const updated = { ...prev, [field]: value }
      
      // When province is selected, find the province name
      if (field === 'provinceId') {
        const selectedProvince = provinces.find((p) => p.id === value)
        updated.locationProvince = selectedProvince?.name || ''
        // Clear district when province changes
        if (prev.provinceId !== value) {
          updated.districtId = ''
          updated.locationDistrict = ''
        }
      }
      
      // When district is selected, find the district name
      if (field === 'districtId') {
        const selectedDistrict = districts.find((d) => d.id === value)
        updated.locationDistrict = selectedDistrict?.name || ''
      }
      
      return updated
    })
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
          {/* Province */}
          <div className="flex-1">
            {provincesLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading provinces...</span>
              </div>
            ) : (
              <SearchableDropdown
                options={provinces.map((prov) => ({
                  value: prov.id,
                  label: prov.thname ? `${prov.name} (${prov.thname})` : prov.name,
                  code: prov.code,
                }))}
                value={localData.provinceId || ''}
                onChange={(value) => handleChange('provinceId', value)}
                placeholder="Search province..."
                className="w-full"
                allOptionLabel="Select Province"
              />
            )}
          </div>
          {/* District */}
          <div className="flex-1">
            {!localData.provinceId ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Select province first</span>
              </div>
            ) : districtsLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading districts...</span>
              </div>
            ) : (
              <SearchableDropdown
                options={districts.map((dist) => ({
                  value: dist.id,
                  label: dist.thname ? `${dist.name} (${dist.thname})` : dist.name,
                  code: dist.code,
                }))}
                value={localData.districtId || ''}
                onChange={(value) => handleChange('districtId', value)}
                placeholder="Search district..."
                className="w-full"
                allOptionLabel="Select District"
              />
            )}
          </div>
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
