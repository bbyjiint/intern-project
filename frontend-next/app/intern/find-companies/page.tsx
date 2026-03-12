"use client";

import { useEffect, useMemo, useState } from "react";
import InternNavbar from "@/components/InternNavbar";
import JobCard, {JobPostData} from "@/components/profile/JobCard"; // แก้ Path ให้ตรงกับ Component ที่เราสร้าง
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function FindCompaniesPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPostData[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [positionFilter, setPositionFilter] = useState("");
  const [formatFilters, setFormatFilters] = useState({
    onSite: true,
    hybrid: true,
    remote: true,
  });

  // ตั้งค่าเริ่มต้นเงินเดือน
  const SLIDER_MAX = 50000;
  const [minSalary, setMinSalary] = useState("0");
  const [maxSalary, setMaxSalary] = useState(SLIDER_MAX.toString());

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await apiFetch<{ jobPosts: JobPostData[] }>("/api/job-posts/public");
        if (!isMounted) return;
        setJobs(response.jobPosts || []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load public job posts:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load job posts");
        setJobs([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFormat = (key: keyof typeof formatFilters) => {
    setFormatFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    setSearchQuery("");
    setPositionFilter("");
    setFormatFilters({ onSite: true, hybrid: true, remote: true });
    setMinSalary("0");
    setMaxSalary(SLIDER_MAX.toString());
  };

  const handleBookmark = async (id: string) => {
    const newBookmarks = new Set(bookmarkedJobs);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
      // TODO: Call API to remove bookmark
    } else {
      newBookmarks.add(id);
      // TODO: Call API to add bookmark
    }
    setBookmarkedJobs(newBookmarks);
  };

  const parseAllowance = (allowanceStr: string) => {
    if (allowanceStr.toLowerCase().includes("unpaid")) return [0, 0];
    const cleanStr = allowanceStr.replace(/,/g, "");
    const matches = cleanStr.match(/\d+/g);
    if (!matches) return [0, 0];
    const min = parseInt(matches[0], 10);
    const max = matches.length > 1 ? parseInt(matches[1], 10) : min;
    return [min, max];
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPosition =
        positionFilter === "" ||
        job.roleType.toLowerCase().includes(positionFilter.toLowerCase()) ||
        job.jobTitle.toLowerCase().includes(positionFilter.toLowerCase());

      const isHybrid = job.workType === "Hybrid";
      const isOnSite = job.workType === "On Site";
      const isRemote = job.workType === "Remote";

      const matchesFormat =
        (formatFilters.hybrid && isHybrid) ||
        (formatFilters.onSite && isOnSite) ||
        (formatFilters.remote && isRemote);

      const [jobMinSalary, jobMaxSalary] = parseAllowance(job.allowance);
      const filterMin = minSalary ? parseInt(minSalary, 10) : 0;
      const filterMax = maxSalary ? parseInt(maxSalary, 10) : Infinity;

      const matchesSalary =
        jobMaxSalary >= filterMin && jobMinSalary <= filterMax;

      return matchesSearch && matchesPosition && matchesFormat && matchesSalary;
    });
  }, [jobs, searchQuery, positionFilter, formatFilters, minSalary, maxSalary]);

  const countWorkType = (type: string) => {
    return jobs.filter((j) => j.workType === type).length;
  };

  // --- Slider Logic ---
  const currentMin = parseInt(minSalary) || 0;
  const currentMax = maxSalary === "" ? SLIDER_MAX : parseInt(maxSalary) || 0;

  const minPercent = Math.min(
    Math.max((currentMin / SLIDER_MAX) * 100, 0),
    100,
  );
  const maxPercent = Math.min(
    Math.max((currentMax / SLIDER_MAX) * 100, 0),
    100,
  );

  // เมื่อลากวงกลมฝั่งซ้าย (Min)
  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), currentMax - 500); // เว้นระยะไม่ให้ทับกัน
    setMinSalary(val.toString());
  };

  // เมื่อลากวงกลมฝั่งขวา (Max)
  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), currentMin + 500); // เว้นระยะไม่ให้ทับกัน
    setMaxSalary(val.toString());
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1 w-full">
        {/* ================= LEFT SIDEBAR (FILTERS) ================= */}
        <div className="w-[280px] lg:w-[320px] bg-white border-r border-gray-200 py-8 px-6 lg:px-8 flex flex-col gap-8 flex-shrink-0">
          {/* Position Filter */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Positions</h3>
            <div className="relative">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
              >
                <option value="">Select Position</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="ai">AI Engineer</option>
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

          {/* Internship Format Filter */}
          <div>
            <div className="flex items-center justify-between mb-4 cursor-pointer">
              <h3 className="text-sm font-bold text-gray-900">
                Internship format
              </h3>
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </div>
            <div className="space-y-3">
              {/* On-Site */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formatFilters.onSite ? "bg-[#3B82F6] border-[#3B82F6]" : "border-gray-300 bg-white"}`}
                  >
                    {formatFilters.onSite && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formatFilters.onSite}
                    onChange={() => toggleFormat("onSite")}
                  />
                  <span className="text-sm text-gray-700">On-Site</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {countWorkType("On Site")}
                </span>
              </label>

              {/* Hybrid */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formatFilters.hybrid ? "bg-[#3B82F6] border-[#3B82F6]" : "border-gray-300 bg-white"}`}
                  >
                    {formatFilters.hybrid && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formatFilters.hybrid}
                    onChange={() => toggleFormat("hybrid")}
                  />
                  <span className="text-sm text-gray-700">Hybrid</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {countWorkType("Hybrid")}
                </span>
              </label>

              {/* Remote */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formatFilters.remote ? "bg-[#3B82F6] border-[#3B82F6]" : "border-gray-300 bg-white"}`}
                  >
                    {formatFilters.remote && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formatFilters.remote}
                    onChange={() => toggleFormat("remote")}
                  />
                  <span className="text-sm text-gray-700">Remote</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {countWorkType("Remote")}
                </span>
              </label>
            </div>
          </div>

          {/* Allowance Filter */}
          <div>
            <div className="flex items-center justify-between mb-8 cursor-pointer">
              <h3 className="text-sm font-bold text-gray-900">Allowance</h3>
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </div>

            {/* Interactive Dual Slider */}
            <div className="relative h-1.5 bg-gray-200 rounded-full mb-8 mx-2">
              {/* Active Blue Track */}
              <div
                className="absolute top-0 h-full bg-[#3B82F6] rounded-full pointer-events-none"
                style={{
                  left: `${minPercent}%`,
                  right: `${100 - maxPercent}%`,
                }}
              ></div>

              {/* Min Input Slider */}
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                step="500"
                value={currentMin}
                onChange={handleMinSliderChange}
                className="absolute w-full -top-[7px] appearance-none bg-transparent pointer-events-none 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto 
                [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:border-gray-500
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto 
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-gray-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:border-gray-500"
              />

              {/* Max Input Slider */}
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                step="500"
                value={currentMax}
                onChange={handleMaxSliderChange}
                className="absolute w-full -top-[7px] appearance-none bg-transparent pointer-events-none 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto 
                [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:border-gray-500
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto 
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-gray-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:border-gray-500"
              />
            </div>

            {/* Min - Max Inputs */}
            <div className="flex items-center gap-3 mb-6">
              <input
                type="number"
                placeholder="Min"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-full text-xs focus:outline-none focus:border-blue-500 shadow-sm text-center"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-full text-xs focus:outline-none focus:border-blue-500 shadow-sm text-center"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 bg-[#3B82F6] text-white text-xs font-bold py-2.5 rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                Apply
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-[#F1F5F9] text-gray-600 text-xs font-bold py-2.5 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="layout-container">
            {loadError && (
              <div className="mb-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {loadError}
              </div>
            )}

            {/* Header Row: Search */}
            <div className="flex justify-end mb-8">
              <div className="relative w-full max-w-md">
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
                  placeholder="Search by role or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                />
              </div>
            </div>

            {/* Jobs Count */}
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-6">
              {isLoading ? "Loading job posts..." : `${filteredJobs.length} Total Job Post`}
            </h2>

            {/* Job Cards Grid */}
            {isLoading ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                Loading available job posts...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                No jobs match your selected filters. Try adjusting your search
                criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
    </div>
  );
}