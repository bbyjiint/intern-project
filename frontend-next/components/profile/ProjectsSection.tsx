'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Project } from '@/hooks/useProfile'
import ProjectsModal from './ProjectsModal' // ตรวจสอบ path ให้ถูกต้อง

interface ProjectsSectionProps {
  projects: Project[]
  onAdd: (project: any) => Promise<void>
  onEdit: (id: string, project: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function ProjectsSection({ projects, onAdd, onEdit, onDelete }: ProjectsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const displayedProjects = projects.slice(0, 3)

  // เปิด Modal สำหรับเพิ่มใหม่
  const handleAddNew = () => {
    setCurrentProject(null)
    setIsModalOpen(true)
  }

  // เปิด Modal สำหรับแก้ไข
  const handleEditClick = (project: Project) => {
    setCurrentProject(project)
    setIsModalOpen(true)
  }

  // จัดการเมื่อกดบันทึกใน Modal
  const handleSave = async (formData: any) => {
    if (currentProject?.id) {
      await onEdit(currentProject.id, formData)
    } else {
      await onAdd(formData)
    }
    setIsModalOpen(false)
  }

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
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-100"
        >
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400 italic">No projects provided. Add your first project to stand out!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayedProjects.map((project) => (
            <div key={project.id} className="relative border border-gray-100 rounded-xl p-6 bg-white hover:border-blue-200 transition-all shadow-hover">
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                  project.relatedSkills?.length ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${project.relatedSkills?.length ? 'bg-green-500' : 'bg-blue-500'}`} />
                  {project.relatedSkills?.length ? 'Complete' : 'Pending Files'}
                </div>
              </div>

              {/* Project Info */}
              <div className="mb-4 pr-32">
                <h3 className="text-lg font-bold text-[#1C2D4F]">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Role: <span className="font-medium text-gray-700">{project.role || 'Web Developer'}</span> | {project.startDate || 'N/A'} - {project.endDate || 'Present'}
                </p>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-2">
                  {project.description || 'Description not provided.'}
                </p>
              </div>

              {/* Credibility Grid (Icons) */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <CredibilityItem icon="github" label="Github Linked" active={!!project.githubUrl} />
                <CredibilityItem icon="link" label="Project Link" active={!!project.projectUrl} />
                <CredibilityItem icon="file" label="Documentation" active={false} />
              </div>

              {/* Skills & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-50 pt-4">
                <div className="flex flex-wrap gap-2">
                  {project.relatedSkills?.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md">
                      {skill}
                    </span>
                  )) || <span className="text-gray-300 text-xs">No skills tagged</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => project.id && onDelete?.(project.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditClick(project)}
                    className="px-4 py-1.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Edit Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Footer */}
      {projects.length > 3 && (
        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <Link href="/intern/project" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
            View all projects ({projects.length})
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Modal Integration */}
      <ProjectsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingProject={currentProject}
      />
    </div>
  )
}

// Helper Component for Credibility Items
function CredibilityItem({ icon, label, active }: { icon: string, label: string, active: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 border rounded-xl bg-gray-50/30 ${active ? 'border-green-100' : 'border-gray-100 opacity-60'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
          {icon === 'github' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>}
          {icon === 'link' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
          {icon === 'file' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        </div>
        <span className="text-xs font-bold text-gray-600">{label}</span>
      </div>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${active ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
        {active && (
          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  )
}