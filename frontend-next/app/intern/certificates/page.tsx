"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/InternSidebar"; // หรือแก้เป็น "@/components/Sidebar" ตามโปรเจกต์ของคุณ

// 1. อัปเดต Interface ให้รองรับ tags สำหรับ Mockup
interface Certificate {
  id: string;
  name: string;
  url: string;
  type?: string | null;
  description?: string | null;
  issuedBy?: string | null;
  issueDate?: string | null;
  certificateId?: string | null;
  certificateUrl?: string | null;
  createdAt: string;
  tags?: string[];
}

// 2. Mock Data ให้ตรงกับในรูปภาพเป๊ะๆ
const mockCertificates: Certificate[] = Array(4).fill({
  id: "mock-1",
  name: "UI/UX Design Fundamentals",
  issuedBy: "Interaction Design Foundation",
  issueDate: "18 January 2024",
  description:
    "Completed foundational training in user interface and user experience design, covering design thinking, user research, wireframing, prototyping, usability testing, and Figma fundamentals. Developed practical skills in creating user-centered digital products.",
  tags: ["UI Design", "UX Design", "Wireframing", "Prototyping"],
  url: "#",
  createdAt: new Date().toISOString(),
}).map((cert, index) => ({ ...cert, id: `mock-${index + 1}` }));

export default function CertificatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // ตั้งค่าเริ่มต้นเป็น Mock Data
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("All");

  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>(
          "/api/auth/me"
        );

        if (userData.user.role === "COMPANY") {
          router.push("/employer/profile");
          return;
        }

        if (!userData.user.role) {
          router.push("/role-selection");
          return;
        }

        setIsLoading(false);
        loadCertificates();
      } catch (error) {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ certificates: Certificate[] }>(
        "/api/candidates/certificates"
      );
      if (data.certificates && data.certificates.length > 0) {
        const parsedCerts = data.certificates.map((cert: any) => {
          if (cert.description) {
            try {
              const desc = JSON.parse(cert.description);
              return {
                ...cert,
                issuedBy: desc.issuedBy || null,
                issueDate: desc.issueDate || null,
                certificateId: desc.certificateId || null,
                certificateUrl: desc.certificateUrl || null,
              };
            } catch (e) {
              return cert;
            }
          }
          return cert;
        });
        setCertificates(parsedCerts);
      }
    } catch (error) {
      console.error("Failed to load certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !["pdf", "jpg", "jpeg", "png", "webp"].includes(fileExtension || "")
    ) {
      setUploadError(
        "Invalid file type. Please upload a PDF or image file (JPG, PNG, WEBP)."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploadedFile(file);
    setUploadError(null);
  };

  const handleSaveCertificate = async () => {
    if (!certificateName.trim()) {
      setUploadError("Certificate Name is required");
      return;
    }
    if (!uploadedFile) {
      setUploadError("Please upload a certificate file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("name", certificateName);
      if (issuedBy) formData.append("issuedBy", issuedBy);
      if (issueDate) formData.append("issueDate", issueDate);
      if (certificateId) formData.append("certificateId", certificateId);
      if (certificateUrl) formData.append("certificateUrl", certificateUrl);

      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/api/candidates/certificates`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to upload certificate" }));
        throw new Error(errorData.error || "Failed to upload certificate");
      }

      handleCancel();
      await loadCertificates();
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload certificate. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setCertificateName("");
    setIssuedBy("");
    setIssueDate("");
    setCertificateId("");
    setCertificateUrl("");
    setUploadedFile(null);
    setUploadError(null);
    setShowUploadModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await apiFetch(`/api/candidates/certificates/${id}`, {
        method: "DELETE",
      });
      await loadCertificates();
    } catch (error) {
      alert("Failed to delete certificate. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0273B1] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* --- Header Row --- */}
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
                  {/* Search Bar */}
                  <div className="relative w-full lg:w-72">
                    <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {/* Add Certificate Button */}
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-5 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
                  >
                    + Add Certificate
                  </button>
                </div>
              </div>

              {/* --- Filters Row --- */}
              <div className="flex items-center justify-between mb-6">
                <button
                  className="px-8 py-2 text-sm font-bold rounded-lg border border-[#3B82F6] text-[#3B82F6] bg-white shadow-sm"
                >
                  All
                </button>
                
                <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-800 font-bold text-sm rounded-lg hover:bg-gray-50 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Skill
                </button>
              </div>

              {/* Total Count */}
              <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">
                {certificates.length} Total Certificate
              </h2>

              {/* --- Certificates List --- */}
              <div className="space-y-4">
                {certificates.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                    No certificates found.
                  </div>
                ) : (
                  certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
                    >
                      {/* Title */}
                      <h3 className="text-[19px] font-bold text-gray-900 mb-1">
                        {cert.name}
                      </h3>
                      
                      {/* Subtitle */}
                      <p className="text-[13px] text-gray-500 mb-4">
                        Issued by {cert.issuedBy || "Unknown"} | {cert.issueDate || ""}
                      </p>
                      
                      {/* Description */}
                      <p className="text-[14px] text-gray-700 leading-relaxed mb-6 max-w-[85%]">
                        {cert.description}
                      </p>

                      {/* Footer: Tags & Actions */}
                      <div className="flex items-center justify-between mt-auto">
                        
                        {/* Tags */}
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

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDelete(cert.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors mr-2"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="px-5 py-2 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors shadow-sm">
                            View File
                          </button>
                          <button className="px-5 py-2 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors shadow-sm">
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

      {/* Upload Modal (ยังคงระบบเดิมไว้ให้ทำงานได้ปกติ) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Certificate</h2>
            {uploadError && <p className="text-red-600 mb-4">{uploadError}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Name</label>
                <input
                  type="text"
                  value={certificateName}
                  onChange={(e) => setCertificateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Certificate File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCertificate}
                  disabled={isUploading}
                  className="px-6 py-2 bg-[#0273B1] text-white font-bold rounded-lg hover:bg-[#025a8f] transition-colors"
                >
                  {isUploading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}