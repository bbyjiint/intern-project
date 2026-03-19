"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmployerNavbar from "@/components/EmployerNavbar";
import EmployerSidebar from "@/components/EmployerSidebar";
import { apiFetch } from "@/lib/api";

interface JobPostDetail {
  id: string;
  jobTitle?: string;
  locationProvince?: string | null;
  locationDistrict?: string | null;
  locationProvinceId?: string | null;
  LocationProvince?: { name: string } | null;
  positions?: string[];
  workingDaysHours?: string | null;
  jobType?: string | null;
  positionsAvailable?: number | null;
  gpa?: string | null;
  workplaceType?: string | null;
  allowance?: number | null;
  allowancePeriod?: "MONTH" | "WEEK" | "DAY" | null;
  noAllowance?: boolean | null;
  jobDescription?: string | null;
  jobSpecification?: string | null;
  createdAt?: string;
  ScreeningQuestions?: Array<{ id: string }>;
  Company?: {
    companyName?: string | null;
    logoURL?: string | null;
  } | null;
}

interface CompanyProfile {
  companyName?: string;
  companyDescription?: string;
  phoneNumber?: string;
  email?: string;
  contactName?: string;
  addressDetails?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postcode?: string;
  companyLogo?: string;
  logoURL?: string;
  profileImage?: string;
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

const formatAllowance = (jobPost: JobPostDetail) => {
  if (jobPost.noAllowance) return "No allowance";
  if (!jobPost.allowance) return "-";
  const periodMap: Record<string, string> = {
    MONTH: "Month",
    WEEK: "Week",
    DAY: "Day",
  };
  return `${Number(jobPost.allowance).toLocaleString()} THB${jobPost.allowancePeriod ? ` / ${periodMap[jobPost.allowancePeriod] || jobPost.allowancePeriod}` : ""}`;
};

const renderLines = (text?: string | null) => {
  const lines = (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return <p className="text-gray-600 text-[15px]">-</p>;
  }

  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="text-gray-600 text-[15px] leading-relaxed flex items-start">
          <span className="mr-2">-</span>
          <span>{line.startsWith("-") ? line.slice(1).trim() : line}</span>
        </li>
      ))}
    </ul>
  );
};

export default function EmployerViewPostPage() {
  const params = useParams();
  const router = useRouter();
  const jobPostId = params?.id as string;

  const [jobPost, setJobPost] = useState<JobPostDetail | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!jobPostId) return;
      try {
        const [jobResp, companyResp] = await Promise.all([
          apiFetch<{ jobPost: JobPostDetail }>(`/api/job-posts/${jobPostId}`),
          apiFetch<{ profile: CompanyProfile }>(`/api/companies/profile`),
        ]);
        setJobPost(jobResp.jobPost);
        setCompanyProfile(companyResp.profile || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job post");
      }
    };
    load();
  }, [jobPostId]);

  const fullAddress = useMemo(() => {
    if (!companyProfile) return "";
    return [
      companyProfile.addressDetails,
      companyProfile.subDistrict,
      companyProfile.district,
      companyProfile.province,
      companyProfile.postcode,
      "Thailand",
    ]
      .filter(Boolean)
      .join(", ");
  }, [companyProfile]);

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] transition-colors dark:bg-slate-950">
        <EmployerNavbar />
        <div className="flex">
          <EmployerSidebar activeItem="applicants" />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[#6B7280] dark:text-slate-400">{error || "Loading job post..."}</p>
          </div>
        </div>
      </div>
    );
  }

  const companyLogo =
    companyProfile?.companyLogo ||
    companyProfile?.logoURL ||
    companyProfile?.profileImage ||
    jobPost.Company?.logoURL ||
    "";
  const workType = formatWorkType(jobPost.workplaceType);

  return (
    <div className="min-h-screen bg-[#F4F7FA] transition-colors dark:bg-slate-950">
      <EmployerNavbar />
      <div className="flex">
        <EmployerSidebar activeItem="applicants" />

        <div className="flex-1">
          <div className="layout-container layout-page">
            {/* Header */}
            <h1 className="mb-[20px] text-[24px] font-bold text-[#05060A] dark:text-white">
              Applicants &gt; View Post
            </h1>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* LEFT COLUMN */}
              <div className="w-full flex-[2] rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:p-10">
                {/* Date */}
                <div className="mb-4 flex items-center text-gray-500 dark:text-slate-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">{formatPostedDate(jobPost.createdAt)}</span>
                </div>

                {/* Title & Company */}
                <h2 className="mb-1 text-[28px] font-extrabold text-black dark:text-white">
                  {jobPost.jobTitle || "Untitled Job Post"}
                </h2>
                <p className="mb-6 text-gray-500 dark:text-slate-400">
                  {companyProfile?.companyName || jobPost.Company?.companyName || "Company Name"}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span
                    className="rounded-[5px] px-[14px] py-[5px] text-[12px] font-semibold text-white"
                    style={{ backgroundColor: workTypeColors[workType] || "#94A3B8" }}
                  >
                    {workType}
                  </span>
                  {Array.isArray(jobPost.positions) && jobPost.positions.length > 0
                    ? jobPost.positions.map((pos) => (
                        <span key={pos} className="rounded-[5px] bg-[#E5E7EB] px-[14px] py-[5px] text-[12px] font-semibold text-[#4B5563] dark:bg-slate-800 dark:text-slate-300">
                          {pos}
                        </span>
                      ))
                    : null}
                </div>

                {/* Positions Available */}
                <h3 className="mb-8 text-lg font-bold text-black dark:text-white">
                  Number of positions available: {jobPost.positionsAvailable ?? "-"}
                </h3>

                {/* Job Description */}
                <div className="mb-8">
                  <h3 className="mb-3 text-[17px] font-bold text-black dark:text-white">Job description</h3>
                  {renderLines(jobPost.jobDescription)}
                </div>

                {/* Qualifications */}
                <div className="mb-8">
                  <h3 className="mb-3 text-[17px] font-bold text-black dark:text-white">Applicant qualifications</h3>
                  {renderLines(jobPost.jobSpecification)}
                </div>

                {/* Other Details */}
                <div className="space-y-6 mb-12">
                  <div>
                    <h3 className="mb-1 text-[17px] font-bold text-black dark:text-white">GPA</h3>
                    <p className="text-[15px] text-gray-600 dark:text-slate-300">{jobPost.gpa || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-[17px] font-bold text-black dark:text-white">Allowance</h3>
                    <p className="text-[15px] text-gray-600 dark:text-slate-300">{formatAllowance(jobPost)}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-[17px] font-bold text-black dark:text-white">Preferred Location</h3>
                    <p className="text-[15px] text-gray-600 dark:text-slate-300">
                      {jobPost.LocationProvince?.name || jobPost.locationProvince || "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-[17px] font-bold text-black dark:text-white">Working Days &amp; Hours</h3>
                    <p className="text-[15px] text-gray-600 dark:text-slate-300">{jobPost.workingDaysHours || "Not specified"}</p>
                  </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-end border-t pt-8 dark:border-slate-800">
                  <button
                    onClick={() => router.back()}
                    className="rounded-lg border-2 border-[#2563EB] px-6 py-2 font-bold text-[#2563EB] transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="w-full flex-[1] rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:sticky lg:top-8">
                <h2 className="mb-6 text-center text-xl font-extrabold text-black dark:text-white">Job Poster</h2>

                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-[#F8F9FA] shadow-sm dark:border-slate-800 dark:bg-slate-800">
                    {companyLogo && companyLogo.startsWith("http") ? (
                      <img src={companyLogo} alt={companyProfile?.companyName || "Company"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#23356E] text-sm font-bold text-white">
                        {(companyProfile?.companyName || jobPost.Company?.companyName || "C").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Name & Email */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {companyProfile?.companyName || jobPost.Company?.companyName || "-"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{companyProfile?.email || "-"}</p>
                </div>

                <p className="mb-8 px-2 text-left text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                  {companyProfile?.companyDescription || "-"}
                </p>

                {/* Contact Info */}
                <div className="mb-8">
                  <h4 className="mb-4 text-[15px] font-bold text-black dark:text-white">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                      <svg className="w-5 h-5 text-[#2563EB] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {companyProfile?.phoneNumber || "-"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                      <svg className="w-5 h-5 text-[#2563EB] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {companyProfile?.contactName || "-"}
                    </div>
                  </div>
                </div>

                {/* Address & Map */}
                <div>
                  <h4 className="mb-2 text-[15px] font-bold text-black dark:text-white">Address</h4>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-slate-300">{fullAddress || "-"}</p>
                  <div className="h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-slate-800 dark:bg-slate-800">
                    {fullAddress ? (
                      <iframe
                        title="Company location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">
                        Map not available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}