"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Sidebar from "@/components/InternSidebar";
import { apiFetch } from "@/lib/api";
import ProjectsModal, { ProjectData } from "@/components/profile/ProjectsModal";
import ProjectUploadModal from "@/components/profile/ProjectUploadModal";
import { useProfile } from "@/hooks/useProfile";
import { Github, Globe, FileText } from "lucide-react";

interface UIProject {
  id: string;
  title: string;
  name?: string;
  role: string;
  period: string;
  description: string;
  skills: string[];
  uploadStatus: "No File Uploaded" | "File Uploaded";
  githubLinked: boolean;
  projectLinked: boolean;
  fileUploaded: boolean;
  githubUrl?: string;
  projectUrl?: string;
  fileUrl?: string;
  fileName?: string;
  rawStartDate?: string | null;
  rawEndDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
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

function formatDisplayDate(isoString?: string | null) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return isNaN(d.getTime())
    ? ""
    : `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ProjectPage() {
  const router = useRouter();
  const { profileData, refetch, isLoading: profileLoading } = useProfile();

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [projects, setProjects] = useState<UIProject[]>([]);
  const [filterTab, setFilterTab] = useState<
    "All" | "No File Uploaded" | "File Uploaded"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(
    null,
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [projectToUpload, setProjectToUpload] = useState<UIProject | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const isAnyModalOpen =
      isModalOpen || isUploadModalOpen || isDeleteModalOpen;
    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.cssText = `position: fixed; top: -${scrollY}px; width: 100%; overflow: hidden;`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, [isModalOpen, isUploadModalOpen, isDeleteModalOpen]);

  useEffect(() => {
    if (profileData?.projects) {
      const mapped = profileData.projects.map((p: any) => {
        const sd = formatDisplayDate(p.startDate);
        const ed = formatDisplayDate(p.endDate);
        return {
          id: p.id,
          title: p.name,
          role: p.role || "",
          period: sd && ed ? `${sd} - ${ed}` : sd || ed || "No date",
          description: p.description || "",
          skills: p.relatedSkills || p.skills || [],
          uploadStatus: (p.fileUrl ? "File Uploaded" : "No File Uploaded") as
            | "No File Uploaded"
            | "File Uploaded",
          githubLinked: !!p.githubUrl,
          projectLinked: !!p.projectUrl,
          fileUploaded: !!p.fileUrl,
          githubUrl: p.githubUrl,
          projectUrl: p.projectUrl,
          fileUrl: p.fileUrl,
          fileName: p.fileName,
          rawStartDate: p.startDate,
          rawEndDate: p.endDate,
        };
      });
      setProjects([...mapped].reverse());
    }
  }, [profileData]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>(
          "/api/auth/me",
        );
        if (userData.user.role === "COMPANY") router.push("/employer/profile");
        else if (!userData.user.role) router.push("/role-selection");
        else setIsAuthLoading(false);
      } catch {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchTab = filterTab === "All" || p.uploadStatus === filterTab;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [projects, filterTab, searchQuery]);

  const handleSave = async (formData: ProjectData) => {
    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        description: formData.description,
        relatedSkills: formData.relatedSkills,
        startDate: parseToISODate(formData.startDate || ""),
        endDate: parseToISODate(formData.endDate || ""),
        githubUrl: formData.githubUrl || "",
        projectUrl: formData.projectUrl || "",
        fileUrl: "",
        fileName: "",
      };
      const url = currentProject?.id
        ? `/api/candidates/projects/${currentProject.id}`
        : `/api/candidates/projects`;
      await apiFetch(url, {
        method: currentProject?.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save project.");
    }
  };

  const handleDeleteExecute = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/candidates/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });
      await refetch();
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      alert("Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
      <InternNavbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
                Projects
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                A collection of projects you have created.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-full lg:w-72">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:ring-blue-500"
                />
              </div>
              <button
                className="px-5 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] font-bold rounded-full hover:bg-blue-50 transition-colors"
                onClick={() => {
                  setCurrentProject(null);
                  setIsModalOpen(true);
                }}
              >
                + Add Project
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8">
            {["All", "No File Uploaded", "File Uploaded"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab as any)}
                className={`px-6 py-2 text-sm font-bold rounded-lg border transition-all ${
                  filterTab === tab
                    ? "border-blue-500 text-blue-500 bg-white shadow-sm"
                    : "border-gray-200 text-gray-700 bg-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="text-base font-extrabold text-gray-900 mb-4">
            {filteredProjects.length} Total Projects
          </h2>

          {/* Project List */}
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[17px] font-bold text-gray-900">
                    {project.title}
                  </h3>
                  <Badge status={project.uploadStatus} />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Role: {project.role} | {project.period}
                </p>
                <p className="text-[14px] text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                  {project.description}
                </p>

                {/* ✅ Links Section */}
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Upload Files for Credibility
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <ProjectLink
                    label="Github Linked"
                    active={project.githubLinked}
                    url={project.githubUrl}
                    icon={<Github size={28} />}
                  />
                  <ProjectLink
                    label="Project Link"
                    active={project.projectLinked}
                    url={project.projectUrl}
                    icon={<Globe size={28} />}
                  />
                  <ProjectLink
                    label="Upload File"
                    active={project.fileUploaded}
                    url={project.fileUrl}
                    icon={<FileText size={28} />}
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => {
                        setProjectToDelete({
                          id: project.id,
                          title: project.title,
                        });
                        setIsDeleteModalOpen(true);
                      }}
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
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setProjectToUpload({
                          ...project,
                          name: project.title,
                          startDate: project.rawStartDate ?? null,
                          endDate: project.rawEndDate ?? null,
                        });
                        setIsUploadModalOpen(true);
                      }}
                    >
                      {project.uploadStatus === "No File Uploaded"
                        ? "Upload Files"
                        : "Edit Files"}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const [startDate = "", endDate = ""] =
                          project.period.split(" - ");
                        setCurrentProject({
                          id: project.id,
                          name: project.title,
                          role: project.role,
                          startDate: startDate.trim(),
                          endDate: endDate.trim(),
                          description: project.description,
                          relatedSkills: project.skills,
                          githubUrl: project.githubUrl,
                          projectUrl: project.projectUrl,
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      Edit Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingProject={currentProject}
      />
      <ProjectUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        project={projectToUpload}
        onUpdate={refetch}
        onRefresh={refetch}
      />

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Project?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete <b>{projectToDelete?.title}</b>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteExecute}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold flex justify-center"
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
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const isUploaded = status === "File Uploaded";
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
        isUploaded
          ? "bg-green-50 text-green-600 border-green-100"
          : "bg-blue-50 text-blue-600 border-blue-100"
      }`}
    >
      {isUploaded ? "✓ File Uploaded" : "ℹ No File Uploaded"}
    </span>
  );
}

// ✅ ProjectLink — แนวนอน: ไอคอนใหญ่ซ้าย | label กลาง | ❌/✅ ขวา
function ProjectLink({
  label,
  active,
  url,
  icon,
}: {
  label: string;
  active: boolean;
  url?: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={active ? url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        active ? "border-blue-100 bg-white cursor-pointer hover:shadow-sm" : "border-gray-200 bg-white cursor-default"
      }`}
      onClick={(e) => !active && e.preventDefault()}
    >
      {/* ไอคอนสีน้ำเงิน */}
      <span className="text-blue-600 flex-shrink-0">{icon}</span>

      {/* Label */}
      <span className="flex-1 text-sm font-semibold text-gray-700">{label}</span>

      {/* สถานะ ❌ / ✅ */}
      {active ? (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
    </a>
  );
}