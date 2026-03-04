"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

// 1. อัปเดต Interface ให้รองรับข้อมูลแบบในรูปใหม่
interface JobApplication {
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
  appliedDate: string;
  timeAgo: string;
  status: "Registered" | "Accept" | "Decline";
}

// 2. Mock Data ให้ตรงกับในรูปภาพ "Applied"
const mockApplications: JobApplication[] = [
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
    appliedDate: "5 January 2026",
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
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    appliedDate: "5 January 2026",
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
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    appliedDate: "5 January 2026",
    timeAgo: "1 hour ago",
    status: "Registered",
  },
  {
    id: "4",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    companyLogo: "TRINITY",
    location: "Bangkok",
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    appliedDate: "5 January 2026",
    timeAgo: "1 hour ago",
    status: "Registered",
  },
];

export default function InternAppliedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [statusFilter, setStatusFilter] = useState<"All" | "Registered" | "Accept" | "Decline">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Accept":
        return "bg-[#8BC34A]"; // สีเขียว
      case "Decline":
        return "bg-[#FF5252]"; // สีแดง
      case "Registered":
      default:
        return "bg-[#4A90E2]"; // สีฟ้า
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                Applied
              </h1>
              <p className="text-gray-500 text-sm">
                View and track your recent job applications.
              </p>
            </div>
            <div className="relative mt-4 md:mt-0 w-full md:w-80">
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
                className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["All", "Registered", "Accept", "Decline"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                  statusFilter === status
                    ? "bg-white text-blue-600 border-blue-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <p className="text-gray-900 font-bold mb-4">
            {filteredApplications.length} Total Job Post
          </p>

          {/* Job Application Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-10 text-gray-500 col-span-full">
                No applications found matching your criteria.
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
                >
                  {/* Status Badge (Absolute Top Right) */}
                  <div
                    className={`absolute -top-3 right-6 px-3 py-1 rounded text-white text-xs font-bold shadow-sm ${getStatusStyle(
                      application.status
                    )}`}
                  >
                    {application.status}
                    {/* Optional: Add a small triangle to make it look like a folded ribbon if desired */}
                    <div className={`absolute top-full left-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-black opacity-20`} />
                  </div>

                  {/* Top: Company Info & Options */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Logo Placeholder */}
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                         {/* Trinity Logo Mock */}
                         <div className="w-6 h-6 relative">
                            <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                            <div className="absolute inset-[3px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                         </div>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {application.companyName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {application.companyEmail}
                        </p>
                      </div>
                    </div>
                    {/* 3 dots menu */}
                    <button className="text-gray-300 hover:text-gray-500 transition-colors mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Job Title */}
                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    {application.jobTitle}
                  </h4>

                  {/* Tags */}
                  <div className="flex space-x-2 mb-6">
                    <span className="bg-[#4A90E2] text-white text-[11px] font-semibold px-3 py-1 rounded-md">
                      {application.workType}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-md">
                      {application.roleType}
                    </span>
                  </div>

                  {/* Job Details Grid */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start">
                      <span className="w-[140px] text-gray-400 text-sm">Preferred</span>
                      <span className="text-gray-600 text-sm">{application.location}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-[140px] text-gray-400 text-sm leading-tight">
                        Number of<br />applicants
                      </span>
                      <span className="text-gray-600 text-sm">{application.applicants}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-[140px] text-gray-400 text-sm">Allowance</span>
                      <span className="text-gray-900 text-sm font-bold">
                        {application.allowance}
                      </span>
                    </div>
                  </div>

                  {/* Time Ago Footer */}
                  <div className="text-right mt-auto">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {application.timeAgo}
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