"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import { apiFetch } from "@/lib/api";
import ProjectsModal, { ProjectData } from "@/components/profile/ProjectsModal";
import ProjectUploadModal from "@/components/profile/ProjectUploadModal";
import { useProfile, Project } from "@/hooks/useProfile";
import { Github, Globe, FileText, Trash2, Plus, Search, Menu } from "lucide-react";

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

// --- 1. Delete Confirmation Modal ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, projectName, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={32} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Delete Project?</h3>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          Are you sure you want to delete <b className="text-slate-900 dark:text-slate-200">"{projectName}"</b>? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled={isDeleting}
            onClick={onClose}
            className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="order-1 sm:order-2 flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. Helper Functions ---
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function parseToISODate(displayDate: string) {
  if (!displayDate) return undefined;
  const [monthStr, year] = displayDate.split(" ");
  const mIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthStr.toLowerCase());
  if (mIndex !== -1 && year) return new Date(parseInt(year), mIndex, 1).toISOString();
  return undefined;
}
function formatDisplayDate(isoString?: string | null) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d instanceof Date && !isNaN(d.getTime()) ? `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` : "";
}

// --- Main Component ---
export default function ProjectPage() {
  const { profileData, refetch, isLoading: profileLoading } = useProfile();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [projects, setProjects] = useState<UIProject[]>([]);
  const [filterTab, setFilterTab] = useState<"All" | "No File Uploaded" | "File Uploaded">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<(ProjectData & { fileUrl?: string; fileName?: string; githubUrl?: string; projectUrl?: string }) | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [projectToUpload, setProjectToUpload] = useState<UIProject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isUploadModalOpen || isDeleteModalOpen;
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "auto";
  }, [isModalOpen, isUploadModalOpen, isDeleteModalOpen]);

  useEffect(() => {
    if (profileData?.projects) {
      const mapped = profileData.projects.map((p: any) => {
        const sd = formatDisplayDate(p.startDate);
        const ed = formatDisplayDate(p.endDate);
        const fileUrl = p.fileUrl || p.file?.url || p.files?.[0]?.url;
        const fileName = p.fileName || p.file?.name || p.files?.[0]?.name;

        // ✅ uploadStatus อิงจากมี githubUrl, projectUrl, หรือ fileUrl สักอันนึง
        const hasAnyFile = !!(p.githubUrl || p.projectUrl || fileUrl);

        return {
          id: p.id,
          title: p.name,
          role: p.role || "",
          period: sd && ed ? `${sd} - ${ed}` : sd || ed || "No date",
          description: p.description || "",
          skills: p.relatedSkills || p.skills || [],
          uploadStatus: (hasAnyFile ? "File Uploaded" : "No File Uploaded") as "No File Uploaded" | "File Uploaded",
          githubLinked: !!p.githubUrl,
          projectLinked: !!p.projectUrl,
          fileUploaded: !!fileUrl,
          githubUrl: p.githubUrl,
          projectUrl: p.projectUrl,
          fileUrl: fileUrl,
          fileName: fileName,
          rawStartDate: p.startDate,
          rawEndDate: p.endDate,
        };
      });
      setProjects(mapped);
    }
  }, [profileData]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>("/api/auth/me");
        if (userData.user.role === "COMPANY") window.location.href = "/employer/profile";
        else if (!userData.user.role) window.location.href = "/role-selection";
        else setIsAuthLoading(false);
      } catch {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchTab = filterTab === "All" || p.uploadStatus === filterTab;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [projects, filterTab, searchQuery]);

  if (isAuthLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleDeleteExecute = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/candidates/projects/${projectToDelete.id}`, { method: "DELETE" });
      await refetch();
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300 overflow-hidden">
      <InternNavbar />
      <div className="flex flex-1 overflow-hidden relative">
        <InternSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative custom-scrollbar">
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
          >
            <Menu size={28} strokeWidth={2.5} />
          </button>

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-10 gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Projects</h1>
              <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
                Manage and showcase your professional experience.
              </p>
            </div>
            
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:w-72 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                />
              </div>
              <button
                className="w-auto px-3 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-sm whitespace-nowrap"
                onClick={() => {
                  setCurrentProject(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add <span className="hidden sm:inline">Project</span></span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit mb-8 border border-slate-200 dark:border-slate-800 whitespace-nowrap">
              {["All", "No File Uploaded", "File Uploaded"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab as any)}
                  className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    filterTab === tab
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-black/5"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-[10px] sm:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            {filteredProjects.length} Total Projects
          </h2>

          {/* Project List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="w-full">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-bold text-[13px] sm:text-sm">
                      <span className="text-blue-600 dark:text-blue-400">{project.role}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="w-full sm:w-auto">{project.period}</span>
                    </div>
                  </div>
                  <Badge status={project.uploadStatus} />
                </div>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap font-medium">
                  {project.description}
                </p>

                <p className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                  Project Credibility
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  <ProjectLink label="Github" active={project.githubLinked} url={project.githubUrl} icon={<Github size={20} />} />
                  <ProjectLink label="Demo" active={project.projectLinked} url={project.projectUrl} icon={<Globe size={20} />} />
                  <ProjectLink label="Doc" active={project.fileUploaded} url={project.fileUrl} icon={<FileText size={20} />} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  {/* ✅ Skills tags — เหมือน ProjectSection */}
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[10px] sm:text-[11px] font-extrabold rounded-lg border border-gray-100 dark:border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* ✅ Button group — เหมือน ProjectSection */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 mt-2 md:mt-0">
                    <button
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all flex-shrink-0 mr-auto sm:mr-2"
                      onClick={() => {
                        setProjectToDelete({ id: project.id, title: project.title });
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold text-gray-700 dark:text-slate-200 transition-all hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm whitespace-nowrap"
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
                      {project.uploadStatus === "File Uploaded" ? "Edit Files" : "Upload Files"}
                    </button>
                    <button
                      className="px-5 py-2.5 rounded-lg border-2 border-blue-500 bg-transparent text-sm font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 whitespace-nowrap"
                      onClick={() => {
                        setCurrentProject({
                          id: project.id,
                          name: project.title,
                          role: project.role,
                          startDate: formatDisplayDate(project.rawStartDate), 
                          endDate: formatDisplayDate(project.rawEndDate),
                          description: project.description,
                          relatedSkills: project.skills,
                          githubUrl: project.githubUrl,
                          projectUrl: project.projectUrl,
                          fileUrl: project.fileUrl, 
                          fileName: project.fileName
                        } as any);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-24 lg:hidden" />

        </main>
      </div>

      {/* Modals */}
      <ProjectsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProject={currentProject}
        onSave={async (projectData: any) => {
          const payload = { 
            ...projectData, 
            startDate: parseToISODate(projectData.startDate || ""), 
            endDate: parseToISODate(projectData.endDate || "") 
          };
          if (currentProject?.fileUrl) payload.fileUrl = currentProject.fileUrl;
          if (currentProject?.fileName) payload.fileName = currentProject.fileName;
          if (currentProject?.githubUrl && !payload.githubUrl) payload.githubUrl = currentProject.githubUrl;
          if (currentProject?.projectUrl && !payload.projectUrl) payload.projectUrl = currentProject.projectUrl;
          const method = currentProject?.id ? "PUT" : "POST";
          const url = currentProject?.id ? `/api/candidates/projects/${currentProject.id}` : "/api/candidates/projects";
          try {
            await apiFetch(url, { method, body: JSON.stringify(payload) });
            await refetch();
            setIsModalOpen(false);
          } catch (e) {
            alert("Failed to save project");
          }
        }}
      />
      <ProjectUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        project={projectToUpload}
        onUpdate={refetch}
        onRefresh={refetch}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteExecute}
        projectName={projectToDelete?.title || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const isUploaded = status === "File Uploaded";
  return (
    <span
      className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-black rounded-full border shadow-sm flex-shrink-0 ${
        isUploaded
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
          : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isUploaded ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} />
      {isUploaded ? "File Uploaded" : "No File Uploaded"}
    </span>
  );
}

function ProjectLink({ label, active, url, icon }: { label: string; active: boolean; url?: string; icon: React.ReactNode; }) {
  return (
    <a
      href={active && url ? url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border transition-all duration-300 ${
        active
          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:shadow-black/5 cursor-pointer"
          : "border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed"
      }`}
      onClick={(e) => !active && e.preventDefault()}
    >
      <span className={`${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"}`}>
        {icon}
      </span>
      <span className={`flex-1 text-xs sm:text-sm font-bold ${active ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"}`}>
        {label}
      </span>
      {active ? (
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
        </div>
      )}
    </a>
  );
}