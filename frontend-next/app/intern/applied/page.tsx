"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Sidebar from "@/components/InternSidebar"; // หรือแก้เป็น "@/components/Sidebar" ตามที่โปรเจกต์คุณตั้งชื่อไว้
import { apiFetch } from "@/lib/api";
import JobCard, { JobPostData } from "@/components/profile/JobCard";

// 2. Mock Data ให้ตรงกับในรูปภาพ 4 รายการ
const mockApplications: JobPostData[] = [
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
    allowance: "5,000 - 7,000 THB",
    timeAgo: "1 hour ago",
    status: "Accept",
  },
  {
    id: "2",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    companyLogo: "TRINITY",
    location: "Bangkok",
    workType: "On-Site",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 THB",
    timeAgo: "1 hour ago",
    status: "Decline",
  },
  {
    id: "3",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    companyLogo: "TRINITY",
    location: "Bangkok",
    workType: "Remote",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 THB",
    timeAgo: "1 hour ago",
    status: "Applied",
  },
  {
    id: "4",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    companyLogo: "TRINITY",
    location: "Bangkok",
    workType: "Remote",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 THB",
    timeAgo: "1 hour ago",
    status: "Applied",
  },
];

export default function InternAppliedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [applications, setApplications] =
    useState<JobPostData[]>(mockApplications);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // ให้ Lastest กับ All โชว์ทั้งหมดไปก่อนสำหรับการทำ Mockup
      const matchesStatus =
        statusFilter === "All" ||
        statusFilter === "Lastest" ||
        app.status === statusFilter;
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  // ฟังก์ชันแยกสีของ Tag แบบการทำงาน
  const getWorkTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "hybrid":
        return "bg-[#3B82F6] text-white"; // สีฟ้า
      case "on-site":
        return "bg-[#F59E0B] text-white"; // สีส้ม
      case "remote":
        return "bg-[#EF4444] text-white"; // สีแดง
      default:
        return "bg-gray-400 text-white";
    }
  };

  // ฟังก์ชัน Render ป้ายสถานะแบบ Outline
  const renderStatusBadge = (status: string) => {
    if (status === "Accept") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A] text-xs font-bold rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          Accept
        </span>
      );
    }
    if (status === "Decline") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444] text-xs font-bold rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          Decline
        </span>
      );
    }
    if (status === "Applied") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0F7FF] text-[#3B82F6] border border-[#3B82F6] text-xs font-bold rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Applied
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-y-auto">
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
            {filteredApplications.length} Total Applied
          </h2>

          {/* Job Application Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredApplications.length === 0 ? (
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
