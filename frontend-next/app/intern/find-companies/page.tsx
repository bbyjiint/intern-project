"use client";

import { useEffect, useMemo, useState } from "react";
import InternNavbar from "@/components/InternNavbar";
import JobCard, { JobPostData } from "@/components/profile/JobCard";
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
        setJobs((response.jobPosts || []).map((post: any) => ({
          id: post.id,
          jobTitle: post.jobTitle,
          companyName: post.companyName,
          companyEmail: post.companyEmail || "",
          companyLogo: post.companyLogo,
          location: post.location || "Location not specified",
          workType: post.workType,
          roleType: "",
          positions: Array.isArray(post.positions) ? post.positions : [],
          applicants: post.positionsAvailable || 0,
          allowance: post.allowance,
          timeAgo: post.postedDate,
        })));

        try {
          const bmResp = await apiFetch<{ jobIds: string[] }>("/api/intern/job-bookmarks");
          if (isMounted) setBookmarkedJobs(new Set(bmResp.jobIds || []));
        } catch {}
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load job posts");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadJobs();
    return () => { isMounted = false; };
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
    try {
      if (newBookmarks.has(id)) {
        newBookmarks.delete(id);
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: "DELETE" });
      } else {
        newBookmarks.add(id);
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: "POST" });
      }
      setBookmarkedJobs(new Set(newBookmarks));
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    }
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
      const matchesSearch = searchQuery === "" || 
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPosition = positionFilter === "" ||
        job.jobTitle.toLowerCase().includes(positionFilter.toLowerCase());

      const workType = job.workType?.toUpperCase().replace(/[-\s]/g, "_");
      const matchesFormat = (formatFilters.hybrid && workType === "HYBRID") ||
                            (formatFilters.onSite && workType === "ON_SITE") ||
                            (formatFilters.remote && workType === "REMOTE");

      const [jobMinSalary, jobMaxSalary] = parseAllowance(job.allowance);
      const filterMin = minSalary ? parseInt(minSalary, 10) : 0;
      const filterMax = maxSalary ? parseInt(maxSalary, 10) : Infinity;
      const matchesSalary = jobMaxSalary >= filterMin && jobMinSalary <= filterMax;

      return matchesSearch && matchesPosition && matchesFormat && matchesSalary;
    });
  }, [jobs, searchQuery, positionFilter, formatFilters, minSalary, maxSalary]);

  const countWorkType = (type: string) => {
    return jobs.filter((j) => j.workType?.toUpperCase().replace(/[-\s]/g, "_") === type.toUpperCase()).length;
  };

  // Slider Calc
  const currentMin = parseInt(minSalary) || 0;
  const currentMax = maxSalary === "" ? SLIDER_MAX : parseInt(maxSalary) || 0;
  const minPercent = (currentMin / SLIDER_MAX) * 100;
  const maxPercent = (currentMax / SLIDER_MAX) * 100;

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), currentMax - 1000);
    setMinSalary(val.toString());
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), currentMin + 1000);
    setMaxSalary(val.toString());
  };

  // UI Reusable Styles
  const labelStyles = "text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4 block";
  const sidebarCardStyles = "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-[300px] lg:w-[340px] p-8 flex flex-col gap-10 flex-shrink-0 transition-colors duration-300";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className={sidebarCardStyles}>
          {/* Position */}
          <div>
            <label className={labelStyles}>Positions</label>
            <div className="relative group">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="">All Positions</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="ai">AI Engineer</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className={labelStyles}>Work Format</label>
            <div className="space-y-4">
              {[
                { id: "onSite", label: "On-Site", type: "ON_SITE", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" },
                { id: "hybrid", label: "Hybrid", type: "HYBRID", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
                { id: "remote", label: "Remote", type: "REMOTE", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
              ].map((format) => (
                <label key={format.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formatFilters[format.id as keyof typeof formatFilters] ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30" : "border-slate-300 dark:border-slate-600 bg-transparent"}`}>
                      {formatFilters[format.id as keyof typeof formatFilters] && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={formatFilters[format.id as keyof typeof formatFilters]} onChange={() => toggleFormat(format.id as keyof typeof formatFilters)} />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">{format.label}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${format.color}`}>
                    {countWorkType(format.type)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Allowance Slider */}
          <div>
            <label className={labelStyles}>Allowance (THB)</label>
            <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-10 mt-6">
              <div 
                className="absolute h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <input type="range" min="0" max={SLIDER_MAX} step="500" value={currentMin} onChange={handleMinSliderChange} className="absolute w-full -top-1.5 appearance-none bg-transparent pointer-events-none z-20 slider-thumb-custom" />
              <input type="range" min="0" max={SLIDER_MAX} step="500" value={currentMax} onChange={handleMaxSliderChange} className="absolute w-full -top-1.5 appearance-none bg-transparent pointer-events-none z-20 slider-thumb-custom" />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Min</p>
                <input type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-700 dark:text-white outline-none text-center" />
              </div>
              <span className="text-slate-400 font-bold">/</span>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Max</p>
                <input type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-700 dark:text-white outline-none text-center" />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3.5 rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all">APPLY</button>
              <button onClick={handleReset} className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">RESET</button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="flex justify-end mb-12">
              <div className="relative w-full max-w-lg group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search roles, companies, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-700 dark:text-slate-200 font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isLoading ? "Fetching Opportunities..." : <><span className="text-blue-600 dark:text-blue-400">{filteredJobs.length}</span> Total Job Postings</>}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matching jobs found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="transition-all duration-300 hover:-translate-y-2">
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
        </main>
      </div>

      <style jsx global>{`
        .slider-thumb-custom::-webkit-slider-thumb {
          appearance: none;
          pointer-events: auto;
          width: 22px;
          height: 22px;
          background: #ffffff;
          border: 4px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .slider-thumb-custom::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #3b82f6;
          border-color: #ffffff;
        }
        .dark .slider-thumb-custom::-webkit-slider-thumb {
          background: #1e293b;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}