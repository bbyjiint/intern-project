"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/InternSidebar";
import CertificatesModal, { ModalCertificate } from "@/components/profile/CertificatesModal";

export interface Certificate {
  id: string;
  name: string;
  url: string;
  type?: string | null;
  description?: string | null;
  issuedBy?: string | null;
  issueDate?: string | null;
  createdAt: string;
  tags?: string[];
}

export default function CertificatesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<ModalCertificate | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCertificates = useCallback(async () => {
    try {
      const data = await apiFetch<{ profile: any }>("/api/candidates/profile");
      const raw = data.profile?.files?.certificates || [];
      const mapped: Certificate[] = raw.map((c: any) => ({
        id: c.id,
        name: c.name,
        url: c.url,
        type: c.type,
        description: c.description || "",
        issuedBy: c.issuedBy || "",
        issueDate: c.issueDate
          ? new Date(c.issueDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        tags: c.relatedSkills || [],
        createdAt: c.createdAt,
      }));
      setCertificates(mapped);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, isDeleteModalOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>("/api/auth/me");
        if (userData.user.role === "COMPANY") {
          router.push("/employer/profile");
          return;
        }
        if (!userData.user.role) {
          router.push("/role-selection");
          return;
        }
        await fetchCertificates();
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, fetchCertificates]);

  const openDeleteConfirm = (id: string) => {
    setCertToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!certToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/candidates/certificates/${certToDelete}`, { method: "DELETE" });
      await fetchCertificates();
      setIsDeleteModalOpen(false);
      setCertToDelete(null);
    } catch (error) {
      alert("Failed to delete certificate.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddClick = () => {
    setEditingCert(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (cert: Certificate) => {
    setEditingCert({
      id: cert.id,
      name: cert.name,
      description: cert.description || "",
      issuedBy: cert.issuedBy || "",
      date: cert.issueDate || "",
      tags: cert.tags || [],
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (savedData: ModalCertificate) => {
    try {
      const formData = new FormData();
      formData.append("name", savedData.name);
      if (savedData.description) formData.append("description", savedData.description);
      if (savedData.issuedBy) formData.append("issuedBy", savedData.issuedBy || "");
      if (savedData.date) formData.append("issueDate", new Date(savedData.date).toISOString());
      if (savedData.tags) {
        savedData.tags.forEach((tag) => formData.append("relatedSkills", tag));
      }
      if (savedData.file) formData.append("file", savedData.file);

      const endpoint = editingCert?.id
        ? `/api/candidates/certificates/${editingCert.id}`
        : `/api/candidates/certificates`;
      const method = editingCert?.id ? "PUT" : "POST";

      await apiFetch(endpoint, { method, body: formData });
      await fetchCertificates();
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save certificate. Please try again.");
    }
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.issuedBy && cert.issuedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-gray-100 flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="layout-container layout-page flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    Certificates
                  </h1>
                  <p className="text-gray-400 text-base">
                    Manage and showcase your professional achievements and skills.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-full lg:w-72">
                    <svg
                      className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#161B26] border border-gray-700 rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddClick}
                    className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all whitespace-nowrap shadow-lg shadow-blue-900/20"
                  >
                    + Add Certificate
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <button className="px-10 py-2.5 text-sm font-bold rounded-xl bg-blue-600/10 text-blue-400 border border-blue-600/30">
                  All
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#161B26] border border-gray-700 text-gray-300 font-bold text-sm rounded-xl hover:bg-[#1f2633] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Skill
                </button>
              </div>

              {/* Count */}
              <h2 className="text-xl font-bold text-white mb-6">
                {filteredCertificates.length} Total Certificates
              </h2>

              {/* Certificates List */}
              <div className="grid grid-cols-1 gap-6">
                {filteredCertificates.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 bg-[#161B26] rounded-2xl border border-gray-800 border-dashed">
                    No certificates found. Try adjusting your search.
                  </div>
                ) : (
                  filteredCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="group bg-[#161B26] rounded-2xl border border-gray-800 p-6 hover:border-blue-500/50 transition-all duration-300 shadow-xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {cert.name}
                        </h3>
                        <button
                          onClick={() => openDeleteConfirm(cert.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <p className="text-sm font-medium text-blue-400/80 mb-4">
                        Issued by {cert.issuedBy || "Unknown"} • {cert.issueDate || "N/A"}
                      </p>
                      
                      <p className="text-gray-400 leading-relaxed mb-6 text-base max-w-3xl">
                        {cert.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                        <div className="flex flex-wrap gap-2">
                          {(cert.tags || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          {cert.url && cert.url !== "#" && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-gray-800 text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-700 transition-all border border-gray-700"
                            >
                              View File
                            </a>
                          )}
                          <button
                            onClick={() => handleEditClick(cert)}
                            className="px-5 py-2.5 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-600/30"
                          >
                            Edit Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          ></div>
          
          <div className="relative bg-[#161B26] border border-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">Delete Certificate?</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              This action is permanent and cannot be undone. Are you sure you want to proceed?
            </p>
            
            <div className="flex gap-4">
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-2xl transition-all disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-red-900/20"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Make sure to update the internal styling of CertificatesModal to Dark Mode as well */}
      <CertificatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        editingCertificate={editingCert}
      />
    </div>
  );
}

