"use client";

import { useState } from "react";
import InternNavbar from "@/components/InternNavbar";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// 1. Interface ให้รองรับข้อมูลแบบในรูป
interface JobRecommendation {
  id: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  location: string;
  workType: string;
  roleType: string;
  applicants: number;
  allowance: string;
  matchPercentage: number;
  isBookmarked: boolean;
}

// 2. Mock Data ให้ตรงกับในรูปภาพเป๊ะๆ (2 การ์ด)
const mockRecommendations: JobRecommendation[] = [
  {
    id: "1",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    location: "Bangkok",
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    matchPercentage: 80,
    isBookmarked: false,
  },
  {
    id: "2",
    jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
    companyName: "Trinity Securities Co., Ltd.",
    companyEmail: "info@trinitythai.com",
    location: "Bangkok",
    workType: "Hybrid",
    roleType: "AI Developer",
    applicants: 4,
    allowance: "5,000 - 7,000 Baht",
    matchPercentage: 80,
    isBookmarked: false,
  },
];

export default function AIJobMatchPage() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>(mockRecommendations);

  // ฟังก์ชันสลับสถานะ Bookmark
  const toggleBookmark = (id: string) => {
    setRecommendations((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, isBookmarked: !job.isBookmarked } : job
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <InternNavbar />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-y-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">
              AI Job Match
            </h1>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Job Recommendations from Ai
            </h2>
            <p className="text-gray-500 text-sm">
              A collection of jobs/internships you might be interested in, updated recently.
            </p>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((job) => {
              // คำนวณเส้นรอบวงสำหรับ Circular Progress (รัศมี 16 -> 2 * PI * 16 ≈ 100.5)
              const circumference = 100.5;
              const strokeDashoffset = circumference - (job.matchPercentage / 100) * circumference;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
                >
                  {/* Top Row: Logo, Company Name, Email & 80% Circle */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Company Logo Mock */}
                      <div className="w-14 h-14 bg-[#F8F9FA] border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 relative flex items-end justify-center">
                          <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                          <div className="absolute inset-[3px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                          <span className="text-[4px] font-bold text-white z-10 mb-0.5">TRINITY</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                          {job.companyName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {job.companyEmail}
                        </p>
                      </div>
                    </div>

                    {/* Circular Progress Bar */}
                    <div className="relative w-[52px] h-[52px] flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background Track */}
                        <path
                          className="text-gray-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Progress Indicator */}
                        <path
                          className="text-[#F59E0B]" // สีส้ม
                          strokeWidth="3.5"
                          strokeDasharray={`${circumference}, ${circumference}`}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-gray-800">
                        {job.matchPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Job Title & Bookmark Icon */}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[19px] font-bold text-black">
                      {job.jobTitle}
                    </h4>
                    <button
                      onClick={() => toggleBookmark(job.id)}
                      className="text-gray-500 hover:text-gray-800 transition-colors mr-2"
                    >
                      <svg 
                        className={`w-6 h-6 ${job.isBookmarked ? "fill-gray-800 text-gray-800" : ""}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex space-x-2 mb-6">
                    <span className="bg-[#3B82F6] text-white text-xs font-semibold px-4 py-1.5 rounded-md">
                      {job.workType}
                    </span>
                    <span className="bg-[#E5E7EB] text-gray-700 text-xs font-semibold px-4 py-1.5 rounded-md">
                      {job.roleType}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="grid grid-cols-2 gap-4 items-start">
                      <span className="text-gray-500 text-[15px]">Perferred</span>
                      <span className="text-gray-600 text-[15px]">{job.location}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <span className="text-gray-500 text-[15px] leading-snug">
                        Number of<br />applicants
                      </span>
                      <span className="text-gray-600 text-[15px]">{job.applicants}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-start">
                      <span className="text-gray-500 text-[15px]">Allowance</span>
                      <span className="text-black font-bold text-[15px]">
                        {job.allowance}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <button className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                      Detail
                    </button>
                    <button className="w-full py-2.5 bg-[#F8FAFC] border border-[#3B82F6] rounded-lg text-[#3B82F6] font-semibold text-sm hover:bg-blue-50 transition-colors">
                      Apply
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}