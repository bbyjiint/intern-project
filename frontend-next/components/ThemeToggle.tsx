'use client'

import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
        aria-label="Toggle theme"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-[#223A57] dark:bg-[#10273F] dark:text-white dark:hover:bg-[#223A57] dark:focus:ring-offset-[#0B1C2C]"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          className="h-4 w-4 text-gray-700 dark:text-[#8A94A6]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="h-4 w-4 text-gray-700 dark:text-[#8A94A6]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  )
}
