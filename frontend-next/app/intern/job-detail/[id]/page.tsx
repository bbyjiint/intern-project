"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";

interface JobDetailData {
  id: string;
  state?: string;
  postedDate: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string;
  workType: string;
  roleType: string;
  positionsAvailable: number;
  jobDescription: string[];
  qualifications: string[];
  gpa: string;
  allowance: string;
  location: string;
  workingDaysHours: string;
  companyDescription: string;
  contactPhone: string;
  contactDepartment: string;
  address: string;
  mapEmbedUrl: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [job, setJob] = useState<JobDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobId) {
        setLoadError("Job post not found");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await apiFetch<{ jobPost: JobDetailData }>(`/api/job-posts/public/${jobId}`);
        setJob(response.jobPost);
      } catch (error) {
        console.error("Failed to load job detail:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load job detail");
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchJobDetail();
  }, [jobId]);

  const handleApply = async () => {
    if (!job || isApplying || hasApplied) return;

    setIsApplying(true);
    setApplyMessage(null);

    try {
      const response = await apiFetch<{
        application: { id: string; status: string; createdAt: string };
        alreadyApplied: boolean;
      }>(`/api/job-posts/${job.id}/apply`, {
        method: "POST",
      });

      setHasApplied(true);
      setApplyMessage(response.alreadyApplied ? "You already applied for this position." : "Application submitted successfully.");
    } catch (error: any) {
      console.error("Failed to apply for job post:", error);
      setApplyMessage(error?.message || "Failed to apply for this position.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
        <InternNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
        <InternNavbar />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="rounded-xl bg-white px-6 py-8 text-center shadow-sm border border-gray-100 text-gray-600">
            {loadError || "Job not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      {/* Main Container - ตรงกลางหน้าจอ */}
      <div className="layout-container layout-page">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-gray-600 font-bold text-[15px] mb-6 hover:text-black transition-colors"
        >
          &lt;&lt; Back
        </button>

        {/* 2 Columns Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ================= LEFT COLUMN: Job Details ================= */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 w-full">
            {/* Date */}
            <div className="flex items-center text-gray-500 mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{job.postedDate}</span>
            </div>

            {/* Title & Company */}
            <h1 className="text-[28px] font-extrabold text-black mb-1">
              {job.jobTitle}
            </h1>
            <p className="text-gray-500 mb-6">{job.companyName}</p>

            {/* Tags */}
            <div className="flex gap-3 mb-8">
              <span className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                {job.workType}
              </span>
              <span className="bg-[#E2E8F0] text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold">
                {job.roleType}
              </span>
            </div>

            <h3 className="text-lg font-bold text-black mb-8">
              Number of positions available: {job.positionsAvailable}
            </h3>

            {/* Job Description */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-black mb-3">Job description</h3>
              <ul className="space-y-2">
                {job.jobDescription.map((desc, idx) => (
                  <li key={idx} className="text-gray-600 text-[15px] leading-relaxed flex items-start">
                    <span className="mr-2">-</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Applicant qualifications */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-black mb-3">Applicant qualifications</h3>
              <ul className="space-y-2">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx} className="text-gray-600 text-[15px] leading-relaxed flex items-start">
                    <span className="mr-2">-</span>
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other Details (GPA, Allowance, etc.) */}
            <div className="space-y-6 mb-12">
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">GPA</h3>
                <p className="text-gray-600 text-[15px]">{job.gpa}</p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">Allowance</h3>
                <p className="text-gray-600 text-[15px]">{job.allowance}</p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">Preferred Location</h3>
                <p className="text-gray-600 text-[15px]">{job.location}</p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">Working Days & Hours</h3>
                <p className="text-gray-600 text-[15px]">{job.workingDaysHours}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t pt-8">
              <button
                onClick={() => router.back()}
                className="px-8 py-3 rounded-lg border-2 border-[#2563EB] text-[#2563EB] font-bold hover:bg-blue-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => void handleApply()}
                disabled={isApplying || hasApplied || job.state === "CLOSED"}
                className="px-8 py-3 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors disabled:cursor-not-allowed disabled:bg-[#94A3B8] disabled:shadow-none"
              >
                {job.state === "CLOSED"
                  ? "Position closed"
                  : hasApplied
                  ? "Applied"
                  : isApplying
                  ? "Applying..."
                  : ">> Apply for this position"}
              </button>
            </div>
            {applyMessage && (
              <div
                className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                  hasApplied ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-[#FEF2F2] text-[#B91C1C]"
                }`}
              >
                {applyMessage}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: Job Poster Info ================= */}
          <div className="flex-[1] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full sticky top-8">
            <h2 className="text-xl font-extrabold text-black text-center mb-6">Job Poster</h2>
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-[#F8F9FA] border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-12 h-12 relative flex items-end justify-center">
                  <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  <div className="absolute inset-[3px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  <span className="text-[6px] font-bold text-white z-10 mb-1">TRINITY</span>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-black">{job.companyName}</h3>
              <p className="text-sm text-gray-500">{job.companyEmail}</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-8 text-center px-2">
              {job.companyDescription}
            </p>

            {/* Contact Info */}
            <div className="mb-8">
              <h4 className="text-[15px] font-bold text-black mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-5 h-5 text-[#2563EB] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {job.contactPhone}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-5 h-5 text-[#2563EB] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {job.contactDepartment}
                </div>
              </div>
            </div>

            {/* Address & Map */}
            <div>
              <h4 className="text-[15px] font-bold text-black mb-2">Address</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {job.address}
              </p>
              {/* Google Maps Embed Placeholder */}
              <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                {job.mapEmbedUrl ? (
                  <iframe
                    src={job.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Map not available
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}