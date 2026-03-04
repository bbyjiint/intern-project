'use client'

import Link from 'next/link'
import { Project } from '@/hooks/useProfile'

interface ProjectsSectionProps {
  projects: Project[]
  onAdd: () => void
  onEdit: (id: string) => void
}

export default function ProjectsSection({ projects, onAdd, onEdit }: ProjectsSectionProps) {
  const displayedProjects = projects.slice(0, 3)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
        >
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 italic py-4 text-center">No projects provided.</p>
      ) : (
        <div className="space-y-8">
          {displayedProjects.map((project) => (
            <div key={project.id} className="relative border border-gray-100 rounded-xl p-6 bg-white">
              {/* Status Badge (Top Right) */}
              <div className="absolute top-6 right-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  project.skills?.length ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {project.skills?.length ? 'File Uploaded' : 'No File Uploaded'}
                </div>
              </div>

              {/* Project Info */}
              <div className="mb-4 pr-32">
                <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Role: {project.role || 'Web Developer'} | Mar 2024 - Apr 2024
                </p>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {project.description || 'Currently developing an interactive map website with QR code access, GPS navigation, filtering, and real-time event updates.'}
                </p>
              </div>

              {/* Credibility Section */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Upload Files for Credibility</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Github Item */}
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className="w-8 h-8 opacity-70" alt="Github" />
                      <span className="text-sm font-medium text-gray-700">Github Linked</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Project Link Item */}
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-3 text-blue-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Project Link</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  {/* PDF Upload Item */}
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Upload File</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {['Tableau', 'SQL', 'Python'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button className="px-4 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors">
                    Edit Files
                  </button>
                  <button
                    onClick={() => onEdit(project.id)}
                    className="px-4 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors"
                  >
                    Edit Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All */}
      {projects.length > 3 && (
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link href="/intern/project" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
            View all project
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}