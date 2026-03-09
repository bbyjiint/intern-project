import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileStorage } from "../utils/fileStorage";

export const candidatesRouter = Router();

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

function normalizeEducationLevel(value: unknown): "BACHELOR" | "MASTERS" | "PHD" {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (normalized === "BACHELOR" || normalized === "BACHELORS") return "BACHELOR";
  if (normalized === "MASTER" || normalized === "MASTERS") return "MASTERS";
  if (normalized === "PHD" || normalized === "DOCTORATE") return "PHD";
  return "BACHELOR";
}

function formatGradDate(d?: Date | null) {
  if (!d) return null;
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

// Utility to remove a locally stored file if it exists.
// multer.diskStorage adds a `path` property but memoryStorage does not,
// so we guard with optional chaining.
function cleanupLocalFile(file?: Express.Multer.File | null) {
  if (file?.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (cleanupError) {
      console.error("Error cleaning up temp file:", cleanupError);
    }
  }
}

// Helper function to get candidateId from userId
async function getCandidateIdForUser(userId: string): Promise<string> {
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!candidate) throw new Error("CANDIDATE_PROFILE_NOT_FOUND");
  return candidate.id;
}

// Get own profile (for candidates/interns)
candidatesRouter.get("/profile", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        User: {
          select: {
            email: true,
            createdAt: true,
          }
        },
        CandidatePreferredProvince: {
          include: {
            Province: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        CandidateUniversity: {
          include: {
            University: {
              select: {
                name: true,
                thname: true,
              }
            },
          },
          orderBy: { createdAt: "desc" },
        },
        WorkHistory: {
          orderBy: { startDate: "desc" },
        },
        UserSkill: {
          include: {
            Skills: {
              select: {
                name: true,
              }
            }
          },
          orderBy: { rating: "desc" },
        },
        CandidateContactFile: {
          orderBy: { createdAt: "desc" },
        },
        CertificateFile: {
          orderBy: { createdAt: "desc" },
        },
        UserProjects: {
          orderBy: { createdAt: "desc" },
        },
        CandidateResume: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!candidateProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Format the response for frontend
    const profileData = {
      id: candidateProfile.id,
      userId: candidateProfile.userId,
      fullName: candidateProfile.fullName || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      profileImage: candidateProfile.profileImage || null,
      desiredPosition: candidateProfile.desiredPosition || null,
      bio: candidateProfile.bio || null,
      resumeUrl: candidateProfile.CandidateResume[0]?.url || null,
      resumeFile: candidateProfile.CandidateResume[0]?.name || null,
      resume: candidateProfile.CandidateResume[0]
        ? {
            id: candidateProfile.CandidateResume[0].id,
            name: candidateProfile.CandidateResume[0].name,
            url: candidateProfile.CandidateResume[0].url,
            createdAt: candidateProfile.CandidateResume[0].createdAt.toISOString(),
          }
        : null,
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University.name,
        educationLevel: cu.educationLevel,
        degree: cu.degreeName,
        fieldOfStudy: cu.fieldOfStudy,
        yearOfStudy: cu.yearOfStudy,
        gpa: cu.gpa ? cu.gpa.toString() : null,
        endDate: cu.endDate ? cu.endDate.toISOString().split("T")[0] : null,
        endYear: cu.isCurrent ? null : (cu.endDate ? cu.endDate.getFullYear().toString() : null),
        isCurrent: cu.isCurrent,
      })),
      experience: candidateProfile.WorkHistory.map((wh) => ({
        id: wh.id,
        position: wh.position,
        companyName: wh.companyName,
        startDate: wh.startDate ? wh.startDate.toISOString().split("T")[0] : null,
        endDate: wh.endDate ? wh.endDate.toISOString().split("T")[0] : null,
        description: wh.description || null,
        startYear: wh.startDate ? wh.startDate.getFullYear() : null,
        endYear: wh.endDate ? wh.endDate.getFullYear() : null,
      })),
      skills: candidateProfile.UserSkill.map((us) => {
        const ratingMap: Record<number, string> = {
          1: "beginner",
          2: "intermediate",
          3: "advanced",
        };
        return {
          name: us.Skills.name,
          level: ratingMap[us.rating || 1] || "beginner",
          rating: us.rating || 1,
        };
      }),
      files: {
        contactFiles: candidateProfile.CandidateContactFile.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type,
          createdAt: file.createdAt.toISOString(),
        })),
        certificates: candidateProfile.CertificateFile.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type,
          description: file.description,
          createdAt: file.createdAt.toISOString(),
        })),
      },
      projects: candidateProfile.UserProjects.map((project) => ({
        id: project.id,
        name: project.name,
        role: project.role,
        description: project.description,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
      })),
      createdAt: candidateProfile.createdAt.toISOString(),
      updatedAt: candidateProfile.updatedAt.toISOString(),
    };

    return res.json({ profile: profileData });
  } catch (error: any) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch candidate profile"
    });
  }
});

// Employer dashboard list
candidatesRouter.get("/", requireAuth, requireRole("COMPANY"), async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const candidates = await prisma.candidateProfile.findMany({
    where: q
      ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { desiredPosition: { contains: q, mode: "insensitive" } },
          { User: { email: { contains: q, mode: "insensitive" } } },
        ],
      }
      : undefined,
    include: {
      User: { select: { email: true } },
      CandidateUniversity: {
        include: { University: { select: { name: true, province: true } } }
      },
      UserSkill: { include: { Skills: { select: { name: true } } } },
    },
    take: 50,
  });

  const items = candidates.map((c) => {
    const name = c.fullName ?? c.User.email;

    // Pick the primary education record (current one or latest by endDate)
    const primaryEdu = c.CandidateUniversity[0] ?? null;

    const uni = primaryEdu?.University?.name ?? null;

    const location = primaryEdu?.University?.province ?? null;

    const skills = c.UserSkill.map((us: typeof c.UserSkill[0]) => us.Skills.name);

    // derive graduation date from endDate or yearOfStudy/current flag
    const endDate = primaryEdu?.endDate ?? null;
    let graduationDate: string | null = null;
    if (endDate) {
      graduationDate = formatGradDate(endDate);
    } else if (primaryEdu?.isCurrent) {
      graduationDate = "Present";
    } else if (primaryEdu?.yearOfStudy) {
      graduationDate = primaryEdu.yearOfStudy;
    }

    // Major: derive ONLY from CandidateUniversity.degreeName.
    // CandidateProfile should not be used as a source of education details.
    const major = primaryEdu?.degreeName ?? null;

    return {
      id: c.id,
      name,
      role: c.desiredPosition ?? "Intern",
      university: uni ?? "Unknown University",
      major,
      location: location ?? null,
      graduationDate,
      skills,
      initials: initialsFromName(name),
      email: c.User.email,
      about: c.bio ?? "",
    };
  });

  return res.json({ candidates: items });
});

// Get full candidate profile by ID (for companies to view)
candidatesRouter.get("/:id", requireAuth, requireRole("COMPANY"), async (req, res) => {
  const candidateId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        User: {
          select: {
            email: true,
            createdAt: true,
          }
        },
        CandidateUniversity: {
          include: {
            University: {
              select: {
                name: true,
                thname: true,
              }
            },
          },
          orderBy: { createdAt: "desc" },
        },
        WorkHistory: {
          orderBy: { startDate: "desc" },
        },
        UserSkill: {
          include: {
            Skills: {
              select: {
                name: true,
              }
            }
          },
          orderBy: { rating: "desc" },
        },
        CandidateContactFile: {
          orderBy: { createdAt: "desc" },
        },
        CertificateFile: {
          orderBy: { createdAt: "desc" },
        },
        UserProjects: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!candidateProfile) {
      return res.status(404).json({ error: "Candidate profile not found" });
    }

    // Format the response for frontend
    const profileData = {
      id: candidateProfile.id,
      userId: candidateProfile.userId,
      fullName: candidateProfile.fullName || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      profileImage: candidateProfile.profileImage || null,
      desiredPosition: candidateProfile.desiredPosition || null,
      internshipPeriod: candidateProfile.internshipPeriod || null,
      bio: candidateProfile.bio || null,
      preferredPositions: candidateProfile.preferredPositions || [],
      preferredLocations: candidateProfile.CandidatePreferredProvince.map((entry) => entry.Province.name),
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University.name,
        educationLevel: cu.educationLevel,
        degree: cu.degreeName,
        fieldOfStudy: cu.fieldOfStudy,
        yearOfStudy: cu.yearOfStudy,
        gpa: cu.gpa ? cu.gpa.toString() : null
      })),
      experience: candidateProfile.WorkHistory.map((wh) => ({
        id: wh.id,
        position: wh.position,
        companyName: wh.companyName,
        startDate: wh.startDate ? wh.startDate.toISOString().split("T")[0] : null,
        endDate: wh.endDate ? wh.endDate.toISOString().split("T")[0] : null,
        description: wh.description || null,
        startYear: wh.startDate ? wh.startDate.getFullYear() : null,
        endYear: wh.endDate ? wh.endDate.getFullYear() : null,
      })),
      skills: candidateProfile.UserSkill.map((us) => {
        const ratingMap: Record<number, string> = {
          1: "beginner",
          2: "intermediate",
          3: "advanced",
        };
        return {
          name: us.Skills.name,
          level: ratingMap[us.rating || 1] || "beginner",
          rating: us.rating || 1,
        };
      }),
      files: {
        contactFiles: candidateProfile.CandidateContactFile.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type,
          createdAt: file.createdAt.toISOString(),
        })),
        certificates: candidateProfile.CertificateFile.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type,
          description: file.description,
          createdAt: file.createdAt.toISOString(),
        })),
      },
      projects: candidateProfile.UserProjects.map((project) => ({
        id: project.id,
        name: project.name,
        role: project.role,
        description: project.description,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
      })),
      createdAt: candidateProfile.createdAt.toISOString(),
      updatedAt: candidateProfile.updatedAt.toISOString(),
    };

    return res.json({ profile: profileData });
  } catch (error: any) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch candidate profile"
    });
  }
});

// Create a new project
candidatesRouter.post("/projects", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const { name, role, description, startDate, endDate, relatedSkills } = req.body ?? {};

  console.log("POST /projects body:", JSON.stringify(req.body))

  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const project = await prisma.userProjects.create({
      data: {
        id: randomUUID(),
        candidateId,
        name,
        role,
        description: description || "",
        startDate: startDate || null,
        endDate: endDate || null,
        relatedSkills: relatedSkills || [],
      },
    });

    return res.status(201).json({
      project: {
        ...project,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
      }
    });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error creating project:", e);
    return res.status(500).json({ error: e?.message || "Failed to create project" });
  }
});

// Update a project
candidatesRouter.put("/projects/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const projectId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const { name, role, description, startDate, endDate, relatedSkills } = req.body ?? {};

  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Verify that the project belongs to this candidate
    const existingProject = await prisma.userProjects.findUnique({
      where: { id: projectId },
      select: { candidateId: true },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (existingProject.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to update this project" });
    }

    const project = await prisma.userProjects.update({
      where: { id: projectId },
      data: {
        name,
        role,
        description: description || "",
        startDate: startDate || null,
        endDate: endDate || null,
        relatedSkills: relatedSkills || [],
      },
    });

    return res.json({
      project: {
        ...project,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
      }
    });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error updating project:", e);
    return res.status(500).json({ error: e?.message || "Failed to update project" });
  }
});

// Delete a project
candidatesRouter.delete("/projects/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const projectId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Verify that the project belongs to this candidate
    const existingProject = await prisma.userProjects.findUnique({
      where: { id: projectId },
      select: { candidateId: true },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (existingProject.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to delete this project" });
    }

    await prisma.userProjects.delete({
      where: { id: projectId },
    });

    return res.json({ success: true });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error deleting project:", e);
    return res.status(500).json({ error: e?.message || "Failed to delete project" });
  }
});

// Create a new education entry
candidatesRouter.post("/education", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const { universityName, degreeName, fieldOfStudy, yearOfStudy, educationLevel, gpa, endDate, isCurrent, relevantCoursework, achievements } = req.body ?? {};

  if (!universityName || !degreeName || !educationLevel) {
    return res.status(400).json({ error: "University name, degree name, and education level are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Find university by name
    const university = await prisma.university.findFirst({
      where: { name: universityName },
    });

    if (!university) {
      return res.status(400).json({ error: "University not found" });
    }

    // Store coursework and achievements as JSON in a description field
    // Note: This is a workaround since these fields aren't in the schema
    const additionalData: any = {};
    if (relevantCoursework && relevantCoursework.length > 0) {
      additionalData.relevantCoursework = relevantCoursework;
    }
    if (achievements && achievements.length > 0) {
      additionalData.achievements = achievements;
    }
    const description = Object.keys(additionalData).length > 0 ? JSON.stringify(additionalData) : null;

    const education = await prisma.candidateUniversity.create({
      data: {
        id: randomUUID(),
        candidateId,
        universityId: university.id,
        educationLevel: normalizeEducationLevel(educationLevel),
        degreeName: degreeName,
        fieldOfStudy: fieldOfStudy || degreeName,
        yearOfStudy: yearOfStudy || "",
        gpa: gpa ? parseFloat(gpa.toString()) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
      },
    });

    return res.status(201).json({ education });

  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error creating education:", e);
    return res.status(500).json({ error: e?.message || "Failed to create education" });
  }
});

// Update an education entry
candidatesRouter.put("/education/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const educationId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const { universityName, degreeName, fieldOfStudy, yearOfStudy, educationLevel, gpa, endDate, isCurrent, relevantCoursework, achievements } = req.body ?? {};

  if (!universityName || !degreeName || !educationLevel) {
    return res.status(400).json({ error: "University name, degree name, and education level are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Verify that the education entry belongs to this candidate
    const existingEducation = await prisma.candidateUniversity.findUnique({
      where: { id: educationId },
      select: { candidateId: true },
    });

    if (!existingEducation) {
      return res.status(404).json({ error: "Education entry not found" });
    }

    if (existingEducation.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to update this education entry" });
    }

    // Find university by name
    const university = await prisma.university.findFirst({
      where: { name: universityName },
    });

    if (!university) {
      return res.status(400).json({ error: "University not found" });
    }

    // Store coursework and achievements as JSON
    const additionalData: any = {};
    if (relevantCoursework && relevantCoursework.length > 0) {
      additionalData.relevantCoursework = relevantCoursework;
    }
    if (achievements && achievements.length > 0) {
      additionalData.achievements = achievements;
    }

    const education = await prisma.candidateUniversity.update({
      where: { id: educationId },
      data: {
        universityId: university.id,
        educationLevel: normalizeEducationLevel(educationLevel),
        degreeName: degreeName,
        fieldOfStudy: fieldOfStudy || degreeName,
        yearOfStudy: yearOfStudy || "",
        gpa: gpa ? parseFloat(gpa.toString()) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
      },
    });

    return res.json({ education });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error updating education:", e);
    return res.status(500).json({ error: e?.message || "Failed to update education" });
  }
});

// Create a new experience entry
candidatesRouter.post("/experience", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const { position, companyName, startDate, endDate, isCurrent, description, location, technicalSkills } = req.body ?? {};

  if (!position || !companyName) {
    return res.status(400).json({ error: "Position and company name are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const experience = await prisma.workHistory.create({
      data: {
        id: randomUUID(),
        candidateId,
        position,
        companyName,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
      },
    });

    return res.status(201).json({ experience });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error creating experience:", e);
    return res.status(500).json({ error: e?.message || "Failed to create experience" });
  }
});

// Update an experience entry
candidatesRouter.put("/experience/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const experienceId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const { position, companyName, startDate, endDate, isCurrent, description, location, technicalSkills } = req.body ?? {};

  if (!position || !companyName) {
    return res.status(400).json({ error: "Position and company name are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Verify that the experience entry belongs to this candidate
    const existingExperience = await prisma.workHistory.findUnique({
      where: { id: experienceId },
      select: { candidateId: true },
    });

    if (!existingExperience) {
      return res.status(404).json({ error: "Experience entry not found" });
    }

    if (existingExperience.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to update this experience entry" });
    }

    const experience = await prisma.workHistory.update({
      where: { id: experienceId },
      data: {
        position,
        companyName,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
      },
    });

    return res.json({ experience });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error updating experience:", e);
    return res.status(500).json({ error: e?.message || "Failed to update experience" });
  }
});

// Get all certificates for the authenticated candidate
candidatesRouter.get("/certificates", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const certificates = await prisma.certificateFile.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ certificates });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error fetching certificates:", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch certificates" });
  }
});

// Configure multer for file uploads
// Use memory storage for S3, disk storage for local
const createStorage = (folder: string) => {
  return process.env.FILE_STORAGE_PROVIDER === "s3"
    ? multer.memoryStorage()
    : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), "uploads", folder);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${folder}-${uniqueSuffix}${ext}`);
      },
    });
};

const createUploadMiddleware = (folder: string, maxSizeMB: number = 10) => {
  return multer({
    storage: createStorage(folder),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      // Allow PDFs and common image formats
      const allowedTypes = /\.(pdf|jpg|jpeg|png|webp)$/i;
      const mimetype = allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname);
      if (mimetype) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only PDF and image files are allowed.`));
      }
    },
  });
};

// Upload middleware for certificates
const uploadCertificate = createUploadMiddleware("certificates", 10);

// Upload middleware for resumes (PDF only, larger size limit)
const uploadResume = multer({
  storage: createStorage("resumes"),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit for resumes
  fileFilter: (req, file, cb) => {
    // Only allow PDFs for resumes
    const isPDF = file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname);
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF files are allowed for resumes."));
    }
  },
});

// Upload a certificate (file upload)
candidatesRouter.post("/certificates", requireAuth, requireRole("CANDIDATE"), (req: AuthedRequest, res, next) => {
  uploadCertificate.single("file")(req as any, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size exceeds 10MB limit" });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || "File upload error" });
    }
    next();
  });
}, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    const { name, issuedBy, issueDate, certificateId, certificateUrl } = (req as any).body ?? {};
    const fileName = name || file.originalname;

    // Upload file to storage (S3 or local)
    // For memory storage (S3), use buffer directly; for disk storage (local), read from path
    const fileBuffer = req.file?.buffer || (req.file?.path ? fs.readFileSync(req.file.path) : Buffer.from([]))
    const uploadResult = await fileStorage.uploadFile(
      { ...req.file, buffer: fileBuffer } as Express.Multer.File,
      "certificates",
      undefined // Let storage service generate filename
    );

    // Clean up local temp file if using disk storage
    cleanupLocalFile(req.file as Express.Multer.File);

    // Store additional fields in description as JSON string
    // In production, you might want to add these as separate columns in the schema
    const descriptionData: any = {};
    if (issuedBy) descriptionData.issuedBy = issuedBy;
    if (issueDate) descriptionData.issueDate = issueDate;
    if (certificateId) descriptionData.certificateId = certificateId;
    if (certificateUrl) descriptionData.certificateUrl = certificateUrl;
    const description = Object.keys(descriptionData).length > 0 ? JSON.stringify(descriptionData) : null;

    const certificate = await prisma.certificateFile.create({
      data: {
        id: randomUUID(),
        candidateId,
        name: fileName,
        url: uploadResult.url,
        type: req.file!.mimetype,
        description: description || null,
      },
    });

    return res.status(201).json({ certificate });
  } catch (e: any) {
    // Clean up uploaded file if database operation fails
    cleanupLocalFile(req.file as Express.Multer.File);

    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error creating certificate:", e);
    return res.status(500).json({ error: e?.message || "Failed to create certificate" });
  }
});

// Delete a certificate
candidatesRouter.delete("/certificates/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const certificateId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Get certificate with file URL
    const existingCertificate = await prisma.certificateFile.findUnique({
      where: { id: certificateId },
      select: { candidateId: true, url: true },
    });

    if (!existingCertificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (existingCertificate.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to delete this certificate" });
    }

    // Delete file from storage (S3 or local)
    try {
      const fileKey = fileStorage.extractKeyFromUrl(existingCertificate.url);
      if (fileKey) {
        await fileStorage.deleteFile(fileKey);
      }
    } catch (storageError: any) {
      console.error("Error deleting file from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
      // (file might have been manually deleted or storage might be unavailable)
    }

    // Delete database record
    await prisma.certificateFile.delete({
      where: { id: certificateId },
    });

    return res.json({ success: true });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error deleting certificate:", e);
    return res.status(500).json({ error: e?.message || "Failed to delete certificate" });
  }
});

// ========== Resume/Contact File Routes ==========

// Get all resumes/contact files for the authenticated candidate
candidatesRouter.get("/resumes", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const contactFiles = await prisma.candidateContactFile.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ resumes: contactFiles });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error fetching resumes:", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch resumes" });
  }
});

// Upload a resume (file upload)
candidatesRouter.post("/resumes", requireAuth, requireRole("CANDIDATE"), (req: AuthedRequest, res, next) => {
  uploadResume.single("file")(req as any, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size exceeds 15MB limit" });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || "File upload error" });
    }
    next();
  });
}, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    const { name, type } = (req as any).body ?? {};
    const fileName = name || file.originalname;

    // Determine file type (RESUME, PORTFOLIO, or OTHER)
    let fileType: "RESUME" | "PORTFOLIO" | "OTHER" = "RESUME";
    if (type) {
      const upperType = type.toUpperCase();
      if (upperType === "RESUME" || upperType === "PORTFOLIO" || upperType === "OTHER") {
        fileType = upperType as "RESUME" | "PORTFOLIO" | "OTHER";
      }
    }

    // Upload file to storage (S3 or local)
    const fileBuffer = req.file?.buffer || (req.file?.path ? fs.readFileSync(req.file.path) : Buffer.from([]))
    const uploadResult = await fileStorage.uploadFile(
      { ...req.file, buffer: fileBuffer } as Express.Multer.File,
      "resumes",
      undefined // Let storage service generate filename
    );

    // Clean up local temp file if using disk storage
    cleanupLocalFile(req.file as Express.Multer.File);

    // Check if this should be the primary resume (if no other resumes exist)
    const existingResumes = await prisma.candidateResume.findMany({
      where: { candidateId },
    });
    const isPrimary = existingResumes.length === 0;

    // If this is set as primary, unset other primary resumes
    if (isPrimary) {
      await prisma.candidateResume.updateMany({
        where: { candidateId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const resume = await prisma.candidateResume.create({
      data: {
        id: randomUUID(),
        candidateId,
        name: fileName,
        url: uploadResult.url,
        fileSize: file.size || null,
        fileType: file.mimetype || null,
        isPrimary,
      },
    });

    return res.status(201).json({ resume });
  } catch (e: any) {
    // Clean up uploaded file if database operation fails
    cleanupLocalFile(req.file as Express.Multer.File);

    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error creating resume:", e);
    return res.status(500).json({ error: e?.message || "Failed to create resume" });
  }
});

// Delete a resume
candidatesRouter.delete("/resumes/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const resumeId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // Get resume with file URL
    const existingResume = await prisma.candidateResume.findUnique({
      where: { id: resumeId },
    });

    if (!existingResume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Verify ownership
    if (existingResume.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to delete this resume" });
    }

    // Delete file from storage (S3 or local)
    try {
      const fileKey = fileStorage.extractKeyFromUrl(existingResume.url);
      if (fileKey) {
        await fileStorage.deleteFile(fileKey);
      }
    } catch (storageError: any) {
      console.error("Error deleting file from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await prisma.candidateResume.delete({
      where: { id: resumeId },
    });

    return res.json({ success: true, message: "Resume deleted successfully" });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error deleting resume:", e);
    return res.status(500).json({ error: e?.message || "Failed to delete resume" });
  }
});
