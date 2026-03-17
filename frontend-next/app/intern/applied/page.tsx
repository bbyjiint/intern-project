"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Sidebar from "@/components/InternSidebar"; // หรือแก้เป็น "@/components/Sidebar" ตามที่โปรเจกต์คุณตั้งชื่อไว้
import { apiFetch } from "@/lib/api";
import JobCard, { JobPostData } from "@/components/profile/JobCard";

export default function InternAppliedPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobPostData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await apiFetch<{ applications: JobPostData[] }>("/api/intern/applications");
        setApplications(data.applications || []);
      } catch (error) {
        console.error("Failed to load applied jobs:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load applications");
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Map backend status to frontend filter
      // Backend: NEW, SHORTLISTED, REVIEWED, REJECTED
      // Frontend: Applied, Accept, Decline
      let matchesStatus = true;
      if (statusFilter === "All") {
        matchesStatus = true;
      } else if (statusFilter === "Lastest") {
        // Show most recent applications (sorted by createdAt desc, so first items)
        matchesStatus = true; // All are shown, but we could add date-based filtering if needed
      } else if (statusFilter === "Applied") {
        matchesStatus = app.status === "Applied";
      } else if (statusFilter === "Accept") {
        matchesStatus = app.status === "Accept";
      } else if (statusFilter === "Decline") {
        matchesStatus = app.status === "Decline";
      }
      
      const matchesSearch =
        searchQuery === "" ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {loadError && (
            <div className="mb-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {loadError}
            </div>
          )}

          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-[36px] font-extrabold text-gray-900 mb-1 tracking-tight">
                Applied
              </h1>
              <p className="text-gray-500 text-sm">
                View and track your recent job applications.
              </p>
            </div>

            <div className="relative w-full md:w-80 lg:w-[400px]">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
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
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {["All", "Lastest", "Applied", "Accept", "Decline"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-2 text-sm font-bold rounded-lg border transition-colors ${
                    statusFilter === status
                      ? "bg-white text-[#3B82F6] border-[#3B82F6] shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>

          <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">
            {isLoading ? "Loading applications..." : `${filteredApplications.length} Total Applied`}
          </h2>

          {/* Job Application Cards Grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500 col-span-full">
                Loading your applications...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-10 text-gray-500 col-span-full">
                No applications found matching your criteria.
              </div>
            ) : (
              filteredApplications.map((application) => (
                <JobCard
                  key={application.id}
                  job={application}
                  onMenuClick={(id) =>
                    console.log("Clicked menu on job ID:", id)
                  }
                  onClick={(id) => router.push(`/intern/job-detail/${id}`)}
                  // onBookmarkClick={(id) => ...} // ถ้าอยากให้หน้า Applied มีปุ่มถูกใจด้วยก็เปิดใช้
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
