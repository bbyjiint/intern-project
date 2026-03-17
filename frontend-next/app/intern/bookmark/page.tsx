"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/InternSidebar";
import JobCard, { JobPostData } from "@/components/profile/JobCard";

export default function InternBookmarkPage() {
  const router = useRouter();

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

  // Load bookmarked jobs from API
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
        // Remove from jobs list
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

    // Note: academicYear, startDate, endDate, duration, institution filters
    // are not available in JobPostData structure, so they're not applied here.
    // These would need to be added to the job post data structure or fetched separately.

    return matchesSearch && matchesPosition;
  });

  return (
    <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="layout-container layout-page flex-1 overflow-y-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
            Bookmark
          </h1>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Search
                </label>
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Position"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Academic Year
                </label>
                <div className="relative">
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 text-sm text-gray-500 bg-white"
                  >
                    <option value="">Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Internship Period
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Start-Date"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) =>
                      e.target.value === "" ? (e.target.type = "text") : null
                    }
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="End-Date"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) =>
                      e.target.value === "" ? (e.target.type = "text") : null
                    }
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (Month)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Institution
                </label>
                <div className="relative">
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 text-sm text-gray-500 bg-white"
                  >
                    <option value="">Select Institution Name</option>
                    <option value="chula">Chulalongkorn University</option>
                    <option value="tu">Thammasat University</option>
                    <option value="mu">Mahidol University</option>
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
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
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {loadError && (
            <div className="mb-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {loadError}
            </div>
          )}

          <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">
            {isLoading ? "Loading..." : `${filteredJobs.length} Total Job Post`}
          </h2>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
              Loading bookmarks...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
              {jobs.length === 0 
                ? "No bookmarked jobs yet. Start bookmarking jobs to see them here."
                : "No bookmarked jobs matching your criteria."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{ ...job, isBookmarked: bookmarkedJobs.has(job.id) }}
                  onBookmarkClick={handleBookmark}
                  onClick={(id) => router.push(`/intern/job-detail/${id}`)}
                  onMenuClick={(id) => console.log("Clicked menu for:", id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
