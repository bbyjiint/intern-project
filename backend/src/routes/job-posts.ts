import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const jobPostsRouter = Router();

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

function formatAllowance(
  allowance: number | null,
  allowancePeriod: "MONTH" | "WEEK" | "DAY" | null,
  noAllowance: boolean
): string {
  if (noAllowance) return "No allowance";
  if (allowance && allowancePeriod) {
    const periodMap: Record<string, string> = {
      MONTH: "Month",
      WEEK: "Week",
      DAY: "Day",
    };
    return `${allowance.toLocaleString()} THB/${periodMap[allowancePeriod] || allowancePeriod}`;
  }
  if (allowance) return `${allowance.toLocaleString()} THB`;
  return "Not specified";
}

function formatWorkplaceType(value: "ON_SITE" | "HYBRID" | "REMOTE"): string {
  const workplaceTypeMap: Record<string, string> = {
    ON_SITE: "On-site",
    HYBRID: "Hybrid",
    REMOTE: "Remote",
  };
  return workplaceTypeMap[value] || "On-site";
}

// Create Job Post
jobPostsRouter.post("/job-posts", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  const {
    jobTitle,
    locationProvince,
    locationDistrict,
    jobType,
    positionsAvailable,
    gpa,
    workplaceType, // 'on-site' | 'hybrid' | 'remote'
    allowance,
    allowancePeriod, // 'Month' | 'Week' | 'Day'
    noAllowance,
    jobPostStatus, // 'urgent' | 'not-urgent'
    jobDescription,
    jobSpecification,
    screeningQuestions,
    rejectionMessage,
    state, // Optional: 'DRAFT' | 'PUBLISHED' | 'CLOSED', defaults to 'DRAFT'
  } = req.body;

  try {
    // Get company profile
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found. Please complete your profile first." });
    }

    // Map frontend workplaceType to database enum
    const workplaceTypeMap: Record<string, "ON_SITE" | "HYBRID" | "REMOTE"> = {
      "on-site": "ON_SITE",
      "hybrid": "HYBRID",
      "remote": "REMOTE",
    };

    // Map frontend allowancePeriod to database enum
    const allowancePeriodMap: Record<string, "MONTH" | "WEEK" | "DAY"> = {
      Month: "MONTH",
      Week: "WEEK",
      Day: "DAY",
    };

    // Map frontend jobPostStatus to database enum
    const jobPostStatusMap: Record<string, "URGENT" | "NOT_URGENT"> = {
      urgent: "URGENT",
      "not-urgent": "NOT_URGENT",
    };

    // Map frontend state to database enum
    const stateMap: Record<string, "DRAFT" | "PUBLISHED" | "CLOSED"> = {
      DRAFT: "DRAFT",
      PUBLISHED: "PUBLISHED",
      CLOSED: "CLOSED",
      draft: "DRAFT",
      published: "PUBLISHED",
      closed: "CLOSED",
    };
    const jobPostState = state && stateMap[state] ? stateMap[state] : "DRAFT";

    // Create job post
    const jobPost = await prisma.jobPost.create({
      data: {
        id: randomUUID(),
        companyId: companyProfile.id,
        jobTitle: jobTitle || "",
        locationProvince: locationProvince || null,
        locationDistrict: locationDistrict || null,
        jobType: jobType || null,
        positionsAvailable:
          positionsAvailable !== undefined && positionsAvailable !== null && positionsAvailable !== ""
            ? Number(positionsAvailable)
            : null,
        gpa: typeof gpa === "string" && gpa.trim() ? gpa.trim() : null,
        workplaceType: workplaceTypeMap[workplaceType] || "ON_SITE",
        allowance: noAllowance ? null : (allowance ? parseFloat(allowance) : null),
        allowancePeriod: noAllowance ? null : (allowancePeriod ? allowancePeriodMap[allowancePeriod] : null),
        noAllowance: noAllowance || false,
        jobPostStatus: jobPostStatusMap[jobPostStatus] || "NOT_URGENT",
        jobDescription: jobDescription || null,
        jobSpecification: jobSpecification || null,
        rejectionMessage: rejectionMessage || null,
        state: jobPostState, // Use mapped state, defaults to DRAFT if not provided or invalid
      },
    });

    // Create screening questions if provided
    if (Array.isArray(screeningQuestions) && screeningQuestions.length > 0) {
      for (let i = 0; i < screeningQuestions.length; i++) {
        const question = screeningQuestions[i];
        
        // Map frontend questionType to database enum
        const questionTypeMap: Record<string, "TEXT" | "MULTIPLE_CHOICE"> = {
          text: "TEXT",
          "multiple-choice": "MULTIPLE_CHOICE",
        };

        const screeningQuestion = await prisma.screeningQuestion.create({
          data: {
            id: randomUUID(),
            jobPostId: jobPost.id,
            question: question.question || "",
            questionType: questionTypeMap[question.questionType] || "TEXT",
            idealAnswer: question.idealAnswer || null,
            automaticRejection: question.automaticRejection || false,
            order: i + 1,
          },
        });

        // Create choices for multiple-choice questions
        if (question.questionType === "multiple-choice" && Array.isArray(question.choices) && question.choices.length > 0) {
          for (let j = 0; j < question.choices.length; j++) {
            await prisma.screeningQuestionChoice.create({
              data: {
                id: randomUUID(),
                questionId: screeningQuestion.id,
                choice: question.choices[j] || "",
                order: j + 1,
              },
            });
          }
        }
      }
    }

    // Return the created job post with related data
    const createdJobPost = await prisma.jobPost.findUnique({
      where: { id: jobPost.id },
      include: {
        ScreeningQuestions: {
          include: {
            Choices: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        Company: {
          select: {
            companyName: true,
            logoURL: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      jobPost: createdJobPost,
    });
  } catch (error: any) {
    console.error("Error creating job post:", error);
    return res.status(500).json({
      error: error.message || "Failed to create job post",
    });
  }
});

// Get public job posts (must be before /job-posts/:id to avoid route conflicts)
jobPostsRouter.get("/job-posts/public", async (req, res) => {
  try {
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        state: "PUBLISHED", // Only show published job posts
      },
      include: {
        Company: {
          select: {
            companyName: true,
            logoURL: true,
          },
        },
      },
      orderBy: [
        { jobPostStatus: "asc" }, // URGENT first
        { createdAt: "desc" }, // Then newest first
      ],
    });

    // Format job posts for frontend
    const formattedJobPosts = jobPosts.map((post) => {
      // Format allowance
      const allowanceStr = formatAllowance(post.allowance, post.allowancePeriod, post.noAllowance);

      // Format location
      const locationParts = [post.locationDistrict, post.locationProvince].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not specified";

      // Format posted date
      const postedDate = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Date not available";
      // Extract company logo initials from company name if logoURL is an image
      const companyName = post.Company?.companyName || "Company Name";
      let companyLogo = "TRINITY"; // Default fallback
      
      if (post.Company?.logoURL) {
        // Check if logoURL is a base64 image or image URL
        if (post.Company.logoURL.startsWith("data:image") || 
            post.Company.logoURL.startsWith("http") ||
            post.Company.logoURL.includes("base64")) {
          // Extract initials from company name (first 7 characters max, uppercase)
          companyLogo = companyName.substring(0, 7).toUpperCase().replace(/\s+/g, "");
        } else {
          // Use logoURL as-is if it's just text
          companyLogo = post.Company.logoURL;
        }
      } else if (companyName) {
        // Extract initials from company name if no logoURL
        companyLogo = companyName.substring(0, 7).toUpperCase().replace(/\s+/g, "");
      }

      return {
        id: post.id,
        jobTitle: post.jobTitle || "Untitled Job",
        companyName,
        companyLogo,
        location,
        workType: formatWorkplaceType(post.workplaceType),
        jobType: post.jobType || "internship",
        seniorityLevel: "student", // Default, can be enhanced later
        field: "IT&Software", // Default, can be enhanced later
        positions: post.positionsAvailable || 1,
        allowance: allowanceStr,
        skills: [], // Can be enhanced later if skills are stored
        postedDate,
        jobDescription: post.jobDescription || "",
        jobSpecification: post.jobSpecification || "",
        isUrgent: post.jobPostStatus === "URGENT",
      };
    });

    return res.json({ jobPosts: formattedJobPosts });
  } catch (error: any) {
    console.error("Error fetching public job posts:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch public job posts",
    });
  }
});

jobPostsRouter.get("/job-posts/public/:id", async (req, res) => {
  const id = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
  if (!id) return res.status(400).json({ error: "Job post ID is required" });

  try {
    const jobPost = await prisma.jobPost.findFirst({
      where: {
        id,
        state: "PUBLISHED",
      },
      include: {
        Company: {
          include: {
            User: { select: { email: true } },
            CompanyEmails: { select: { email: true }, take: 1 },
            CompanyPhones: { select: { phone: true }, take: 1 },
            Province: { select: { name: true } },
            District: { select: { name: true, postalCode: true } },
            Subdistrict: { select: { name: true } },
          },
        },
      },
    });

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    const companyName = jobPost.Company?.companyName || "Company Name";
    const companyEmail =
      jobPost.Company?.CompanyEmails[0]?.email ||
      jobPost.Company?.User?.email ||
      "info@example.com";
    const companyLogo = jobPost.Company?.logoURL || companyName.substring(0, 7).toUpperCase().replace(/\s+/g, "");
    const location = [jobPost.locationDistrict, jobPost.locationProvince].filter(Boolean).join(", ") || "Location not specified";
    const address = [
      jobPost.Company?.addressDetails,
      jobPost.Company?.Subdistrict?.name,
      jobPost.Company?.District?.name,
      jobPost.Company?.Province?.name,
      jobPost.Company?.postcode || jobPost.Company?.District?.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || "Address not specified";

    return res.json({
      jobPost: {
        id: jobPost.id,
        state: jobPost.state,
        postedDate: new Date(jobPost.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        jobTitle: jobPost.jobTitle,
        companyName,
        companyEmail,
        companyLogo,
        workType: formatWorkplaceType(jobPost.workplaceType),
        roleType: jobPost.jobType ? jobPost.jobType.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Internship",
        positionsAvailable: jobPost.positionsAvailable || 1,
        jobDescription: jobPost.jobDescription ? jobPost.jobDescription.split("\n").map((line) => line.trim()).filter(Boolean) : [],
        qualifications: jobPost.jobSpecification ? jobPost.jobSpecification.split("\n").map((line) => line.trim()).filter(Boolean) : [],
        gpa: jobPost.gpa || "Not specified",
        allowance: formatAllowance(jobPost.allowance, jobPost.allowancePeriod, jobPost.noAllowance),
        location,
        workingDaysHours: "Not specified",
        companyDescription: jobPost.Company?.about || "No company description available.",
        contactPhone: jobPost.Company?.CompanyPhones[0]?.phone || "Not specified",
        contactDepartment: jobPost.Company?.recruiterPosition || jobPost.Company?.recruiterName || "Hiring Team",
        address,
        mapEmbedUrl: "",
      },
    });
  } catch (error: any) {
    console.error("Error fetching public job post detail:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch job post detail",
    });
  }
});

// Get all job posts for a company
jobPostsRouter.get("/job-posts", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const jobPosts = await prisma.jobPost.findMany({
      where: { companyId: companyProfile.id },
      include: {
        ScreeningQuestions: {
          include: {
            Choices: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ jobPosts });
  } catch (error: any) {
    console.error("Error fetching job posts:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch job posts",
    });
  }
});

// Get a single job post by ID
jobPostsRouter.get("/job-posts/:id", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const id = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const jobPost = await prisma.jobPost.findFirst({
      where: {
        id,
        companyId: companyProfile.id, // Ensure the job post belongs to the company
      },
      include: {
        ScreeningQuestions: {
          include: {
            Choices: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        Company: {
          select: {
            companyName: true,
            logoURL: true,
          },
        },
      },
    });

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    return res.json({ jobPost });
  } catch (error: any) {
    console.error("Error fetching job post:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch job post",
    });
  }
});

// Update job post
jobPostsRouter.put("/job-posts/:id", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const id = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    // Verify job post belongs to company
    const existingJobPost = await prisma.jobPost.findFirst({
      where: {
        id,
        companyId: companyProfile.id,
      },
    });

    if (!existingJobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    const {
      jobTitle,
      locationProvince,
      locationDistrict,
      jobType,
      positionsAvailable,
      gpa,
      workplaceType,
      allowance,
      allowancePeriod,
      noAllowance,
      jobPostStatus,
      jobDescription,
      jobSpecification,
      rejectionMessage,
      state,
      screeningQuestions,
    } = req.body;

    // Map enums
    const workplaceTypeMap: Record<string, "ON_SITE" | "HYBRID" | "REMOTE"> = {
      "on-site": "ON_SITE",
      "hybrid": "HYBRID",
      "remote": "REMOTE",
    };

    const allowancePeriodMap: Record<string, "MONTH" | "WEEK" | "DAY"> = {
      Month: "MONTH",
      Week: "WEEK",
      Day: "DAY",
    };

    const jobPostStatusMap: Record<string, "URGENT" | "NOT_URGENT"> = {
      urgent: "URGENT",
      "not-urgent": "NOT_URGENT",
    };

    // Map frontend state to database enum
    const stateMap: Record<string, "DRAFT" | "PUBLISHED" | "CLOSED"> = {
      DRAFT: "DRAFT",
      PUBLISHED: "PUBLISHED",
      CLOSED: "CLOSED",
      draft: "DRAFT",
      published: "PUBLISHED",
      closed: "CLOSED",
    };

    // Update job post
    const updateData: any = {};
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (locationProvince !== undefined) updateData.locationProvince = locationProvince;
    if (locationDistrict !== undefined) updateData.locationDistrict = locationDistrict;
    if (jobType !== undefined) updateData.jobType = jobType;
    if (positionsAvailable !== undefined) {
      updateData.positionsAvailable =
        positionsAvailable !== null && positionsAvailable !== ""
          ? Number(positionsAvailable)
          : null;
    }
    if (gpa !== undefined) {
      updateData.gpa = typeof gpa === "string" && gpa.trim() ? gpa.trim() : null;
    }
    if (workplaceType !== undefined) updateData.workplaceType = workplaceTypeMap[workplaceType] || "ON_SITE";
    if (noAllowance !== undefined) {
      updateData.noAllowance = noAllowance;
      updateData.allowance = noAllowance ? null : (allowance ? parseFloat(allowance) : null);
      updateData.allowancePeriod = noAllowance ? null : (allowancePeriod ? allowancePeriodMap[allowancePeriod] : null);
    } else {
      if (allowance !== undefined) updateData.allowance = allowance ? parseFloat(allowance) : null;
      if (allowancePeriod !== undefined) updateData.allowancePeriod = allowancePeriod ? allowancePeriodMap[allowancePeriod] : null;
    }
    if (jobPostStatus !== undefined) updateData.jobPostStatus = jobPostStatusMap[jobPostStatus] || "NOT_URGENT";
    if (jobDescription !== undefined) updateData.jobDescription = jobDescription;
    if (jobSpecification !== undefined) updateData.jobSpecification = jobSpecification;
    if (rejectionMessage !== undefined) updateData.rejectionMessage = rejectionMessage;
    if (state !== undefined) {
      updateData.state = stateMap[state] || state; // Use mapped state if available, otherwise use the provided value
    }

    const updatedJobPost = await prisma.jobPost.update({
      where: { id },
      data: updateData,
    });

    // Update screening questions if provided
    if (Array.isArray(screeningQuestions)) {
      // Delete existing questions and choices
      await prisma.screeningQuestionChoice.deleteMany({
        where: {
          Question: {
            jobPostId: id,
          },
        },
      });
      await prisma.screeningQuestion.deleteMany({
        where: { jobPostId: id },
      });

      // Create new questions
      for (let i = 0; i < screeningQuestions.length; i++) {
        const question = screeningQuestions[i];
        const questionTypeMap: Record<string, "TEXT" | "MULTIPLE_CHOICE"> = {
          text: "TEXT",
          "multiple-choice": "MULTIPLE_CHOICE",
        };

        const screeningQuestion = await prisma.screeningQuestion.create({
          data: {
            id: randomUUID(),
            jobPostId: id,
            question: question.question || "",
            questionType: questionTypeMap[question.questionType] || "TEXT",
            idealAnswer: question.idealAnswer || null,
            automaticRejection: question.automaticRejection || false,
            order: i + 1,
          },
        });

        if (question.questionType === "multiple-choice" && Array.isArray(question.choices) && question.choices.length > 0) {
          for (let j = 0; j < question.choices.length; j++) {
            await prisma.screeningQuestionChoice.create({
              data: {
                id: randomUUID(),
                questionId: screeningQuestion.id,
                choice: question.choices[j] || "",
                order: j + 1,
              },
            });
          }
        }
      }
    }

    const result = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        ScreeningQuestions: {
          include: {
            Choices: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        Company: {
          select: {
            companyName: true,
            logoURL: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      jobPost: result,
    });
  } catch (error: any) {
    console.error("Error updating job post:", error);
    return res.status(500).json({
      error: error.message || "Failed to update job post",
    });
  }
});

// Delete job post
jobPostsRouter.delete("/job-posts/:id", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const id = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    // Verify job post belongs to company
    const jobPost = await prisma.jobPost.findFirst({
      where: {
        id,
        companyId: companyProfile.id,
      },
    });

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    // Delete will cascade to screening questions and choices
    await prisma.jobPost.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting job post:", error);
    return res.status(500).json({
      error: error.message || "Failed to delete job post",
    });
  }
});

// Public endpoint moved to top of file (before /job-posts/:id) to avoid route conflicts

// Candidate applies to a job post
jobPostsRouter.post("/job-posts/:id/apply", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const jobPostId = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
  if (!jobPostId) return res.status(400).json({ error: "id is required" });

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!candidate) return res.status(404).json({ error: "Candidate profile not found" });

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobPostId },
      select: { id: true, state: true },
    });
    if (!jobPost) return res.status(404).json({ error: "Job post not found" });
    if (jobPost.state !== "PUBLISHED") {
      return res.status(400).json({ error: "Job post is not accepting applications" });
    }

    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobPostId_candidateId: { jobPostId, candidateId: candidate.id },
      },
      select: { id: true, status: true, createdAt: true },
    });
    if (existing) {
      return res.status(200).json({
        application: {
          id: existing.id,
          status: existing.status,
          createdAt: existing.createdAt,
        },
        alreadyApplied: true,
      });
    }

    const application = await prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        jobPostId,
        candidateId: candidate.id,
        status: "NEW",
        updatedAt: new Date(),
      },
      select: { id: true, status: true, createdAt: true },
    });

    return res.status(201).json({ application, alreadyApplied: false });
  } catch (error: any) {
    console.error("Error applying to job post:", error);
    return res.status(500).json({ error: error.message || "Failed to apply to job post" });
  }
});

// Company views applicants for their job post
jobPostsRouter.get("/job-posts/:id/applicants", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const jobPostId = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
  if (!jobPostId) return res.status(400).json({ error: "id is required" });

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
      select: { id: true, companyName: true },
    });
    if (!companyProfile) return res.status(404).json({ error: "Company profile not found" });

    const jobPost = await prisma.jobPost.findFirst({
      where: { id: jobPostId, companyId: companyProfile.id },
      select: {
        id: true,
        jobTitle: true,
        locationDistrict: true,
        locationProvince: true,
        workplaceType: true,
      },
    });
    if (!jobPost) return res.status(404).json({ error: "Job post not found" });

    const apps = await prisma.jobApplication.findMany({
      where: { jobPostId },
      orderBy: { createdAt: "desc" },
      include: {
        Candidate: {
          include: {
            User: { select: { email: true } },
            UserSkill: { include: { Skills: { select: { name: true } } } },
            CandidateUniversity: {
              include: {
                University: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
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
        },
      },
    });

    const statusMap: Record<string, "new" | "shortlisted" | "reviewed" | "rejected"> = {
      NEW: "new",
      SHORTLISTED: "shortlisted",
      REVIEWED: "reviewed",
      REJECTED: "rejected",
    };

    function initialsFromName(name: string) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0] ?? "?";
      const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
      return (first + (second ?? "")).toUpperCase();
    }

    const applicants = apps.map((a) => {
      const name = a.Candidate.fullName ?? a.Candidate.User.email;
      const skills = a.Candidate.UserSkill.map((us) => us.Skills.name).slice(0, 6);
      const primaryEducation = a.Candidate.CandidateUniversity[0];
      const preferredLocations = a.Candidate.CandidatePreferredProvince.map((entry) => entry.Province.name).filter(Boolean);
      return {
        id: a.id,
        candidateId: a.Candidate.id,
        name,
        email: a.Candidate.contactEmail || a.Candidate.User.email,
        initials: initialsFromName(name),
        appliedDate: relativeDateLabel(a.createdAt),
        status: statusMap[a.status] ?? "new",
        skills,
        appliedAt: a.createdAt,
        internshipPeriod: a.Candidate.internshipPeriod || null,
        preferredPositions: a.Candidate.preferredPositions || [],
        preferredLocations,
        institution: primaryEducation?.University.name || null,
        academicYear: primaryEducation?.yearOfStudy || null,
        fieldOfStudy: primaryEducation?.fieldOfStudy || primaryEducation?.degreeName || null,
      };
    });

    const workType =
      jobPost.workplaceType === "ON_SITE"
        ? "On-site"
        : jobPost.workplaceType === "HYBRID"
        ? "Hybrid"
        : jobPost.workplaceType === "REMOTE"
        ? "Remote"
        : "Not specified";

    const location = [jobPost.locationDistrict, jobPost.locationProvince].filter(Boolean).join(", ");

    return res.json({
      jobPost: {
        id: jobPost.id,
        title: jobPost.jobTitle,
        companyName: companyProfile.companyName,
        location: location ? `- ${location}` : "",
        workType,
      },
      applicants,
    });
  } catch (error: any) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch applicants" });
  }
});

// Company updates an applicant status
jobPostsRouter.patch(
  "/job-posts/:id/applicants/:applicationId",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const jobPostId = typeof (req.params as any).id === "string" ? (req.params as any).id : (req.params as any).id?.[0];
    const applicationId =
      typeof (req.params as any).applicationId === "string"
        ? (req.params as any).applicationId
        : (req.params as any).applicationId?.[0];
    if (!jobPostId || !applicationId) return res.status(400).json({ error: "id and applicationId are required" });
    const { status } = req.body ?? {};

    const statusIn: Record<string, "NEW" | "SHORTLISTED" | "REVIEWED" | "REJECTED"> = {
      new: "NEW",
      shortlisted: "SHORTLISTED",
      reviewed: "REVIEWED",
      rejected: "REJECTED",
    };
    const nextStatus = typeof status === "string" ? statusIn[status] : undefined;
    if (!nextStatus) {
      return res.status(400).json({ error: "status must be one of: new, shortlisted, reviewed, rejected" });
    }

    try {
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!companyProfile) return res.status(404).json({ error: "Company profile not found" });

      const jobPost = await prisma.jobPost.findFirst({
        where: { id: jobPostId, companyId: companyProfile.id },
        select: { id: true },
      });
      if (!jobPost) return res.status(404).json({ error: "Job post not found" });

      const updated = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: nextStatus, updatedAt: new Date() },
        select: { id: true, status: true, createdAt: true },
      });

      return res.json({ application: updated });
    } catch (error: any) {
      console.error("Error updating application status:", error);
      return res.status(500).json({ error: error.message || "Failed to update application status" });
    }
  }
);
