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

  // --- ส่วนที่เพิ่มใหม่: สำหรับ Delete Confirmation Popup ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // ---------------------------------------------------

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
    // ป้องกันการ Scroll เมื่อเปิด Modal ใดๆ
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

  // ฟังก์ชันเรียกเปิด Popup ยืนยันการลบ
  const openDeleteConfirm = (id: string) => {
    setCertToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // ฟังก์ชันลบจริงเมื่อกดยืนยันใน Popup
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
      if (savedData.issuedBy) formData.append("issuedBy", savedData.issuedBy);
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
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0273B1] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-[36px] font-extrabold text-gray-900 mb-1 tracking-tight">
                    Certificate
                  </h1>
                  <p className="text-gray-500 text-sm">
                    A collection of certificate you have created and added to your profile.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-full lg:w-72">
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    />
                  </div>
                  <button
                    onClick={handleAddClick}
                    className="px-5 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
                  >
                    + Add Certificate
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <button className="px-8 py-2 text-sm font-bold rounded-lg border border-[#3B82F6] text-[#3B82F6] bg-white shadow-sm">
                  All
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-800 font-bold text-sm rounded-lg hover:bg-gray-50 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Skill
                </button>
              </div>

              {/* Count */}
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">
                {filteredCertificates.length} Total Certificate
              </h2>

              {/* Certificates List */}
              <div className="space-y-4">
                {filteredCertificates.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                    No certificates found.
                  </div>
                ) : (
                  filteredCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
                    >
                      <h3 className="text-[19px] font-bold text-gray-900 mb-1">{cert.name}</h3>
                      <p className="text-[13px] text-gray-500 mb-4">
                        Issued by {cert.issuedBy || "Unknown"} | {cert.issueDate || ""}
                      </p>
                      <p className="text-[14px] text-gray-700 leading-relaxed mb-6 max-w-[85%]">
                        {cert.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-wrap gap-2">
                          {(cert.tags || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-[#EFF6FF] text-[#3B82F6] text-[11px] font-bold rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openDeleteConfirm(cert.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors mr-2"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {cert.url && cert.url !== "#" && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors shadow-sm"
                            >
                              View File
                            </a>
                          )}
                          <button
                            onClick={() => handleEditClick(cert)}
                            className="px-5 py-2 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            Edit Certificate
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

      {/* --- ส่วนที่เพิ่มใหม่: Delete Confirmation Modal UI --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
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
              Are you sure you want to delete this certificate? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Delete"}
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


