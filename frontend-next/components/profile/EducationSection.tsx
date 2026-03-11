'use client'

import { useEffect, useState } from 'react'
import { Education } from '@/hooks/useProfile'
import EducationModal from './EducationModal'
import { apiFetch } from '@/lib/api'
import TranscriptUploadModal from './TranscriptUploadModal'

interface EducationSectionProps {
  education: Education[]
  onAdd: () => void
  onEdit: (id: string) => void
  onRefresh?: () => void
}

export default function EducationSection({
  education,
  onAdd,
  onEdit,
  onRefresh
}: EducationSectionProps) {

  const [uploadEduId, setUploadEduId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)

  // Transcript modal state
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false)
  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null)

  useEffect(() => {
    if (isModalOpen || isTranscriptModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isModalOpen, isTranscriptModalOpen])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education entry?")) return

    try {
      await apiFetch(`/api/candidates/education/${id}`, {
        method: "DELETE",
      })

      onRefresh?.()
    } catch (error) {
      console.error("Failed to delete education:", error)
      alert("Failed to delete education entry.")
    }
  }

  const openTranscriptModal = (educationId: string) => {
    setSelectedEducationId(educationId)
    setIsTranscriptModalOpen(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Education</h2>

        <button
          onClick={() => {
            setEditingEducation(null)
            setIsModalOpen(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm"
        >
          + Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400 italic">
            No education history added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {education.map((edu) => (
            <div
              key={edu.id}
              className="border border-gray-100 rounded-xl p-5"
            >

              <h3 className="text-lg font-bold text-gray-900">
                {edu.universityName}
              </h3>

              <p className="text-gray-600 text-sm">
                {edu.degreeName} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
              </p>

              <div className="flex justify-end gap-3 mt-4">

                <button
                  onClick={() => handleDelete(edu.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setUploadEduId(edu.id)}
                  className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"
                >
                  Upload Transcript
                </button>

                <button
                  onClick={() => {
                    setEditingEducation(edu)
                    setIsModalOpen(true)
                  }}
                  className="px-6 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"
                >
                  Edit
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* Education modal */}
      <EducationModal
        isOpen={isModalOpen}
        education={editingEducation}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEducation(null)
        }}
        onSave={() => onRefresh?.()}
      />

      {/* Transcript modal */}
      <TranscriptUploadModal
        isOpen={!!uploadEduId}
        educationId={uploadEduId!}
        onClose={() => setUploadEduId(null)}
        onUploaded={() => onRefresh?.()}
      />

    </div>
  )
}
