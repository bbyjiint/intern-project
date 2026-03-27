'use client'

import { useMemo, useState } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'

export type ViewTab = 'all' | 'new' | 'job-match' | 'accepted' | 'declined'

const ACADEMIC_YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'job-match', label: 'Job Match' },
  { key: 'accepted', label: 'Accept' },
  { key: 'declined', label: 'Decline' },
] as const

interface University {
  id: string
  name: string
  thname: string | null
  code: string | null
}

interface ApplicantFiltersProps {
  // filter values
  searchQuery: string
  positionFilter: string
  academicYearFilter: string
  institutionFilter: string
  durationFilter: string
  internshipStartFilter: string
  internshipEndFilter: string
  activeTab: ViewTab
  // options
  positionOptions: string[]
  universities: University[]
  universitiesLoading: boolean
  totalCount: number
  // callbacks
  onSearchChange: (v: string) => void
  onPositionChange: (v: string) => void
  onAcademicYearChange: (v: string) => void
  onInstitutionChange: (v: string) => void
  onDurationChange: (v: string) => void
  onInternshipStartChange: (v: string) => void
  onInternshipEndChange: (v: string) => void
  onTabChange: (tab: ViewTab) => void
  onClearFilters: () => void
}

export default function ApplicantFilters({
  searchQuery, positionFilter, academicYearFilter, institutionFilter,
  durationFilter, internshipStartFilter, internshipEndFilter, activeTab,
  positionOptions, universities, universitiesLoading, totalCount,
  onSearchChange, onPositionChange, onAcademicYearChange, onInstitutionChange,
  onDurationChange, onInternshipStartChange, onInternshipEndChange,
  onTabChange, onClearFilters,
}: ApplicantFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (searchQuery.trim()) n++
    if (positionFilter) n++
    if (academicYearFilter) n++
    if (internshipStartFilter) n++
    if (internshipEndFilter) n++
    if (durationFilter) n++
    if (institutionFilter) n++
    return n
  }, [
    searchQuery,
    positionFilter,
    academicYearFilter,
    internshipStartFilter,
    internshipEndFilter,
    durationFilter,
    institutionFilter,
  ])

  return (
    <>
      {/* Filter card — aligned with Find Candidates (responsive collapse + grid) */}
      <div className="mb-4 min-w-0 rounded-2xl border border-gray-100 bg-white px-2.5 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-none sm:mb-4 sm:rounded-[16px] sm:px-6 sm:py-5">
        <button
          type="button"
          className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-left transition-colors hover:bg-[#ECEFF3] dark:bg-gray-900/50 dark:hover:bg-gray-900 md:hidden"
          onClick={() => setMobileFiltersOpen((o) => !o)}
          aria-expanded={mobileFiltersOpen}
        >
          <span className="text-sm font-semibold text-[#111827] dark:text-white">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                {activeFilterCount}
              </span>
            )}
          </span>
          <svg
            className={`h-5 w-5 shrink-0 text-gray-600 transition-transform dark:text-gray-400 ${mobileFiltersOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
          <p className="mb-3 hidden text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb] md:block">Filters</p>

          {/* Row 1: Search full width on lg; Position + Year on 2-col mobile */}
          <div className="mb-3 grid min-w-0 grid-cols-2 gap-2 sm:mb-4 sm:gap-3 lg:mb-4 lg:grid-cols-3 lg:gap-4">
            <div className="col-span-2 min-w-0 lg:col-span-1">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 md:left-3">
                  <svg className="h-4 w-4 text-[#9CA3AF] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Name, skills…"
                  className="h-10 min-h-[40px] w-full rounded-lg border border-[#D1D5DB] bg-white pl-8 pr-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 md:h-[42px] md:rounded-[8px] md:pl-9 md:pr-3"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Position</label>
              <SearchableDropdown
                options={positionOptions.map((p) => ({ value: p, label: p }))}
                value={positionFilter}
                onChange={onPositionChange}
                placeholder="Position"
                className="w-full"
                allOptionLabel="Position"
                variant="applicants"
                compact
              />
            </div>

            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">
                <span className="md:hidden">Year</span>
                <span className="hidden md:inline">Academic Year</span>
              </label>
              <div className="relative">
                <select
                  value={academicYearFilter}
                  onChange={(e) => onAcademicYearChange(e.target.value)}
                  className="h-10 min-h-[40px] w-full appearance-none rounded-lg border border-[#D1D5DB] bg-white px-2 pr-8 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white md:h-[42px] md:rounded-[8px] md:px-3 md:pr-9"
                >
                  <option value="">Year</option>
                  {ACADEMIC_YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 md:right-3">
                  <svg className="h-4 w-4 text-[#6B7280] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: dates + duration + institution */}
          <div className="mb-3 grid min-w-0 grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] xl:items-end xl:gap-3">
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">
                <span className="md:hidden">Start</span>
                <span className="hidden md:inline">Internship start</span>
              </label>
              <input
                type="date"
                value={internshipStartFilter}
                onChange={(e) => onInternshipStartChange(e.target.value)}
                className="h-10 min-h-[40px] w-full min-w-0 max-w-full rounded-lg border border-[#D1D5DB] bg-white px-1.5 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:[color-scheme:dark] md:h-[42px] md:rounded-[8px] md:px-3"
              />
            </div>
            <div className="hidden items-center justify-center pb-[2px] text-[16px] text-[#9CA3AF] dark:text-[#757575] xl:flex">–</div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px] xl:invisible xl:mb-1.5">
                <span className="md:hidden">End</span>
                <span className="hidden md:inline">Internship end</span>
              </label>
              <input
                type="date"
                value={internshipEndFilter}
                onChange={(e) => onInternshipEndChange(e.target.value)}
                className="h-10 min-h-[40px] w-full min-w-0 max-w-full rounded-lg border border-[#D1D5DB] bg-white px-1.5 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:[color-scheme:dark] md:h-[42px] md:rounded-[8px] md:px-3"
              />
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Duration</label>
              <input
                type="text"
                value={durationFilter}
                onChange={(e) => onDurationChange(e.target.value)}
                placeholder="Months"
                className="h-10 min-h-[40px] w-full rounded-lg border border-[#D1D5DB] bg-white px-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 md:h-[42px] md:rounded-[8px] md:px-3"
              />
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-2 xl:col-span-1">
              <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-[#e5e7eb] md:mb-1.5 md:text-[13px]">Institution</label>
              {universitiesLoading ? (
                <div className="flex h-10 min-h-[40px] w-full items-center rounded-lg border border-[#D1D5DB] bg-gray-50 px-2.5 dark:border-gray-700 dark:bg-gray-900/50 md:h-[42px] md:rounded-[8px] md:px-3">
                  <span className="text-[13px] text-[#9CA3AF] dark:text-gray-500">Loading...</span>
                </div>
              ) : (
                <SearchableDropdown
                  options={universities.map((uni) => ({
                    value: uni.name,
                    label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                    code: uni.code,
                  }))}
                  value={institutionFilter}
                  onChange={onInstitutionChange}
                  placeholder="University"
                  className="w-full"
                  allOptionLabel="All Universities"
                  variant="applicants"
                  compact
                />
              )}
            </div>
          </div>

          <div className="flex justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={onClearFilters}
              className="h-10 min-h-[40px] w-full rounded-lg border border-[#D1D5DB] bg-white px-4 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-700 sm:h-[38px] sm:w-auto sm:rounded-[8px] sm:px-5"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-[12px] flex flex-wrap gap-[8px]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`min-w-[85px] rounded-[6px] border px-[18px] py-[8px] text-[12px] font-semibold transition ${
              activeTab === tab.key
                ? 'border-[#2563EB] bg-white text-[#2563EB] dark:bg-white dark:text-[#2563EB]'
                : 'border-[#CBD5E1] bg-white text-[#374151] hover:bg-[#F8FAFC] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mb-[16px] text-[14px] font-semibold text-[#1F2937] dark:text-[#ffffff]">
        {totalCount} Total Candidate{totalCount === 1 ? '' : 's'}
      </p>
    </>
  )
}