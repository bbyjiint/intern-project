"use client";

import { useState } from "react";
import InternNavbar from "@/components/InternNavbar";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/InternSidebar";
import JobCard, { JobPostData } from "@/components/profile/JobCard";

// Mock Data ให้ตรงกับในรูปภาพเป๊ะๆ (2 การ์ด)
const mockRecommendations: JobPostData[] = [
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
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<JobPostData[]>(mockRecommendations);

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
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          
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
            {recommendations.map((job) => (
              <JobCard 
                 key={job.id} 
                 job={job}
                 onBookmarkClick={toggleBookmark}
                 onClick={(id) => router.push(`/intern/job-detail/${id}`)}
                 showActions={true}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}