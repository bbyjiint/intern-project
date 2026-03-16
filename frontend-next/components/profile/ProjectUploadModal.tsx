"use client";

import { useState, useEffect, useRef } from "react";
import { Project } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";

interface ProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any | null;
  onUpdate: (id: string, data: any) => void;
  onRefresh?: () => void;
}

export default function ProjectUploadModal({
  isOpen,
  onClose,
  project,
  onUpdate,
  onRefresh,
}: ProjectUploadModalProps) {
  const [githubUrl, setGithubUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project && isOpen) {
      setGithubUrl(project.githubUrl || "");
      setProjectUrl(project.projectUrl || "");
      setFile(null);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".docx")
      ) {
        setFile(droppedFile);
      } else {
        alert("Please upload only PDF or DOCX files.");
      }
    }
  };

  const handleUpload = async () => {
    if (!project?.id) return;

    setLoading(true);

    try {
      let uploadedFileUrl = project.fileUrl || "";
      let uploadedFileName = project.fileName || "";

      // อัปโหลดไฟล์ใหม่ถ้ามี
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/candidates/projects/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        uploadedFileUrl = data.url;
        uploadedFileName = file.name;
      }

      const safeProjectName = project.name || (file ? file.name.split('.')[0] : "Untitled Project");
      const safeProjectRole = project.role || "Developer";

      // ✅ แก้บัค: ส่งข้อมูลทั้งหมดของ project ไปด้วย ไม่ใช่แค่ URL
      // เพื่อป้องกันข้อมูลอื่นๆ (เช่น วันที่) หายไป
      await apiFetch(`/api/candidates/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: safeProjectName,
          role: safeProjectRole,
          description: project.description || "",
          // ✅ แก้บัค: ส่ง startDate/endDate ที่ได้รับมาจาก project prop ตรงๆ
          startDate: project.startDate || null,
          endDate: project.endDate || null,
          relatedSkills: project.relatedSkills || project.skills || [],
          githubUrl: githubUrl || "",
          projectUrl: projectUrl || "",
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
        }),
      });

      // ✅ แก้บัค: เรียก onRefresh เพื่อดึงข้อมูลใหม่จาก DB เสมอ
      onRefresh?.();
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#1C2D4F]">
            Upload Project Files
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <p className="text-[14px] text-gray-500 mb-2">
            Add at least one project link or file (GitHub, project link, or file
            upload).
          </p>

          {/* GitHub Input */}
          <div>
            <label className="block text-[15px] font-bold text-[#1C2D4F] mb-2">
              GitHub Repository URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://github.com/yourusername/project-name"
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Project Link Input */}
          <div>
            <label className="block text-[15px] font-bold text-[#1C2D4F] mb-2">
              Project Link
            </label>
            <input
              type="text"
              placeholder="Paste your project link (portfolio, case study, demo, etc.)"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
            />
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-[15px] font-bold text-[#1C2D4F] mb-2">
              Upload Project File
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />

            {!file && project?.fileUrl ? (
              <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-white">
                <div className="w-14 h-14 mb-3 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 text-[15px] mb-3">
                  {project.fileName || "Uploaded File"}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-[#2563EB] text-white rounded-lg font-bold text-[13px] hover:bg-blue-600 transition-colors"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group 
                  ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : file
                        ? "border-[#8BC34A] bg-[#F0FDF4]"
                        : "border-gray-300 bg-[#F8FAFC] hover:bg-gray-50"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${file ? "bg-[#8BC34A] text-white" : "bg-white text-[#3B82F6]"}`}
                >
                  {file ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  )}
                </div>
                <p className="font-bold text-gray-700 text-[15px] mb-1">
                  {file?.name || "Drag and drop your file here"}
                </p>
                <button
                  type="button"
                  className={`mt-3 px-6 py-2 rounded-lg font-bold text-[13px] transition-colors shadow-sm ${file ? "bg-white border border-[#8BC34A] text-[#16A34A]" : "bg-[#2563EB] text-white hover:bg-blue-600"}`}
                >
                  {file ? "Change File" : "Select File"}
                </button>
                {!file && (
                  <p className="mt-4 text-xs text-gray-400">
                    PDF or DOCX format. Max size: 5 MB
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 text-[14px] font-bold border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={
              loading ||
              (!githubUrl && !projectUrl && !file && !project?.fileUrl)
            }
            className="px-8 py-2.5 bg-[#2563EB] text-white rounded-lg text-[14px] font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
