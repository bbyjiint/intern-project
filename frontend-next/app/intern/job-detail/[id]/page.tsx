"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";
import PageBackButton from "@/components/PageBackButton";
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

/** Public job API may send a full URL, a path like `/uploads/...`, or a text fallback when no logo is set. */
function resolveCompanyLogoUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${API_BASE_URL}${t}`;
  return null;
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
  if (!lines.length) return <p className="text-sm text-gray-600 dark:text-slate-400 sm:text-[15px]">-</p>;
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li
          key={i}
          className="flex items-start text-sm leading-relaxed text-gray-600 dark:text-slate-400 sm:text-[15px]"
        >
          <span className="mr-2 shrink-0">-</span>
          <span className="min-w-0 break-words">{line.startsWith("-") ? line.slice(1).trim() : line}</span>
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
      <div className="min-h-screen bg-[#E6EBF4] dark:bg-slate-950 flex flex-col">
        <InternNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] dark:bg-slate-950 flex flex-col">
        <InternNavbar />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="rounded-xl bg-white dark:bg-slate-800 px-6 py-8 text-center shadow-sm border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400">
            {loadError || "Job not found"}
          </div>
        </div>
      </div>
    );
  }

  const workType = formatWorkType(job.workplaceType);

  const companyLogoUrl = resolveCompanyLogoUrl(job.companyLogo);
  const companyDescription = job.companyDescription?.trim();
  const showCompanyDescription = !!companyDescription && companyDescription !== "-";
  const phone = job.contactPhone?.trim();
  const dept = job.contactDepartment?.trim();
  const showPhone = !!phone && phone !== "-";
  const showDept = !!dept && dept !== "-";
  const showContactBlock = showPhone || showDept;
  const addressLine = job.address?.trim();
  const showAddressText = !!addressLine && addressLine !== "-";
  const showMap = !!job.mapEmbedUrl?.trim();
  const showAddressSection = showAddressText || showMap;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F7FA] transition-colors duration-300 dark:bg-slate-950">
      <InternNavbar />

      <div className="layout-container w-full min-w-0 max-w-full pb-6 pt-2 sm:pb-8 sm:pt-3 lg:pb-10 lg:pt-4">
        <PageBackButton />

        <div className="flex flex-col items-start gap-5 lg:flex-row lg:gap-6">
          {/* LEFT COLUMN */}
          <div className="w-full min-w-0 flex-[2] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 md:p-8 lg:p-10">
            {/* Date */}
            <div className="mb-4 flex flex-wrap items-center gap-x-2 text-gray-500 dark:text-slate-400">
              <svg
                className="h-4 w-4 shrink-0"
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
              <span className="min-w-0 text-sm font-medium">
                {formatPostedDate(job.createdAt || job.postedDate)}
              </span>
            </div>

            {/* Title & Company */}
            <h1 className="mb-1 break-words text-xl font-extrabold leading-tight text-black dark:text-white sm:text-2xl md:text-[28px]">
              {job.jobTitle || "Untitled Job Post"}
            </h1>
            <p className="mb-5 break-words text-sm text-gray-500 dark:text-slate-400 sm:mb-6 sm:text-base">
              {job.companyName || "-"}
            </p>

            {/* Tags */}
            <div className="mb-6 flex flex-wrap gap-1.5 sm:mb-8 sm:gap-2">
              <span
                className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-white sm:rounded-[5px] sm:px-[14px] sm:py-[5px] sm:text-[12px]"
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
                      className="max-w-full break-words rounded-md bg-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563] dark:bg-slate-700 dark:text-slate-300 sm:rounded-[5px] sm:px-[14px] sm:py-[5px] sm:text-[12px]"
                    >
                      {pos}
                    </span>
                  ))
                : null}
            </div>

            {/* Positions Available */}
            <h3 className="mb-6 break-words text-base font-bold text-black dark:text-white sm:mb-8 sm:text-lg">
              Number of positions available: {job.positionsAvailable ?? "-"}
            </h3>

            {/* Job Description */}
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-2 text-base font-bold text-black dark:text-white sm:mb-3 sm:text-[17px]">
                Job description
              </h3>
              {renderLines(job.jobDescription)}
            </div>

            {/* Applicant Qualifications */}
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-2 text-base font-bold text-black dark:text-white sm:mb-3 sm:text-[17px]">
                Applicant qualifications
              </h3>
              {renderLines(job.qualifications)}
            </div>

            {/* Other Details */}
            <div className="mb-8 space-y-5 sm:mb-12 sm:space-y-6">
              <div>
                <h3 className="mb-1 text-base font-bold text-black dark:text-white sm:text-[17px]">GPA</h3>
                <p className="break-words text-sm text-gray-600 dark:text-slate-400 sm:text-[15px]">
                  {job.gpa || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-black dark:text-white sm:text-[17px]">
                  Allowance
                </h3>
                <p className="break-words text-sm text-gray-600 dark:text-slate-400 sm:text-[15px]">
                  {formatAllowance(job)}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-black dark:text-white sm:text-[17px]">
                  Preferred Location
                </h3>
                <p className="break-words text-sm text-gray-600 dark:text-slate-400 sm:text-[15px]">
                  {job.location || "Location not specified"}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-black dark:text-white sm:text-[17px]">
                  Working Days &amp; Hours
                </h3>
                <p className="break-words text-sm text-gray-600 dark:text-slate-400 sm:text-[15px]">
                  {job.workingDaysHours || "Not specified"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end sm:gap-4 sm:pt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-11 w-full items-center justify-center rounded-lg border-2 border-[#2563EB] font-bold text-[#2563EB] transition-colors hover:bg-blue-50 dark:hover:bg-blue-950 sm:h-auto sm:w-auto sm:px-6 sm:py-2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleApply()}
                disabled={isApplying || hasApplied || job.state === "CLOSED"}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#2563EB] px-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none dark:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-500 sm:h-auto sm:w-auto sm:px-6 sm:py-2 sm:text-base"
              >
                {job.state === "CLOSED"
                  ? "Position closed"
                  : hasApplied
                    ? "Applied"
                    : isApplying
                      ? "Applying..."
                      : "Apply for this position"}
              </button>
            </div>

            {applyMessage && (
              <div
                className={`mt-4 rounded-lg px-3 py-3 text-sm sm:px-4 ${
                  hasApplied
                    ? "bg-[#EFF6FF] dark:bg-blue-950 text-[#1D4ED8] dark:text-blue-300"
                    : "bg-[#FEF2F2] dark:bg-red-950 text-[#B91C1C] dark:text-red-400"
                }`}
              >
                {applyMessage}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — company details / contact */}
          <div className="w-full min-w-0 flex-[1] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 md:p-8 lg:sticky lg:top-8">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-extrabold text-black dark:border-slate-700 dark:text-white sm:mb-5 sm:text-lg">
              Company details
            </h2>

            {companyLogoUrl && (
              <div className="mb-4 flex justify-center sm:mb-5">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-100 bg-[#F8F9FA] shadow-sm dark:border-slate-600 dark:bg-slate-700 sm:h-20 sm:w-20">
                  <img
                    src={companyLogoUrl}
                    alt={job.companyName || "Company"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="mb-5 space-y-1.5 sm:mb-6">
              <p className="break-words text-lg font-bold leading-snug text-black dark:text-white">
                {job.companyName || "—"}
              </p>
              {job.companyEmail && job.companyEmail.trim() !== "-" ? (
                <a
                  href={`mailto:${job.companyEmail}`}
                  className="block break-all text-sm font-medium text-[#2563EB] underline-offset-2 hover:underline dark:text-blue-400"
                >
                  {job.companyEmail}
                </a>
              ) : null}
            </div>

            {showCompanyDescription && (
              <p className="mb-5 break-words text-sm leading-relaxed text-gray-600 dark:text-slate-400 sm:mb-6">
                {companyDescription}
              </p>
            )}

            {showContactBlock && (
              <div className="mb-5 sm:mb-6">
                <h3 className="mb-2.5 text-sm font-bold text-black dark:text-white">Contact</h3>
                <div className="space-y-2.5">
                  {showPhone && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]"
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
                      <span className="min-w-0 break-words">{phone}</span>
                    </div>
                  )}
                  {showDept && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]"
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
                      <span className="min-w-0 break-words">{dept}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showAddressSection && (
              <div>
                <h3 className="mb-2 text-sm font-bold text-black dark:text-white">Address</h3>
                {showAddressText && (
                  <p className="mb-3 break-words text-sm leading-relaxed text-gray-600 dark:text-slate-400 sm:mb-4">
                    {addressLine}
                  </p>
                )}
                {showMap && (
                  <div className="h-44 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-slate-600 dark:bg-slate-700 sm:h-48">
                    <iframe
                      src={job.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Company location map"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}