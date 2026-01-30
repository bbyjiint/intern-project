import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const bookmarksRouter = Router();

// Get all bookmarked candidates for the company
bookmarksRouter.get("/", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { companyId: companyProfile.id },
      include: {
        Candidate: {
          include: {
            User: { select: { email: true } },
            University: { select: { name: true } },
            CandidateUniversity: {
              orderBy: [{ isCurrent: "desc" }, { endDate: "desc" }],
              take: 1,
              include: { University: { select: { name: true } } },
            },
            UserSkill: { include: { Skills: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format candidates similar to the candidates list endpoint
    function initialsFromName(name: string) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0] ?? "?";
      const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
      return (first + (second ?? "")).toUpperCase();
    }

    function formatGradDate(d?: Date | null) {
      if (!d) return "N/A";
      return d.toLocaleString("en-US", { month: "short", year: "numeric" });
    }

    const candidates = bookmarks.map((bookmark) => {
      const c = bookmark.Candidate;
      const name = c.fullName ?? c.User.email;
      const uni =
        c.CandidateUniversity[0]?.University?.name ??
        c.University?.name ??
        "Unknown University";
      const skills = c.UserSkill.map((us) => us.Skills.name);
      const endDate = c.CandidateUniversity[0]?.endDate ?? null;

      return {
        id: c.id,
        name,
        role: c.desiredPosition ?? "Intern",
        university: uni,
        major: c.major ?? "N/A",
        graduationDate: formatGradDate(endDate),
        skills,
        initials: initialsFromName(name),
        email: c.User.email,
        about: c.bio ?? "",
      };
    });

    return res.json({ candidates });
  } catch (error: any) {
    console.error("Error fetching bookmarks:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch bookmarks",
    });
  }
});

// Check if a candidate is bookmarked
bookmarksRouter.get("/:candidateId", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const candidateId = typeof req.params.candidateId === "string" ? req.params.candidateId : req.params.candidateId[0];

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        companyId_candidateId: {
          companyId: companyProfile.id,
          candidateId,
        },
      },
    });

    return res.json({ isBookmarked: !!bookmark });
  } catch (error: any) {
    console.error("Error checking bookmark:", error);
    return res.status(500).json({
      error: error.message || "Failed to check bookmark",
    });
  }
});

// Add bookmark
bookmarksRouter.post("/:candidateId", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const candidateId = typeof req.params.candidateId === "string" ? req.params.candidateId : req.params.candidateId[0];

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    // Check if candidate exists
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        companyId_candidateId: {
          companyId: companyProfile.id,
          candidateId,
        },
      },
    });

    if (existingBookmark) {
      return res.status(409).json({ error: "Candidate already bookmarked" });
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        id: randomUUID(),
        companyId: companyProfile.id,
        candidateId,
      },
    });

    return res.status(201).json({ message: "Candidate bookmarked successfully", bookmark });
  } catch (error: any) {
    console.error("Error creating bookmark:", error);
    return res.status(500).json({
      error: error.message || "Failed to bookmark candidate",
    });
  }
});

// Remove bookmark
bookmarksRouter.delete("/:candidateId", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const candidateId = typeof req.params.candidateId === "string" ? req.params.candidateId : req.params.candidateId[0];

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        companyId_candidateId: {
          companyId: companyProfile.id,
          candidateId,
        },
      },
    });

    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    await prisma.bookmark.delete({
      where: {
        companyId_candidateId: {
          companyId: companyProfile.id,
          candidateId,
        },
      },
    });

    return res.json({ message: "Bookmark removed successfully" });
  } catch (error: any) {
    console.error("Error removing bookmark:", error);
    return res.status(500).json({
      error: error.message || "Failed to remove bookmark",
    });
  }
});
