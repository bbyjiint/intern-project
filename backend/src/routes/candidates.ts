import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileStorage } from "../utils/fileStorage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SkillCategory } from "@prisma/client";

export const candidatesRouter = Router();

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

function formatInternshipPeriod(raw: string | null): string | null {
  if (!raw) return null;
  // รองรับ format "2026-03-01 - 2026-03-07" หรือ "2026-03-01 - 2026-04-24"
  const match = raw.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
  if (!match) return raw; // ถ้าไม่ match ส่งกลับ raw เดิม

  const start = new Date(match[1]);
  const end = new Date(match[2]);

  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));

  const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fmt.format(start)} - ${fmt.format(end)} (${months} Month)`;
}

function normalizeEducationLevel(value: unknown): string {
  const normalized = String(value || "").trim().toUpperCase().replace(/[^A-Z_]/g, "");

  if (normalized === "BELOW_HIGH_SCHOOL") return "BELOW_HIGH_SCHOOL";
  if (normalized === "HIGH_SCHOOL") return "HIGH_SCHOOL";
  if (normalized === "HIGHER_VOCATIONAL") return "HIGHER_VOCATIONAL";
  if (normalized === "BACHELOR" || normalized === "BACHELORS") return "BACHELOR";
  if (normalized === "MASTER" || normalized === "MASTERS") return "MASTERS";
  if (normalized === "PHD" || normalized === "DOCTORATE") return "PHD";
  return "BACHELOR";
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

        WorkHistory: {
          orderBy: { startDate: "desc" },
        },

        CandidateUniversity: {
          include: { University: { select: { name: true, province: true } } },
          orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
          // ไม่ต้องแก้ — gpa มีอยู่แล้วใน CandidateUniversity model
        },
        UserSkill: {
          include: {
            Skills: {
              select: {
                name: true,
                category: true,
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

      gender: candidateProfile.gender || null,

      dateOfBirth: candidateProfile.dateOfBirth
        ? candidateProfile.dateOfBirth.toISOString()
        : null,

      nationality: candidateProfile.nationality || null,

      internshipPeriod: candidateProfile.internshipPeriod || null,

      preferredPositions: candidateProfile.preferredPositions || [],

      preferredLocations: candidateProfile.CandidatePreferredProvince.map(
        (entry) => entry.Province.name
      ),

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
        universityName: cu.University.name,
        educationLevel: cu.educationLevel,
        degree: cu.degreeName,
        fieldOfStudy: cu.fieldOfStudy,
        yearOfStudy: cu.yearOfStudy,
        gpa: cu.gpa ? cu.gpa.toString() : null,
        isCurrent: cu.isCurrent,
        isVerified: cu.isVerified,
        transcriptUrl: cu.transcriptUrl ?? null,
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
          category: us.Skills.category,
          status: us.status
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
          issuedBy: file.issuedBy || "",
          issueDate: file.issueDate ? file.issueDate.toISOString().split("T")[0] : "",
          relatedSkills: file.relatedSkills || [],
          createdAt: file.createdAt.toISOString(),
        })),
      },
      projects: candidateProfile.UserProjects.map((project) => ({
        id: project.id,
        name: project?.name || "",
        role: project?.role || "",
        description: project?.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
        githubUrl: project.githubUrl || "",
        githubVerified: project.githubVerified || false,
        projectUrl: project.projectUrl || "",
        fileUrl: project.fileUrl || "",
        fileName: project.fileName || "",
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

candidatesRouter.get("/skills", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateId = await getCandidateIdForUser(userId);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // const oneMinuteAgo = new Date();
    // oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const skills = await prisma.userSkill.findMany({
      where: { candidateId },
      include: {
        Skills: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    const formattedSkills = await Promise.all(skills.map(async (skill) => {
      const skillNameForSearch = (skill.Skills?.name || "").trim().toLowerCase();
      const attempts = await prisma.skillTestAttempt.findMany({
        where: {
          candidateId,
          skillName: skillNameForSearch,
          createdAt: { gte: oneMonthAgo }
          // createdAt: { gte: oneMinuteAgo }
        },
        orderBy: { createdAt: 'asc' } // เอาอันเก่าสุดขึ้นก่อน
      });

      const ratingMap: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };

      // คำนวณวันที่โควต้าจะคืน (30 วันหลังจากสอบครั้งแรกในชุดนั้น)
      let nextAvailableDate = null;
      if (attempts.length >= 3) {
        const firstAttemptDate = new Date(attempts[0].createdAt);
        // firstAttemptDate.setMonth(firstAttemptDate.getMonth() + 1);
        firstAttemptDate.setMinutes(firstAttemptDate.getMinutes() + 1);
        nextAvailableDate = firstAttemptDate.toISOString();
      }

      return {
        id: skill.id,
        name: skill.Skills?.name || "Unknown Skill",
        category: skill.category || skill.Skills?.category || "TECHNICAL",
        rating: skill.rating,
        level: ratingMap[skill.rating || 1] || "Beginner",
        status: skill.status,
        // เพิ่มข้อมูลโควต้าส่งไปให้หน้าบ้าน
        attemptsUsed: attempts.length,
        nextAvailableDate: nextAvailableDate
      };
    }));

    return res.json({ skills: formattedSkills });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error fetching candidate skills:", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch candidate skills" });
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
        include: { University: { select: { name: true, province: true } } },
        orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
      },
      CandidatePreferredProvince: {
        include: { Province: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
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

    const preferredLocation = c.CandidatePreferredProvince[0]?.Province?.name ?? null;
    const location = preferredLocation ?? primaryEdu?.University?.province ?? null;

    const skills = c.UserSkill.map((us: typeof c.UserSkill[0]) => us.Skills.name);

    // derive graduation date from endDate or yearOfStudy/current flag
    let graduationDate: string | null = null;
    if (primaryEdu?.isCurrent) {
      graduationDate = "Present";
    } else if (primaryEdu?.yearOfStudy) {
      graduationDate = primaryEdu.yearOfStudy;
    }

    // Major: derive ONLY from CandidateUniversity.degreeName.
    // CandidateProfile should not be used as a source of education details.
    const major = primaryEdu?.fieldOfStudy ?? primaryEdu?.degreeName ?? null;

    const role = c.desiredPosition ?? (c.preferredPositions.length > 0 ? c.preferredPositions[0] : "Intern");

    return {
      id: c.id,
      name,
      role,
      university: uni ?? "Unknown University",
      major,
      location,
      graduationDate,
      skills,
      initials: initialsFromName(name),
      email: c.User.email,
      about: c.bio ?? "",
      preferredPositions: c.preferredPositions ?? [],
      preferredLocations: c.CandidatePreferredProvince.map((p) => p.Province.name),
      internshipPeriod: formatInternshipPeriod(c.internshipPeriod ?? null),
      yearOfStudy: primaryEdu?.yearOfStudy ?? null,
      gpa: primaryEdu?.gpa ? primaryEdu.gpa.toString() : null,
      degreeName: primaryEdu?.degreeName ?? null,
      isCurrent: primaryEdu?.isCurrent ?? false,
      phoneNumber: c.phoneNumber ?? null,
      profileImage: c.profileImage ?? null,
      createdAt: c.createdAt.toISOString(),
    };

  });

  return res.json({ candidates: items });
});

// ============================================================
// แทนที่ route /job-matches เดิมใน candidates.ts
// ============================================================

candidatesRouter.get("/job-matches", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const forceRefresh = req.query.refresh === "true";

  try {
    const candidateId = await getCandidateIdForUser(userId);

    // 1. ดึง JobPost ทั้งหมดที่ PUBLISHED
    const jobPosts = await prisma.jobPost.findMany({
      where: { state: "PUBLISHED" },
      include: {
        Company: {
          select: {
            id: true,
            companyName: true,
            logoURL: true,
            CompanyEmails: { select: { email: true }, take: 1 },
          },
        },
        LocationProvince: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. ดึง bookmarks
    const bookmarks = await prisma.jobBookmark.findMany({
      where: { candidateId },
      select: { jobPostId: true },
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.jobPostId));

    // 3. เช็ค cache
    const cache = await (prisma as any).jobMatchCache.findUnique({
      where: { candidateId },
    });

    let aiScores: Record<string, number> = {};
    let usedCache = false;

    if (cache && !forceRefresh) {
      // ใช้ cache ที่มีอยู่
      aiScores = cache.scores as Record<string, number>;
      usedCache = true;
      console.log(`[JobMatch] Using cached scores for candidate ${candidateId}`);
    } else {
      // ไม่มี cache หรือ force refresh — เรียก Gemini
      console.log(`[JobMatch] Calculating new scores for candidate ${candidateId}`);

      const candidate = await prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: {
          UserSkill: { include: { Skills: { select: { name: true, category: true } } } },
          CandidateUniversity: {
            orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
            take: 1,
          },
          CandidatePreferredProvince: {
            include: { Province: { select: { name: true } } },
          },
          UserProjects: { select: { name: true, role: true, relatedSkills: true, description: true } },
          WorkHistory: { select: { position: true, companyName: true, description: true }, take: 3 },
        },
      });

      if (!candidate) return res.status(404).json({ error: "Candidate not found" });

      const candidateProfile = {
        skills: candidate.UserSkill.map((us) => ({ name: us.Skills.name, category: us.Skills.category })),
        preferredPositions: candidate.preferredPositions,
        preferredProvinces: candidate.CandidatePreferredProvince.map((p) => p.Province.name),
        gpa: candidate.CandidateUniversity[0]?.gpa ?? null,
        bio: candidate.bio ?? "",
        projects: candidate.UserProjects.map((p) => ({
          name: p.name, role: p.role, skills: p.relatedSkills, description: p.description,
        })),
        workHistory: candidate.WorkHistory.map((w) => ({
          position: w.position, company: w.companyName, description: w.description,
        })),
      };

      const jobList = jobPosts.map((job) => ({
        id: job.id,
        title: job.jobTitle,
        positions: job.positions,
        workplaceType: job.workplaceType,
        province: (job as any).LocationProvince?.name ?? job.locationProvince ?? "",
        description: job.jobDescription ?? "",
        specification: job.jobSpecification ?? "",
        minimumGpa: job.gpa ?? null,  // minimum GPA required
      }));

      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `
You are a job matching expert for internship positions in Thailand.

Analyze how well this candidate matches each job posting and return a match score (0-100) for each job.

CANDIDATE PROFILE:
- Skills: ${JSON.stringify(candidateProfile.skills)}
- Preferred Positions: ${candidateProfile.preferredPositions.join(", ") || "Not specified"}
- Preferred Locations: ${candidateProfile.preferredProvinces.join(", ") || "Not specified"}
- GPA: ${candidateProfile.gpa ?? "Not specified"}
- About: ${candidateProfile.bio || "Not provided"}
- Projects: ${JSON.stringify(candidateProfile.projects)}
- Work History: ${JSON.stringify(candidateProfile.workHistory)}

JOB POSTINGS:
${JSON.stringify(jobList, null, 2)}

SCORING CRITERIA:
- Skills match with job requirements (40%)
- Location preference match (20%): If the job's workplaceType is "REMOTE", give full score (20/20) for location regardless of candidate's preferred location — remote jobs have no location constraint.
- Position/role interest match (20%)
- GPA requirement (10%): minimumGpa is the MINIMUM GPA required by the job. If candidate GPA >= minimumGpa = full score. If minimumGpa is null = no requirement, give neutral score. If candidate has no GPA = partial score.
- Overall profile fit (10%)

Return ONLY a JSON object with job IDs as keys and scores (0-100) as values.
Example: { "uuid-1": 85, "uuid-2": 62 }
`;

        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim().replace(/```json\n?|```\n?/g, "");
        aiScores = JSON.parse(rawText);
      } catch (aiError) {
        console.error("Gemini scoring failed, using keyword fallback:", aiError);
        // Fallback keyword matching
        const candidate2 = await prisma.candidateProfile.findUnique({
          where: { id: candidateId },
          include: { UserSkill: { include: { Skills: { select: { name: true } } } } },
        });
        jobPosts.forEach((job) => {
          const cSkills = (candidate2?.UserSkill || []).map((us) => us.Skills.name.toLowerCase());
          const jSkills = job.positions.map((p) => p.toLowerCase());
          const matched = cSkills.filter((cs) => jSkills.some((js) => js.includes(cs) || cs.includes(js)));
          aiScores[job.id] = Math.round(Math.min((matched.length / Math.max(jSkills.length, 1)) * 100, 100));
        });
      }

      // 4. บันทึก cache (upsert)
      await (prisma as any).jobMatchCache.upsert({
        where: { candidateId },
        update: { scores: aiScores },
        create: { candidateId, scores: aiScores },
      });
    }

    // 5. สร้าง response
    const scoredJobs = jobPosts.map((job) => {
      const jobProvinceName = (job as any).LocationProvince?.name ?? job.locationProvince ?? "";
      return {
        id: job.id,
        jobTitle: job.jobTitle,
        companyName: job.Company.companyName,
        companyEmail: job.Company.CompanyEmails[0]?.email ?? "",
        companyLogo: job.Company.logoURL ?? null,
        workplaceType: job.workplaceType,
        positions: job.positions,
        locationProvince: jobProvinceName,
        positionsAvailable: job.positionsAvailable ?? 0,
        allowance: job.allowance ?? null,
        allowancePeriod: job.allowancePeriod ?? null,
        noAllowance: job.noAllowance,
        score: aiScores[job.id] ?? 0,
        isBookmarked: bookmarkedIds.has(job.id),
      };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    return res.json({ jobs: scoredJobs, cached: usedCache });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error fetching job matches:", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch job matches" });
  }
});


// ============================================================
// Helper function — เรียกหลังจาก candidate แก้ข้อมูลใดๆ
// วางไว้ใกล้ๆ getCandidateIdForUser หรือเรียกในแต่ละ route ที่แก้ข้อมูล
// ============================================================
async function invalidateJobMatchCache(candidateId: string) {
  try {
    await (prisma as any).jobMatchCache.deleteMany({
      where: { candidateId },
    });
  } catch (e) {
    // ไม่มี cache อยู่ก็ไม่เป็นไร
  }
}

// ============================================================
// เพิ่ม invalidateJobMatchCache() ในทุก route ที่แก้ข้อมูล candidate:
//
// POST/PUT /projects      → invalidateJobMatchCache(candidateId)
// DELETE /projects/:id    → invalidateJobMatchCache(candidateId)
// POST/PUT /skills        → invalidateJobMatchCache(candidateId)
// DELETE /skills/:id      → invalidateJobMatchCache(candidateId)
// PUT /profile            → invalidateJobMatchCache(candidateId)
// POST/PUT /education     → invalidateJobMatchCache(candidateId)
// POST/PUT /experience    → invalidateJobMatchCache(candidateId)
//
// ตัวอย่าง (ใส่หลัง prisma.userProjects.create/update/delete สำเร็จ):
//
//   await invalidateJobMatchCache(candidateId);
//   return res.status(201).json({ project: ... });
// ============================================================

// GET /api/candidates/applicant-match-scores?jobPostId=xxx&candidateIds=id1,id2,id3
candidatesRouter.get(
  "/applicant-match-scores",
  requireAuth,
  requireRole("COMPANY"),
  async (req, res) => {
    const jobPostId = typeof req.query.jobPostId === "string" ? req.query.jobPostId : "";
    const rawIds = typeof req.query.candidateIds === "string" ? req.query.candidateIds : "";
    const candidateIds = rawIds.split(",").filter(Boolean);
    const forceRefresh = req.query.refresh === "true";

    if (!jobPostId || candidateIds.length === 0) {
      return res.status(400).json({ error: "jobPostId and candidateIds are required" });
    }

    try {
      // ✅ STEP 1: ดึงจาก JobMatchCache ของ intern ก่อน (ตัวเลขเดียวกัน 100%)
      const internCaches = await (prisma as any).jobMatchCache.findMany({
        where: { candidateId: { in: candidateIds } },
      });

      const scores: Record<string, number> = {};
      const missingIds: string[] = [];

      for (const candidateId of candidateIds) {
        const internCache = internCaches.find((c: any) => c.candidateId === candidateId);
        if (internCache && !forceRefresh) {
          const jobScore = (internCache.scores as Record<string, number>)[jobPostId];
          if (jobScore !== undefined) {
            scores[candidateId] = jobScore; // ✅ ใช้ตัวเลขเดียวกับ intern
          } else {
            missingIds.push(candidateId); // intern ยังไม่เคย calculate job นี้
          }
        } else {
          missingIds.push(candidateId); // ไม่มี intern cache หรือ force refresh
        }
      }

      // ✅ STEP 2: ถ้าทุกคนมีครบแล้ว return เลย
      if (missingIds.length === 0) {
        await (prisma as any).applicantMatchCache.upsert({
          where: { jobPostId },
          update: { scores },
          create: { jobPostId, scores },
        });
        console.log(`[ApplicantMatch] All scores from intern cache for jobPost ${jobPostId}`);
        return res.json({ scores, cached: true });
      }

      // ✅ STEP 3: มีบางคนที่ไม่มีใน intern cache → เรียก Gemini เฉพาะคนที่ขาด
      console.log(`[ApplicantMatch] Calling Gemini for ${missingIds.length} missing candidates...`);

      const jobPost = await prisma.jobPost.findUnique({
        where: { id: jobPostId },
        select: {
          jobTitle: true,
          positions: true,
          workplaceType: true,
          jobDescription: true,
          jobSpecification: true,
          gpa: true,
          locationProvince: true,
          LocationProvince: { select: { name: true } },
        },
      });

      if (!jobPost) return res.status(404).json({ error: "Job post not found" });

      const jobInfo = {
        title: jobPost.jobTitle,
        positions: jobPost.positions,
        workplaceType: jobPost.workplaceType,
        province: (jobPost as any).LocationProvince?.name ?? jobPost.locationProvince ?? "",
        description: jobPost.jobDescription ?? "",
        specification: jobPost.jobSpecification ?? "",
        minimumGpa: jobPost.gpa ?? null,
      };

      // ดึงเฉพาะ candidate ที่ขาด
      const missingCandidates = await prisma.candidateProfile.findMany({
        where: { id: { in: missingIds } },
        include: {
          UserSkill: { include: { Skills: { select: { name: true, category: true } } } },
          CandidateUniversity: {
            orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
            take: 1,
          },
          CandidatePreferredProvince: {
            include: { Province: { select: { name: true } } },
          },
          UserProjects: {
            select: { name: true, role: true, relatedSkills: true, description: true },
          },
          WorkHistory: {
            select: { position: true, companyName: true, description: true },
            take: 3,
          },
        },
      });

      const missingProfiles = missingCandidates.map((c) => ({
        id: c.id,
        skills: c.UserSkill.map((us) => ({ name: us.Skills.name, category: us.Skills.category })),
        preferredPositions: c.preferredPositions,
        preferredProvinces: c.CandidatePreferredProvince.map((p) => p.Province.name),
        gpa: c.CandidateUniversity[0]?.gpa ?? null,
        bio: c.bio ?? "",
        projects: c.UserProjects.map((p) => ({
          name: p.name, role: p.role, skills: p.relatedSkills, description: p.description,
        })),
        workHistory: c.WorkHistory.map((w) => ({
          position: w.position, company: w.companyName, description: w.description,
        })),
      }));

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
You are a job matching expert for internship positions in Thailand.

Analyze how well each candidate matches this job posting and return a match score (0-100) for each candidate.

JOB POSTING:
${JSON.stringify(jobInfo, null, 2)}

CANDIDATES:
${JSON.stringify(missingProfiles, null, 2)}

SCORING CRITERIA:
- Skills match with job requirements (40%)
- Location preference match (20%): If workplaceType is "REMOTE", give full location score regardless of candidate preference.
- Position/role interest match (20%)
- GPA requirement (10%): minimumGpa is minimum required. candidate GPA >= minimumGpa = full score. null = no requirement.
- Overall profile fit (10%)

Return ONLY a JSON object with candidate IDs as keys and scores (0-100) as values.
Example: { "uuid-1": 85, "uuid-2": 62 }
`;

      let geminiScores: Record<string, number> = {};

      try {
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim().replace(/```json\n?|```\n?/g, "");
        geminiScores = JSON.parse(rawText);
      } catch (aiError) {
        console.error("Gemini scoring failed, fallback to keyword:", aiError);
        missingCandidates.forEach((c) => {
          const cSkills = c.UserSkill.map((us) => us.Skills.name.toLowerCase());
          const jSkills = jobPost.positions.map((p: string) => p.toLowerCase());
          const matched = cSkills.filter((cs) => jSkills.some((js: string) => js.includes(cs) || cs.includes(js)));
          geminiScores[c.id] = Math.round(Math.min((matched.length / Math.max(jSkills.length, 1)) * 100, 100));
        });
      }

      // ✅ STEP 4: Merge scores จาก intern cache + Gemini
      const finalScores = { ...scores, ...geminiScores };

      // บันทึกลง ApplicantMatchCache
      const existingAppCache = await (prisma as any).applicantMatchCache.findUnique({
        where: { jobPostId },
      });
      const existingScores = existingAppCache ? (existingAppCache.scores as Record<string, number>) : {};
      const mergedScores = { ...existingScores, ...finalScores };

      await (prisma as any).applicantMatchCache.upsert({
        where: { jobPostId },
        update: { scores: mergedScores },
        create: { jobPostId, scores: mergedScores },
      });

      return res.json({ scores: finalScores, cached: false });
    } catch (e: any) {
      console.error("Error computing applicant match scores:", e);
      return res.status(500).json({ error: e?.message || "Failed to compute scores" });
    }
  }
);

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
        CandidateResume: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { createdAt: "desc" },
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
      preferredLocations: candidateProfile.CandidatePreferredProvince.map((entry: { Province: { name: string } }) => entry.Province.name),
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        universityName: cu.University.name,
        educationLevel: cu.educationLevel,
        degree: cu.degreeName,
        fieldOfStudy: cu.fieldOfStudy,
        yearOfStudy: cu.yearOfStudy,
        gpa: cu.gpa ? cu.gpa.toString() : null,
        isCurrent: cu.isCurrent,
        isVerified: cu.isVerified,
        transcriptUrl: cu.transcriptUrl ?? null,
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
          category: us.category || "TECHNICAL",
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
          issuedBy: file.issuedBy || "",
          issueDate: file.issueDate ? file.issueDate.toISOString().split("T")[0] : "",
          relatedSkills: file.relatedSkills || [],
          createdAt: file.createdAt.toISOString(),
        })),
      },
      projects: candidateProfile.UserProjects.map((project) => ({
        id: project.id,
        name: project?.name || "",
        role: project?.role || "",
        description: project?.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
        githubUrl: project.githubUrl || "",
        projectUrl: project.projectUrl || "",
        fileUrl: project.fileUrl || "",
        fileName: project.fileName || "",
      })),
      resume: candidateProfile.CandidateResume[0]
        ? {
          id: candidateProfile.CandidateResume[0].id,
          name: candidateProfile.CandidateResume[0].name,
          url: candidateProfile.CandidateResume[0].url,
          createdAt: candidateProfile.CandidateResume[0].createdAt.toISOString(),
        }
        : null,
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


candidatesRouter.post(
  "/projects/upload",
  requireAuth, requireRole("CANDIDATE"),
  (req: AuthedRequest, res, next) => {
    uploadProjectFile.single("file")(req as any, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req: AuthedRequest, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    try {
      const fileBuffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : Buffer.from([]));
      const result = await fileStorage.uploadFile(
        { ...req.file, buffer: fileBuffer } as Express.Multer.File,
        "projects", undefined
      );
      cleanupLocalFile(req.file);
      return res.json({ url: result.url });
    } catch (e: any) {
      cleanupLocalFile(req.file);
      return res.status(500).json({ error: e?.message || "Upload failed" });
    }
  }
);

// Create a new project
candidatesRouter.post("/projects", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const { name, role, description, startDate, endDate, relatedSkills, githubUrl, projectUrl, fileUrl, fileName } = req.body ?? {};


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
        githubUrl: githubUrl ?? null,
        projectUrl: projectUrl ?? null,
        fileUrl: fileUrl ?? null,
        fileName: fileName ?? null,
      },
    });

    await invalidateJobMatchCache(candidateId);
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
  const {
    name,
    role,
    description,
    startDate,
    endDate,
    relatedSkills,
    githubUrl,
    projectUrl,
    fileUrl,
    fileName
  } = req.body ?? {};

  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);

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
        githubUrl: githubUrl ?? null,
        projectUrl: projectUrl ?? null,
        fileUrl: fileUrl ?? null,
        fileName: fileName ?? null,
      },
    });
    await invalidateJobMatchCache(candidateId);
    return res.json({
      project: {
        ...project,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
        githubUrl: project.githubUrl || "",
        projectUrl: project.projectUrl || "",
        fileUrl: project.fileUrl || "",
        fileName: project.fileName || "",
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

    const existingProject = await prisma.userProjects.findUnique({
      where: { id: projectId },
      select: { candidateId: true, fileUrl: true },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (existingProject.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to delete this project" });
    }

    // ✅ ลบไฟล์จริงก่อน ถ้ามี
    if (existingProject.fileUrl) {
      try {
        const fileKey = fileStorage.extractKeyFromUrl(existingProject.fileUrl);
        if (fileKey) await fileStorage.deleteFile(fileKey);
      } catch (e) {
        console.error("Error deleting project file:", e);
      }
    }

    await prisma.userProjects.delete({
      where: { id: projectId },
    });
    await invalidateJobMatchCache(candidateId);

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
      where: {
        name: { equals: universityName, mode: "insensitive" }
      },
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
      where: {
        name: { equals: universityName, mode: "insensitive" }
      },
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

    const oldTranscript = await prisma.educationTranscript.findFirst({
      where: { educationId },
    });
    if (oldTranscript) {
      try {
        const key = fileStorage.extractKeyFromUrl(oldTranscript.url);
        if (key) await fileStorage.deleteFile(key);
      } catch { }
      await prisma.educationTranscript.delete({ where: { id: oldTranscript.id } });
    }

    const education = await prisma.candidateUniversity.update({
      where: { id: educationId },
      data: {
        universityId: university.id,
        educationLevel: normalizeEducationLevel(educationLevel),
        degreeName,
        fieldOfStudy: fieldOfStudy || degreeName,
        yearOfStudy: yearOfStudy || "",
        gpa: gpa ? parseFloat(gpa.toString()) : null,
        isCurrent: isCurrent || false,
        // ✅ reset เมื่อ edit
        isVerified: false,
        verifiedBy: null,
        transcriptUrl: null,
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

candidatesRouter.delete("/education/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const educationId = typeof req.params.id === "string" ? req.params.id : req.params.id[0]

  try {
    const candidateId = await getCandidateIdForUser(userId)

    const existing = await prisma.candidateUniversity.findUnique({
      where: { id: educationId },
      select: { candidateId: true },
    })

    if (!existing) return res.status(404).json({ error: "Education not found" })
    if (existing.candidateId !== candidateId) return res.status(403).json({ error: "No permission" })

    await prisma.candidateUniversity.delete({ where: { id: educationId } })

    return res.json({ success: true })
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" })
    return res.status(500).json({ error: e?.message || "Failed to delete education" })
  }
})

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

// Upload middleware for profile image
const uploadProfileImage = multer({
  storage: multer.memoryStorage(), // <-- เปลี่ยนตรงนี้
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname) || file.mimetype.startsWith("image/");
    isImage ? cb(null, true) : cb(new Error("Only image files allowed"));
  },
});

const uploadProjectFile = multer({
  storage: createStorage("projects"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx)$/i.test(file.originalname);
    ok ? cb(null, true) : cb(new Error("Only PDF or DOCX allowed"));
  },
});

// POST /api/candidates/profile/image
candidatesRouter.post("/profile/image", requireAuth, requireRole("CANDIDATE"), (req: AuthedRequest, res, next) => {
  uploadProfileImage.single("file")(req as any, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File is required" });

    // ✅ ดึง profileImage เก่าก่อน
    const existingProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
      select: { profileImage: true },
    });

    const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : Buffer.from([]));
    const uploadResult = await fileStorage.uploadFile(
      { ...file, buffer: fileBuffer } as Express.Multer.File,
      "profiles",
      undefined
    );
    cleanupLocalFile(file);

    // ✅ ลบไฟล์เก่าหลัง upload ใหม่สำเร็จ
    if (existingProfile?.profileImage) {
      try {
        const oldKey = fileStorage.extractKeyFromUrl(existingProfile.profileImage);
        if (oldKey) await fileStorage.deleteFile(oldKey);
      } catch (e) {
        console.error("Error deleting old profile image:", e);
      }
    }

    await prisma.candidateProfile.update({
      where: { userId },
      data: { profileImage: uploadResult.url, updatedAt: new Date() },
    });

    return res.json({ url: uploadResult.url });
  } catch (e: any) {
    cleanupLocalFile(req.file);
    return res.status(500).json({ error: e?.message || "Upload failed" });
  }
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
    let relatedSkills: string[] = [];
    const rawSkills = (req as any).body?.relatedSkills;
    if (Array.isArray(rawSkills)) {
      relatedSkills = rawSkills;
    } else if (typeof rawSkills === "string") {
      try { relatedSkills = JSON.parse(rawSkills); } catch { relatedSkills = [rawSkills]; }
    }

    const plainDescription = (req as any).body?.description || null;

    const certificate = await prisma.certificateFile.create({
      data: {
        id: randomUUID(),
        candidateId,
        name: fileName,
        url: uploadResult.url,
        type: req.file!.mimetype,
        description: plainDescription,   // ✅ เก็บแค่ description จริงๆ
        issuedBy: issuedBy || null,      // ✅ เก็บลง column ตรงๆ
        issueDate: issueDate ? new Date(issueDate) : null,  // ✅
        relatedSkills: relatedSkills,    // ✅
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

// แก้ไข Certificate
candidatesRouter.put("/certificates/:id", requireAuth, requireRole("CANDIDATE"), (req: AuthedRequest, res, next) => {
  uploadCertificate.single("file")(req as any, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const certificateId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const existing = await prisma.certificateFile.findUnique({
      where: { id: certificateId },
      select: { candidateId: true, url: true },
    });

    if (!existing) return res.status(404).json({ error: "Certificate not found" });
    if (existing.candidateId !== candidateId) return res.status(403).json({ error: "No permission" });

    const { name, issuedBy, issueDate } = (req as any).body ?? {};

    let relatedSkills: string[] = [];
    const rawSkills = (req as any).body?.relatedSkills;
    if (Array.isArray(rawSkills)) {
      relatedSkills = rawSkills;
    } else if (typeof rawSkills === "string") {
      try { relatedSkills = JSON.parse(rawSkills); } catch { relatedSkills = [rawSkills]; }
    }

    const plainDescription = (req as any).body?.description || null;

    // ถ้ามีไฟล์ใหม่ ให้อัปโหลดและลบของเก่า
    let newUrl = existing.url;
    let newType: string | undefined;

    if (req.file) {
      const fileBuffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : Buffer.from([]));
      const uploadResult = await fileStorage.uploadFile(
        { ...req.file, buffer: fileBuffer } as Express.Multer.File,
        "certificates",
        undefined
      );
      cleanupLocalFile(req.file);
      try {
        const oldKey = fileStorage.extractKeyFromUrl(existing.url);
        if (oldKey) await fileStorage.deleteFile(oldKey);
      } catch { }
      newUrl = uploadResult.url;
      newType = req.file.mimetype;
    }

    const certificate = await prisma.certificateFile.update({
      where: { id: certificateId },
      data: {
        name: name || undefined,
        url: newUrl,
        ...(newType && { type: newType }),
        description: plainDescription,
        issuedBy: issuedBy || null,
        issueDate: issueDate ? new Date(issueDate) : null,
        relatedSkills,
      },
    });

    return res.json({ certificate });
  } catch (e: any) {
    cleanupLocalFile(req.file);
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") return res.status(404).json({ error: "Candidate profile not found" });
    return res.status(500).json({ error: e?.message || "Failed to update certificate" });
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

    // Delete all existing resumes (file storage + db records)
    const existingResumes = await prisma.candidateResume.findMany({
      where: { candidateId },
      select: { id: true, url: true },
    });

    for (const existing of existingResumes) {
      try {
        const fileKey = fileStorage.extractKeyFromUrl(existing.url);
        if (fileKey) await fileStorage.deleteFile(fileKey);
      } catch (e) {
        console.error("Error deleting old resume file:", e);
      }
    }

    await prisma.candidateResume.deleteMany({
      where: { candidateId },
    });

    const resume = await prisma.candidateResume.create({
      data: {
        id: randomUUID(),
        candidateId,
        name: fileName,
        url: uploadResult.url,
        fileSize: file.size || null,
        fileType: file.mimetype || null,
        isPrimary: true,
      },
    });

    return res.status(201).json({ resume });
  } catch (e: any) {
    cleanupLocalFile(req.file as Express.Multer.File);

    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error creating resume:", e);
    return res.status(500).json({ error: e?.message || "Failed to create resume" });
  }
});

candidatesRouter.delete("/skills/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const userSkillId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

  try {
    const candidateId = await getCandidateIdForUser(userId);

    const existingSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
      select: { candidateId: true },
    });

    if (!existingSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    if (existingSkill.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to delete this skill" });
    }

    await prisma.userSkill.delete({
      where: { id: userSkillId },
    });
    await invalidateJobMatchCache(candidateId);

    return res.json({ success: true, message: "Skill deleted successfully" });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error deleting skill:", e);
    return res.status(500).json({ error: e?.message || "Failed to delete skill" });
  }
});

candidatesRouter.post("/skills", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const { name, category, level } = req.body ?? {};

  if (!name || !level) {
    return res.status(400).json({ error: "Skill name and proficiency level are required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);
    const normalizedCategory =
      typeof category === "string" && category.toUpperCase() === "BUSINESS"
        ? "BUSINESS"
        : "TECHNICAL";

    let skill = await prisma.skills.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      },
    });

    if (!skill) {
      skill = await prisma.skills.create({
        data: {
          name: name,
          category: normalizedCategory as SkillCategory
        },
      });
    }

    let rating = 1;
    if (level === "Intermediate") rating = 2;
    else if (level === "Advanced") rating = 3;

    const existingUserSkill = await prisma.userSkill.findFirst({
      where: {
        candidateId: candidateId,
        skillId: skill.id
      }
    });

    if (existingUserSkill) {
      const updatedSkill = await prisma.userSkill.update({
        where: { id: existingUserSkill.id },
        data: {
          rating: rating,
          category: skill.category || normalizedCategory,
        }
      });
      await invalidateJobMatchCache(candidateId);
      return res.status(200).json({ message: "Skill updated", skill: updatedSkill });
    }

    const userSkill = await prisma.userSkill.create({
      data: {
        id: randomUUID(),
        candidateId: candidateId,
        skillId: skill.id,
        rating: rating,
        category: skill.category || normalizedCategory,
      },
    });
    await invalidateJobMatchCache(candidateId);
    return res.status(201).json({ message: "Skill added successfully", skill: userSkill });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error adding skill:", e);
    return res.status(500).json({ error: e?.message || "Failed to add skill" });
  }
});

candidatesRouter.put("/skills/:id", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const userSkillId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const { name, category, level } = req.body ?? {}; 

  if (!level) {
    return res.status(400).json({ error: "Proficiency level is required" });
  }

  try {
    const candidateId = await getCandidateIdForUser(userId);
    let resolvedCategory =
      typeof category === "string" && category.toUpperCase() === "BUSINESS"
        ? "BUSINESS"
        : "TECHNICAL";

    const existingUserSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
      select: { candidateId: true, skillId: true },
    });

    if (!existingUserSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    if (existingUserSkill.candidateId !== candidateId) {
      return res.status(403).json({ error: "You don't have permission to update this skill" });
    }

    let finalSkillId = existingUserSkill.skillId;
    if (name) {
      let masterSkill = await prisma.skills.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (!masterSkill) {
        masterSkill = await prisma.skills.create({
          data: {
            name: name,
            category: resolvedCategory as SkillCategory,
          },
        });
      }
      finalSkillId = masterSkill.id;
      resolvedCategory = masterSkill.category;
    }

    let rating = 1;
    if (level === "Intermediate") rating = 2;
    else if (level === "Advanced") rating = 3;

    const updatedSkill = await prisma.userSkill.update({
      where: { id: userSkillId },
      data: {
        skillId: finalSkillId,
        rating: rating,
      },
    });
    await invalidateJobMatchCache(candidateId);
    return res.json({ message: "Skill updated successfully", skill: updatedSkill });
  } catch (e: any) {
    if (e?.message === "CANDIDATE_PROFILE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate profile not found" });
    }
    console.error("Error updating skill:", e);
    return res.status(500).json({ error: e?.message || "Failed to update skill" });
  }
});

candidatesRouter.post(
  "/education/:educationId/transcript",
  requireAuth,
  requireRole("CANDIDATE"),
  uploadResume.single("file"),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const educationId =
      typeof req.params.educationId === "string"
        ? req.params.educationId
        : req.params.educationId[0];

    try {
      const candidateId = await getCandidateIdForUser(userId);

      const file = req.file;
      if (!file) return res.status(400).json({ error: "File is required" });

      // ── 1. โหลด education record จาก DB ──────────────────────────────
      const edu = await prisma.candidateUniversity.findFirst({
        where: { id: educationId, candidateId },
        include: { University: { select: { name: true } } },
      });

      if (!edu) return res.status(404).json({ error: "Education record not found" });

      // ── 2. แปลงไฟล์เป็น base64 ───────────────────────────────────────
      const fileBuffer =
        file.buffer || (file.path ? fs.readFileSync(file.path) : Buffer.from([]));
      const base64File = fileBuffer.toString("base64");

      // ── 3. เรียก Gemini ──────────────────────────────────────────────
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const levelMap: Record<string, string> = {
        BELOW_HIGH_SCHOOL: "Below High School",
        HIGH_SCHOOL: "High School / Vocational Certificate",
        HIGHER_VOCATIONAL: "Higher Vocational Diploma",
        BACHELOR: "Bachelor's Degree",
        MASTERS: "Master's Degree",
        PHD: "Doctoral Degree (PhD)",
      };

      const prompt = `
You are an education transcript verifier.

Applicant's profile:
- University: ${edu.University?.name ?? "N/A"}
- Degree: ${edu.degreeName}
- Field of Study: ${edu.fieldOfStudy}
- Education Level: ${levelMap[edu.educationLevel] ?? edu.educationLevel}
- GPA: ${edu.gpa ?? "N/A"}

Read the uploaded transcript and compare each field.
Rules:
- GPA: allow ±0.05 tolerance
- Text fields: minor abbreviations are OK (e.g. "B.Eng" = "Bachelor of Engineering")

Return ONLY valid JSON (no markdown):
{
  "verified": true,
  "extractedData": {
    "universityName": "...",
    "degreeName": "...",
    "fieldOfStudy": "...",
    "educationLevel": "BACHELOR",
    "gpa": "3.50"
  },
  "mismatches": []
}

If fields don't match set verified: false and list mismatches:
{
  "verified": false,
  "extractedData": { ... },
  "mismatches": [{ "field": "GPA", "profile": "3.50", "transcript": "3.80" }]
}

If cannot read the document:
{ "verified": false, "extractedData": {}, "mismatches": [], "error": "Cannot read document" }
`;

      const aiResult = await model.generateContent([
        { inlineData: { mimeType: file.mimetype, data: base64File } },
        { text: prompt },
      ]);

      const rawText = aiResult.response.text().trim();

      let verifyResult: {
        verified: boolean;
        extractedData: Record<string, string>;
        mismatches: Array<{ field: string; profile: string; transcript: string }>;
        error?: string;
      };

      try {
        const clean = rawText.replace(/```json|```/g, "").trim();
        verifyResult = JSON.parse(clean);
      } catch {
        cleanupLocalFile(file);
        return res.status(422).json({ message: "AI could not analyze the transcript. Please try again." });
      }

      // ── 4. ถ้า verified → upload ไฟล์ + อัปเดต DB ──────────────────
      if (verifyResult.verified) {
        const uploadResult = await fileStorage.uploadFile(
          { ...file, buffer: fileBuffer } as Express.Multer.File,
          "transcripts"
        );
        cleanupLocalFile(file);

        // upsert transcript record
        const existingTranscript = await prisma.educationTranscript.findFirst({
          where: { educationId, candidateId },
        });

        if (existingTranscript) {
          await prisma.educationTranscript.update({
            where: { id: existingTranscript.id },
            data: {
              name: file.originalname,
              url: uploadResult.url,
              fileSize: file.size || null,
              fileType: file.mimetype || null,
            },
          });
        } else {
          await prisma.educationTranscript.create({
            data: {
              id: randomUUID(),
              educationId,
              candidateId,
              name: file.originalname,
              url: uploadResult.url,
              fileSize: file.size || null,
              fileType: file.mimetype || null,
            },
          });
        }

        // อัปเดต isVerified ใน CandidateUniversity
        await prisma.candidateUniversity.update({
          where: { id: educationId },
          data: {
            isVerified: true,
            verifiedBy: "TRANSCRIPT",
            transcriptUrl: uploadResult.url,
          },
        });

        return res.json({
          verified: true,
          extractedData: verifyResult.extractedData,
          mismatches: [],
        });
      }

      // ── 5. ถ้าไม่ verified → ไม่บันทึกอะไร คืน mismatch ──────────
      cleanupLocalFile(file);

      return res.json({
        verified: false,
        extractedData: verifyResult.extractedData,
        mismatches: verifyResult.mismatches,
        error: verifyResult.error,
      });

    } catch (e: any) {
      cleanupLocalFile(req.file);
      console.error("Transcript verify error:", e);
      return res.status(500).json({ message: e.message || "Internal server error" });
    }
  }
);

candidatesRouter.get(
  "/education/:educationId/transcript",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: AuthedRequest, res) => {

    const userId = req.user!.id;
    const educationId =
      typeof req.params.educationId === "string"
        ? req.params.educationId
        : req.params.educationId[0]

    try {
      const candidateId = await getCandidateIdForUser(userId);

      const transcripts = await prisma.educationTranscript.findMany({
        where: {
          candidateId,
          educationId,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ transcripts });

    } catch (e) {
      console.error("Error fetching transcripts:", e);
      return res.status(500).json({ error: "Failed to fetch transcripts" });
    }
  }
);

candidatesRouter.post("/skills/generate-test", requireAuth, async (req: AuthedRequest, res) => {
  const { skillName } = req.body;
  const userId = req.user!.id;

  try {
    const candidateId = await getCandidateIdForUser(userId);
    const normalizedSkillName = skillName.trim().toLowerCase();

    // 1. ตรวจสอบโควต้าการสอบ (เหมือนเดิม)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // const oneMinuteAgo = new Date();
    // oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    const recentAttempts = await prisma.skillTestAttempt.count({
      where: {
        candidateId,
        skillName: normalizedSkillName,
        // createdAt: { gte: oneMinuteAgo }
        createdAt: { gte: oneMonthAgo }
      }
    });

    if (recentAttempts >= 3) {
      return res.status(403).json({ error: "Quota exceeded. Max 3 attempts per month." });
    }

    // 2. ดึงข้อมูลชุดคำถามจาก DB
    let testRecord = await prisma.skillTest.findUnique({
      where: { skillName: normalizedSkillName }
    });

    // 3. ถ้าไม่มีคำถามใน DB หรือมีไม่ครบ 15 ข้อ ให้ AI สร้างใหม่
    if (!testRecord) {
      console.log(`Cache MISS: กำลังให้ AI สร้าง Pool คำถาม 15 ข้อสำหรับ ${skillName}...`);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", 
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are an expert technical examiner. Generate exactly 15 multiple-choice questions for "${skillName}".
        The questions must be categorized strictly:
        - 5 "Beginner" questions
        - 5 "Intermediate" questions
        - 5 "Advanced" questions
        
        Return ONLY a JSON array of objects:
        [{ "id": 1, "difficulty": "Beginner", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }]
      `;

      const result = await model.generateContent(prompt);
      let rawText = result.response.text();

      // 1. ทำความสะอาดข้อความ ลบ Markdown block (```json และ ```) ออกให้หมด
      rawText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let questions;
      try {
        // 2. ลอง Parse JSON ดู
        questions = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Failed to parse AI JSON:", rawText);
        throw new Error("AI returned invalid JSON format.");
      }

      // บันทึกลง Database (Upsert เพื่อป้องกัน Race Condition)
      testRecord = await prisma.skillTest.upsert({
        where: { skillName: normalizedSkillName },
        update: { questions: questions },
        create: { skillName: normalizedSkillName, questions: questions }
      });
    }

    // 4. Logic การสุ่มคำถาม (Random Selection)
    // ดึง Pool ทั้งหมด 15 ข้อออกมา
    const allQuestions = testRecord.questions as any[];

    // แยกกลุ่มตามความยาก
    const beginnerPool = allQuestions.filter(q => q.difficulty === "Beginner");
    const intermediatePool = allQuestions.filter(q => q.difficulty === "Intermediate");
    const advancedPool = allQuestions.filter(q => q.difficulty === "Advanced");

    // ฟังก์ชันช่วยสุ่มอาเรย์
    const getRandom = (arr: any[], n: number) => {
      return arr.sort(() => 0.5 - Math.random()).slice(0, n);
    };

    // สุ่มมาอย่างละ 3 ข้อ (รวมเป็น 9 ข้อตาม Logic เดิมของคุณ)
    const selectedQuestions = [
      ...getRandom(beginnerPool, 3),
      ...getRandom(intermediatePool, 3),
      ...getRandom(advancedPool, 3)
    ];

    // 5. ส่งเฉพาะคำถามไปให้หน้าบ้าน (ห้ามส่ง correctAnswer)
    const safeQuestions = selectedQuestions.map(q => ({
      id: q.id,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options
    }));

    return res.json({ questions: safeQuestions });

  } catch (error: any) {
    console.error("Test generation error:", error);
    return res.status(500).json({ error: "Failed to load test" });
  }
});

candidatesRouter.post("/skills/submit-test", requireAuth, async (req: AuthedRequest, res) => {
  const { skillName, answers, userSkillId } = req.body;
  // answers หน้าตาประมาณ: { "1": "Choice A", "2": "Choice C", ... }

  const candidateId = await getCandidateIdForUser(req.user!.id);
  const normalizedSkillName = skillName.trim().toLowerCase();

  try {
    // 1. ดึงเฉลยจาก Database (ที่เราให้ AI เจนเก็บไว้)
    const testRecord = await prisma.skillTest.findUnique({
      where: { skillName: normalizedSkillName }
    });

    if (!testRecord) return res.status(404).json({ error: "Test not found" });

    const originalQuestions = testRecord.questions as any[];

    // 2. ตรวจคำตอบและนับคะแนนแบ่งตามระดับ
    let scores = { Beginner: 0, Intermediate: 0, Advanced: 0 };

    originalQuestions.forEach(q => {
      // ดึงคำตอบของ user (รองรับทั้ง key ที่เป็นตัวเลขและ string)
      const userAnswer = answers[q.id] || answers[String(q.id)]; 

      if (userAnswer) {
        const correctAns = String(q.correctAnswer).trim();
        const userAnsStr = String(userAnswer).trim();

        let isMatch = false;

        // กรณีที่ 1: ตรงกันเป๊ะๆ (เช่น "Python" === "Python" หรือ "A) Python" === "A) Python")
        if (userAnsStr === correctAns) {
          isMatch = true;
        } 
        // กรณีที่ 2: AI ให้คำตอบมาแค่ "A", "B", "C", "D"
        else if (correctAns.length === 1) {
          const letter = correctAns.toUpperCase();
          
          // เช็คว่า User ตอบแบบมี Prefix ไหม (เช่น "A) Python", "A. Python")
          if (userAnsStr.startsWith(`${letter})`) || 
              userAnsStr.startsWith(`${letter}.`) || 
              userAnsStr.startsWith(`${letter} `)) {
            isMatch = true;
          } 
          // เช็คแบบ Index: A = 0, B = 1, C = 2, D = 3 (เช่น ตอบ "Python" ซึ่งอยู่ index 0 ตรงกับ A พอดี)
          else if (Array.isArray(q.options)) {
            const expectedIndex = letter.charCodeAt(0) - 65; // แปลงตัวอักษรเป็น Index
            if (expectedIndex >= 0 && expectedIndex < q.options.length) {
              if (q.options[expectedIndex].trim() === userAnsStr) {
                isMatch = true;
              }
            }
          }
        }
        // กรณีที่ 3: User ตอบมี Prefix แต่เฉลยไม่มี (เช่น User: "A) Python" / เฉลย: "Python")
        else if (userAnsStr.includes(correctAns)) {
          isMatch = true;
        }

        // ถ้าตอบถูกบวกคะแนน
        if (isMatch && scores[q.difficulty as keyof typeof scores] !== undefined) {
          scores[q.difficulty as keyof typeof scores]++;
        }
      }
    });

    // 3. คำนวณ Level ตาม Logic ที่กำหนด 
    let finalLevel = "Beginner"; // ค่าต่ำสุด
    let isPassed = false;

    // ขั้นที่ 1: ตรวจ Beginner
    if (scores.Beginner >= 2) {
      isPassed = true;
      finalLevel = "Beginner"; // ผ่านเบื้องต้น

      // ขั้นที่ 2: ตรวจ Intermediate
      if (scores.Intermediate >= 2) {
        finalLevel = "Intermediate";

        // ขั้นที่ 3: ตรวจ Advanced
        if (scores.Advanced >= 2) {
          finalLevel = "Advanced";
        }
      }
    }

    const fiveSecondsAgo = new Date();
    fiveSecondsAgo.setSeconds(fiveSecondsAgo.getSeconds() - 5);

    const duplicateCheck = await prisma.skillTestAttempt.findFirst({
      where: {
        candidateId,
        skillName: normalizedSkillName,
        createdAt: { gte: fiveSecondsAgo } // เช็คว่าเพิ่งสร้างไปใน 5 วิที่ผ่านมาไหม
      }
    });

    if (duplicateCheck) {
      console.log("ดักจับการยิง API เบิ้ลสำเร็จ! ไม่ตัดโควต้าซ้ำ");
      return res.json({ 
        success: true, 
        isPassed: false, 
        message: "Duplicate submission prevented" 
      });
    }

    // 4. บันทึกประวัติการสอบ (ตัดโควต้า)
    await prisma.skillTestAttempt.create({
      data: {
        candidateId,
        skillName: normalizedSkillName,
        scoreResult: scores,
        finalLevel: finalLevel
      }
    });

    // 5. อัปเดตตาราง Skill ของ User ให้เป็น Verified
    if (isPassed && userSkillId) {
      // แปลง Level จากข้อสอบ ให้เป็นตัวเลข Rating ตาม Schema ของคุณ
      let newRating = 1; // ถือว่า Beginner = 1
      if (finalLevel === "Intermediate") newRating = 2;
      if (finalLevel === "Advanced") newRating = 3;

      await prisma.userSkill.update({
        where: { id: userSkillId },
        data: {
          status: "VERIFIED", // ใช้ค่า Enum (ตัวพิมพ์ใหญ่ตามที่คุณตั้งใน Schema)
          rating: newRating   // อัปเดตฟิลด์ rating แทน level
        }
      });
    }

    return res.json({
      success: true,
      isPassed,
      scores,
      finalLevel
    });

  } catch (error) {
    console.error("Submit test error:", error);
    return res.status(500).json({ error: "Failed to submit test" });
  }
});