import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

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
        University: { 
          select: { 
            name: true,
            thname: true,
            province: true,
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
            UniversityFaculty: {
              include: {
                Faculty: {
                  select: {
                    name: true,
                    thname: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isCurrent: "desc" }, { endDate: "desc" }],
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
      return res.status(404).json({ error: "Profile not found" });
    }

    // Format the response for frontend
    const profileData = {
      id: candidateProfile.id,
      userId: candidateProfile.userId,
      fullName: candidateProfile.fullName || null,
      studentCode: candidateProfile.studentCode || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      profileImage: candidateProfile.profileImage || null,
      desiredPosition: candidateProfile.desiredPosition || null,
      bio: candidateProfile.bio || null,
      major: candidateProfile.major || null,
      studyYear: candidateProfile.studyYear || null,
      university: candidateProfile.University ? {
        name: candidateProfile.University.name,
        thname: candidateProfile.University.thname,
        province: candidateProfile.University.province,
      } : null,
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University.name,
        universityThai: cu.University.thname,
        degree: cu.degreeName || null,
        educationLevel: cu.educationLevel,
        startDate: cu.startDate ? cu.startDate.toISOString().split("T")[0] : null,
        endDate: cu.endDate ? cu.endDate.toISOString().split("T")[0] : null,
        startYear: cu.startDate ? cu.startDate.getFullYear() : null,
        endYear: cu.endDate ? cu.endDate.getFullYear() : null,
        gpa: cu.gpa || null,
        isCurrent: cu.isCurrent,
        faculty: cu.UniversityFaculty?.Faculty ? {
          name: cu.UniversityFaculty.Faculty.name,
          thname: cu.UniversityFaculty.Faculty.thname,
        } : null,
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

  const items = candidates.map((c: typeof candidates[0]) => {
    const name = c.fullName ?? c.User.email;
    const uni =
      c.CandidateUniversity[0]?.University?.name ??
      c.University?.name ??
      "Unknown University";
    const skills = c.UserSkill.map((us: typeof c.UserSkill[0]) => us.Skills.name);
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
        University: { 
          select: { 
            name: true,
            thname: true,
            province: true,
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
            UniversityFaculty: {
              include: {
                Faculty: {
                  select: {
                    name: true,
                    thname: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isCurrent: "desc" }, { endDate: "desc" }],
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
      studentCode: candidateProfile.studentCode || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      desiredPosition: candidateProfile.desiredPosition || null,
      bio: candidateProfile.bio || null,
      major: candidateProfile.major || null,
      studyYear: candidateProfile.studyYear || null,
      university: candidateProfile.University ? {
        name: candidateProfile.University.name,
        thname: candidateProfile.University.thname,
        province: candidateProfile.University.province,
      } : null,
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University.name,
        universityThai: cu.University.thname,
        degree: cu.degreeName || null,
        educationLevel: cu.educationLevel,
        startDate: cu.startDate ? cu.startDate.toISOString().split("T")[0] : null,
        endDate: cu.endDate ? cu.endDate.toISOString().split("T")[0] : null,
        startYear: cu.startDate ? cu.startDate.getFullYear() : null,
        endYear: cu.endDate ? cu.endDate.getFullYear() : null,
        gpa: cu.gpa || null,
        isCurrent: cu.isCurrent,
        faculty: cu.UniversityFaculty?.Faculty ? {
          name: cu.UniversityFaculty.Faculty.name,
          thname: cu.UniversityFaculty.Faculty.thname,
        } : null,
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
  const { name, role, description } = req.body ?? {};

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
      },
    });

    return res.status(201).json({ project });
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
  const { name, role, description } = req.body ?? {};

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
      },
    });

    return res.json({ project });
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
