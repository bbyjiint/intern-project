'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type EmployerSidebarItem = 'profile' | 'applicants' | 'job-post' | 'bookmark'

interface EmployerSidebarProps {
  activeItem?: EmployerSidebarItem | null
}

const items: Array<{
  id: EmployerSidebarItem
  label: string
  href: string
  icon: JSX.Element
}> = [
  {
    id: 'profile',
    label: 'Profile',
    href: '/employer/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'applicants',
    label: 'Applicants',
    href: '/employer/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'job-post',
    label: 'Job Post',
    href: '/employer/job-post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'bookmark',
    label: 'Bookmark',
    href: '/employer/bookmark',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
]

const inferActiveItem = (pathname: string | null): EmployerSidebarItem | null => {
  if (!pathname) return null
  if (pathname.startsWith('/employer/profile')) return 'profile'
  if (pathname.startsWith('/employer/bookmark')) return 'bookmark'
  if (pathname.startsWith('/employer/dashboard')) return 'applicants'
  if (pathname.startsWith('/employer/job-post') || pathname.startsWith('/employer/create-job-post')) return 'job-post'
  return null
}

export default function EmployerSidebar({ activeItem }: EmployerSidebarProps) {
  const pathname = usePathname()
  const currentItem = activeItem ?? inferActiveItem(pathname)

  return (
    <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
      <div className="px-6 space-y-2">
        {items.map((item) => {
          const isActive = currentItem === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                isActive ? 'text-white bg-[#0273B1]' : 'text-[#1C2D4F] hover:text-[#0273B1]'
              }`}
            >
              <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
