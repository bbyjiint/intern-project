'use client'

import { useState, type ReactNode } from 'react'
import EmployerSidebar, { type EmployerSidebarItem } from '@/components/EmployerSidebar'

interface EmployerSidebarShellProps {
  activeItem?: EmployerSidebarItem | null
  children: ReactNode
}

/**
 * Matches intern layout: slide-over nav on &lt;lg, fixed column on lg+, FAB to open on mobile.
 */
export default function EmployerSidebarShell({ activeItem, children }: EmployerSidebarShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <EmployerSidebar activeItem={activeItem} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.15)] transition-all duration-200 hover:scale-110 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {children}
    </div>
  )
}
