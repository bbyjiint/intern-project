"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import { Project } from "@/hooks/useProfile";
import Sidebar from "@/components/Sidebar";

export default function ProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTechFilter, setSelectedTechFilter] =
    useState<string>("All Tech");
  const [profileData, setProfileData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const isAIAnalysisPage = pathname === "/intern/ai-analysis";
  const isJobMatchPage =
    pathname === "/intern/job-match" || pathname === "/intern/find-companies";
  const isCertificatesPage = pathname === "/intern/certificates";
  const isExperiencePage = pathname === "/intern/experience";
  const isProjectPage = pathname === "/intern/project";
  const isSkillPage = pathname === "/intern/skills";

  // Check if current page is one of the dropdown menu pages
  const isProfileDropdownPage =
    isAIAnalysisPage ||
    isJobMatchPage ||
    isCertificatesPage ||
    isExperiencePage ||
    isProjectPage ||
    isSkillPage;

  // Keep dropdown open when navigating to dropdown menu pages
  useEffect(() => {
    if (isProfileDropdownPage) {
      setIsProfileDropdownOpen(true);
    }
  }, [isProfileDropdownPage]);

  const loadProjects = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await apiFetch<{ profile: any }>("/api/candidates/profile");
      setProfileData(data.profile);
      setProjects(data.profile?.projects || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

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

        setIsLoading(false);
        loadProjects();
      } catch (error) {
        console.error("Failed to check auth:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("log in")
        ) {
          router.push("/login");
        } else {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [router, loadProjects]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
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
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return "JD";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "JD";
    const first = parts[0]?.[0] ?? "J";
    const second =
      parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
    return (first + (second ?? "D")).toUpperCase();
  };

  // Extract all unique technologies from projects
  const allTechnologies = Array.from(
    new Set(projects.flatMap((project) => project.skills || [])),
  ).sort();

  // Filter projects based on selected technology
  const filteredProjects =
    selectedTechFilter === "All Tech"
      ? projects
      : projects.filter((project) =>
          project.skills?.includes(selectedTechFilter),
        );

  // Featured projects (first 3-4 projects)
  const featuredProjects = projects.slice(0, 4);

  // Don't return early - keep layout visible

  return (
    <div className="min-h-screen bg-gray-50">
      <InternNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <Sidebar/>
        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="mb-8">
                <h1
                  className="text-4xl font-bold mb-2"
                  style={{ color: "#1C2D4F" }}
                >
                  {profileData?.fullName || "John Doe"}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {profileData?.desiredPosition || "Software Engineer Intern"}
                </p>
                <p className="text-gray-700 max-w-3xl">
                  {profileData?.bio ||
                    profileData?.aboutYou ||
                    "Aspiring software engineer with hands-on experience in developing data-driven applications. Skilled in Python, SQL, and Tableau."}
                </p>
              </div>

              {/* Featured Projects Section */}
              {!dataLoading && featuredProjects.length > 0 && (
                <div className="mb-12">
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{ color: "#1C2D4F" }}
                  >
                    Featured Projects
                  </h2>
                  <div className="space-y-6">
                    {featuredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Project Icon */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                            style={{ backgroundColor: "#0273B1" }}
                          >
                            {getInitials(project.name)}
                          </div>

                          {/* Project Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3
                                  className="text-lg font-semibold mb-1"
                                  style={{ color: "#1C2D4F" }}
                                >
                                  {project.name}
                                  {project.role && ` · ${project.role}`}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {project.linkedToExperience ||
                                    "Software Engineering Intern"}
                                </p>
                              </div>
                              {(project.startDate || project.endDate) && (
                                <div className="text-sm text-gray-600 text-right">
                                  {formatDate(project.startDate)} -{" "}
                                  {formatDate(project.endDate) || "Present"}
                                </div>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-gray-700 mb-3">
                                {project.description}
                              </p>
                            )}
                            {project.skills && project.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                      backgroundColor: "#E3F2FD",
                                      color: "#0273B1",
                                    }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#1C2D4F" }}
                  >
                    All Projects
                  </h2>
                  <Link
                    href="/intern/certificates"
                    className="text-sm font-medium flex items-center space-x-1"
                    style={{ color: "#0273B1" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#025a8f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#0273B1";
                    }}
                  >
                    <span>All Certificates</span>
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedTechFilter("All Tech")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTechFilter === "All Tech"
                        ? "text-white"
                        : "text-gray-700 bg-white border border-gray-300"
                    }`}
                    style={{
                      backgroundColor:
                        selectedTechFilter === "All Tech"
                          ? "#0273B1"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTechFilter !== "All Tech") {
                        e.currentTarget.style.backgroundColor = "#F0F4F8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTechFilter !== "All Tech") {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    All Tech
                  </button>
                  {allTechnologies.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTechFilter(tech)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTechFilter === tech
                          ? "text-white"
                          : "text-gray-700 bg-white border border-gray-300"
                      }`}
                      style={{
                        backgroundColor:
                          selectedTechFilter === tech
                            ? "#0273B1"
                            : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTechFilter !== tech) {
                          e.currentTarget.style.backgroundColor = "#F0F4F8";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTechFilter !== tech) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {tech}
                    </button>
                  ))}
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 flex items-center space-x-1"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F0F4F8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>All Types</span>
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Projects List */}
                {dataLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500">Loading projects...</p>
                    </div>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p className="text-gray-600 mb-4">No projects found.</p>
                    <button
                      onClick={() => router.push("/intern/profile")}
                      className="px-4 py-2 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: "#0273B1" }}
                    >
                      Add Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Project Icon */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                            style={{ backgroundColor: "#0273B1" }}
                          >
                            {getInitials(project.name)}
                          </div>

                          {/* Project Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3
                                  className="text-lg font-semibold mb-1"
                                  style={{ color: "#1C2D4F" }}
                                >
                                  {project.name}
                                  {project.role && ` · ${project.role}`}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {project.linkedToExperience ||
                                    "Software Engineering Intern"}
                                </p>
                              </div>
                              {(project.startDate || project.endDate) && (
                                <div className="text-sm text-gray-600 text-right">
                                  {formatDate(project.startDate)} -{" "}
                                  {formatDate(project.endDate) || "Present"}
                                </div>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-gray-700 mb-3">
                                {project.description}
                              </p>
                            )}
                            {project.skills && project.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                      backgroundColor: "#E3F2FD",
                                      color: "#0273B1",
                                    }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
