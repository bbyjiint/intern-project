"use client";

import { useState, useEffect } from "react";
import CertificatesModal, { ModalCertificate } from "./CertificatesModal";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";

export interface Certificate {
  id: string;
  name: string;
  issuedBy: string;
  date: string;
  description: string;
  tags: string[];
  url?: string;
}

// --- Delete Confirmation Modal ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  certName: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  certName,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isDeleting && onClose()}
      ></div>

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600 dark:text-rose-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          Delete Certificate?
        </h3>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-black text-slate-900 dark:text-slate-100 underline decoration-rose-500/30">
            "{certName}"
          </span>
          ?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled={isDeleting}
            onClick={onClose}
            className="order-2 sm:order-1 flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="order-1 sm:order-2 flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Delete Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function CertificateSection() {
  const { profileData, refetch } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCert, setCurrentCert] = useState<ModalCertificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: "",
    name: "",
  });

  useEffect(() => {
    const shouldHideScroll = isModalOpen || deleteModal.isOpen;
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
  }, [isModalOpen, deleteModal.isOpen]);

  useEffect(() => {
    if (profileData?.certificates) {
      const mappedCerts = profileData.certificates.map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        issuedBy: cert.issuedBy || "",
        date: cert.issueDate || cert.date || "",
        description: cert.description || "",
        tags: cert.relatedSkills || cert.tags || [],
        url: cert.url,
      }));
      setCertificates(mappedCerts);
    }
  }, [profileData]);

  const handleConfirmDelete = async () => {
    try {
      setIsDeletingLoading(true);
      await apiFetch(`/api/candidates/certificates/${deleteModal.id}`, {
        method: "DELETE",
      });
      await refetch();
      setDeleteModal({ isOpen: false, id: "", name: "" });
    } catch (error) {
      alert("Failed to delete certificate.");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleSave = async (data: ModalCertificate) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.issuedBy) formData.append("issuedBy", data.issuedBy);
      if (data.date)
        formData.append("issueDate", new Date(data.date).toISOString());

      data.tags?.forEach((tag) => formData.append("relatedSkills", tag));
      if (data.file) formData.append("file", data.file);

      const endpoint = currentCert?.id
        ? `/api/candidates/certificates/${currentCert.id}`
        : `/api/candidates/certificates`;
      await apiFetch(endpoint, {
        method: currentCert?.id ? "PUT" : "POST",
        body: formData,
      });

      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save certificate.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-8 mb-6 transition-colors">
      <div className="flex flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-500/10 p-2 sm:p-2.5 rounded-xl flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Certificates
          </h2>
        </div>
        <button
          onClick={() => {
            setCurrentCert(null);
            setIsModalOpen(true);
          }}
          className="w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <span className="sm:hidden">+ Add</span>
          <span className="hidden sm:inline">+ Add Certificates</span>
        </button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {certificates.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-4">
            <p className="text-sm sm:text-base text-slate-400 dark:text-slate-500 font-bold italic tracking-wide">
              No certificates added yet.
            </p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="group bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-xl dark:hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                    {cert.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-sm mb-4 font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span className="text-slate-700 dark:text-slate-300">
                      {cert.issuedBy}
                    </span>
                    {cert.date && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full hidden sm:block"></span>
                        <span className="font-medium text-slate-400">
                          {new Date(cert.date).toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                    {cert.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-end space-x-2 sm:space-x-3 mt-6 pt-5 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() =>
                    setDeleteModal({
                      isOpen: true,
                      id: cert.id,
                      name: cert.name,
                    })
                  }
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-5 py-2 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-center"
                  >
                    View Doc
                  </a>
                )}
                <button
                  onClick={() => {
                    setCurrentCert(cert);
                    setIsModalOpen(true);
                  }}
                  className="px-4 sm:px-6 py-2 bg-white dark:bg-slate-900 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CertificatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingCertificate={currentCert}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        certName={deleteModal.name}
        isDeleting={isDeletingLoading}
      />
    </div>
  );
}
