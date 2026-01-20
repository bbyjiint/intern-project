import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const candidatesRouter = Router();

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

// Employer dashboard list
candidatesRouter.get("/", requireAuth, requireRole("COMPANY"), async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const candidates = await prisma.candidateProfile.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { major: { contains: q, mode: "insensitive" } },
            { desiredPosition: { contains: q, mode: "insensitive" } },
            { User: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
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
    take: 50,
  });

  const items = candidates.map((c) => {
    const name = c.fullName ?? c.User.email;
    const uni =
      c.CandidateUniversity[0]?.University?.name ??
      c.University?.name ??
      "Unknown University";
    const skills = c.UserSkill.map((us) => us.Skills.name);
    const endDate = c.CandidateUniversity[0]?.endDate ?? null;

    return {
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

  return res.json({ candidates: items });
});

