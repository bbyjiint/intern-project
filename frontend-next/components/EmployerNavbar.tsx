'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EmployerNavbar() {
  const pathname = usePathname()
  const isMessagesPage = pathname?.includes('/messages')

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div>
              <Link href="/employer/dashboard" className="text-2xl font-bold text-blue-600">
                CompanyHub
              </Link>
              <p className="text-xs text-gray-500">RECRUITING</p>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/employer/dashboard"
                className={`font-medium pb-1 transition-colors ${
                  !isMessagesPage
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Find Candidates
              </Link>
              <Link
                href="/employer/messages"
                className={`font-medium pb-1 transition-colors ${
                  isMessagesPage
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Messages
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Senior Recruiter</p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              SJ
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

