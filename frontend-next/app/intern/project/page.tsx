"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import { apiFetch } from "@/lib/api";
import ProjectsModal, { ProjectData } from "@/components/profile/ProjectsModal";
import ProjectUploadModal from "@/components/profile/ProjectUploadModal";
import { useProfile, Project } from "@/hooks/useProfile";
import { Github, Globe, FileText, Trash2, Plus, Search } from "lucide-react";

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
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={32} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Delete Project?</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
          Are you sure you want to delete <b className="text-slate-900 dark:text-slate-200">"{projectName}"</b>? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
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
  return isNaN(d.getTime()) ? "" : `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
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

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isUploadModalOpen || isDeleteModalOpen;
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "auto";
  }, [isModalOpen, isUploadModalOpen, isDeleteModalOpen]);

  useEffect(() => {
    if (profileData?.projects) {
      const mapped = profileData.projects.map((p: any) => {
        const sd = formatDisplayDate(p.startDate);
        const ed = formatDisplayDate(p.endDate);
        
        // ดึง URL และ Name ให้รองรับกรณีที่ Backend คืนค่ามาเป็น Object ซ้อนกัน (ป้องกันบั๊ก)
        const fileUrl = p.fileUrl || p.file?.url || p.files?.[0]?.url;
        const fileName = p.fileName || p.file?.name || p.files?.[0]?.name;

        return {
          id: p.id,
          title: p.name,
          role: p.role || "",
          period: sd && ed ? `${sd} - ${ed}` : sd || ed || "No date",
          description: p.description || "",
          skills: p.relatedSkills || p.skills || [],
          uploadStatus: (fileUrl ? "File Uploaded" : "No File Uploaded") as "No File Uploaded" | "File Uploaded",
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />
      <div className="flex flex-1">
        <InternSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Projects</h1>
              <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2">
                Manage and showcase your professional experience.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                />
              </div>
              <button
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                onClick={() => {
                  setCurrentProject(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} strokeWidth={3} />
                Add Project
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit mb-8 border border-slate-200 dark:border-slate-800">
            {["All", "No File Uploaded", "File Uploaded"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab as any)}
                className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                  filterTab === tab
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-black/5"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            {filteredProjects.length} Total Projects
          </h2>

          {/* Project List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 font-bold text-sm">
                      <span className="text-blue-600 dark:text-blue-400">{project.role}</span>
                      <span>•</span>
                      <span>{project.period}</span>
                    </div>
                  </div>
                  <Badge status={project.uploadStatus} />
                </div>

                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap font-medium">
                  {project.description}
                </p>

                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                  Project Credibility
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <ProjectLink label="Github Repository" active={project.githubLinked} url={project.githubUrl} icon={<Github size={24} />} />
                  <ProjectLink label="Live Demo" active={project.projectLinked} url={project.projectUrl} icon={<Globe size={24} />} />
                  <ProjectLink label="Documentation" active={project.fileUploaded} url={project.fileUrl} icon={<FileText size={24} />} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-black rounded-lg border border-blue-100 dark:border-blue-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      className="p-2.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                      onClick={() => {
                        setProjectToDelete({ id: project.id, title: project.title });
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
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
                      {project.uploadStatus === "No File Uploaded" ? "Upload Files" : "Edit Files"}
                    </button>
                    <button
                      className="px-5 py-2.5 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
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
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* Modals */}
      <ProjectsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProject={currentProject}
        onSave={async (projectData: any) => {
          // แก้บั๊กที่ล้าง URL ທิ้ง! -> ให้เก็บค่าเดิมไว้ถ้ามี
          const payload = { 
            ...projectData, 
            startDate: parseToISODate(projectData.startDate || ""), 
            endDate: parseToISODate(projectData.endDate || "") 
          };
          
          // ถ้ากำลังแก้ไข และของเดิมมีไฟล์อยู่ ห้ามเขียนทับด้วย String ว่างเด็ดขาด
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
      className={`flex items-center gap-2 px-4 py-1.5 text-xs font-black rounded-full border shadow-sm ${
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
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 ${
        active
          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:shadow-black/5 cursor-pointer"
          : "border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed"
      }`}
      onClick={(e) => !active && e.preventDefault()}
    >
      <span className={`${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"}`}>
        {icon}
      </span>
      <span className={`flex-1 text-sm font-bold ${active ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"}`}>
        {label}
      </span>
      {active ? (
        <div className="w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow-sm">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
        </div>
      )}
    </a>
  );
}