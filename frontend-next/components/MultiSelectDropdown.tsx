"use client";

import { useState, useRef, useEffect } from "react";

type Option = string | { value: string; label: string };

interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number;
  helperText?: string;
}

export default function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  maxSelections,
  helperText,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ป้องกัน value เป็น undefined
  const safeValue = value ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOptionValue = (option: Option): string => {
    return typeof option === "string" ? option : option.value;
  };

  const getOptionLabel = (option: Option): string => {
    return typeof option === "string" ? option : option.label;
  };

  const filteredOptions = options.filter((option) => {
    const label = getOptionLabel(option).toLowerCase();
    return label.includes(searchQuery.toLowerCase().trim());
  });

  const handleToggle = (option: Option) => {
    const optionValue = getOptionValue(option);
    if (safeValue.includes(optionValue)) {
      onChange(safeValue.filter((v) => v !== optionValue));
    } else {
      if (!maxSelections || safeValue.length < maxSelections) {
        onChange([...safeValue, optionValue]);
      }
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(safeValue.filter((v) => v !== optionValue));
  };

  const getSelectedLabel = (val: string): string => {
    const option = options.find((opt) => getOptionValue(opt) === val);
    return option ? getOptionLabel(option) : val;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white min-h-[44px]"
      >
        <div className="flex-1 flex flex-wrap gap-2">
          {safeValue.length > 0 ? (
            safeValue.map((selected) => (
              <span
                key={selected}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
              >
                {getSelectedLabel(selected)}
                <span
                  onClick={(e) => handleRemove(selected, e)}
                  className="hover:bg-blue-100 rounded-full p-0.5 cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? "transform rotate-180" : ""}`}
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
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = safeValue.includes(optionValue);
                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleToggle(option)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                      isSelected ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-900"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span>{optionLabel}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">No options found</div>
            )}
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-xs mt-1" style={{ color: "#A9B4CD" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}