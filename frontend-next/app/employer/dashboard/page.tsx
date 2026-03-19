"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmployerNavbar from "@/components/EmployerNavbar";
import EmployerSidebar from "@/components/EmployerSidebar";
import EmployerApplicantsOverviewCard, {
  type EmployerApplicantsOverviewCardData,
} from "@/components/job-post/EmployerApplicantsOverviewCard";
import { apiFetch } from "@/lib/api";

interface JobPost extends EmployerApplicantsOverviewCardData {
  createdAt: string;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
// เก็บ { [jobPostId]: timestamp } ของเวลาที่ employer กด View Candidates ล่าสุด
const STORAGE_KEY = "viewedJobPostsAt";

function getViewedAt(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setViewedAt(id: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getViewedAt();
    current[id] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | "latest">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // เก็บ viewedAt ใน state เพื่อให้ useMemo re-run เมื่อกด View Candidates
  const [viewedAt, setViewedAtState] = useState<Record<string, number>>(getViewedAt);

  const markAsViewed = (id: string) => {
    setViewedAt(id);
    setViewedAtState(getViewedAt()); // sync state → trigger re-render
  };

  // Check user role
  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>("/api/auth/me");
        if (userData.user.role === "CANDIDATE") { router.push("/intern/dashboard"); return; }
        if (!userData.user.role) { router.push("/role-selection"); return; }
      } catch {
        router.push("/login");
      }
    };
    checkRole();
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const [postsResp, companyResp] = await Promise.all([
          apiFetch<{ jobPosts: any[] }>("/api/job-posts"),
          apiFetch<{
            profile: {
              companyName?: string;
              email?: string;
              companyLogo?: string;
              logoURL?: string;
              profileImage?: string;
            };
          }>("/api/companies/profile"),
        ]);

        const companyName = companyResp?.profile?.companyName || "Company Name";
        const companyEmail = companyResp?.profile?.email || "info@companyhub.com";
        const companyLogoImage =
          companyResp?.profile?.companyLogo ||
          companyResp?.profile?.logoURL ||
          companyResp?.profile?.profileImage ||
          "";

        const normalized: JobPost[] = await Promise.all(
          (postsResp.jobPosts || []).map(async (post: any) => {
            const createdAt = post.createdAt || post.updatedAt || new Date().toISOString();
            const diffMs = Math.max(Date.now() - new Date(createdAt).getTime(), 0);
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            const postedDate =
              diffHours < 1 ? "just now"
              : diffHours < 24 ? `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
              : diffDays === 1 ? "1 day ago"
              : `${diffDays} days ago`;

            const workType =
              post.workplaceType === "ON_SITE" ? "On-Site"
              : post.workplaceType === "HYBRID" ? "Hybrid"
              : post.workplaceType === "REMOTE" ? "Remote"
              : "On-Site";

            const allowance = post.noAllowance
              ? "No allowance"
              : post.allowance
                ? `${Number(post.allowance).toLocaleString()} THB`
                : "-";

            // ✅ ดึง applicants และหา latestAppliedAt ของคนที่ status === "new"
            let applicantsCount = 0;
            let hasNewApplicant = false;
            let latestNewAppliedAt = 0;

            try {
              const applicantsResp = await apiFetch<{ applicants: any[] }>(
                `/api/job-posts/${post.id}/applicants`,
              );
              const applicants = applicantsResp.applicants || [];
              applicantsCount = applicants.length;

              const newApplicants = applicants.filter((a) => a.status === "new");
              if (newApplicants.length > 0) {
                hasNewApplicant = true;
                // หาเวลา apply ล่าสุดในกลุ่ม new
                latestNewAppliedAt = Math.max(
                  ...newApplicants.map((a) =>
                    a.appliedAt ? new Date(a.appliedAt).getTime() : 0,
                  ),
                );
              }
            } catch {
              applicantsCount = 0;
            }

            return {
              id: post.id,
              title: post.jobTitle || "Untitled Job Post",
              companyName,
              companyEmail,
              companyLogo: companyName.substring(0, 2).toUpperCase(),
              companyLogoImage,
              workType,
              positions: Array.isArray(post.positions) ? post.positions : [],
              preferred:
                (post as any).LocationProvince?.name ||
                post.locationProvince ||
                "Not specified",
              applicantsCount: post.positionsAvailable ?? applicantsCount,
              allowance,
              postedDate,
              // ✅ isNew = มี new applicant AND (belum pernah dilihat ATAU ada yang apply setelah terakhir dilihat)
              isNew: hasNewApplicant,
              _latestNewAppliedAt: latestNewAppliedAt, // ใช้ใน useMemo
              createdAt,
            } as JobPost & { _latestNewAppliedAt: number };
          }),
        );

        setJobPosts(normalized);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Failed to load candidates");
        setJobPosts([]);
      }
    })();
  }, []);

  const filteredJobPosts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return [...jobPosts]
      .map((post: any) => {
        const lastViewedAt = viewedAt[post.id] || 0;
        // ✅ New หายถ้า employer เคยดูแล้ว และไม่มี applicant ใหม่หลังจากนั้น
        const isNew = post.isNew && post._latestNewAppliedAt > lastViewedAt;
        return { ...post, isNew };
      })
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(query) ||
          post.companyName.toLowerCase().includes(query) ||
          post.positions.some((p: string) => p.toLowerCase().includes(query));

        if (activeFilter === "new") return matchesSearch && !!post.isNew;
        return matchesSearch;
      })
      .sort((a, b) => {
        if (activeFilter === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // New ขึ้นก่อนเสมอ
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });
  }, [jobPosts, searchQuery, activeFilter, viewedAt]);

  return (
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <EmployerNavbar />
      <div className="flex flex-1">
        <EmployerSidebar activeItem="applicants" />

        <div className="layout-container layout-page flex-1 overflow-y-auto">
          <div className="py-8">
            {apiError && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-500/10 dark:text-yellow-300">
                {apiError}
              </div>
            )}

            <div className="mb-[18px] flex items-start justify-between gap-6">
              <div>
                <h1 className="text-[32px] font-bold leading-none tracking-[-0.02em] text-[#05060A] dark:text-white">
                  Applicants
                </h1>
                <p className="mt-4 text-[14px] text-[#6B7280] dark:text-gray-400">
                  View and manage your job posts and track applicants for each position.
                </p>
              </div>

              <div className="relative pt-[2px]">
                <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                    <svg className="h-5 w-5 text-[#6B7280] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                    className="h-[38px] w-[356px] rounded-full border border-[#C9CED8] bg-white pl-[50px] pr-5 text-[14px] text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="mb-[12px] flex gap-[6px]">
              {(
                [
                  ["all", "All"],
                  ["new", "New"],
                  ["latest", "Lastest"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`h-[36px] rounded-[7px] border px-6 text-[14px] font-semibold transition-colors ${
                    activeFilter === value
                      ? 'border-[#2563EB] bg-white text-[#2563EB] dark:bg-white dark:text-[#2563EB]'
                      : 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mb-[16px] text-[16px] font-semibold text-[#111827] dark:text-white">
              {filteredJobPosts.length} Total Job Post
            </p>

            {filteredJobPosts.length === 0 && (
              <div className="rounded-[12px] border border-gray-100 bg-white px-6 py-12 text-center text-[#6B7280] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                No job posts found matching your search.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredJobPosts.map((post) => (
                <EmployerApplicantsOverviewCard
                  key={post.id}
                  post={post}
                  onView={() => markAsViewed(post.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}