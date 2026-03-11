"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Project } from "@/hooks/useProfile";
import ProjectUploadModal from "./ProjectUploadModal";
import ProjectsModal, { ProjectData } from "./ProjectsModal";

interface ProjectsSectionProps {
  projects: Project[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onUpdateProject: (id: string, data: any) => Promise<void>;
  onRefresh?: () => void;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ฟังก์ชันแปลงวันที่กลับเป็น ISO String (เพื่อส่งเข้า DB)
function parseToISODate(displayDate: string) {
  if (!displayDate) return undefined;
  const [monthStr, year] = displayDate.split(" ");
  const mIndex = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthStr.toLowerCase(),
  );
  if (mIndex !== -1 && year) {
    return new Date(parseInt(year), mIndex, 1).toISOString();
  }
  return undefined;
}

// ฟังก์ชันแปลงจาก ISO เป็น Display (Jan 2024)
function formatDisplayDate(isoString?: string) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ProjectsSection({
  projects,
  onAdd,
  onEdit,
  onUpdateProject,
  onRefresh,
}: ProjectsSectionProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(
    null,
  ); // 👈 เปลี่ยนเป็น ProjectData
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const displayedProjects = projects.slice(0, 3);

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isUploadOpen;

    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      
      // ล็อคทั้ง html และ body
      document.documentElement.style.height = "100vh";
      document.documentElement.style.overflow = "hidden";
      
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.height = "100vh"; // เพิ่มความชัวร์
      document.body.style.overflow = "hidden";
      
      // ป้องกันการลากเลื่อนบนมือถือ (iOS)
      const preventDefault = (e: TouchEvent) => {
        // ยอมให้เลื่อนได้เฉพาะใน Modal (ต้องระบุ class หรือ id ของ modal container)
        if (!(e.target as HTMLElement).closest('.modal-content-container')) {
          if (e.touches.length > 1) return; // ยอมให้ zoom ได้
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventDefault, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', preventDefault);
      };
    } else {
      // คืนค่า
      const scrollY = document.body.style.top;
      
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
      
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
  }, [isModalOpen, isUploadOpen]);
      

  const handleOpenUpload = (project: Project) => {
    setSelectedProject(project);
    setIsUploadOpen(true);
  };

  // ฟังก์ชันสำหรับการลบโปรเจกต์
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      setIsDeleting(id);
      await apiFetch(`/api/candidates/projects/${id}`, {
        method: "DELETE",
      });
      onRefresh?.();
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  // ฟังก์ชันกดปุ่ม Edit
  const handleEditClick = (project: Project) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      role: project.role,
      description: project.description,
      // แปลงวันที่ให้อยู่ใน Format ที่ Modal อ่านได้
      startDate: formatDisplayDate(project.startDate),
      endDate: formatDisplayDate(project.endDate),
      // 💡 ดึง skills แล้วส่งเข้าไปในชื่อ relatedSkills เพื่อให้ Modal อ่านออก
      relatedSkills: project.skills || (project as any).relatedSkills || [],
      githubUrl: (project as any).githubUrl,
      projectUrl: (project as any).projectUrl,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-100"
        >
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 italic py-10 text-center border-2 border-dashed border-gray-50 rounded-xl">
          No projects provided.
        </p>
      ) : (
        <div className="space-y-8">
          {displayedProjects.map((project: any) => {
            const hasAnyFile = !!(
              project.githubUrl ||
              project.projectUrl ||
              project.fileUrl
            );

            return (
              <div
                key={project.id}
                className="relative border border-gray-100 rounded-xl p-6 bg-white hover:border-blue-100 transition-all"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      hasAnyFile
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${hasAnyFile ? "bg-green-500" : "bg-blue-500"}`}
                    />
                    {hasAnyFile ? "File Uploaded" : "No File Uploaded"}
                  </div>
                </div>

                {/* Project Info */}
                <div className="mb-4 pr-32">
                  <h3 className="text-lg font-bold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Role: {project.role || "Contributor"} |{" "}
                    {formatDisplayDate(project.startDate) || "N/A"} -{" "}
                    {formatDisplayDate(project.endDate) || "Present"}
                  </p>
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-2">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Credibility Section */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Project Credibility
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CredibilityItem
                      icon="github"
                      label="Github Linked"
                      active={!!project.githubUrl}
                    />
                    <CredibilityItem
                      icon="link"
                      label="Project Link"
                      active={!!project.projectUrl}
                    />
                    <CredibilityItem
                      icon="file"
                      label="Documentation"
                      active={!!project.fileUrl}
                    />
                  </div>
                </div>

                {/* Skills & Actions */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {/* 💡 ดึงข้อมูลจาก skills หรือ relatedSkills เผื่อชื่อตัวแปรไหนมีค่าก็ให้ใช้อันนั้น */}
                    {((project as any).skills || (project as any).relatedSkills)
                      ?.length > 0 ? (
                      (
                        (project as any).skills ||
                        (project as any).relatedSkills
                      ).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 text-xs italic">
                        No skills tagged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ปุ่มลบ (ถังขยะ) */}
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={isDeleting === project.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                      title="Delete Project"
                    >
                      {isDeleting === project.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
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
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenUpload(project)}
                      className={`px-4 py-1.5 border-2 rounded-lg text-sm font-bold transition-all ${
                        hasAnyFile
                          ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {hasAnyFile ? "Edit Files" : "Upload Files"}
                    </button>
                    <button
                      onClick={() => handleEditClick(project)}
                      className="px-4 py-1.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold transition-all"
                    >
                      Edit Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Footer */}
      {projects.length > 3 && (
        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <Link
            href="/intern/project"
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
          >
            View all projects ({projects.length})
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Render Upload Modal */}
      <ProjectUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        project={selectedProject}
        onUpdate={async () => {
          onRefresh?.();
        }}
      />

      {/* Projects Modal */}
      <ProjectsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={async (projectData) => {
          try {
            // 💡 แปลงข้อมูลก่อนส่ง
            const payload = {
              name: projectData.name,
              role: projectData.role,
              description: projectData.description || "",
              startDate: parseToISODate(projectData.startDate || ""),
              endDate: parseToISODate(projectData.endDate || ""),
              relatedSkills: projectData.relatedSkills || [], // ส่งเป็น relatedSkills
              githubUrl: projectData.githubUrl || "",
              projectUrl: projectData.projectUrl || "",
            };

            if (editingProject?.id) {
              await apiFetch(`/api/candidates/projects/${editingProject.id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
              });
            } else {
              await apiFetch("/api/candidates/projects", {
                method: "POST",
                body: JSON.stringify(payload),
              });
            }

            onRefresh?.();
            setIsModalOpen(false);
            setEditingProject(null);
          } catch (err) {
            console.error("Failed saving project", err);
          }
        }}
        editingProject={editingProject}
      />
    </div>
  );
}

// Helper Component for Credibility Items
function CredibilityItem({
  icon,
  label,
  active,
}: {
  icon: "github" | "link" | "file";
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-xl transition-all ${active ? "bg-white border-green-100 shadow-sm" : "bg-gray-50/50 border-gray-100 opacity-60"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${active ? "bg-green-50 text-green-600" : "bg-gray-200 text-gray-500"}`}
        >
          {icon === "github" && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          )}
          {icon === "link" && (
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
          {icon === "file" && (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>
        <span
          className={`text-xs font-bold ${active ? "text-gray-700" : "text-gray-400"}`}
        >
          {label}
        </span>
      </div>
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${active ? "border-green-500 bg-green-50" : "border-gray-200"}`}
      >
        {active && (
          <svg
            className="w-3 h-3 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
