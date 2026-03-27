'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ReportBugModal from './ReportBugModal'

export type EmployerSidebarItem =
  | 'find-candidates'
  | 'profile'
  | 'applicants'
  | 'job-post'
  | 'bookmark'

interface EmployerSidebarProps {
  activeItem?: EmployerSidebarItem | null
  isOpen?: boolean
  onClose?: () => void
}

const items: Array<{
  id: EmployerSidebarItem
  label: string
  href: string
  icon: JSX.Element
}> = [
  {
    id: 'find-candidates',
    label: 'Find Candidates',
    href: '/employer/find-candidates',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/employer/profile',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'applicants',
    label: 'Applicants',
    href: '/employer/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'job-post',
    label: 'Job Post',
    href: '/employer/job-post',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'bookmark',
    label: 'Bookmark',
    href: '/employer/bookmark',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
]

const inferActiveItem = (pathname: string | null): EmployerSidebarItem | null => {
  if (!pathname) return null
  if (pathname.startsWith('/employer/profile-setup')) return null
  if (pathname.startsWith('/employer/find-candidates')) return 'find-candidates'
  if (pathname.startsWith('/employer/profile')) return 'profile'
  if (pathname.startsWith('/employer/bookmark')) return 'bookmark'
  if (pathname.startsWith('/employer/dashboard')) return 'applicants'
  if (pathname.startsWith('/employer/job-post') || pathname.startsWith('/employer/create-job-post')) return 'job-post'
  return null
}

export default function EmployerSidebar({ activeItem, isOpen, onClose }: EmployerSidebarProps) {
  const pathname = usePathname()
  const currentItem = activeItem ?? inferActiveItem(pathname)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)

  useEffect(() => {
    if (onClose && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose()
    }
  }, [pathname])

  return (
    <>
      <div
        className={`fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`
        fixed inset-y-0 left-0 z-[120] w-[280px] bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
        lg:relative lg:z-30 lg:translate-x-0 lg:shadow-none
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800/50 lg:hidden">
            <span className="font-bold text-slate-800 dark:text-slate-200">Navigation</span>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</p>
            {items.map((item) => {
              const isActive = currentItem === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`group flex w-full items-center space-x-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 dark:text-slate-500'}>{item.icon}</span>
                  <span className="font-bold tracking-tight">{item.label}</span>
                </Link>
              )
            })}

            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800 lg:hidden">
              <p className="mb-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Menu</p>

              <Link
                href="/employer/messages"
                onClick={() => onClose?.()}
                className="group mt-1 flex items-center space-x-3 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-bold">Message</span>
              </Link>

              <Link
                href="/employer/job-post?create=1"
                onClick={() => onClose?.()}
                className="group mt-1 flex items-center space-x-3 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-bold">Create Job Post</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  onClose?.()
                  setIsBugModalOpen(true)
                }}
                className="group mt-1 flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-slate-700 transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold">Report Bug</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <ReportBugModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </>
  )
}
