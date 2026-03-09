"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/InternSidebar";
import JobCard, {JobPostData} from "@/components/profile/JobCard"; // นำเข้า Component

// 1. Mock Data จำลอง (เปลี่ยน Interface มาใช้ของ JobCard)
const mockJobs: JobPostData[] = [
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

  const [jobs, setJobs] = useState<JobPostData[]>(mockJobs);
  // ตั้งค่าเริ่มต้นให้ Bookmark ทั้ง id 1 และ 2 ไว้เลย
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

  // กรองข้อมูลตาม Filter
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
          <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">
            {filteredJobs.length} Total Job Post
          </h2>

          {/* Bookmarked Job Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 col-span-full bg-white rounded-2xl shadow-sm border border-gray-100">
                No bookmarked jobs matching your criteria.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={{...job, isBookmarked: bookmarkedJobs.has(job.id)}} // ส่งสถานะ Bookmark เข้าไปให้
                  onBookmarkClick={handleBookmark} // ส่งฟังก์ชันไปให้ Component เรียกใช้เวลาคลิก
                  onClick={(id) => router.push(`/intern/job-detail/${id}`)}
                  onMenuClick={(id) => console.log("Clicked menu for:", id)}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}