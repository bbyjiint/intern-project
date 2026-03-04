"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AIAnalysisPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isAIAnalysisPage = pathname === "/intern/ai-analysis";
  const isJobMatchPage =
    pathname === "/intern/job-match" || pathname === "/intern/find-companies";
  const isCertificatesPage = pathname === "/intern/certificates";
  const isExperiencePage = pathname === "/intern/experience";
  const isProjectPage = pathname === "/intern/project";
  const isSkillPage = pathname === "/intern/skills";

  // Check if current page is one of the dropdown menu pages
  const isProfileDropdownPage =
    isAIAnalysisPage ||
    isJobMatchPage ||
    isCertificatesPage ||
    isExperiencePage ||
    isProjectPage ||
    isSkillPage;

  // Keep dropdown open when navigating to dropdown menu pages
  useEffect(() => {
    if (isProfileDropdownPage) {
      setIsProfileDropdownOpen(true);
    }
  }, [isProfileDropdownPage]);

  // Dropdown stays open when clicked - no auto-close on outside click

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>(
          "/api/auth/me",
        );

        if (userData.user.role === "COMPANY") {
          router.push("/employer/profile");
          return;
        }

        if (!userData.user.role) {
          router.push("/role-selection");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to check auth:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("log in")
        ) {
          router.push("/login");
        } else {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InternNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <InternNavbar />
      
      {/* จับ Sidebar และ Main Content ใส่ flex แถวเดียวกัน */}
      <div className="flex flex-1">
        
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#1C2D4F" }}>
              Skill
            </h1>
          </div>
        </div>

      </div>
    </div>
  );
}
