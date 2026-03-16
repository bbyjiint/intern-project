"use client";

import { useEffect, useState } from "react";
import { Education } from "@/hooks/useProfile";
import EducationModal from "./EducationModal";
import TranscriptUploadModal from "./TranscriptModal";

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
  const [uploadEduId, setUploadEduId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string; // เก็บ ID ที่กำลังจะถูกลบ
  }>({
    isOpen: false,
    id: "",
  });

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await handleDelete(deleteModal.id); // เรียกฟังก์ชันลบจริงของคุณ
      setDeleteModal({ isOpen: false, id: "" }); // ลบเสร็จก็ปิด Modal
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  // เพิ่มส่วนนี้เข้าไปครับ
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // คืนค่าเดิมเมื่อปิดหรือเปลี่ยนหน้า
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const handleDelete = async (id: string) => {
    console.log("Delete id:", id);
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
                  onClick={() => setDeleteModal({ isOpen: true, id: edu.id })}
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
                  onClick={() => setUploadEduId(edu.id)}
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

      {/* เติมวงเล็บปิดของ uploadEduId ตรงนี้ให้สมบูรณ์ */}
      {uploadEduId && (
        <TranscriptUploadModal
          isOpen={!!uploadEduId}
          educationId={uploadEduId}
          onClose={() => setUploadEduId(null)}
          onUploaded={() => {
            setUploadEduId(null);
            onRefresh?.();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteModal({ isOpen: false, id: "" })}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete This Education?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this Education? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModal({ isOpen: false, id: "" })}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
