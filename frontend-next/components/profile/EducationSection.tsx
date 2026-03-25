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

type VerificationStep = "upload" | "success" | "mismatch" | "error";
interface VerifyResult {
  verified: boolean;
  extractedData?: Record<string, string>;
  mismatches?: any[];
  error?: string;
  message?: string;
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

  const [verifyingEduId, setVerifyingEduId] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<{
    isOpen: boolean;
    eduId: string | null;
    step: VerificationStep;
    result: VerifyResult | null;
  }>({ isOpen: false, eduId: null, step: "upload", result: null });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({
    isOpen: false,
    id: "",
  });

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await handleDelete(deleteModal.id);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow =
      isModalOpen || verifyState.isOpen || deleteModal.isOpen
        ? "hidden"
        : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, verifyState.isOpen, deleteModal.isOpen]);

  const handleDelete = async (id: string) => {
    try {
      const { apiFetch } = await import("@/lib/api");
      await apiFetch(`/api/candidates/education/${id}`, { method: "DELETE" });
      onRefresh?.();
    } catch (e: any) {
      alert(e.message || "Failed to delete education");
    }
  };

  const handleNeedEdit = (eduId: string) => {
    const edu = education.find((e) => e.id === eduId) || null;
    setEditingEducation(edu);
    setIsModalOpen(true);
  };

  const executeVerification = async (file: File, eduId: string) => {
    setVerifyState((prev) => ({ ...prev, isOpen: false }));
    setVerifyingEduId(eduId);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const formData = new FormData();
      formData.append("file", file);

      let token = "";
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )auth=([^;]+)/);
        if (match) token = match[2];
        if (!token) token = localStorage.getItem("token") || "";
      }

      const res = await fetch(
        `${API_BASE_URL}/api/candidates/education/${eduId}/transcript`,
        {
          method: "POST",
          credentials: "include",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }

      const data: VerifyResult = await res.json();

      setVerifyState({
        isOpen: true,
        eduId,
        step: data.verified ? "success" : "mismatch",
        result: data,
      });

      if (data.verified) {
        onRefresh?.();
      }
    } catch (err: any) {
      setVerifyState({
        isOpen: true,
        eduId,
        step: "error",
        result: {
          verified: false,
          message: err.message || "An unexpected error occurred",
        },
      });
    } finally {
      setVerifyingEduId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-800 transition-colors">
      {/* Section Header */}
      <div className="flex flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              <path
                d="M3.88 12.83l7.12 3.88 7.12-3.88-7.12-3.88-7.12 3.88z"
                opacity=".3"
              />
              <path d="M19 13.52V17l-7 4-7-4v-3.48l7 3.82 7-3.82z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Education
          </h2>
        </div>

        {education.length === 0 && (
          <button
            onClick={() => {
              setEditingEducation(null);
              setIsModalOpen(true);
            }}
            className="w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <span className="sm:hidden">+ Add</span>
            <span className="hidden sm:inline">+ Add Education</span>
          </button>
        )}
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20">
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            No education history added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {education.map((edu) => {
            const isVerified = (edu as any).isVerified === true;
            const isVerifying = verifyingEduId === edu.id;

            return (
              <div
                key={edu.id}
                className="group bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all duration-300"
              >
                {/* Top Header of Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-2">
                      {edu.universityName || "University Name"}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {isVerified ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-full text-[10px] sm:text-xs font-bold shadow-sm">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified Transcript
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full text-[10px] sm:text-xs font-bold shadow-sm">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pending Verify
                        </div>
                      )}

                      <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-full text-[10px] sm:text-xs font-bold">
                        {edu.isCurrent ? "Ongoing" : "Completed"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="text-sm sm:text-base font-bold dark:text-gray-100 flex items-start gap-2">
                    <span className="text-blue-500 mt-1 flex-shrink-0">●</span>
                    <span>{`${edu.degreeName || "Degree Name"}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}`}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 pl-5">
                    {edu.gpa && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 uppercase text-[10px]">
                          GPA:
                        </span>
                        <span className="text-gray-900 dark:text-gray-200 font-bold">
                          {edu.gpa}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 uppercase text-[10px]">
                        Status:
                      </span>
                      <span className="text-gray-900 dark:text-gray-200">
                        {edu.isCurrent
                          ? `${edu.yearOfStudy || "Studying"}`
                          : "Graduated"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                  {/* Delete Button */}
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: true, id: edu.id })
                    }
                    className="p-2.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
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

                  {/* Right-side buttons */}
                  <div className="flex items-center gap-3">
                    {isVerifying ? (
                      <div className="flex items-center justify-center gap-2 px-5 py-2 text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm animate-pulse">
                        <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        AI Verifying...
                      </div>
                    ) : isVerified ? (
                      <button
                        className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm"
                        onClick={() => {
                          const url = (edu as any).transcriptUrl;
                          if (url)
                            window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        View Transcript
                      </button>
                    ) : (
                      <button
                        className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm"
                        onClick={() =>
                          setVerifyState({
                            isOpen: true,
                            eduId: edu.id,
                            step: "upload",
                            result: null,
                          })
                        }
                      >
                        Upload Transcript
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingEducation(edu);
                        setIsModalOpen(true);
                      }}
                      className="px-5 py-2 rounded-lg border-2 border-blue-500 bg-transparent text-sm font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Modals --- */}
      <EducationModal
        isOpen={isModalOpen}
        education={editingEducation}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEducation(null);
        }}
        onSave={() => onRefresh?.()}
      />

      <TranscriptUploadModal
        isOpen={verifyState.isOpen}
        step={verifyState.step}
        result={verifyState.result}
        onClose={() => setVerifyState((prev) => ({ ...prev, isOpen: false }))}
        onStartVerification={(file) => {
          if (verifyState.eduId) {
            executeVerification(file, verifyState.eduId);
          }
        }}
        onRetry={() => setVerifyState((prev) => ({ ...prev, step: "upload" }))}
        onNeedEdit={() => {
          if (verifyState.eduId) {
            handleNeedEdit(verifyState.eduId);
            setVerifyState((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        onSuccessConfirm={() =>
          setVerifyState((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              !isDeleting && setDeleteModal({ isOpen: false, id: "" })
            }
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-500"
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
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3">
              Confirm Delete
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8 font-medium">
              This will permanently remove your education record.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModal({ isOpen: false, id: "" })}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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