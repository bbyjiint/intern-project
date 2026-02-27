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
        UserProjects: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!candidateProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Transform database data to match frontend format
    // Response schema matches what PUT endpoint accepts
    const profileData = {
      fullName: candidateProfile.fullName || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      aboutYou: candidateProfile.bio || null,
      professionalSummary: candidateProfile.bio || null,
      profileImage: candidateProfile.profileImage || null,
      location: null, // Not stored in CandidateProfile currently
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University.name,
        degree: cu.degreeName || "",
        startDate: cu.startDate ? cu.startDate.toISOString().split("T")[0] : "",
        endDate: cu.endDate ? cu.endDate.toISOString().split("T")[0] : "",
        startYear: cu.startDate ? cu.startDate.getFullYear().toString() : "",
        endYear: cu.isCurrent ? null : (cu.endDate ? cu.endDate.getFullYear().toString() : null),
        gpa: cu.gpa ? cu.gpa.toString() : null,
        // Note: coursework and achievements are not stored in schema currently
        // TODO: Add fields to CandidateUniversity model if needed
      })),
      experience: candidateProfile.WorkHistory.map((wh) => ({
        id: wh.id,
        title: wh.position || "",
        company: wh.companyName || "",
        startDate: wh.startDate ? wh.startDate.toISOString().split("T")[0] : "",
        endDate: wh.endDate ? wh.endDate.toISOString().split("T")[0] : null,
        description: wh.description || "",
        // Note: department and manager are not stored in WorkHistory schema
        // TODO: Add fields to WorkHistory model if needed
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
          // Note: category and usedIn are not stored in UserSkill schema
          // TODO: Add category field to UserSkill model and junction tables for usedIn if needed
        };
      }),
      projects: candidateProfile.UserProjects.map((project) => ({
        id: project.id,
        name: project.name || "",
        role: project.role || "",
        description: project.description || "",
      })),
    };

    return res.json({ profile: profileData });
  } catch (error: any) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// Candidate Profile Update
// Accepts: { fullName, email, phoneNumber, aboutYou, professionalSummary, profileImage, education[], experience[], skills[], projects[] }
// Ignores: location (not in schema)
profilesRouter.put("/candidates/profile", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const {
    fullName,
    email,
    phoneNumber,
    aboutYou,
    professionalSummary,
    profileImage,
    education,
    experience,
    skills,
    projects,
    // Note: location is ignored (not in CandidateProfile schema)
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
          ...(profileImage && { profileImage }),
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
          ...(profileImage && { profileImage }),
          updatedAt: new Date(),
        },
      });
    }

    // Handle education (CandidateUniversity)
    // Accepts: { university, degree/fieldOfStudy, startYear, endYear }
    // If endYear is empty/null → treat as current (isCurrent = true, endDate = null)
    if (Array.isArray(education) && education.length > 0) {
      console.log("Processing education data:", JSON.stringify(education, null, 2));
      
      // Delete existing education entries
      await prisma.candidateUniversity.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new education entries
      for (const edu of education) {
        // Support both 'university' and 'institution' field names from frontend
        const universityName = edu.university || edu.institution;
        
        if (universityName && (edu.degree || edu.fieldOfStudy)) {
          // Find university by exact name match (since we're using dropdown now)
          let university = await prisma.university.findFirst({
            where: { name: { equals: universityName, mode: "insensitive" } },
          });

          if (!university) {
            // Fallback: try contains match for backward compatibility
            university = await prisma.university.findFirst({
              where: { name: { contains: universityName, mode: "insensitive" } },
            });
          }

          if (!university) {
            console.warn(`University not found: ${universityName}, creating new entry`);
            // Only create if not found - this shouldn't happen with dropdown, but keep for safety
            university = await prisma.university.create({
              data: {
                id: randomUUID(),
                name: universityName,
              },
            });
          }

          // Handle endYear: if empty/null/undefined/empty string → current education
          const endYearStr = edu.endYear ? String(edu.endYear).trim() : "";
          const hasEndYear = endYearStr !== "" && endYearStr !== "null" && endYearStr !== "undefined";
          const isCurrent = !hasEndYear;

          const degreeName = (edu.degree && edu.degree.trim()) ? edu.degree : (edu.fieldOfStudy || null);

          // NOTE: Do NOT write education details back into CandidateProfile.
          // CandidateProfile should not store education details; they live in CandidateUniversity.
          const educationRecord = await prisma.candidateUniversity.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              universityId: university.id,
              educationLevel: "BACHELOR", // Default, you might want to map this
              degreeName: degreeName,
              startDate: edu.startYear ? new Date(`${edu.startYear}-01-01`) : null,
              endDate: hasEndYear ? new Date(`${edu.endYear}-12-31`) : null,
              isCurrent: isCurrent,
              gpa: edu.gpa ? parseFloat(String(edu.gpa)) : null,
            },
          });
          
          console.log(`Created education record: ${educationRecord.id} for university: ${university.name}`);
        } else {
          console.warn("Skipping education entry - missing required fields:", {
            university: universityName,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
          });
        }
      }
    }

    // Handle work experience (WorkHistory)
    // Accepts: { title, company, startDate, endDate, description }
    // Ignores: department, manager (not in schema)
    if (Array.isArray(experience) && experience.length > 0) {
      // Delete existing work history
      await prisma.workHistory.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new work history entries
      for (const exp of experience) {
        // Only process if required fields are present
        if (exp.company && exp.title) {
          // If endDate is null or "Present", treat as current position
          let endDateValue: Date | null = null;
          if (exp.endDate && exp.endDate !== "Present" && exp.endDate !== "") {
            try {
              endDateValue = new Date(exp.endDate);
            } catch (e) {
              // Invalid date, treat as null (current position)
              endDateValue = null;
            }
          }

          await prisma.workHistory.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              companyName: exp.company,
              position: exp.title,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: endDateValue,
              description: exp.description || null,
              // Note: department and manager fields are ignored (not in WorkHistory schema)
            },
          });
        }
      }
    }

    // Handle skills (UserSkill)
    // Accepts: { name, level }
    // Ignores: category, usedIn (not in schema)
    if (Array.isArray(skills) && skills.length > 0) {
      // Delete existing skills
      await prisma.userSkill.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new skills
      for (const skill of skills) {
        // Only process if name is present
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
              // Note: category and usedIn fields are ignored (not in UserSkill schema)
              // TODO: Add category field to UserSkill model and junction tables for usedIn if needed
            },
          });
        }
      }
    }

    // Handle projects (UserProjects)
    // Accepts: { name, role, description }
    if (Array.isArray(projects) && projects.length >= 0) {
      // Delete existing projects
      await prisma.userProjects.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new projects
      for (const project of projects) {
        // Only process if required fields are present
        if (project.name && project.role) {
          await prisma.userProjects.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              name: project.name,
              role: project.role,
              description: project.description || "",
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
      profileImage: companyProfile.logoURL || "",
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
    profileImage,
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
          ...(profileImage && { logoURL: profileImage }),
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
          ...(profileImage && { logoURL: profileImage }),
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