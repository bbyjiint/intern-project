'use client'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                      Certificates
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium">
                      Manage and showcase your professional achievements and skills.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-72">
                      <svg
                        className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search certificates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:text-white rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddClick}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <span className="text-lg">+</span> Add Certificate
                    </button>
                  </div>
                </div>

                {/* Filters & Count */}
                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-2">
                    <button className="px-6 py-2 text-sm font-bold rounded-xl bg-blue-600 text-white shadow-md">
                      All
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter Skill
                    </button>
                  </div>
                  <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {filteredCertificates.length} Total Certificates
                  </h2>
                </div>

                {/* Certificates List */}
                <div className="grid grid-cols-1 gap-6">
                  {filteredCertificates.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400 dark:text-slate-500 font-medium">No certificates found matching your search.</p>
                    </div>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 transition-colors">
                            {cert.name}
                          </h3>
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                            <span>{cert.issuedBy || "Organization"}</span>
                            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                            <span className="text-slate-400 dark:text-slate-500 font-medium">{cert.issueDate}</span>
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2 max-w-2xl">
                            {cert.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {(cert.tags || []).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-black rounded-lg uppercase tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6 md:mt-0 flex-shrink-0">
                          <button
                            onClick={() => openDeleteConfirm(cert.id)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          <div className="flex gap-2">
                            {cert.url && cert.url !== "#" && (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                              >
                                VIEW FILE
                              </a>
                            )}
                            <button
                              onClick={() => handleEditClick(cert)}
                              className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-blue-600 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all shadow-sm"
                            >
                              EDIT
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
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          ></div>
          
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Delete Certificate?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              This action is permanent and cannot be undone. Are you sure?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-red-500/20"
              >
                {isDeleting ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CertificatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        editingCertificate={editingCert}
      />
    </div>
  );
}