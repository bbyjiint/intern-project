"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import CertificatesModal, { ModalCertificate } from "./CertificatesModal";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface Certificate {
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
  tags: string[];
}

export default function CertificateSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { profileData, refetch } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCert, setCurrentCert] = useState<ModalCertificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const fetchCertificates = useCallback(async () => {
    try {
      const data = await apiFetch<{ certificates: any[] }>(
        "/api/candidates/certificates",
      );

      if (data.certificates) {
        const formattedCerts = data.certificates.map((cert) => {
          // แปลง DateTime ของ Prisma กลับมาเป็นแค่ string วันที่แบบ YYYY-MM-DD สำหรับให้ <input type="date"> ใช้งานได้
          const dateStr = cert.issueDate
            ? new Date(cert.issueDate).toISOString().split("T")[0]
            : "";

          return {
            id: cert.id,
            name: cert.name,
            url: cert.url,
            type: cert.type,
            description: cert.description || "",
            issuedBy: cert.issuedBy || "", // ดึงตรงๆ จาก Database เลย
            issueDate: dateStr, // ดึงตรงๆ จาก Database เลย
            tags: cert.relatedSkills || [], // Database ใช้ชื่อ relatedSkills แต่ frontend เราใช้ชื่อ tags
            createdAt: cert.createdAt,
          };
        });

        setCertificates(formattedCerts);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    }
  }, []);

  // useEffect(() => {
  //   if (profileData?.certificates) {
  //     const API_BASE_URL =
  //       process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  //     const mappedCerts: Certificate[] = profileData.certificates.map(
  //       (cert: any) => {
  //         const formattedDate = cert.issueDate
  //           ? new Date(cert.issueDate).toISOString().split("T")[0]
  //           : "";

  //         let fileUrl = cert.url;
  //         if (fileUrl && fileUrl.startsWith("/uploads")) {
  //           fileUrl = `${API_BASE_URL}${fileUrl}`;
  //         }

  //         return {
  //           id: cert.id,
  //           name: cert.name,
  //           url: fileUrl,
  //           description: cert.description || "",
  //           issuedBy: cert.issuedBy || "",
  //           issueDate: formattedDate,
  //           tags: cert.relatedSkills || cert.tags || [],
  //           createdAt: cert.createdAt,
  //         };
  //       },
  //     );
  //     setCertificates(mappedCerts);
  //   }
  // }, [profileData]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>(
          "/api/auth/me",
        );
        if (userData.user.role === "COMPANY") {
          router.push("/employer/profile");
          return;
        }
        if (!userData.user.role) {
          router.push("/role-selection");
          return;
        }

        // ถ้า Auth ผ่าน ให้ดึงข้อมูล Certificate เลย
        await fetchCertificates();
        setIsLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
      }
    };
    checkAuthAndFetchData();
  }, [router, fetchCertificates]);

  const handleAddNew = () => {
    setCurrentCert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: Certificate) => {
  setCurrentCert({
    id: cert.id,
    name: cert.name,
    description: cert.description ?? undefined,
    issuedBy: cert.issuedBy ?? undefined,
    date: cert.issueDate ?? undefined,
    tags: cert.tags ?? [],
  });

  setIsModalOpen(true);
};

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this certificate?")) {
      try {
        await apiFetch(`/api/candidates/certificates/${id}`, {
          method: "DELETE",
        });
        await refetch();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete certificate.");
      }
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

      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }

      if (data.file) {
        formData.append("file", data.file);
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const endpoint = currentCert?.id
        ? `${API_BASE_URL}/api/candidates/certificates/${currentCert.id}`
        : `${API_BASE_URL}/api/candidates/certificates`;

      const method = currentCert?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save certificate");
      }

      await fetchCertificates();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Failed to save certificate. Please try again.");
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
          onClick={handleAddNew}
          disabled={isSaving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95 disabled:opacity-50"
        >
          + Add Certificate
        </button>
      </div>

      <div className="space-y-6">
        {certificates.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed">
            No certificates added yet.
          </p>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      {cert.issuedBy}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{cert.issueDate}</span>
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 max-w-3xl">
                    {cert.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {cert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold border border-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-3 mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => handleDelete(cert.id)}
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
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-1.5 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors block text-center"
                  >
                    View File
                  </a>
                )}
                <button
                  onClick={() => handleEdit(cert)}
                  className="px-5 py-1.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  Edit Certificate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {certificates.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-50">
          <Link
            href="/intern/certificates"
            className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            <span>View all certificates</span>
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}

      <CertificatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingCertificate={currentCert}
      />
    </div>
  );
}
