"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import { apiFetch } from "@/lib/api";

interface JobDetailData {
  id: string;
  state?: string;
  createdAt?: string;
  postedDate?: string;
  jobTitle?: string;
  companyName?: string;
  companyEmail?: string;
  companyLogo?: string;
  workplaceType?: string;
  positions?: string[];
  positionsAvailable?: number;
  jobDescription?: string;
  jobSpecification?: string;
  qualifications?: string[] | string;
  gpa?: string;
  allowance?: number;
  allowancePeriod?: "MONTH" | "WEEK" | "DAY" | null;
  noAllowance?: boolean;
  location?: string;
  workingDaysHours?: string;
  companyDescription?: string;
  contactPhone?: string;
  contactDepartment?: string;
  address?: string;
  mapEmbedUrl?: string;
}

const formatPostedDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatWorkType = (value?: string | null) => {
  if (!value) return "On-Site";
  if (value === "ON_SITE" || value === "on-site") return "On-Site";
  if (value === "HYBRID" || value === "hybrid") return "Hybrid";
  if (value === "REMOTE" || value === "remote") return "Remote";
  return value;
};

const workTypeColors: Record<string, string> = {
  Hybrid: "#3B82F6",
  "On-Site": "#F4C14D",
  Remote: "#F85454",
};

const formatAllowance = (job: JobDetailData) => {
  if (job.noAllowance) return "No allowance";
  if (!job.allowance) return "-";
  const periodMap: Record<string, string> = {
    MONTH: "Month",
    WEEK: "Week",
    DAY: "Day",
  };
  return `${Number(job.allowance).toLocaleString()} THB${job.allowancePeriod ? ` / ${periodMap[job.allowancePeriod]}` : ""}`;
};

const renderLines = (text?: string | string[] | null) => {
  const lines = Array.isArray(text)
    ? text.map((l) => l.trim()).filter(Boolean)
    : (text || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
  if (!lines.length) return <p className="text-gray-600 text-[15px]">-</p>;
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li
          key={i}
          className="text-gray-600 text-[15px] leading-relaxed flex items-start"
        >
          <span className="mr-2">-</span>
          <span>{line.startsWith("-") ? line.slice(1).trim() : line}</span>
        </li>
      ))}
    </ul>
  );
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

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
        const response = await apiFetch<{ jobPost: JobDetailData }>(
          `/api/job-posts/public/${jobId}`,
        );
        setJob(response.jobPost);
        // check ว่าเคย apply ไปแล้วหรือยัง
        try {
          const appResp = await apiFetch<{ applications: any[] }>(
            "/api/intern/applications",
          );
          console.log("first app:", JSON.stringify(appResp.applications?.[0]));
          const alreadyApplied = (appResp.applications || []).some(
            (a) => a.id === jobId,
          );
          if (alreadyApplied) {
            setHasApplied(true);
            setApplyMessage("You already applied for this position.");
          }
        } catch {
          // ไม่ต้องทำอะไร
        }
      } catch (error) {
        console.error("Failed to load job detail:", error);
        setLoadError(
          error instanceof Error ? error.message : "Failed to load job detail",
        );
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
      }>(`/api/job-posts/${job.id}/apply`, { method: "POST" });
      setHasApplied(true);
      setApplyMessage(
        response.alreadyApplied
          ? "You already applied for this position."
          : "Application submitted successfully.",
      );
    } catch (error: any) {
      setApplyMessage(error?.message || "Failed to apply for this position.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
        <InternNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
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

  const workType = formatWorkType(job.workplaceType);

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      <div className="layout-container layout-page">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-gray-600 font-bold text-[15px] mb-6 hover:text-black transition-colors"
        >
          &lt;&lt; Back
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 w-full">
            {/* Date */}
            <div className="flex items-center text-gray-500 mb-4">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">
                {formatPostedDate(job.createdAt || job.postedDate)}
              </span>
            </div>

            {/* Title & Company */}
            <h1 className="text-[28px] font-extrabold text-black mb-1">
              {job.jobTitle || "Untitled Job Post"}
            </h1>
            <p className="text-gray-500 mb-6">{job.companyName || "-"}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span
                className="rounded-[5px] px-[14px] py-[5px] text-[12px] font-semibold text-white"
                style={{
                  backgroundColor: workTypeColors[workType] || "#94A3B8",
                }}
              >
                {workType}
              </span>
              {Array.isArray(job.positions) && job.positions.length > 0
                ? job.positions.map((pos) => (
                    <span
                      key={pos}
                      className="rounded-[5px] bg-[#E5E7EB] px-[14px] py-[5px] text-[12px] font-semibold text-[#4B5563]"
                    >
                      {pos}
                    </span>
                  ))
                : null}
            </div>

            {/* Positions Available */}
            <h3 className="text-lg font-bold text-black mb-8">
              Number of positions available: {job.positionsAvailable ?? "-"}
            </h3>

            {/* Job Description */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-black mb-3">
                Job description
              </h3>
              {renderLines(job.jobDescription)}
            </div>

            {/* Applicant Qualifications */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-black mb-3">
                Applicant qualifications
              </h3>
              {renderLines(job.qualifications)}
            </div>

            {/* Other Details */}
            <div className="space-y-6 mb-12">
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">GPA</h3>
                <p className="text-gray-600 text-[15px]">
                  {job.gpa || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">
                  Allowance
                </h3>
                <p className="text-gray-600 text-[15px]">
                  {formatAllowance(job)}
                </p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">
                  Preferred Location
                </h3>
                <p className="text-gray-600 text-[15px]">
                  {job.location || "Location not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">
                  Working Days &amp; Hours
                </h3>
                <p className="text-gray-600 text-[15px]">
                  {job.workingDaysHours || "Not specified"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t pt-8 justify-end">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg border-2 border-[#2563EB] text-[#2563EB] font-bold hover:bg-blue-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => void handleApply()}
                disabled={isApplying || hasApplied || job.state === "CLOSED"}
                className="px-6 py-2 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:shadow-none disabled:text-[#9CA3AF]"
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
                  hasApplied
                    ? "bg-[#EFF6FF] text-[#1D4ED8]"
                    : "bg-[#FEF2F2] text-[#B91C1C]"
                }`}
              >
                {applyMessage}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-[1] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full sticky top-8">
            <h2 className="text-xl font-extrabold text-black text-center mb-6">
              Job Poster
            </h2>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-[#F8F9FA] border border-gray-100 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                {job.companyLogo && job.companyLogo.startsWith("http") ? (
                  <img
                    src={job.companyLogo}
                    alt={job.companyName || "Company"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#23356E] text-sm font-bold text-white">
                    {(job.companyName || "C").substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Company Name & Email */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-black">
                {job.companyName || "-"}
              </h3>
              <p className="text-sm text-gray-500">{job.companyEmail || "-"}</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-8 text-left px-2">
              {job.companyDescription || "-"}
            </p>

            {/* Contact Info */}
            <div className="mb-8">
              <h4 className="text-[15px] font-bold text-black mb-4">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg
                    className="w-5 h-5 text-[#2563EB] mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {job.contactPhone || "-"}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <svg
                    className="w-5 h-5 text-[#2563EB] mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {job.contactDepartment || "-"}
                </div>
              </div>
            </div>

            {/* Address & Map */}
            <div>
              <h4 className="text-[15px] font-bold text-black mb-2">Address</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {job.address || "-"}
              </p>
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
                  />
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
