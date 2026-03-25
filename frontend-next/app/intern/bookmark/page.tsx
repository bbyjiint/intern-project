"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/InternSidebar";
import JobCard, { JobPostData } from "@/components/profile/JobCard";

export default function InternBookmarkPage() {
  const router = useRouter();

  // State สำหรับ Mobile Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [institution, setInstitution] = useState("");

  const [jobs, setJobs] = useState<JobPostData[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const resp = await apiFetch<{ jobs: JobPostData[] }>(
          "/api/intern/job-bookmarks/jobs",
        );
        const bookmarkedIds = new Set<string>(
          (resp.jobs || []).map((j) => j.id),
        );
        setBookmarkedJobs(bookmarkedIds);
        setJobs(resp.jobs || []);
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load bookmarked jobs");
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadBookmarks();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery("");
    setPosition("");
    setAcademicYear("");
    setStartDate("");
    setEndDate("");
    setDuration("");
    setInstitution("");
  };

  const handleBookmark = async (id: string) => {
    const newBookmarks = new Set(bookmarkedJobs);
    try {
      if (newBookmarks.has(id)) {
        newBookmarks.delete(id);
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: "DELETE" });
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        newBookmarks.add(id);
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: "POST" });
      }
      setBookmarkedJobs(new Set(newBookmarks));
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPosition =
      !position ||
      job.jobTitle.toLowerCase().includes(position.toLowerCase()) ||
      job.roleType?.toLowerCase().includes(position.toLowerCase());

    return matchesSearch && matchesPosition;
  });

  const inputStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/30 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all";
  const labelStyles = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Floating Action Button (FAB) - ปรากฏเฉพาะบน Mobile (lg:hidden) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="layout-container layout-page flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Bookmarks
              </h1>
              {/* ปุ่ม Sidebar เดิมถูกย้ายไปที่ FAB แล้ว */}
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 md:p-8 mb-6 md:mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-4 md:mb-8">
                <div>
                  <label className={labelStyles}>Search Keyword</label>
                  <div className="relative group">
                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Frontend, Google"
                      className={`${inputStyles} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyles}>Position</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Search position"
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label className={labelStyles}>Academic Year</label>
                  <div className="relative">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className={`${inputStyles} appearance-none cursor-pointer`}
                    >
                      <option value="">All Years</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
                <div className="sm:col-span-2">
                  <label className={labelStyles}>Internship Period</label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      placeholder="Start Date"
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => e.target.value === "" ? (e.target.type = "text") : null}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputStyles}
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => e.target.value === "" ? (e.target.type = "text") : null}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyles}>Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Months (e.g. 3)"
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label className={labelStyles}>Institution</label>
                  <div className="relative">
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className={`${inputStyles} appearance-none cursor-pointer`}
                    >
                      <option value="">All Institutions</option>
                      <option value="chula">Chulalongkorn University</option>
                      <option value="tu">Thammasat University</option>
                      <option value="mu">Mahidol University</option>
                    </select>
                    <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {loadError && (
              <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-6 py-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loadError}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {isLoading ? (
                  <span className="animate-pulse">Loading Bookmarks...</span>
                ) : (
                  <><span className="text-blue-600 dark:text-blue-400">{filteredJobs.length}</span> Saved Jobs</>
                )}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[280px] rounded-2xl bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm px-4">
                <div className="mb-4 flex justify-center text-slate-300 dark:text-slate-700">
                  <svg className="w-16 h-16 md:w-20 md:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No saved jobs found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
                  {jobs.length === 0 
                    ? "Start bookmarking jobs that interest you to keep track of them here."
                    : "Try adjusting your filters to find what you're looking for."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="transition-transform duration-300 hover:scale-[1.02]">
                    <JobCard
                      job={{ ...job, isBookmarked: bookmarkedJobs.has(job.id) }}
                      onBookmarkClick={handleBookmark}
                      onClick={(id) => router.push(`/intern/job-detail/${id}`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}