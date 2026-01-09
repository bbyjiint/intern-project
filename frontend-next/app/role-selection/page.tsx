'use client'

import { useRouter } from 'next/navigation'

export default function RoleSelectionPage() {
  const router = useRouter()

  const handleInternClick = () => {
    router.push('/intern/dashboard')
  }

  const handleEmployerClick = () => {
    router.push('/employer/profile-setup')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Main White Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students and employers already using our platform to build the future of finance.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intern Card */}
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-8 hover:border-blue-500 transition-colors">
              <div className="text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14v7M5.176 14.248a12.078 12.078 0 01.665-6.479L12 14l-6.824-2.998a11.952 11.952 0 00-2.978 3.246zM18.824 11.002a12.078 12.078 0 01.665 6.479L12 14l6.824-2.998a11.952 11.952 0 012.978 3.246z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  I'm a Intern
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  Looking for internships and entry-level roles.
                </p>

                {/* Button */}
                <button
                  onClick={handleInternClick}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continue as Intern
                </button>
              </div>
            </div>

            {/* Employer Card */}
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-8 hover:border-gray-400 transition-colors">
              <div className="text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  I'm an Employer
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  Looking to hire top finance talent.
                </p>

                {/* Button */}
                <button
                  onClick={handleEmployerClick}
                  className="w-full bg-white border-2 border-gray-700 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue as Employer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

