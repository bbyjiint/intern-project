"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CertificatesModal, { ModalCertificate } from "./CertificatesModal"; // ตรวจสอบ path ให้ถูกต้อง
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

export default function CertificateSection() {
  const { profileData, refetch } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCert, setCurrentCert] = useState<ModalCertificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]); 
  const [isSaving, setIsSaving] = useState(false);

  // ข้อมูลเริ่มต้น (ตัวอย่าง)
  useEffect(() => {
    if (profileData?.certificates) {
      const mappedCerts = profileData.certificates.map((cert: any) => {
        // แปลงวันที่จาก ISO ของ DB เป็น YYYY-MM-DD เพื่อให้ Input Type Date นำไปแสดงผลได้
        const formattedDate = cert.issueDate
          ? new Date(cert.issueDate).toISOString().split("T")[0]
          : "";

        return {
          id: cert.id,
          name: cert.name,
          issuedBy: cert.issuedBy || "",
          date: formattedDate,
          description: cert.description || "",
          tags: cert.relatedSkills || [],
          url: cert.url,
        };
      });
      setCertificates(mappedCerts);
    }
  }, [profileData]);

  const handleAddNew = () => {
    setCurrentCert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: Certificate) => {
    setCurrentCert(cert);
    setIsModalOpen(true);
  };

  // ลบ Certificate
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this certificate?")) {
      try {
        await apiFetch(`/api/candidates/certificates/${id}`, {
          method: "DELETE",
        });
        await refetch(); // รีเฟรชข้อมูลใหม่จาก DB
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete certificate.");
      }
    }
  };

  const handleSave = async (data: ModalCertificate) => {
    setIsSaving(true);
    try {
      // ⚠️ เนื่องจากมีการอัปโหลดไฟล์ ต้องใช้ FormData แทน JSON
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.issuedBy) formData.append("issuedBy", data.issuedBy);
      if (data.date)
        formData.append("issueDate", new Date(data.date).toISOString());

      // ส่ง Array ของ Tags (Skills)
      if (data.tags) {
        data.tags.forEach((tag) => formData.append("relatedSkills", tag));
      }

      // ถ้ามีการแนบไฟล์ใหม่
      if (data.file) {
        formData.append("file", data.file);
      }

      const endpoint = currentCert?.id
        ? `/api/candidates/certificates/${currentCert.id}`
        : `/api/candidates/certificates`;

      const method = currentCert?.id ? "PUT" : "POST";

      // ใช้ fetch ดิบๆ แทน apiFetch สำหรับส่ง FormData เพื่อป้องกันปัญหา Content-Type พัง
      await apiFetch(endpoint, {
        method: method,
        body: formData, // ส่ง formData ไปตรงๆ แบบนี้เลย ไม่ต้องใช้ JSON.stringify()
      });

      await refetch(); // โหลดข้อมูลใหม่จาก DB ทันทีหลังเซฟเสร็จ
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save certificate. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
      {/* Header */}
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
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
        >
          + Add Certificate
        </button>
      </div>

      {/* List of Certificates */}
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
                    <span>{cert.date}</span>
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 max-w-3xl">
                    {cert.description || 'No description provided.'}
                  </p>

                  {/* Tags */}
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

              {/* Actions */}
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

      {/* View All Link */}
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

      {/* Modal */}
      <CertificatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingCertificate={currentCert}
      />
    </div>
  );
}
