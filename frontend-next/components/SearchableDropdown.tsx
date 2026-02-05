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

  // Close dropdown when clicking outside
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
    
    // Check if any option has an exact code match (case-insensitive)
    const exactCodeMatches = options.filter((option) => 
      option.code?.toLowerCase() === searchLower
    )
    
    // If we have exact code matches, only return those
    if (exactCodeMatches.length > 0) {
      return exactCodeMatches
    }
    
    // Otherwise, use contains logic for both name and code
    return options.filter((option) => {
      const matchesLabel = option.label.toLowerCase().includes(searchLower)
      const matchesCode = option.code?.toLowerCase().includes(searchLower) ?? false
      return matchesLabel || matchesCode
    })
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
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
      >
        <span className={value === '' ? 'text-gray-500' : 'text-gray-900'}>
          {displayValue}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {allOptionLabel && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                  value === '' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900'
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
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                      value === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col">
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
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">No universities found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
