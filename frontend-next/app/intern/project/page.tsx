"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Sidebar from "@/components/InternSidebar";
import { apiFetch } from "@/lib/api";

// 1. Interface สำหรับ Mock Data ให้ตรงกับ Design
interface MockProject {
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
}

// 2. Mockup Data ตามในรูปภาพ
const mockProjects: MockProject[] = [
  {
    id: "1",
    title: "Khon Kaen Zoo Interactive Map Website - Web Developer",
    role: "Web developer",
    period: "Mar 2024 - Apr 2024",
    description:
      "Currently developing an interactive map website for Khon Kaen Zoo with QR code access, GPS navigation, filtering, and real-time event updates. Includes an admin panel for managing maps, content, and visitor statistics.",
    skills: ["Tableau", "SQL", "Python"],
    uploadStatus: "No File Uploaded",
    githubLinked: false,
    projectLinked: false,
    fileUploaded: false,
  },
  {
    id: "2",
    title: "Khon Kaen Zoo Interactive Map Website - Web Developer",
    role: "Web developer",
    period: "Mar 2024 - Apr 2024",
    description:
      "Currently developing an interactive map website for Khon Kaen Zoo with QR code access, GPS navigation, filtering, and real-time event updates. Includes an admin panel for managing maps, content, and visitor statistics.",
    skills: ["Tableau", "SQL", "Python"],
    uploadStatus: "File Uploaded",
    githubLinked: true,
    projectLinked: true,
    fileUploaded: true,
  },
  {
    id: "3",
    title: "Khon Kaen Zoo Interactive Map Website - Web Developer",
    role: "Web developer",
    period: "Mar 2024 - Apr 2024",
    description:
      "Currently developing an interactive map website for Khon Kaen Zoo with QR code access, GPS navigation, filtering, and real-time event updates. Includes an admin panel for managing maps, content, and visitor statistics.",
    skills: ["Tableau", "SQL", "Python"],
    uploadStatus: "File Uploaded",
    githubLinked: true,
    projectLinked: true,
    fileUploaded: true,
  },
  {
    id: "4",
    title: "Khon Kaen Zoo Interactive Map Website - Web Developer",
    role: "Web developer",
    period: "Mar 2024 - Apr 2024",
    description:
      "Currently developing an interactive map website for Khon Kaen Zoo with QR code access, GPS navigation, filtering, and real-time event updates. Includes an admin panel for managing maps, content, and visitor statistics.",
    skills: ["Tableau", "SQL", "Python"],
    uploadStatus: "File Uploaded",
    githubLinked: true,
    projectLinked: true,
    fileUploaded: true,
  },
];

export default function ProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [projects] = useState<MockProject[]>(mockProjects); // ใช้ Mock Data ไปก่อน
  const [filterTab, setFilterTab] = useState<"All" | "No File Upload" | "File Uploaded">("All");

  // ตรวจสอบ Auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>("/api/auth/me");
        if (userData.user.role === "COMPANY") {
          router.push("/employer/profile");
          return;
        }
        if (!userData.user.role) {
          router.push("/role-selection");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false); // ปล่อยผ่านเพื่อให้เห็นหน้า Mockup ก่อน
      }
    };
    checkAuth();
  }, [router]);

  // ฟังก์ชันช่วย Filter
  const filteredProjects = projects.filter((p) => {
    if (filterTab === "All") return true;
    return p.uploadStatus === filterTab;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Top Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">
                    Projects
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    A collection of projects you have created and added to your profile.
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    />
                  </div>
                  {/* Add Project Button */}
                  <button className="px-5 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm">
                    + Add Project
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFilterTab("All")}
                    className={`px-6 py-2 text-sm font-bold rounded-lg border transition-colors ${
                      filterTab === "All" ? "border-[#3B82F6] text-[#3B82F6] shadow-sm bg-white" : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterTab("No File Upload")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${
                      filterTab === "No File Upload" ? "border-[#3B82F6] text-[#3B82F6] shadow-sm bg-white" : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    No File Upload
                  </button>
                  <button
                    onClick={() => setFilterTab("File Uploaded")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${
                      filterTab === "File Uploaded" ? "border-[#3B82F6] text-[#3B82F6] shadow-sm bg-white" : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    File Uploaded
                  </button>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 font-bold text-sm rounded-lg hover:bg-gray-50 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Skill
                </button>
              </div>

              {/* Total Count */}
              <h2 className="text-base font-extrabold text-gray-900 mb-4">
                {filteredProjects.length} Total Projects
              </h2>

              {/* Projects List */}
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    
                    {/* Card Header & Badge */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[17px] font-bold text-gray-900">
                        {project.title}
                      </h3>
                      
                      {/* Status Badge */}
                      {project.uploadStatus === "No File Uploaded" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0F7FF] text-[#0273B1] text-xs font-bold rounded-full border border-[#DBF0FF]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01"></path>
                          </svg>
                          No File Uploaded
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#16A34A] text-xs font-bold rounded-full border border-[#DCFCE7]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                          </svg>
                          File Uploaded
                        </span>
                      )}
                    </div>

                    {/* Subtitle */}
                    <p className="text-sm text-gray-500 mb-4">
                      Role: {project.role} | {project.period}
                    </p>

                    {/* Description */}
                    <p className="text-[14px] text-gray-700 leading-relaxed mb-6 max-w-4xl">
                      {project.description}
                    </p>

                    {/* Upload Files for Credibility Section */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Upload Files for Credibility</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* GitHub Box */}
                        <div className="flex items-center justify-between px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EBF5FF] flex items-center justify-center text-[#3B82F6]">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Github Linked</span>
                          </div>
                          {project.githubLinked ? (
                            <svg className="w-5 h-5 text-[#8BC34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#FF5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6M9 9l6 6"></path></svg>
                          )}
                        </div>

                        {/* Project Link Box */}
                        <div className="flex items-center justify-between px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EBF5FF] flex items-center justify-center text-[#3B82F6]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Project Link</span>
                          </div>
                          {project.projectLinked ? (
                            <svg className="w-5 h-5 text-[#8BC34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#FF5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6M9 9l6 6"></path></svg>
                          )}
                        </div>

                        {/* Upload File Box */}
                        <div className="flex items-center justify-between px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EBF5FF] flex items-center justify-center text-[#3B82F6]">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Upload File</span>
                          </div>
                          {project.fileUploaded ? (
                            <svg className="w-5 h-5 text-[#8BC34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#FF5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6M9 9l6 6"></path></svg>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Card Footer: Skills & Action Buttons */}
                    <div className="flex items-center justify-between mt-6">
                      {/* Skills Tags */}
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

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-red-500 transition-colors mr-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button className="px-4 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors">
                          {project.uploadStatus === "No File Uploaded" ? "Upload Files" : "Edit Files"}
                        </button>
                        <button className="px-4 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-xs font-bold rounded-md hover:bg-blue-50 transition-colors">
                          Edit Project
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}