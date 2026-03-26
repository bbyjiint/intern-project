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

  const safeValue = value ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOptionValue = (option: Option): string =>
    typeof option === "string" ? option : option.value;

  const getOptionLabel = (option: Option): string =>
    typeof option === "string" ? option : option.label;

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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
        className="flex min-h-[2.5rem] w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 md:min-h-[2.75rem] md:px-4 md:py-2.5"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {safeValue.length > 0 ? (
            safeValue.map((selected) => (
              <span
                key={selected}
                className="inline-flex max-w-full items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <span className="min-w-0 truncate">{getSelectedLabel(selected)}</span>
                <span
                  onClick={(e) => handleRemove(selected, e)}
                  className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5 cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </span>
            ))
          ) : (
            <span className="min-w-0 truncate text-sm text-gray-500 dark:text-slate-400">
              {placeholder}
            </span>
          )}
        </div>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform dark:text-slate-400 md:h-5 md:w-5 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-slate-600">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
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
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors md:px-4 ${
                      isSelected
                        ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-900 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 dark:border-slate-500"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="min-w-0 break-words text-left">{optionLabel}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-slate-400 text-sm">No options found</div>
            )}
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-xs mt-1 text-[#A9B4CD] dark:text-slate-500">{helperText}</p>
      )}
    </div>
  );
}