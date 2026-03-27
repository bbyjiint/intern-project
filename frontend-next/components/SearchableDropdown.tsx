'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchableDropdownProps {
  options: Array<{ value: string; label: string; code?: string | null }>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  allOptionLabel?: string
  variant?: 'default' | 'applicants'
  /** Shorter control height + radius for dense mobile layouts */
  compact?: boolean
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  allOptionLabel = 'All',
  variant = 'default',
  compact = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = (() => {
    if (!searchQuery) return options
    const searchLower = searchQuery.toLowerCase().trim()
    return options.filter((option) => option.label.toLowerCase().includes(searchLower))
  })()

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : allOptionLabel
  const isApplicantsVariant = variant === 'applicants'

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between border bg-white text-left transition-colors focus:border-[#94A3B8] focus:outline-none ${
          compact
            ? 'h-10 min-h-[40px] rounded-lg px-2.5 md:h-[42px] md:min-h-0 md:rounded-[8px] md:px-3'
            : 'h-[42px] rounded-[8px] px-3'
        } ${
          isApplicantsVariant
            ? 'border-[#D1D5DB] dark:border-gray-700 dark:bg-gray-900/50'
            : 'border-[#D1D5DB] dark:border-gray-700 dark:bg-gray-900/50'
        }`}
      >
        <span className={`truncate text-[13px] ${value === ''
          ? 'text-[#9CA3AF] dark:text-gray-500'
          : isApplicantsVariant ? 'text-[#111827] dark:text-[#e5e7eb]' : 'text-[#111827] dark:text-white'}`}>
          {displayValue}
        </span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-[#6B7280] transition-transform ${isApplicantsVariant ? 'dark:text-gray-400' : 'dark:text-gray-400'} ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-[8px] border bg-white shadow-lg ${
          isApplicantsVariant
            ? 'border-[#D1D5DB] dark:border-gray-700 dark:bg-gray-800'
            : 'border-[#D1D5DB] dark:border-gray-700 dark:bg-gray-800'
        }`}>
          <div className={`border-b border-[#E5E7EB] p-2 ${isApplicantsVariant ? 'dark:border-gray-700' : 'dark:border-gray-700'}`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-[6px] border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] ${
                isApplicantsVariant
                  ? 'dark:border-gray-700 dark:bg-gray-900/50 dark:text-[#e5e7eb] dark:placeholder:text-gray-500'
                  : 'dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500'
              }`}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {allOptionLabel && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-[#F3F4F6] dark:hover:bg-gray-700 ${
                  value === ''
                    ? 'bg-[#EFF6FF] dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 font-medium'
                    : isApplicantsVariant
                      ? 'text-[#111827] dark:text-[#e5e7eb]'
                      : 'text-[#111827] dark:text-white'
                }`}
              >
                {allOptionLabel}
              </button>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const searchLower = searchQuery.toLowerCase()
                const codeMatches = option.code?.toLowerCase().includes(searchLower) ?? false
                const labelMatches = option.label.toLowerCase().includes(searchLower)

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-[#F3F4F6] dark:hover:bg-gray-700 ${
                      value === option.value
                        ? 'bg-[#EFF6FF] dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 font-medium'
                        : isApplicantsVariant
                          ? 'text-[#111827] dark:text-[#e5e7eb]'
                          : 'text-[#111827] dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {option.code && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          codeMatches && !labelMatches
                            ? 'bg-blue-100 text-blue-700 font-medium dark:bg-[#0273b1]/10 dark:text-[#0273b1]'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {option.code}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-2 text-[13px] text-[#9CA3AF] dark:text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}