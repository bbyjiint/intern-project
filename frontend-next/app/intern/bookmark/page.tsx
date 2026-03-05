"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/InternSidebar";

// 1. อัปเดต Interface ให้รองรับข้อมูลแบบในรูปภาพ
interface BookmarkedJob {
  id: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo: string;
  location: string;
  workType: string;
  roleType: string;
  applicants: number;
  allowance: string;
  timeAgo: string;
}

// 2. Mock Data จำลองให้ตรงกับรูปภาพเป๊ะๆ
const mockJobs: BookmarkedJob[] = [
  {
    id: "1",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    companyLogo: "TRINITY",
    location: "Bangkok",
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    timeAgo: "1 hour ago",
  },
  {
    id: "2",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    companyLogo: "TRINITY",
    location: "Bangkok",
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    timeAgo: "1 hour ago",
  },
];

export default function InternBookmarkPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [institution, setInstitution] = useState("");

  const [jobs, setJobs] = useState<BookmarkedJob[]>(mockJobs);
  // ตั้งค่าเริ่มต้นให้ Bookmark ทั้ง id 1 และ 2 ไว้เลย จะได้แสดงบนหน้าจอตามภาพ
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set(["1", "2"]));

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
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
      // TODO: Call API to remove bookmark
    } else {
      newBookmarks.add(id);
      // TODO: Call API to add bookmark
    }
    setBookmarkedJobs(newBookmarks);
  };

  // ดึงเฉพาะ Job ที่ถูก Bookmark ไว้
  const bookmarkedJobsList = jobs.filter((job) => bookmarkedJobs.has(job.id));

  // กรองข้อมูลตาม Filter (เบื้องต้นใช้แค่ Search กับ Position)
  const filteredJobs = bookmarkedJobsList.filter((job) => {
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition =
      !position || job.jobTitle.toLowerCase().includes(position.toLowerCase());

    return matchesSearch && matchesPosition;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-y-auto">
          
          {/* Page Title */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
            Bookmark
          </h1>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Search</label>
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
              
              {/* Position */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Position</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Position"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Academic Year</label>
                <div className="relative">
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-500 bg-white"
                  >
                    <option value="">Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Internship Period */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">Internship Period</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Start-Date"
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => e.target.value === '' ? e.target.type = 'text' : null}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="End-Date"
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => e.target.value === '' ? e.target.type = 'text' : null}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (Month)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Institution</label>
                <div className="relative">
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-500 bg-white"
                  >
                    <option value="">Select Institution Name</option>
                    <option value="chula">Chulalongkorn University</option>
                    <option value="tu">Thammasat University</option>
                    <option value="mu">Mahidol University</option>
                  </select>
                  <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filter Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {/* Job Post Count */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {filteredJobs.length} Total Job Post
          </h2>

          {/* Bookmarked Job Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 col-span-full">
                No bookmarked jobs matching your criteria.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative"
                >
                  {/* Top Row: Company Info & Icons */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Logo Placeholder */}
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                         <div className="w-6 h-6 relative">
                            <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                            <div className="absolute inset-[3px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                         </div>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {job.companyName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {job.companyEmail}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => handleBookmark(job.id)}
                        className="text-[#1C2D4F] hover:text-blue-700 transition-colors"
                      >
                        {/* Solid Bookmark Icon */}
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Job Title */}
                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    {job.jobTitle}
                  </h4>

                  {/* Tags */}
                  <div className="flex space-x-2 mb-6">
                    <span className="bg-[#4A90E2] text-white text-[11px] font-semibold px-3 py-1 rounded-md">
                      {job.workType}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-md">
                      {job.roleType}
                    </span>
                  </div>

                  {/* Job Details Grid */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start">
                      <span className="w-[140px] text-gray-400 text-sm">Perferred</span>
                      <span className="text-gray-600 text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-[140px] text-gray-400 text-sm leading-tight">
                        Number of<br />applicants
                      </span>
                      <span className="text-gray-600 text-sm">{job.applicants}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-[140px] text-gray-400 text-sm">Allowance</span>
                      <span className="text-gray-900 text-sm font-bold">
                        {job.allowance}
                      </span>
                    </div>
                  </div>

                  {/* Time Ago Footer */}
                  <div className="text-right mt-auto">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {job.timeAgo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}