import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const internRouter = Router();

function asParam(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function workplaceLabel(workplaceType: any): string {
  if (workplaceType === "ON_SITE") return "On-site";
  if (workplaceType === "HYBRID") return "Hybrid";
  if (workplaceType === "REMOTE") return "Remote";
  return "Not specified";
}

function relativeDateLabel(date: Date): string {
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

async function getCandidateIdForUser(userId: string): Promise<string> {
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!candidate) throw new Error("CANDIDATE_PROFILE_NOT_FOUND");
  return candidate.id;
}

// ---- Bookmarks ----
internRouter.get("/job-bookmarks", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    const rows = await prisma.jobBookmark.findMany({
      where: { candidateId },
      select: { jobPostId: true },
    });
    return res.json({ jobIds: rows.map((r) => r.jobPostId) });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to load bookmarks" });
  }
});

internRouter.post("/job-bookmarks/:jobPostId", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const jobPostId = asParam((req.params as any).jobPostId);
  if (!jobPostId) return res.status(400).json({ error: "jobPostId is required" });
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    await prisma.jobBookmark.upsert({
      where: { jobPostId_candidateId: { jobPostId, candidateId } },
      update: { updatedAt: new Date() },
      create: { id: randomUUID(), jobPostId, candidateId, updatedAt: new Date() },
    });
    return res.status(201).json({ ok: true });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to bookmark job" });
  }
});

internRouter.delete("/job-bookmarks/:jobPostId", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const jobPostId = asParam((req.params as any).jobPostId);
  if (!jobPostId) return res.status(400).json({ error: "jobPostId is required" });
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    await prisma.jobBookmark.deleteMany({ where: { jobPostId, candidateId } });
    return res.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to remove bookmark" });
  }
});

internRouter.get("/job-bookmarks/jobs", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    const bookmarks = await prisma.jobBookmark.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      include: {
        JobPost: {
          include: {
            Company: { select: { companyName: true, logoURL: true } },
          },
        },
      },
    });

    const jobs = bookmarks.map((b) => {
      const post = b.JobPost;
      const location = [post.locationDistrict, post.locationProvince].filter(Boolean).join(", ") || "Location not specified";
      return {
        id: post.id,
        jobTitle: post.jobTitle,
        companyName: post.Company?.companyName || "Company Name",
        companyLogo: post.Company?.logoURL || "TRINITY",
        location,
        workType: workplaceLabel(post.workplaceType),
        skills: [],
        description: post.jobDescription || "",
        postedDate: post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : "",
        status: undefined,
        isApplied: undefined,
      };
    });

    return res.json({ jobs });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to load bookmarked jobs" });
  }
});

// ---- Ignored jobs ----
internRouter.get("/job-ignored", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    const rows = await prisma.jobIgnore.findMany({
      where: { candidateId },
      select: { jobPostId: true },
    });
    return res.json({ jobIds: rows.map((r) => r.jobPostId) });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to load ignored jobs" });
  }
});

internRouter.post("/job-ignored/:jobPostId", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const jobPostId = asParam((req.params as any).jobPostId);
  if (!jobPostId) return res.status(400).json({ error: "jobPostId is required" });
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    await prisma.jobIgnore.upsert({
      where: { jobPostId_candidateId: { jobPostId, candidateId } },
      update: { updatedAt: new Date() },
      create: { id: randomUUID(), jobPostId, candidateId, updatedAt: new Date() },
    });
    return res.status(201).json({ ok: true });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to ignore job" });
  }
});

internRouter.delete("/job-ignored/:jobPostId", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const jobPostId = asParam((req.params as any).jobPostId);
  if (!jobPostId) return res.status(400).json({ error: "jobPostId is required" });
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);
    await prisma.jobIgnore.deleteMany({ where: { jobPostId, candidateId } });
    return res.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to un-ignore job" });
  }
});

// ---- Applications (Applied page) ----
internRouter.get("/applications", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  try {
    const candidateId = await getCandidateIdForUser(req.user!.id);

    const apps = await prisma.jobApplication.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      include: {
        JobPost: {
          include: { Company: { select: { companyName: true, logoURL: true } } },
        },
      },
    });

    // Map backend application status to the UI's applied page statuses.
    const statusMap: Record<string, "viewed" | "interviewed" | "accepted" | "rejected"> = {
      NEW: "viewed",
      SHORTLISTED: "interviewed",
      REVIEWED: "interviewed",
      REJECTED: "rejected",
    };

    const bookmarked = await prisma.jobBookmark.findMany({
      where: { candidateId },
      select: { jobPostId: true },
    });
    const bookmarkedSet = new Set(bookmarked.map((b) => b.jobPostId));

    const applications = apps.map((a) => {
      const post = a.JobPost;
      const location = [post.locationDistrict, post.locationProvince].filter(Boolean).join(", ") || "Location not specified";
      return {
        id: post.id,
        jobTitle: post.jobTitle,
        companyName: post.Company?.companyName || "Company Name",
        companyLogo: post.Company?.logoURL || "TRINITY",
        location,
        workType: workplaceLabel(post.workplaceType),
        skills: [],
        description: post.jobDescription || "",
        appliedDate: relativeDateLabel(a.createdAt),
        status: statusMap[a.status] ?? "viewed",
        isBookmarked: bookmarkedSet.has(post.id),
      };
    });

    return res.json({ applications });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to load applications" });
  }
});

