"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Project } from "@/hooks/useProfile";
import ProjectUploadModal from "./ProjectUploadModal";
import ProjectsModal, { ProjectData } from "./ProjectsModal";

// --- 1. Delete Confirmation Modal (Responsive Enhanced) ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3">
          Delete Project?
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            "{projectName}"
          </span>
          ?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center order-1 sm:order-2"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. Helper Functions (คงเดิม) ---
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
function parseToISODate(displayDate: string) {
  if (!displayDate) return undefined;
  const [monthStr, year] = displayDate.split(" ");
  const mIndex = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthStr.toLowerCase(),
  );
  if (mIndex !== -1 && year)
    return new Date(parseInt(year), mIndex, 1).toISOString();
  return undefined;
}
function formatDisplayDate(isoString?: string) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// --- 3. Main Component ---
export default function ProjectsSection({
  projects,
  onRefresh,
}: {
  projects: Project[];
  onRefresh?: () => void;
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(
    null,
  );
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: "",
    name: "",
  });

  const displayedProjects = projects.slice(0, 3);

  const handleOpenUpload = (project: any) => {
    setSelectedProject({
      ...project,
      name: project.name || "",
      relatedSkills: project.relatedSkills || (project as any).skills || [],
    });
    setIsUploadOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeletingLoading(true);
      await apiFetch(`/api/candidates/projects/${deleteModalState.id}`, {
        method: "DELETE",
      });
      onRefresh?.();
      setDeleteModalState({ isOpen: false, id: "", name: "" });
    } catch (err) {
      alert("Failed to delete project.");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      role: project.role,
      description: project.description,
      startDate: formatDisplayDate(project.startDate),
      endDate: formatDisplayDate(project.endDate),
      relatedSkills: project.skills || (project as any).relatedSkills || [],
      githubUrl: (project as any).githubUrl,
      projectUrl: (project as any).projectUrl,
      fileUrl: (project as any).fileUrl,
      fileName: (project as any).fileName,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-5 sm:p-8 mb-6 border border-gray-100 dark:border-gray-800 transition-colors">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-5 mb-8">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Projects
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <span className="sm:hidden">+ Add</span>
          <span className="hidden sm:inline">+ Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 sm:py-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <p className="text-gray-400 dark:text-gray-600 italic font-medium">
            No projects provided yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6 sm:y-8">
          {displayedProjects.map((project: any) => {
            const hasAnyFile = !!(
              project.githubUrl ||
              project.projectUrl ||
              project.fileUrl
            );
            return (
              <div
                key={project.id}
                className="group relative border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-8 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all"
              >
                {/* Status Badge - Responsive Position */}
                <div className="mb-4 sm:absolute sm:top-8 sm:right-8">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${hasAnyFile ? "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30" : "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasAnyFile ? "bg-green-500" : "bg-blue-500"}`}
                    />
                    {hasAnyFile ? "File Uploaded" : "No File Uploaded"}
                  </div>
                </div>

                {/* Project Info */}
                <div className="mb-6 sm:pr-32">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      {project.role || "Contributor"}
                    </span>
                    <span className="opacity-30 hidden sm:inline">•</span>
                    <span className="w-full sm:w-auto">
                      {formatDisplayDate(project.startDate) || "N/A"} -{" "}
                      {formatDisplayDate(project.endDate) || "Present"}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 leading-relaxed line-clamp-3">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Credibility Items - Grid 1 on mobile, Grid 3 on md+ */}
                <div className="mb-8">
                  <h4 className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">
                    Project Credibility
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <CredibilityItem
                      icon="github"
                      label="Github"
                      active={!!project.githubUrl}
                      url={project.githubUrl}
                    />
                    <CredibilityItem
                      icon="link"
                      label="Live Demo"
                      active={!!project.projectUrl}
                      url={project.projectUrl}
                    />
                    <CredibilityItem
                      icon="file"
                      label="Docs"
                      active={!!project.fileUrl}
                      url={project.fileUrl}
                    />
                  </div>
                </div>

                {/* Bottom Actions - Responsive Layout */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5 border-t border-gray-50 dark:border-gray-800 pt-5 sm:pt-6">
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {(project.skills || project.relatedSkills)?.map(
                      (skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] sm:text-[11px] font-extrabold rounded-lg border border-gray-100 dark:border-gray-700"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>

                  {/* Buttons group - Smaller and aligned to the right */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 mt-2 sm:mt-0">
                    <button
                      onClick={() =>
                        setDeleteModalState({
                          isOpen: true,
                          id: project.id,
                          name: project.name,
                        })
                      }
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all flex-shrink-0 mr-auto sm:mr-2"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
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

                    <button
                      onClick={() => handleOpenUpload(project)}
                      className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm whitespace-nowrap"
                    >
                      {hasAnyFile ? "Edit Files" : "Upload Files"}
                    </button>

                    <button
                      onClick={() => handleEditClick(project)}
                      className="px-5 py-2.5 rounded-lg border-2 border-blue-500 bg-transparent text-sm font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 whitespace-nowrap"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      {projects.length > 3 && (
        <div className="mt-10 text-center">
          <Link
            href="/intern/project"
            className="inline-flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black hover:gap-5 transition-all text-sm group"
          >
            VIEW ALL PROJECTS ({projects.length})
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Modals (คงเดิม) */}
      <ProjectUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        project={selectedProject}
        onRefresh={onRefresh}
        onUpdate={() => onRefresh?.()}
      />
      <ProjectsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={async (projectData: any) => {
          const payload: any = {
            ...projectData,
            startDate: parseToISODate(projectData.startDate || ""),
            endDate: parseToISODate(projectData.endDate || ""),
          };
          if (editingProject?.fileUrl) payload.fileUrl = editingProject.fileUrl;
          if (editingProject?.fileName)
            payload.fileName = editingProject.fileName;
          if (editingProject?.githubUrl && !payload.githubUrl)
            payload.githubUrl = editingProject.githubUrl;
          if (editingProject?.projectUrl && !payload.projectUrl)
            payload.projectUrl = editingProject.projectUrl;
          const method = editingProject?.id ? "PUT" : "POST";
          const url = editingProject?.id
            ? `/api/candidates/projects/${editingProject.id}`
            : "/api/candidates/projects";
          await apiFetch(url, { method, body: JSON.stringify(payload) });
          onRefresh?.();
          setIsModalOpen(false);
        }}
        editingProject={editingProject}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        projectName={deleteModalState.name}
        isDeleting={isDeletingLoading}
      />
    </div>
  );
}

// --- 4. Sub-component สำหรับ Credibility (Responsive Enhanced) ---
function CredibilityItem({
  icon,
  label,
  active,
  url,
}: {
  icon: "github" | "link" | "file";
  label: string;
  active: boolean;
  url?: string;
}) {
  return (
    <a
      href={active && url ? url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => !active && e.preventDefault()}
      className={`flex items-center justify-between p-3.5 sm:p-4 border rounded-2xl transition-all ${active ? "bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/30 shadow-sm" : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-50 grayscale cursor-not-allowed"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl ${active ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
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
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
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
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>
        <span
          className={`text-[11px] font-black ${active ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}
        >
          {label}
        </span>
      </div>
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${active ? "border-green-500 bg-green-50 dark:bg-green-900/30" : "border-gray-200 dark:border-gray-800"}`}
      >
        {active && (
          <svg
            className="w-3 h-3 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={4}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </a>
  );
}
