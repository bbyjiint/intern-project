'use client'

import { useState, useEffect } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

interface Step2CompanyAddressProps {
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
  postalCode: string | null
}

interface Subdistrict {
  id: string
  name: string
  thname: string | null
  code: string | null
}

export default function Step2CompanyAddress({ data, onUpdate }: Step2CompanyAddressProps) {
  const [formData, setFormData] = useState({
    addressDetails: data.addressDetails || '',
    subDistrict: data.subDistrict || '',
    district: data.district || '',
    province: data.province || '',
    postcode: data.postcode || '',
    provinceId: data.provinceId || '',
    districtId: data.districtId || '',
    subdistrictId: data.subdistrictId || '',
  })

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([])
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [subdistrictsLoading, setSubdistrictsLoading] = useState(false)

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    setFormData({
      addressDetails: data.addressDetails || '',
      subDistrict: data.subDistrict || '',
      district: data.district || '',
      province: data.province || '',
      postcode: data.postcode || '',
      provinceId: data.provinceId || '',
      districtId: data.districtId || '',
      subdistrictId: data.subdistrictId || '',
    })
  }, [data.addressDetails, data.subDistrict, data.district, data.province, data.postcode, data.provinceId, data.districtId, data.subdistrictId])

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
    if (provinces.length > 0 && formData.province && !formData.provinceId) {
      // Try to find matching province by name (case-insensitive)
      const matchedProvince = provinces.find(
        (p) => p.name.toLowerCase() === formData.province.toLowerCase() ||
               p.thname?.toLowerCase() === formData.province.toLowerCase()
      )
      if (matchedProvince) {
        const updated = { ...formData, provinceId: matchedProvince.id }
        setFormData(updated)
        onUpdate(updated)
      }
    }
  }, [provinces, formData.province, formData.provinceId])

  // Load districts when province is selected
  useEffect(() => {
    if (formData.provinceId) {
      const loadDistricts = async () => {
        setDistrictsLoading(true)
        try {
          const response = await apiFetch<{ districts: District[] }>(
            `/api/addresses/districts?provinceId=${formData.provinceId}`
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
      setSubdistricts([])
      // Clear district and subdistrict selections when province is cleared
      if (formData.districtId || formData.subdistrictId) {
        handleChange('districtId', '')
        handleChange('district', '')
        handleChange('subdistrictId', '')
        handleChange('subDistrict', '')
        handleChange('postcode', '')
      }
    }
  }, [formData.provinceId])

  // Auto-match district ID from district name when districts are loaded
  useEffect(() => {
    if (districts.length > 0 && formData.district && !formData.districtId) {
      // Try to find matching district by name (case-insensitive)
      const matchedDistrict = districts.find(
        (d) => d.name.toLowerCase() === formData.district.toLowerCase() ||
               d.thname?.toLowerCase() === formData.district.toLowerCase()
      )
      if (matchedDistrict) {
        const updated = { 
          ...formData, 
          districtId: matchedDistrict.id,
          district: matchedDistrict.name,
          postcode: matchedDistrict.postalCode || formData.postcode
        }
        setFormData(updated)
        onUpdate(updated)
      }
    }
  }, [districts, formData.district, formData.districtId])

  // Load subdistricts when district is selected
  useEffect(() => {
    if (formData.districtId) {
      const loadSubdistricts = async () => {
        setSubdistrictsLoading(true)
        try {
          const response = await apiFetch<{ subdistricts: Subdistrict[] }>(
            `/api/addresses/subdistricts?districtId=${formData.districtId}`
          )
          setSubdistricts(response.subdistricts || [])
        } catch (err) {
          console.error('Failed to load subdistricts:', err)
          setSubdistricts([])
        } finally {
          setSubdistrictsLoading(false)
        }
      }
      loadSubdistricts()
    } else {
      setSubdistricts([])
      // Clear subdistrict selection when district is cleared
      if (formData.subdistrictId) {
        handleChange('subdistrictId', '')
        handleChange('subDistrict', '')
        handleChange('postcode', '')
      }
    }
  }, [formData.districtId])

  // Auto-match subdistrict ID from subdistrict name when subdistricts are loaded
  useEffect(() => {
    if (subdistricts.length > 0 && formData.subDistrict && !formData.subdistrictId) {
      // Try to find matching subdistrict by name (case-insensitive)
      const matchedSubdistrict = subdistricts.find(
        (s) => s.name.toLowerCase() === formData.subDistrict.toLowerCase() ||
               s.thname?.toLowerCase() === formData.subDistrict.toLowerCase()
      )
      if (matchedSubdistrict) {
        const updated = { 
          ...formData, 
          subdistrictId: matchedSubdistrict.id,
          subDistrict: matchedSubdistrict.name
        }
        setFormData(updated)
        onUpdate(updated)
      }
    }
  }, [subdistricts, formData.subDistrict, formData.subdistrictId])

  // Auto-fill postal code when district is selected
  useEffect(() => {
    if (formData.districtId && districts.length > 0) {
      const selectedDistrict = districts.find((d) => d.id === formData.districtId)
      if (selectedDistrict?.postalCode) {
        handleChange('postcode', selectedDistrict.postalCode)
      }
    }
  }, [formData.districtId, districts])

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    
    // When province is selected, find the province name
    if (field === 'provinceId') {
      const selectedProvince = provinces.find((p) => p.id === value)
      updated.province = selectedProvince?.name || ''
    }
    
    // When district is selected, find the district name
    if (field === 'districtId') {
      const selectedDistrict = districts.find((d) => d.id === value)
      updated.district = selectedDistrict?.name || ''
      // Auto-fill postal code
      if (selectedDistrict?.postalCode) {
        updated.postcode = selectedDistrict.postalCode
      }
    }
    
    // When subdistrict is selected, find the subdistrict name
    if (field === 'subdistrictId') {
      const selectedSubdistrict = subdistricts.find((s) => s.id === value)
      updated.subDistrict = selectedSubdistrict?.name || ''
    }
    
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

        {/* Province */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Province
          </label>
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
              value={formData.provinceId}
              onChange={(value) => handleChange('provinceId', value)}
              placeholder="Search by name or code..."
              className="w-full"
              allOptionLabel="Select Province"
            />
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            District
          </label>
          {!formData.provinceId ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Please select a province first</span>
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
              value={formData.districtId}
              onChange={(value) => handleChange('districtId', value)}
              placeholder="Search by name or code..."
              className="w-full"
              allOptionLabel="Select District"
            />
          )}
        </div>

        {/* Sub-District */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Sub-District
          </label>
          {!formData.districtId ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Please select a district first</span>
            </div>
          ) : subdistrictsLoading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading subdistricts...</span>
            </div>
          ) : (
            <SearchableDropdown
              options={subdistricts.map((sub) => ({
                value: sub.id,
                label: sub.thname ? `${sub.name} (${sub.thname})` : sub.name,
                code: sub.code,
              }))}
              value={formData.subdistrictId}
              onChange={(value) => handleChange('subdistrictId', value)}
              placeholder="Search by name or code..."
              className="w-full"
              allOptionLabel="Select Sub-District"
            />
          )}
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
            placeholder="Postcode (auto-filled when district is selected)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!!formData.districtId}
          />
          {formData.districtId && (
            <p className="text-xs mt-1" style={{ color: '#A9B4CD' }}>
              Postcode is automatically filled based on the selected district
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
