"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Sidebar from "@/components/InternSidebar";
import { apiFetch } from "@/lib/api";
import ProjectsModal, { ProjectData } from "@/components/profile/ProjectsModal";
import ProjectUploadModal from "@/components/profile/ProjectUploadModal";
import { Project, useProfile } from "@/hooks/useProfile";

// Interface สำหรับข้อมูลโปรเจกต์ที่จะแสดงใน UI
interface UIProject {
  id: string;
  title: string;
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

export default function ProjectPage() {
  const router = useRouter();
  const { profileData, refetch, isLoading: profileLoading } = useProfile(); // ดึงข้อมูลโปรไฟล์จาก DB

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
  const [projectToUpload, setProjectToUpload] = useState<any | null>(null);

  // 💡 แมปข้อมูลจาก Database เข้าสู่ UI State เมื่อโหลดเสร็จ
  useEffect(() => {
    if (profileData?.projects) {
      const mappedProjects: UIProject[] = profileData.projects.map((p: any) => {
        // ฟังก์ชันแปลง Date จาก DB เป็นแบบแสดงผล (Jan 2024)
        const formatDisplayDate = (isoString?: string) => {
          if (!isoString) return "";
          const d = new Date(isoString);
          if (isNaN(d.getTime())) return "";
          return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
        };

        const sd = formatDisplayDate(p.startDate);
        const ed = formatDisplayDate(p.endDate);
        const period = sd && ed ? `${sd} - ${ed}` : sd || ed || "No date";

        return {
          id: p.id,
          title: p.name,
          role: p.role || "",
          period,
          description: p.description || "",
          skills: p.relatedSkills || p.skills || [],
          uploadStatus: p.fileUrl ? "File Uploaded" : "No File Uploaded",
          githubLinked: !!p.githubUrl,
          projectLinked: !!p.projectUrl,
          fileUploaded: !!p.fileUrl,
          githubUrl: p.githubUrl,
          projectUrl: p.projectUrl,
          fileUrl: p.fileUrl,
          fileName: p.fileName, 
        };
      });

      // เรียงจากใหม่สุดไปเก่าสุด (โดยอิงจาก ID หรือ วันที่)
      setProjects(mappedProjects.reverse());
    }
  }, [profileData]);

  // เช็คสถานะการเข้าสู่ระบบ
  useEffect(() => {
    const checkAuth = async () => {
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
        setIsAuthLoading(false);
      } catch (error) {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleAddNew = () => {
    setCurrentProject(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (project: UIProject) => {
    const [startDate = "", endDate = ""] = project.period.split(" - ");
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
  };

  // 💡 ยิง API: ลบข้อมูลโปรเจกต์
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await apiFetch(`/api/candidates/projects/${id}`, { method: "DELETE" });
        await refetch(); // ดึงข้อมูลใหม่จาก DB หลังลบ
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project.");
      }
    }
  };

  // 💡 ยิง API: สร้าง/อัปเดตข้อมูลโปรเจกต์
  const handleSave = async (formData: ProjectData) => {
    try {
      // เตรียมข้อมูลให้ตรงกับฝั่ง Database
      const payload = {
        name: formData.name,
        role: formData.role,
        description: formData.description,
        relatedSkills: formData.relatedSkills,
        startDate: parseToISODate(formData.startDate || ""),
        endDate: parseToISODate(formData.endDate || ""),
      };

      if (currentProject?.id) {
        // Edit Mode
        await apiFetch(`/api/candidates/projects/${currentProject.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // Add Mode
        await apiFetch(`/api/candidates/projects`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await refetch(); // ดึงข้อมูลใหม่จาก DB
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project.");
    }
  };

  const handleUpdateFiles = () => {
    refetch(); // หากอัปโหลดไฟล์เสร็จ ให้รีเฟรชข้อมูลโปรไฟล์เพื่ออัปเดตสถานะไฟล์
  };

  const filteredProjects = projects.filter((p) => {
    const matchTab = filterTab === "All" || p.uploadStatus === filterTab;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const isPageLoading = isAuthLoading || profileLoading;

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {isPageLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
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
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    />
                  </div>
                  <button
                    className="px-5 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                    onClick={handleAddNew}
                  >
                    + Add Project
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap gap-3">
                  {["All", "No File Uploaded", "File Uploaded"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab as any)}
                      className={`px-6 py-2 text-sm font-bold rounded-lg border transition-colors ${
                        filterTab === tab
                          ? "border-[#3B82F6] text-[#3B82F6] shadow-sm bg-white"
                          : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Cards */}
              <h2 className="text-base font-extrabold text-gray-900 mb-4">
                {filteredProjects.length} Total Projects
              </h2>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <p className="text-gray-500 font-medium">
                    No projects found. Click "+ Add Project" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                      {/* Card Header & Badge */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[17px] font-bold text-gray-900">
                          {project.title}
                        </h3>
                        {/* Status Badge */}
                        {project.uploadStatus === "No File Uploaded" ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0F7FF] text-[#0273B1] text-xs font-bold rounded-full border border-[#DBF0FF]">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                strokeWidth="2"
                              ></circle>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 16v-4M12 8h.01"
                              ></path>
                            </svg>
                            No File Uploaded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#16A34A] text-xs font-bold rounded-full border border-[#DCFCE7]">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            File Uploaded
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        Role: {project.role} | {project.period}
                      </p>
                      <p className="text-[14px] text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                        {project.description}
                      </p>

                      {/* Upload Files UI Section */}
                      <div className="mb-2">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">
                          Upload Files for Credibility
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* GitHub Box */}
                          <a
                            href={
                              project.githubLinked && project.githubUrl
                                ? project.githubUrl
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!project.githubLinked) e.preventDefault();
                            }}
                            className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-all ${
                              project.githubLinked
                                ? "border-blue-100 bg-white hover:bg-blue-50 hover:shadow-sm cursor-pointer"
                                : "border-gray-100 bg-gray-50/50 cursor-default opacity-80"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${project.githubLinked ? "bg-[#EBF5FF] text-[#3B82F6]" : "bg-gray-200 text-gray-400"}`}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                              </div>
                              <span
                                className={`text-sm font-medium ${project.githubLinked ? "text-gray-900" : "text-gray-500"}`}
                              >
                                Github Linked
                              </span>
                            </div>
                            {project.githubLinked ? (
                              <svg
                                className="w-5 h-5 text-[#8BC34A]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-[#FF5252]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 9l-6 6M9 9l6 6"
                                ></path>
                              </svg>
                            )}
                          </a>

                          {/* Project Link Box */}
                          <a
                            href={
                              project.projectLinked && project.projectUrl
                                ? project.projectUrl
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!project.projectLinked) e.preventDefault();
                            }}
                            className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-all ${
                              project.projectLinked
                                ? "border-blue-100 bg-white hover:bg-blue-50 hover:shadow-sm cursor-pointer"
                                : "border-gray-100 bg-gray-50/50 cursor-default opacity-80"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${project.projectLinked ? "bg-[#EBF5FF] text-[#3B82F6]" : "bg-gray-200 text-gray-400"}`}
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
                                    strokeWidth="2"
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                  />
                                </svg>
                              </div>
                              <span
                                className={`text-sm font-medium ${project.projectLinked ? "text-gray-900" : "text-gray-500"}`}
                              >
                                Project Linked
                              </span>
                            </div>
                            {project.projectLinked ? (
                              <svg
                                className="w-5 h-5 text-[#8BC34A]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-[#FF5252]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 9l-6 6M9 9l6 6"
                                ></path>
                              </svg>
                            )}
                          </a>

                          {/* Upload File Box */}
                          <a
                            href={
                              project.fileUploaded && project.fileUrl
                                ? project.fileUrl
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!project.fileUploaded) e.preventDefault();
                            }}
                            className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-all ${
                              project.fileUploaded
                                ? "border-blue-100 bg-white hover:bg-blue-50 hover:shadow-sm cursor-pointer"
                                : "border-gray-100 bg-gray-50/50 cursor-default opacity-80"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${project.fileUploaded ? "bg-[#EBF5FF] text-[#3B82F6]" : "bg-gray-200 text-gray-400"}`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span
                                className={`text-sm font-medium ${project.fileUploaded ? "text-gray-900" : "text-gray-500"}`}
                              >
                                Upload File
                              </span>
                            </div>
                            {project.fileUploaded ? (
                              <svg
                                className="w-5 h-5 text-[#8BC34A]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-[#FF5252]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 9l-6 6M9 9l6 6"
                                ></path>
                              </svg>
                            )}
                          </a>
                        </div>
                      </div>

                      {/* Card Footer: Skills & Action Buttons */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4 border-t pt-4">
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[#EBF5FF] text-[#2563EB] text-[11px] font-bold rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-gray-400 hover:text-red-500 transition-colors mr-1"
                            onClick={() => handleDelete(project.id)}
                            title="Delete Project"
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
                            className="px-4 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
                            onClick={() => {
                              setProjectToUpload({
                                id: project.id,
                                name: project.title,
                                role: project.role,
                                description: project.description,
                                startDate: "",
                                endDate: "",
                                relatedSkills: project.skills,
                                githubUrl: project.githubUrl,
                                projectUrl: project.projectUrl,
                                fileUrl: project.fileUrl,
                                fileName: project.fileName,
                              });

                              setIsUploadModalOpen(true);
                            }}
                          >
                            {project.uploadStatus === "No File Uploaded"
                              ? "Upload Files"
                              : "Edit Files"}
                          </button>
                          <button
                            className="px-4 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
                            onClick={() => handleEditClick(project)}
                          >
                            Edit Project
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
        onUpdate={handleUpdateFiles}
      />
    </div>
  );
}
