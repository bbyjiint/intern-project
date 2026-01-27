'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EmployerNavbar from '@/components/EmployerNavbar'

interface JobPost {
  id: string
  title: string
  companyName: string
  companyLogo: string
  location: string
  workType: string
  skills: string[]
  description: string
  postedDate: string
}

const mockJobPosts: JobPost[] = [
  {
    id: '1',
    title: 'Internship - UX/UI Designer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Hybrid',
    skills: ['Figma and Adobe Illustrator', 'Understanding of UX', 'Ability to work with developers'],
    description: 'We are looking for a UX/UI Designer Intern to support the design of user-centered digital experiences and collaborate with cross-functional teams.',
    postedDate: '4 days ago',
  },
]

export default function JobPostPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobPosts, setJobPosts] = useState<JobPost[]>(mockJobPosts)

  useEffect(() => {
    // Load job posts from localStorage
    const savedJobPosts = localStorage.getItem('jobPosts')
    if (savedJobPosts) {
      try {
        const posts = JSON.parse(savedJobPosts)
        // Convert to JobPost format and calculate postedDate
        const formattedPosts = posts.map((post: any) => {
          const postedDate = new Date(post.postedDate || post.createdAt)
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - postedDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          return {
            id: post.id || Date.now().toString(),
            title: post.jobTitle || post.title || 'Untitled Job Post',
            companyName: post.companyName || (() => {
              try {
                return JSON.parse(localStorage.getItem('employerProfileData') || '{}').companyName || 'Company Name'
              } catch {
                return 'Company Name'
              }
            })(),
            companyLogo: post.companyLogo || 'TRINITY',
            location: post.location || `${post.locationDistrict || ''}, ${post.locationProvince || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Location not specified',
            workType: post.workplaceType === 'on-site' ? 'On-site' : post.workplaceType === 'hybrid' ? 'Hybrid' : post.workplaceType === 'remote' ? 'Remote' : 'Not specified',
            skills: post.skills || [],
            description: post.jobDescription || post.description || '',
            postedDate: diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`,
          }
        })
        setJobPosts(formattedPosts.length > 0 ? formattedPosts : mockJobPosts)
      } catch (e) {
        console.error('Failed to parse job posts:', e)
      }
    }
  }, [])

  const filteredJobPosts = jobPosts.filter((post) => {
    const title = (post.title || '').toLowerCase()
    const companyName = (post.companyName || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return title.includes(query) || companyName.includes(query)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            <Link
              href="/employer/profile"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              href="/employer/dashboard"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Applicants</span>
            </Link>
            <Link
              href="/employer/job-post"
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-white">Job Post</span>
            </Link>
            <Link
              href="/employer/bookmark"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">Bookmark</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Job Posts</h1>

            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: '#0273B1', minWidth: '120px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                Find Post
              </button>
            </div>

            {/* Job Post Count */}
            <p className="text-lg font-medium text-gray-700 mb-6">
              {filteredJobPosts.length} post{filteredJobPosts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Job Posts Grid */}
          <div className="space-y-6">
            {filteredJobPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 relative"
              >
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => {
                    setJobPosts(jobPosts.filter((p) => p.id !== post.id))
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-red-600 rounded-lg flex flex-col items-center justify-center border-2 border-white shadow-sm relative overflow-hidden">
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-white"></div>
                      </div>
                      <span className="absolute bottom-2 text-white text-[10px] font-bold uppercase tracking-tight">{post.companyLogo}</span>
                    </div>
                  </div>

                  {/* Job Post Content */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h2>
                      <p className="text-gray-600 mb-2">{post.companyName}</p>
                      <p className="text-gray-500 text-sm">
                        {post.location} ({post.workType})
                      </p>
                    </div>

                    {/* Skills/Requirements */}
                    {post.skills && post.skills.length > 0 && (
                      <div className="mb-4">
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                          {post.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Description */}
                    {post.description && (
                      <p className="text-gray-600 text-sm mb-4">{post.description}</p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">{post.postedDate}</span>
                      <div className="flex gap-3">
                        <button
                          className="px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
                          style={{ borderColor: '#0273B1', color: '#0273B1', backgroundColor: 'white' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0F4F8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          View Applicants
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                          style={{ backgroundColor: '#0273B1' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#025a8f'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0273B1'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobPosts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No job posts found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
