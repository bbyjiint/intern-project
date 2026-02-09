'use client'

import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import Link from 'next/link'

export default function JobPostSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #E3F2FD 0%, #FFFFFF 300px)' }}>
      <EmployerNavbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your job post has been posted.
          </h2>
          
          {/* Action Button */}
          <Link
            href="/employer/job-post"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: '#0273B1' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#025a8f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0273B1'
            }}
          >
            Go to Job Post
          </Link>
        </div>
      </div>
    </div>
  )
}
