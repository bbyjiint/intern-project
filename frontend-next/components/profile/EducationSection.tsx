"use client";

import { useState } from "react";
import { Education } from "@/hooks/useProfile";
import EducationModal from "./EducationModal";

interface EducationSectionProps {
  education: Education[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRefresh?: () => void;
}

export default function EducationSection({
  education,
  onAdd,
  onEdit,
  onRefresh,
}: EducationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null,
  );

  const handleDelete = async (id: string) => {
    console.log("Delete id:", id);
    const confirmed = window.confirm(
      "Are you sure you want to delete this education entry?",
    );
    if (!confirmed) return;

    try {
      const { apiFetch } = await import("@/lib/api");
      await apiFetch(`/api/candidates/education/${id}`, { method: "DELETE" });
      onRefresh?.();
    } catch (e: any) {
      alert(e.message || "Failed to delete education");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              <path
                d="M3.88 12.83l7.12 3.88 7.12-3.88-7.12-3.88-7.12 3.88z"
                opacity=".3"
              />
              <path d="M19 13.52V17l-7 4-7-4v-3.48l7 3.82 7-3.82z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
        </div>
        {education.length === 0 && (
          <button
            onClick={() => {
              setEditingEducation(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
          >
            + Add Education
          </button>
        )}
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
              className="relative border border-gray-100 rounded-xl p-5 hover:border-blue-100 transition-all bg-white"
            >
              {/* Status Badge (Top Right) */}
              <div className="absolute top-5 right-5">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Not Verified
                </div>
              </div>

              {/* Education Info */}
              <div className="pr-32">
                {" "}
                {/* Space for badge */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {edu.universityName || "University Name"}
                </h3>
                <div className="text-gray-600 text-sm space-y-1">
                  <p className="font-medium">
                    {`${edu.degreeName || "Bachelor of Engineering"}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}`}
                    {edu.gpa && (
                      <span className="text-gray-400 font-normal">
                        {" "}
                        | GPA: {edu.gpa}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500">
                    {edu.isCurrent
                      ? `${edu.yearOfStudy || "Currently studying"}${edu.yearOfStudy ? " (Currently studying)" : ""}`
                      : "Graduated"}
                  </p>
                </div>
              </div>

              {/* Action Buttons (Bottom Right) */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-2">
                <button
                  onClick={() => handleDelete(edu.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                <button
                  className="px-4 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => {
                    /* Logic for upload */
                  }}
                >
                  Upload Transcript
                </button>

                <button
                  onClick={() => {
                    setEditingEducation(edu);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <EducationModal
        isOpen={isModalOpen}
        education={editingEducation}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEducation(null);
        }}
        onSave={() => onRefresh?.()}
      />
    </div>
  );
}
