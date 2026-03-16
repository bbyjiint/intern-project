'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchableDropdownProps {
  options: Array<{ value: string; label: string; code?: string | null }>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  allOptionLabel?: string
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  allOptionLabel = 'All',
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
        className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-left flex items-center justify-between focus:outline-none focus:border-[#94A3B8]"
      >
        <span className={`text-[13px] truncate ${value === '' ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}>
          {displayValue}
        </span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-[#6B7280] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D1D5DB] rounded-[8px] shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-[#E5E7EB]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-[6px] border border-[#D1D5DB] px-3 py-2 text-[13px] outline-none focus:border-[#94A3B8]"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {allOptionLabel && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-4 py-2 text-left text-[13px] hover:bg-[#F3F4F6] transition-colors ${
                  value === '' ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#111827]'
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
                    className={`w-full px-4 py-2 text-left text-[13px] hover:bg-[#F3F4F6] transition-colors ${
                      value === option.value ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#111827]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {option.code && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          codeMatches && !labelMatches
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {option.code}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-2 text-[13px] text-[#9CA3AF]">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}