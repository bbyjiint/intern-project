"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Sidebar from "@/components/InternSidebar"; 
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
      let matchesStatus = true;
      if (statusFilter === "All") {
        matchesStatus = true;
      } else if (statusFilter === "Lastest") {
        matchesStatus = true; 
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
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="layout-container layout-page flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            
            {loadError && (
              <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loadError}
              </div>
            )}

            {/* Header & Search */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  Applied
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  View and track your recent job applications and status.
                </p>
              </div>

              <div className="relative w-full lg:w-[400px] group">
                <svg
                  className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors absolute left-4 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by company or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/30 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit">
              {["All", "Lastest", "Applied", "Accept", "Decline"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                      statusFilter === status
                        ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md scale-105"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Updating List...
                  </span>
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">{filteredApplications.length}</span> Total Applications
                  </>
                )}
              </h2>
            </div>

            {/* Job Application Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                // Loading State UI
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-white/50 dark:bg-slate-900/50 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                ))
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 col-span-full">
                  <div className="mb-4 flex justify-center text-slate-300 dark:text-slate-700">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No applications found matching your criteria.</p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div key={application.id} className="transform transition-all hover:scale-[1.02]">
                    <JobCard
                      job={application}
                      onMenuClick={(id) => console.log("Menu ID:", id)}
                      onClick={(id) => router.push(`/intern/job-detail/${id}`)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}