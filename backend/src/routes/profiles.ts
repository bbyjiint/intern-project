import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const profilesRouter = Router();

// Candidate Profile Get
profilesRouter.get("/candidates/profile", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        User: { select: { email: true } },
        CandidateUniversity: {
          include: { University: { select: { name: true } } },
          orderBy: [{ isCurrent: "desc" }, { endDate: "desc" }],
        },
        WorkHistory: {
          orderBy: { startDate: "desc" },
        },
        UserSkill: {
          include: { Skills: { select: { name: true } } },
        },
      },
    });

    if (!candidateProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Transform database data to match frontend format
    const profileData = {
      fullName: candidateProfile.fullName || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      aboutYou: candidateProfile.bio || null,
      professionalSummary: candidateProfile.bio || null,
      location: null, // Not stored in CandidateProfile currently
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University.name,
        degree: cu.degreeName || "",
        startDate: cu.startDate ? cu.startDate.toISOString().split("T")[0] : "",
        endDate: cu.endDate ? cu.endDate.toISOString().split("T")[0] : "",
        startYear: cu.startDate ? cu.startDate.getFullYear().toString() : "",
        endYear: cu.endDate ? cu.endDate.getFullYear().toString() : "",
        gpa: cu.gpa ? cu.gpa.toString() : null,
        coursework: [],
        achievements: [],
      })),
      experience: candidateProfile.WorkHistory.map((wh) => ({
        id: wh.id,
        position: wh.position || "",
        companyName: wh.companyName || "",
        company: wh.companyName || "",
        title: wh.position || "",
        startDate: wh.startDate ? wh.startDate.toISOString().split("T")[0] : "",
        endDate: wh.endDate ? wh.endDate.toISOString().split("T")[0] : "",
        description: wh.description || "",
        department: null,
        manager: null,
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
          category: "technical", // Default, you might want to add this to the schema
        };
      }),
      projects: [], // Projects might need a separate table
    };

    return res.json({ profile: profileData });
  } catch (error: any) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// Candidate Profile Update
profilesRouter.put("/candidates/profile", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const {
    fullName,
    location,
    email,
    phoneNumber,
    aboutYou,
    professionalSummary,
    education,
    experience,
    skills,
  } = req.body ?? {};

  try {
    // Get or create candidate profile
    let candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    const bio = aboutYou || professionalSummary || null;
    const contactEmail = email || null;
    const phone = phoneNumber || null;

    if (candidateProfile) {
      // Update existing profile
      candidateProfile = await prisma.candidateProfile.update({
        where: { userId },
        data: {
          ...(fullName && { fullName }),
          ...(contactEmail && { contactEmail }),
          ...(phone && { phoneNumber: phone }),
          ...(bio && { bio }),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      candidateProfile = await prisma.candidateProfile.create({
        data: {
          id: randomUUID(),
          userId,
          ...(fullName && { fullName }),
          ...(contactEmail && { contactEmail }),
          ...(phone && { phoneNumber: phone }),
          ...(bio && { bio }),
          updatedAt: new Date(),
        },
      });
    }

    // Handle education (CandidateUniversity)
    if (Array.isArray(education) && education.length > 0) {
      // Delete existing education entries
      await prisma.candidateUniversity.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new education entries
      for (const edu of education) {
        if (edu.university && edu.degree) {
          // Find or create university (simplified - you might want to use a lookup)
          let university = await prisma.university.findFirst({
            where: { name: { contains: edu.university, mode: "insensitive" } },
          });

          if (!university) {
            // Create university if not found (you might want to handle this differently)
            university = await prisma.university.create({
              data: {
                id: randomUUID(),
                name: edu.university,
              },
            });
          }

          await prisma.candidateUniversity.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              universityId: university.id,
              educationLevel: "BACHELOR", // Default, you might want to map this
              degreeName: edu.degree || edu.fieldOfStudy || null,
              startDate: edu.startYear ? new Date(`${edu.startYear}-01-01`) : null,
              endDate: edu.endYear ? new Date(`${edu.endYear}-12-31`) : null,
              isCurrent: !edu.endYear || false,
            },
          });
        }
      }
    }

    // Handle work experience (WorkHistory)
    if (Array.isArray(experience) && experience.length > 0) {
      // Delete existing work history
      await prisma.workHistory.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new work history entries
      for (const exp of experience) {
        if (exp.company && exp.title) {
          await prisma.workHistory.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              companyName: exp.company,
              position: exp.title,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description || null,
            },
          });
        }
      }
    }

    // Handle skills (UserSkill)
    if (Array.isArray(skills) && skills.length > 0) {
      // Delete existing skills
      await prisma.userSkill.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new skills
      for (const skill of skills) {
        if (skill.name) {
          // Find or create skill
          let skillRecord = await prisma.skills.findUnique({
            where: { name: skill.name },
          });

          if (!skillRecord) {
            skillRecord = await prisma.skills.create({
              data: {
                id: randomUUID(),
                name: skill.name,
              },
            });
          }

          // Map level to rating (beginner=1, intermediate=2, advanced=3)
          const ratingMap: Record<string, number> = {
            beginner: 1,
            intermediate: 2,
            advanced: 3,
          };

          await prisma.userSkill.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              skillId: skillRecord.id,
              rating: ratingMap[skill.level] || null,
            },
          });
        }
      }
    }

    return res.json({ success: true, profile: candidateProfile });
  } catch (error: any) {
    console.error("Error updating candidate profile:", error);
    return res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

// Company Profile Get
profilesRouter.get("/companies/profile", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  try {
    console.log("Fetching company profile for userId:", userId);
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        User: { select: { email: true } },
        CompanyEmails: { select: { email: true } },
        CompanyPhones: { select: { phone: true } },
      },
    });

    console.log("Company profile found:", companyProfile ? "Yes" : "No");
    if (companyProfile) {
      console.log("Company name:", companyProfile.companyName);
      console.log("Company emails:", companyProfile.CompanyEmails);
      console.log("Company phones:", companyProfile.CompanyPhones);
    }

    if (!companyProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Parse location string back into components (if stored as comma-separated)
    // Note: The location is stored as a single string, so we'll try to parse it
    // Handle both comma-separated and other formats
    let addressDetails = "";
    let subDistrict = "";
    let district = "";
    let province = companyProfile.province || "";
    let postcode = "";
    
    if (companyProfile.location) {
      const locationParts = companyProfile.location.split(", ");
      if (locationParts.length > 0) {
        addressDetails = locationParts[0] || "";
        subDistrict = locationParts[1] || "";
        district = locationParts[2] || "";
        if (!province && locationParts[3]) {
          province = locationParts[3];
        }
        postcode = locationParts[4] || "";
      } else {
        // If not comma-separated, use the whole location as addressDetails
        addressDetails = companyProfile.location;
      }
    }

    // Transform database data to match frontend format
    const profileData = {
      companyName: companyProfile.companyName || "",
      companyDescription: companyProfile.about || "",
      businessType: "", // Not stored in schema currently
      companySize: "", // Not stored in schema currently
      addressDetails,
      subDistrict,
      district,
      province,
      postcode,
      phoneNumber: companyProfile.CompanyPhones[0]?.phone || "",
      email: companyProfile.CompanyEmails[0]?.email || companyProfile.User.email,
      websiteUrl: "", // Not stored in schema currently
      contactName: companyProfile.recruiterName || "",
    };

    // Always return profile data if profile exists, even if some fields are empty
    return res.json({ profile: profileData });
  } catch (error: any) {
    console.error("Error fetching company profile:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// Company Profile Update
profilesRouter.put("/companies/profile", requireAuth, requireRole("COMPANY"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const {
    companyName,
    companyDescription,
    addressDetails,
    subDistrict,
    district,
    province,
    postcode,
    phoneNumber,
    email,
    websiteUrl,
    contactName,
  } = req.body ?? {};

  try {
    // Get or create company profile
    let companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    const location = addressDetails
      ? [addressDetails, subDistrict, district, province, postcode].filter(Boolean).join(", ")
      : null;

    if (companyProfile) {
      // Update existing profile
      companyProfile = await prisma.companyProfile.update({
        where: { userId },
        data: {
          companyName: companyName || companyProfile.companyName,
          about: companyDescription || undefined,
          location,
          province: province || undefined,
          recruiterName: contactName || undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      companyProfile = await prisma.companyProfile.create({
        data: {
          id: randomUUID(),
          userId,
          companyName: companyName || "Company",
          about: companyDescription || undefined,
          location,
          province: province || undefined,
          recruiterName: contactName || undefined,
          updatedAt: new Date(),
        },
      });
    }

    // Handle company email
    if (email) {
      // Delete existing emails
      await prisma.companyEmail.deleteMany({
        where: { companyId: companyProfile.id },
      });

      // Create new email
      await prisma.companyEmail.create({
        data: {
          id: randomUUID(),
          companyId: companyProfile.id,
          email,
        },
      });
    }

    // Handle company phone
    if (phoneNumber) {
      // Delete existing phones
      await prisma.companyPhone.deleteMany({
        where: { companyId: companyProfile.id },
      });

      // Create new phone
      await prisma.companyPhone.create({
        data: {
          id: randomUUID(),
          companyId: companyProfile.id,
          phone: phoneNumber,
        },
      });
    }

    return res.json({ success: true, profile: companyProfile });
  } catch (error: any) {
    console.error("Error updating company profile:", error);
    return res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});
