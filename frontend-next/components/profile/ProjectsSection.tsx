'use client'

import Link from 'next/link'
import { Project } from '@/hooks/useProfile'

interface ProjectsSectionProps {
  projects: Project[]
  onAdd: () => void
  onEdit: (id: string) => void
}

export default function ProjectsSection({ projects, onAdd, onEdit }: ProjectsSectionProps) {
  // Show maximum 3 projects in profile page
  const displayedProjects = projects.slice(0, 3)
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Projects
        </h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#025a8f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0273B1'
          }}
        >
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 italic py-4">No projects provided.</p>
      ) : (
        <div className="space-y-6">
          {displayedProjects.map((project) => (
            <div key={project.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#1C2D4F' }}>
                    {project.name}
                    {project.role && ` - ${project.role}`}
                  </h3>
                  {project.linkedToExperience && (
                    <p className="text-sm text-gray-600 mb-2">
                      Linked to: {project.linkedToExperience}
                    </p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-gray-700 mb-2">{project.description}</p>
                  )}
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: '#E3F2FD', color: '#0273B1' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onEdit(project.id)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-colors ml-4"
                  style={{ 
                    borderColor: '#0273B1',
                    color: '#0273B1',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
          {projects.length > 3 && (
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/intern/project"
                className="text-sm font-medium flex items-center space-x-1 justify-center"
                style={{ color: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#0273B1'
                }}
              >
                <span>View All Projects ({projects.length})</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
