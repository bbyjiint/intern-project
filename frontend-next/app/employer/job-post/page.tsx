"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerNavbar from "@/components/EmployerNavbar";
import EmployerSidebarShell from "@/components/EmployerSidebarShell";
import EmployerJobPostCard, {
  type EmployerJobPostCardData,
} from "@/components/job-post/EmployerJobPostCard";
import CreateJobPostModal, {
  type CreateJobPostModalValues,
} from "@/components/job-post/CreateJobPostModal";
import { apiFetch } from "@/lib/api";

interface JobPost extends EmployerJobPostCardData {
  createdAt: string;
  secondaryTag?: string;
}

interface EditJobPostDetails {
  id: string;
  jobTitle?: string | null;
  workplaceType?: string | null;
  positionsAvailable?: number | null;
  gpa?: string | null;
  allowance?: number | null;
  allowancePeriod?: string | null;
  jobDescription?: string | null;
  jobSpecification?: string | null;
  positions?: string[];
  preferredLocation?: string | null;
  locationProvinceId?: string | null;
  workingDaysHours?: string | null;
}

const mockJobPosts: JobPost[] = [];

function JobPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobPosts, setJobPosts] = useState<JobPost[]>(mockJobPosts);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "latest" | "open" | "closed"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingJobPost, setIsCreatingJobPost] = useState(false);
  const [createJobPostError, setCreateJobPostError] = useState<string | null>(
    null,
  );
  const [jobPostActionError, setJobPostActionError] = useState<string | null>(
    null,
  );
  const [togglingPostId, setTogglingPostId] = useState<string | null>(null);
  const [editingJobPostId, setEditingJobPostId] = useState<string | null>(null);
  const [editingInitialValues, setEditingInitialValues] =
    useState<CreateJobPostModalValues | null>(null);

  const getRelativeTimeLabel = (value: string) => {
    const createdAt = new Date(value);
    const now = new Date();
    const diffMs = Math.max(now.getTime() - createdAt.getTime(), 0);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "just now";
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const toTitleCase = (value: string) =>
    value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const formatWorkTypeLabel = (value: string | null | undefined) =>
    value === "ON_SITE"
      ? "On-Site"
      : value === "HYBRID"
        ? "Hybrid"
        : value === "REMOTE"
          ? "Remote"
          : value === "on-site"
            ? "On-Site"
            : value === "hybrid"
              ? "Hybrid"
              : value === "remote"
                ? "Remote"
                : "On-Site";

  const loadJobPosts = useCallback(async () => {
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
      const companyEmail =
        companyResp?.profile?.email || "info@trinitythai.com";
      const companyLogoImage =
        companyResp?.profile?.companyLogo ||
        companyResp?.profile?.logoURL ||
        companyResp?.profile?.profileImage ||
        "";

      const formatted = await Promise.all(
        (postsResp.jobPosts || []).map(async (post: any) => {
          const workplaceType =
            post.workplaceType === "ON_SITE"
              ? "On-Site"
              : post.workplaceType === "HYBRID"
                ? "Hybrid"
                : post.workplaceType === "REMOTE"
                  ? "Remote"
                  : "On-Site";

          const createdAt =
            post.createdAt || post.updatedAt || new Date().toISOString();
          const allowance = post.noAllowance
            ? "No allowance"
            : post.allowance
              ? `${Number(post.allowance).toLocaleString()} THB`
              : "-";

          let applicantsCount = 0;
          try {
            const applicantsResp = await apiFetch<{ applicants: any[] }>(
              `/api/job-posts/${post.id}/applicants`,
            );
            applicantsCount = applicantsResp.applicants?.length || 0;
          } catch {
            applicantsCount = 0;
          }

          return {
            id: post.id,
            title: post.jobTitle || "Untitled Job Post",
            companyName,
            companyLogo: companyName.substring(0, 2).toUpperCase(),
            companyLogoImage,
            companyEmail,
            location:
              (post as any).LocationProvince?.name ||
              post.locationProvince ||
              "Not specified",
            workType: workplaceType,
            positions: Array.isArray(post.positions) ? post.positions : [],
            applicantsCount: post.positionsAvailable ?? applicantsCount,
            allowance,
            postedDate: getRelativeTimeLabel(createdAt),
            isOpen: post.state !== "CLOSED",
            createdAt,
          } as JobPost;
        }),
      );

      setJobPosts(formatted.length > 0 ? formatted : []);
    } catch (e) {
      console.error(
        "Failed to load job posts from API, falling back to mock/local:",
        e,
      );

      const savedJobPosts = localStorage.getItem("jobPosts");
      if (savedJobPosts) {
        try {
          const posts = JSON.parse(savedJobPosts);
          const formattedPosts = posts.map((post: any) => {
            const createdAt = post.createdAt || new Date().toISOString();
            return {
              id: post.id || Date.now().toString(),
              title: post.jobTitle || post.title || "Untitled Job Post",
              companyName: post.companyName || "Company Name",
              companyLogo: (post.companyName || "Company")
                .substring(0, 2)
                .toUpperCase(),
              companyLogoImage: post.companyLogoImage || post.companyLogo || "",
              companyEmail: post.companyEmail || "info@trinitythai.com",
              location:
                (post as any).LocationProvince?.name ||
                post.locationProvince ||
                "Not specified",
              workType:
                post.workplaceType === "on-site"
                  ? "On-Site"
                  : post.workplaceType === "hybrid"
                    ? "Hybrid"
                    : post.workplaceType === "remote"
                      ? "Remote"
                      : "On-Site",
              positions: Array.isArray(post.positions) ? post.positions : [],
              applicantsCount: post.applicantsCount || 0,
              allowance: post.allowance
                ? `${post.allowance} THB`
                : "No allowance",
              postedDate: getRelativeTimeLabel(createdAt),
              isOpen: post.state !== "CLOSED",
              createdAt,
            } as JobPost;
          });
          setJobPosts(
            formattedPosts.length > 0 ? formattedPosts : mockJobPosts,
          );
          return;
        } catch (err) {
          console.error(
            "Failed to parse job posts localStorage fallback:",
            err,
          );
        }
      }

      setJobPosts(mockJobPosts);
    }
  }, []);

  useEffect(() => {
    loadJobPosts();
  }, [loadJobPosts]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleOpenModal = () => {
      setCreateJobPostError(null);
      setShowCreateModal(true);
    };

    window.addEventListener("openCreateJobPostModal", handleOpenModal);
    return () => {
      window.removeEventListener("openCreateJobPostModal", handleOpenModal);
    };
  }, []);

  const filteredJobPosts = jobPosts
    .filter((post) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        post.title.toLowerCase().includes(query) ||
        post.companyName.toLowerCase().includes(query);

      if (activeFilter === "open") return matchesSearch && post.isOpen;
      if (activeFilter === "closed") return matchesSearch && !post.isOpen;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (activeFilter === "latest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

  const handleDeleteClick = (post: JobPost) => {
    setJobToDelete(post);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (post: JobPost) => {
    if (togglingPostId === post.id) return;

    const nextIsOpen = !post.isOpen;
    const nextState = nextIsOpen ? "PUBLISHED" : "CLOSED";

    setJobPostActionError(null);
    setTogglingPostId(post.id);
    setJobPosts((prev) =>
      prev.map((item) =>
        item.id === post.id ? { ...item, isOpen: nextIsOpen } : item,
      ),
    );

    try {
      const response = await apiFetch<{
        success: boolean;
        jobPost?: {
          state?: string | null;
        } | null;
      }>(`/api/job-posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({ state: nextState }),
      });

      const resolvedIsOpen = response.jobPost?.state
        ? response.jobPost.state !== "CLOSED"
        : nextIsOpen;
      setJobPosts((prev) =>
        prev.map((item) =>
          item.id === post.id ? { ...item, isOpen: resolvedIsOpen } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle job post status:", error);
      setJobPosts((prev) =>
        prev.map((item) =>
          item.id === post.id ? { ...item, isOpen: post.isOpen } : item,
        ),
      );
      setJobPostActionError(
        error instanceof Error
          ? error.message
          : "Failed to update job post status",
      );
    } finally {
      setTogglingPostId((current) => (current === post.id ? null : current));
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await apiFetch(`/api/job-posts/${jobToDelete.id}`, { method: "DELETE" });
      setJobPosts((prev) => prev.filter((p) => p.id !== jobToDelete.id));
    } catch (e) {
      console.error("Failed to delete job post:", e);
    } finally {
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleOpenCreateModal = () => {
    setCreateJobPostError(null);
    setEditingJobPostId(null);
    setEditingInitialValues(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingJobPostId(null);
    setEditingInitialValues(null);
    if (searchParams.get("create") === "1") {
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/employer/job-post");
      }
    }
  };

  const toWorkplaceValue = (
    value: string | null | undefined,
  ): CreateJobPostModalValues["workplaceType"] =>
    value === "HYBRID"
      ? "hybrid"
      : value === "REMOTE"
        ? "remote"
        : value === "ON_SITE"
          ? "on-site"
          : value === "hybrid"
            ? "hybrid"
            : value === "remote"
              ? "remote"
              : "on-site";

  const toAllowancePeriodValue = (
    value: string | null | undefined,
  ): CreateJobPostModalValues["allowancePeriod"] =>
    value === "WEEK" ? "Week" : value === "DAY" ? "Day" : "Month";

  const handleEditJobPost = async (postId: string) => {
    setCreateJobPostError(null);
    setJobPostActionError(null);
    setEditingJobPostId(postId);
    setShowCreateModal(true);

    try {
      const response = await apiFetch<{ jobPost: EditJobPostDetails }>(
        `/api/job-posts/${postId}`,
      );
      const jobPost = response.jobPost;

      setEditingInitialValues({
        jobTitle: jobPost.jobTitle || "",
        workplaceType: toWorkplaceValue(jobPost.workplaceType),
        positionsAvailable:
          jobPost.positionsAvailable != null
            ? String(jobPost.positionsAvailable)
            : "",
        allowance: jobPost.allowance ? String(jobPost.allowance) : "",
        allowancePeriod: toAllowancePeriodValue(jobPost.allowancePeriod),
        gpa: jobPost.gpa || "",
        jobDescription: jobPost.jobDescription || "",
        jobSpecification: jobPost.jobSpecification || "",
        positions: jobPost.positions ?? [],
        preferredLocation: jobPost.locationProvinceId || "",
        workingDaysHours: jobPost.workingDaysHours || "",
      });
    } catch (error) {
      console.error("Failed to load job post for editing:", error);
      setCreateJobPostError(
        error instanceof Error ? error.message : "Failed to load job post",
      );
      setShowCreateModal(false);
      setEditingJobPostId(null);
      setEditingInitialValues(null);
    }
  };

  const handleCreateJobPost = async (values: CreateJobPostModalValues) => {
    if (isCreatingJobPost) return;
    setIsCreatingJobPost(true);
    setCreateJobPostError(null);

    try {
      const payload = {
        jobTitle: values.jobTitle,
        workplaceType: values.workplaceType,
        positionsAvailable: values.positionsAvailable.trim(),
        allowance: values.allowance.replace(/,/g, "").trim(),
        allowancePeriod: values.allowancePeriod,
        gpa: values.gpa.trim(),
        noAllowance: !values.allowance.trim(),
        jobDescription: values.jobDescription,
        jobSpecification: values.jobSpecification,
        positions: values.positions ?? [],
        workingDaysHours: values.workingDaysHours || null,
        preferredLocation: values.preferredLocation || "",
        ...(editingJobPostId ? {} : { state: "PUBLISHED" }),
      };

      const response = await apiFetch<{
        success: boolean;
        jobPost: {
          id: string;
          jobTitle?: string | null;
          workplaceType?: string | null;
          jobType?: string | null;
          allowance?: number | null;
          noAllowance?: boolean | null;
          state?: string | null;
          createdAt?: string | null;
          updatedAt?: string | null;
          locationProvince?: string | null;
          locationDistrict?: string | null;
          Company?: {
            companyName?: string | null;
            logoURL?: string | null;
          } | null;
        };
      }>(
        editingJobPostId
          ? `/api/job-posts/${editingJobPostId}`
          : "/api/job-posts",
        {
          method: editingJobPostId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      const createdPost = response.jobPost;
      const companyName =
        createdPost.Company?.companyName ||
        jobPosts[0]?.companyName ||
        "Company Name";
      const companyLogoImage =
        createdPost.Company?.logoURL || jobPosts[0]?.companyLogoImage || "";
      const companyEmail = jobPosts[0]?.companyEmail || "info@trinitythai.com";
      const createdAt =
        createdPost.createdAt ||
        createdPost.updatedAt ||
        new Date().toISOString();
      const createdAllowance =
        createdPost.noAllowance || !createdPost.allowance
          ? "No allowance"
          : `${Number(createdPost.allowance).toLocaleString()} THB`;

      const optimisticPost: JobPost = {
        id: createdPost.id,
        title: createdPost.jobTitle || values.jobTitle || "Untitled Job Post",
        companyName,
        companyLogo: companyName.substring(0, 2).toUpperCase(),
        companyLogoImage,
        companyEmail,
        location:
          createdPost.locationProvince ||
          createdPost.locationDistrict ||
          "Bangkok",
        workType: formatWorkTypeLabel(createdPost.workplaceType),
        positions: values.positions ?? [], 
        secondaryTag: createdPost.jobType
          ? toTitleCase(createdPost.jobType)
          : "Internship",
        applicantsCount: 0,
        allowance: createdAllowance,
        postedDate: "just now",
        isOpen: createdPost.state !== "CLOSED",
        createdAt,
      };

      setJobPosts((prev) => {
        const next = editingJobPostId
          ? prev.map((post) =>
              post.id === optimisticPost.id ? optimisticPost : post,
            )
          : [
              optimisticPost,
              ...prev.filter((post) => post.id !== optimisticPost.id),
            ];
        return next;
      });

      void loadJobPosts();
      handleCloseCreateModal();
    } catch (error) {
      console.error("Failed to create job post:", error);
      setCreateJobPostError(
        error instanceof Error
          ? error.message
          : editingJobPostId
            ? "Failed to update job post"
            : "Failed to create job post",
      );
    } finally {
      setIsCreatingJobPost(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#E6EBF4] transition-colors duration-300 dark:bg-gray-950">
      <EmployerNavbar />
      <EmployerSidebarShell activeItem="job-post">
        <div className="layout-container layout-page min-w-0 flex-1 overflow-y-auto px-3 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 md:pt-8">
          <div>
            {jobPostActionError && (
              <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B91C1C] dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                {jobPostActionError}
              </div>
            )}

            {createJobPostError && (
              <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B91C1C] dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                {createJobPostError}
              </div>
            )}

            <div className="mb-[18px] flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-[#05060A] dark:text-white md:text-[32px] md:leading-none">
                  Your Job Posts
                </h1>
                <p className="mt-3 text-[13px] text-[#6B7280] dark:text-gray-400 md:mt-4 md:text-[14px]">
                  Create, manage, and update the status of your job posts.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end lg:w-auto lg:pt-[4px]">
                <div className="relative min-w-0 flex-1 sm:max-w-md lg:max-w-none">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 md:left-5">
                    <svg
                      className="h-5 w-5 text-[#6B7280] dark:text-[#686868]"
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
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="h-[42px] w-full rounded-full border border-[#C9CED8] bg-white pl-11 pr-4 text-[14px] text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 md:pl-[50px] lg:w-[356px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex h-[42px] shrink-0 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-4 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EEF4FF] dark:border-gray-600 dark:bg-gray-900/50 dark:text-blue-400 dark:hover:bg-gray-700 sm:px-6 sm:text-[14px]"
                >
                  + Create Job Post
                </button>
              </div>
            </div>

            <div className="mb-[16px] flex flex-wrap gap-2 sm:gap-[6px]">
              {(
                [
                  ["all", "All"],
                  ["latest", "Lastest"],
                  ["open", "Open"],
                  ["closed", "Closed"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`h-[36px] rounded-[7px] border px-6 text-[14px] font-semibold transition-colors ${
                    activeFilter === value
                      ? 'border-[#2563EB] bg-white text-[#2563EB] dark:bg-white dark:text-[#2563EB]'
                      : 'border-[#D1D5DB] bg-[#F3F4F6] text-[#111827] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mb-[16px] text-[16px] font-semibold text-[#111827] dark:text-white">
              {filteredJobPosts.length} Total Job Post
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredJobPosts.map((post) => (
                <EmployerJobPostCard
                  key={post.id}
                  post={post}
                  isTogglePending={togglingPostId === post.id}
                  onToggleStatus={() => void handleToggleStatus(post)}
                  onEdit={() => void handleEditJobPost(post.id)}
                  onDelete={() => handleDeleteClick(post)}
                />
              ))}
            </div>

            {filteredJobPosts.length === 0 && (
              <div className="rounded-[12px] border border-gray-100 bg-white px-6 py-12 text-center text-[#6B7280] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                No job posts found matching your search.
              </div>
            )}
          </div>
        </div>
      </EmployerSidebarShell>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[18px] border border-gray-100 bg-white p-8 shadow-xl transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex justify-center">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 22h20L12 2z"
                    fill="#EF4444"
                    stroke="#DC2626"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">!</span>
                </div>
              </div>
            </div>

            <h2 className="mb-3 text-center text-xl font-bold text-gray-900 dark:text-white">
              Delete this job post?
            </h2>
            <p className="mb-6 text-center text-gray-600 dark:text-[#e5e7eb]">
              This action will permanently delete this job post and remove all
              associated applicants.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateJobPostModal
        isOpen={showCreateModal}
        isSubmitting={isCreatingJobPost}
        title={editingJobPostId ? "Edit Job Post" : "Create Job Post"}
        submitLabel={editingJobPostId ? "Save Changes" : "Create Job Post"}
        initialValues={editingInitialValues ?? undefined}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateJobPost}
      />
    </div>
  );
}

export default function JobPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center min-h-[80vh] w-full">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500"></div>
        </div>
      }
    >
      <JobPostContent />
    </Suspense>
  );
}