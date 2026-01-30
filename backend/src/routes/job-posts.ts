import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const jobPostsRouter = Router();

// Create Job Post
jobPostsRouter.post("/job-posts", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  const {
    jobTitle,
    locationProvince,
    locationDistrict,
    jobType,
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

    // Create job post
    const jobPost = await prisma.jobPost.create({
      data: {
        id: randomUUID(),
        companyId: companyProfile.id,
        jobTitle: jobTitle || "",
        locationProvince: locationProvince || null,
        locationDistrict: locationDistrict || null,
        jobType: jobType || null,
        workplaceType: workplaceTypeMap[workplaceType] || "ON_SITE",
        allowance: noAllowance ? null : (allowance ? parseFloat(allowance) : null),
        allowancePeriod: noAllowance ? null : (allowancePeriod ? allowancePeriodMap[allowancePeriod] : null),
        noAllowance: noAllowance || false,
        jobPostStatus: jobPostStatusMap[jobPostStatus] || "NOT_URGENT",
        jobDescription: jobDescription || null,
        jobSpecification: jobSpecification || null,
        rejectionMessage: rejectionMessage || null,
        state: state || "DRAFT", // Default to DRAFT, can be changed to PUBLISHED
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
  const { id } = req.params;

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
  const { id } = req.params;

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

    // Update job post
    const updateData: any = {};
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (locationProvince !== undefined) updateData.locationProvince = locationProvince;
    if (locationDistrict !== undefined) updateData.locationDistrict = locationDistrict;
    if (jobType !== undefined) updateData.jobType = jobType;
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
    if (state !== undefined) updateData.state = state;

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
  const { id } = req.params;

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
