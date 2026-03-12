"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

// --- แก้ไขส่วน Delete Confirmation Modal ให้ถูกต้อง ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  certName: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, certName, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Certificate?</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-700">"{certName}"</span>? This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Delete"}
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

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
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
      await apiFetch(`/api/candidates/certificates/${deleteModal.id}`, { method: "DELETE" });
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
      if (data.date) formData.append("issueDate", new Date(data.date).toISOString());
      
      data.tags?.forEach((tag) => formData.append("relatedSkills", tag));
      if (data.file) formData.append("file", data.file);

      const endpoint = currentCert?.id ? `/api/candidates/certificates/${currentCert.id}` : `/api/candidates/certificates`;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1C2D4F]">Certificates</h2>
        </div>
        <button
          onClick={() => { setCurrentCert(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          + Add Certificate
        </button>
      </div>

      <div className="space-y-6">
        {certificates.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed">No certificates added yet.</p>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{cert.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{cert.issuedBy}</span>
                    {cert.date && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{new Date(cert.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{cert.description || "No description provided."}</p>
                  <div className="flex flex-wrap gap-2">
                    {cert.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold border border-blue-100">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-3 mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => setDeleteModal({ isOpen: true, id: cert.id, name: cert.name })}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="px-5 py-1.5 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">View File</a>
                )}
                <button onClick={() => { setCurrentCert(cert); setIsModalOpen(true); }} className="px-5 py-1.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">Edit Certificate</button>
              </div>
            </div>
          ))
        )}
      </div>

      <CertificatesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingCertificate={currentCert} />

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={handleConfirmDelete} 
        certName={deleteModal.name} 
        isDeleting={isDeletingLoading} 
      />
    </div>
  );
}