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
  postalCode: string | null
}

interface Subdistrict {
  id: string
  name: string
  thname: string | null
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

  useEffect(() => {
    if (provinces.length > 0 && formData.province && !formData.provinceId) {
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
      if (formData.districtId || formData.subdistrictId) {
        handleChange('districtId', '')
        handleChange('district', '')
        handleChange('subdistrictId', '')
        handleChange('subDistrict', '')
        handleChange('postcode', '')
      }
    }
  }, [formData.provinceId])

  useEffect(() => {
    if (districts.length > 0 && formData.district && !formData.districtId) {
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
      if (formData.subdistrictId) {
        handleChange('subdistrictId', '')
        handleChange('subDistrict', '')
        handleChange('postcode', '')
      }
    }
  }, [formData.districtId])

  useEffect(() => {
    if (subdistricts.length > 0 && formData.subDistrict && !formData.subdistrictId) {
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

  useEffect(() => {
    if (formData.districtId && districts.length > 0) {
      const selectedDistrict = districts.find((d) => d.id === formData.districtId)
      if (selectedDistrict?.postalCode) {
        const updated = { ...formData, postcode: selectedDistrict.postalCode }
        setFormData(updated)
        onUpdate(updated)
      }
    }
  }, [formData.districtId, districts])

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }

    if (field === 'provinceId') {
      const selectedProvince = provinces.find((p) => p.id === value)
      updated.province = selectedProvince?.name || ''
      if (formData.districtId || formData.subdistrictId) {
        updated.districtId = ''
        updated.district = ''
        updated.subdistrictId = ''
        updated.subDistrict = ''
        updated.postcode = ''
      }
    }

    if (field === 'districtId') {
      const selectedDistrict = districts.find((d) => d.id === value)
      updated.district = selectedDistrict?.name || ''
      if (selectedDistrict?.postalCode) {
        updated.postcode = selectedDistrict.postalCode
      }
      if (formData.subdistrictId) {
        updated.subdistrictId = ''
        updated.subDistrict = ''
      }
    }

    if (field === 'subdistrictId') {
      const selectedSubdistrict = subdistricts.find((s) => s.id === value)
      updated.subDistrict = selectedSubdistrict?.name || ''
    }

    setFormData(updated)
    onUpdate(updated)
  }

  const inputClass = "w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-[13px] text-[#1E293B] dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]"
  const disabledClass = "flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50 px-4 py-3"
  const disabledTextClass = "text-sm text-gray-400 dark:text-slate-500"

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl text-[#0273B1] dark:text-white">
        Company Address
      </h2>

      <div className="space-y-6">
        {/* Address Details */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Address Details
          </label>
          <p className="text-xs mb-3 text-[#A9B4CD] dark:text-slate-400">
            (Example: Number, Building, Street etc.)
          </p>
          <textarea
            value={formData.addressDetails}
            onChange={(e) => handleChange('addressDetails', e.target.value)}
            placeholder="Enter your company address details"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Province
          </label>
          {provincesLoading ? (
            <div className={disabledClass}>
              <span className={disabledTextClass}>Loading provinces...</span>
            </div>
          ) : (
            <SearchableDropdown
              options={provinces.map((prov) => ({
                value: prov.id,
                label: prov.thname ? `${prov.name} (${prov.thname})` : prov.name,
              }))}
              value={formData.provinceId}
              onChange={(value) => handleChange('provinceId', value)}
              placeholder="Search by name..."
              className="w-full"
              allOptionLabel="Select Province"
            />
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            District
          </label>
          {!formData.provinceId ? (
            <div className={disabledClass}>
              <span className={disabledTextClass}>Please select a province first</span>
            </div>
          ) : districtsLoading ? (
            <div className={disabledClass}>
              <span className={disabledTextClass}>Loading districts...</span>
            </div>
          ) : (
            <SearchableDropdown
              options={districts.map((dist) => ({
                value: dist.id,
                label: dist.thname ? `${dist.name} (${dist.thname})` : dist.name,
              }))}
              value={formData.districtId}
              onChange={(value) => handleChange('districtId', value)}
              placeholder="Search by name..."
              className="w-full"
              allOptionLabel="Select District"
            />
          )}
        </div>

        {/* Sub-District */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Sub-District
          </label>
          {!formData.districtId ? (
            <div className={disabledClass}>
              <span className={disabledTextClass}>Please select a district first</span>
            </div>
          ) : subdistrictsLoading ? (
            <div className={disabledClass}>
              <span className={disabledTextClass}>Loading subdistricts...</span>
            </div>
          ) : (
            <SearchableDropdown
              options={subdistricts.map((sub) => ({
                value: sub.id,
                label: sub.thname ? `${sub.name} (${sub.thname})` : sub.name,
              }))}
              value={formData.subdistrictId}
              onChange={(value) => handleChange('subdistrictId', value)}
              placeholder="Search by name..."
              className="w-full"
              allOptionLabel="Select Sub-District"
            />
          )}
        </div>

        {/* Postcode */}
        <div>
          <label className="block text-xs font-medium mb-2 text-[#0273B1]">
            Postcode
          </label>
          <input
            type="text"
            value={formData.postcode}
            onChange={(e) => handleChange('postcode', e.target.value)}
            placeholder="Postcode (auto-filled when district is selected)"
            className={inputClass}
            readOnly={!!(formData.provinceId && formData.districtId && formData.subdistrictId)}
          />
          {formData.provinceId && formData.districtId && formData.subdistrictId && (
            <p className="text-xs mt-1 text-[#A9B4CD] dark:text-slate-500">
              Postcode is automatically filled based on the selected district
            </p>
          )}
          {formData.districtId && !formData.subdistrictId && (
            <p className="text-xs mt-1 text-[#A9B4CD] dark:text-slate-500">
              Please select a subdistrict to finalize the address
            </p>
          )}
        </div>
      </div>
    </div>
  )
}