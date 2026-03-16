import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const bookmarksRouter = Router();

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

function formatInternshipPeriod(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
  if (!match) return raw;
  const start = new Date(match[1]);
  const end = new Date(match[2]);
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `${fmt.format(start)} - ${fmt.format(end)} (${months} Month)`;
}

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
            CandidateUniversity: {
              orderBy: [{ isCurrent: "desc" }, { updatedAt: "desc" }],
              take: 1,
              include: { University: { select: { name: true } } },
            },
            UserSkill: { include: { Skills: { select: { name: true } } } },
            CandidatePreferredProvince: {
              take: 1,
              include: { Province: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const candidates = bookmarks.map((bookmark) => {
      const c = bookmark.Candidate;
      const name = c.fullName ?? c.User.email;

      // Get primary education record (current or latest)
      const primaryEdu = c.CandidateUniversity[0] ?? null;

      const uni = primaryEdu?.University?.name ?? "Unknown University";
      const skills = c.UserSkill.map((us: { Skills: { name: string } }) => us.Skills.name);

      // Major: derive ONLY from CandidateUniversity.degreeName.
      const major = primaryEdu?.degreeName ?? null;

      // Preferred location from first preferred province
      const location = c.CandidatePreferredProvince[0]?.Province?.name ?? null;

      return {
        id: c.id,
        name,
        role: c.desiredPosition ?? "Intern",
        university: uni,
        major: major ?? "N/A",
        graduationDate: primaryEdu?.isCurrent ? "Present" : (primaryEdu?.yearOfStudy ?? null),
        skills,
        initials: initialsFromName(name),
        email: c.User.email,
        about: c.bio ?? "",
        // Additional fields for card display
        internshipPeriod: formatInternshipPeriod(c.internshipPeriod ?? null),
        yearOfStudy: primaryEdu?.yearOfStudy ?? null,
        preferredPositions: c.preferredPositions ?? [],
        location,
        profileImage: c.profileImage ?? null,
        createdAt: c.createdAt.toISOString(),
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