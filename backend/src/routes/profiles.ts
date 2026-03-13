import multer from "multer"
import fs from "fs"
import { fileStorage } from "../utils/fileStorage"
import { Router } from "express";
import prisma from "../utils/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { randomUUID } from "crypto";

export const profilesRouter = Router();

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

function yearStringFromDateLike(value: unknown): string {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : raw;
}

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
          orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
        },
        WorkHistory: {
          orderBy: { startDate: "desc" },
        },
        UserSkill: {
          select: {
            rating: true,
            category: true,
            Skills: {
              select: { name: true }
            }
          }
        },
        UserProjects: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!candidateProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get preferred provinces
    const preferredProvinces = await prisma.candidatePreferredProvince.findMany({
      where: { candidateId: candidateProfile.id },
      include: { Province: { select: { id: true, name: true, thname: true } } },
    });

    // Transform database data to match frontend format
    // Response schema matches what PUT endpoint accepts
    const profileData = {
      fullName: candidateProfile.fullName || null,
      email: candidateProfile.contactEmail || candidateProfile.User.email,
      phoneNumber: candidateProfile.phoneNumber || null,
      gender: candidateProfile.gender || null,
      nationality: candidateProfile.nationality || null,
      internshipPeriod: candidateProfile.internshipPeriod || null,
      dateOfBirth: candidateProfile.dateOfBirth ? candidateProfile.dateOfBirth.toISOString().split("T")[0] : null,
      aboutYou: candidateProfile.bio || null,
      professionalSummary: candidateProfile.bio || null,
      description: candidateProfile.description || null,
      profileImage: candidateProfile.profileImage || null,
      positionsOfInterest: candidateProfile.preferredPositions || [],
      preferredLocations: preferredProvinces.map((pp) => pp.Province?.id).filter(Boolean) as string[],
      location: null, // Not stored in CandidateProfile currently
      education: candidateProfile.CandidateUniversity.map((cu) => ({
        id: cu.id,
        university: cu.University?.name || "Unknown University",
        educationLevel: cu.educationLevel,
        degree: cu.degreeName || "",
        fieldOfStudy: cu.fieldOfStudy || "",
        yearOfStudy: cu.yearOfStudy || "",
        isCurrent: cu.isCurrent,
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
          name: us.Skills?.name || "Unknown Skill",
          level: ratingMap[us.rating || 1] || "beginner",
          category: us.category
        };
      }),
      projects: candidateProfile.UserProjects.map((project) => ({
        id: project.id,
        name: project.name || "",
        role: project.role || "",
        description: project.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        relatedSkills: project.relatedSkills || [],
        githubUrl: project.githubUrl || "",
        projectUrl: project.projectUrl || "",
        fileUrl: project.fileUrl || "",
        fileName: project.fileName || "",
      })),
    };

    return res.json({ profile: profileData });
  } catch (error: any) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// Candidate Profile Update
// Accepts: { fullName, email, phoneNumber, dateOfBirth, aboutYou, professionalSummary, description, profileImage, positionsOfInterest[], preferredLocations[], education[], experience[], skills[], projects[] }
profilesRouter.put("/candidates/profile", requireAuth, requireRole("CANDIDATE"), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const {
    fullName,
    email,
    phoneNumber,
    dateOfBirth,
    aboutYou,
    professionalSummary,
    description,
    profileImage,
    positionsOfInterest,
    preferredLocations,
    education,
    experience,
    skills,
    projects,
    gender,
    nationality,
    internshipPeriod,
  } = req.body ?? {};

  try {
    // Get or create candidate profile
    let candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    const bio = aboutYou || professionalSummary || null;
    const contactEmail = email || null;
    const phone = phoneNumber || null;
    const desc = description || null;
    const preferredPositions = Array.isArray(positionsOfInterest) ? positionsOfInterest : [];
    const dob = dateOfBirth ? new Date(dateOfBirth) : null;

    if (candidateProfile) {
      // Update existing profile
      candidateProfile = await prisma.candidateProfile.update({
        where: { userId },
        data: {
          ...(fullName && { fullName }),
          ...(contactEmail && { contactEmail }),
          ...(phone && { phoneNumber: phone }),
          ...(dob !== null && { dateOfBirth: dob }),
          ...(bio !== null && { bio }),
          ...(desc !== null && { description: desc }),
          ...(profileImage && { profileImage }),
          ...(preferredPositions.length > 0 && { preferredPositions }),
          ...(gender !== undefined && { gender }),
          ...(nationality !== undefined && { nationality }),
          ...(internshipPeriod !== undefined && { internshipPeriod }),
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
          ...(dob !== null && { dateOfBirth: dob }),
          ...(bio !== null && { bio }),
          ...(desc !== null && { description: desc }),
          ...(profileImage && { profileImage }),
          ...(preferredPositions.length > 0 && { preferredPositions }),
          ...(gender !== undefined && { gender }),
          ...(nationality && { nationality }),
          ...(internshipPeriod && { internshipPeriod }),
          updatedAt: new Date(),
        },
      });
    }

    // Handle preferred provinces (CandidatePreferredProvince)
    if (Array.isArray(preferredLocations) && preferredLocations.length > 0) {
      // Delete existing preferred provinces
      await prisma.candidatePreferredProvince.deleteMany({
        where: { candidateId: candidateProfile.id },
      });

      // Create new preferred province entries
      for (const provinceValue of preferredLocations) {
        if (provinceValue && typeof provinceValue === "string") {

          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(provinceValue)
          const province = await prisma.province.findFirst({
            where: isUUID
              ? { id: provinceValue }
              : { OR: [{ name: provinceValue }, { thname: provinceValue }] }
          })

          if (province) {
            await prisma.candidatePreferredProvince.create({
              data: {
                id: randomUUID(),
                candidateId: candidateProfile.id,
                provinceId: province.id,
              },
            });
          } else {
            console.warn(`Province not found: ${provinceValue}`);
          }
        }
      }
    } else if (preferredLocations === null || (Array.isArray(preferredLocations) && preferredLocations.length === 0)) {
      // Clear preferred provinces if empty array or null
      await prisma.candidatePreferredProvince.deleteMany({
        where: { candidateId: candidateProfile.id },
      });
    }

    // Handle education (CandidateUniversity)
    // Accepts: { university, degree/fieldOfStudy, startYear, endYear }
    // If endYear is empty/null → treat as current (isCurrent = true, endDate = null)
    if (Array.isArray(education) && education.length > 0) {
      console.log("Processing education data:", JSON.stringify(education, null, 2));
      const normalizedEducation = education
        .map((edu) => {
          const universityName = edu.university || edu.universityName || edu.institution;
          const degreeName = edu.degree || edu.degreeName || edu.fieldOfStudy || "";
          const fieldOfStudy = edu.fieldOfStudy || edu.degreeName || edu.degree || "";
          const yearOfStudy =
            edu.yearOfStudy ||
            yearStringFromDateLike(edu.startYear) ||
            yearStringFromDateLike(edu.startDate);
          const endYearStr =
            yearStringFromDateLike(edu.endYear) ||
            yearStringFromDateLike(edu.endDate);
          const hasEndYear = endYearStr !== "" && endYearStr !== "null" && endYearStr !== "undefined";

          if (!universityName || !degreeName) {
            console.warn("Skipping education entry - missing required fields:", {
              university: universityName,
              degree: degreeName,
              fieldOfStudy,
            });
            return null;
          }

          return {
            universityName,
            degreeName,
            fieldOfStudy,
            yearOfStudy,
            isCurrent: edu.isCurrent === true || !hasEndYear,
            educationLevel: normalizeEducationLevel(edu.educationLevel),
            gpa: edu.gpa ? parseFloat(edu.gpa) : null,
          };
        })
        .filter(Boolean) as Array<{
          universityName: string;
          degreeName: string;
          fieldOfStudy: string;
          yearOfStudy: string;
          isCurrent: boolean;
          educationLevel: "BACHELOR" | "MASTERS" | "PHD";
          gpa: number | null;
        }>;

      if (normalizedEducation.length > 0) {
        // Delete existing education entries only after we know replacement data is valid.
        await prisma.candidateUniversity.deleteMany({
          where: { candidateId: candidateProfile.id },
        });

        for (const edu of normalizedEducation) {
          // Find university by exact name match (since we're using dropdown now)
          let university = await prisma.university.findFirst({
            where: { name: { equals: edu.universityName, mode: "insensitive" } },
          });

          if (!university) {
            // Fallback: try contains match for backward compatibility
            university = await prisma.university.findFirst({
              where: { name: { contains: edu.universityName, mode: "insensitive" } },
            });
          }

          if (!university) {
            console.warn(`University not found: ${edu.universityName}, creating new entry`);
            // Only create if not found - this shouldn't happen with dropdown, but keep for safety
            university = await prisma.university.create({
              data: {
                id: randomUUID(),
                name: edu.universityName,
              },
            });
          }

          // NOTE: Do NOT write education details back into CandidateProfile.
          // CandidateProfile should not store education details; they live in CandidateUniversity.
          const educationRecord = await prisma.candidateUniversity.create({
            data: {
              id: randomUUID(),
              candidateId: candidateProfile.id,
              universityId: university.id,
              educationLevel: edu.educationLevel,
              degreeName: edu.degreeName,
              fieldOfStudy: edu.fieldOfStudy,
              yearOfStudy: edu.yearOfStudy,
              gpa: Number.isFinite(edu.gpa) ? edu.gpa : null,
              isCurrent: edu.isCurrent,
            }
          });

          console.log(`Created education record: ${educationRecord.id} for university: ${university.name}`);
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
          const normalizedCategory =
            typeof skill.category === "string" && skill.category.toUpperCase() === "BUSINESS"
              ? "BUSINESS"
              : "TECHNICAL";

          // Find or create skill
          let skillRecord = await prisma.skills.findUnique({
            where: { name: skill.name },
          });

          if (!skillRecord) {
            skillRecord = await prisma.skills.create({
              data: {
                id: randomUUID(),
                name: skill.name,
                category: normalizedCategory,
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
              category: skillRecord.category || normalizedCategory,
            },
          });
        }
      }
    }

    // Handle projects (UserProjects)
    // Accepts: { name, role, description }
    if (Array.isArray(projects)) {
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
        CompanyEmails: true,
        CompanyPhones: true,
        // Include address relations to get names from IDs
        Province: { select: { id: true, name: true, thname: true } },
        District: { select: { id: true, name: true, thname: true, postalCode: true } },
        Subdistrict: { select: { id: true, name: true, thname: true } },
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

    // Get address data from normalized structure using IDs
    // The IDs are the source of truth - use them to fetch names from relations
    const addressDetails = companyProfile.addressDetails || "";
    const subDistrict = companyProfile.Subdistrict?.name || "";
    const district = companyProfile.District?.name || "";
    const province = companyProfile.Province?.name || "";
    const postcode = companyProfile.postcode || companyProfile.District?.postalCode || "";

    // Transform database data to match frontend format
    const profileData = {
      companyName: companyProfile.companyName || "",
      companyDescription: companyProfile.about || "",
      businessType: companyProfile.businessType || "",
      companySize: companyProfile.companySize || "",
      addressDetails,
      postcode,
      // Return the IDs - these are used by frontend to populate dropdowns
      provinceId: companyProfile.provinceId || "",
      districtId: companyProfile.districtId || "",
      subdistrictId: companyProfile.subdistrictId || "",
      phoneNumber: companyProfile.CompanyPhones[0]?.phone || "",
      email: companyProfile.CompanyEmails[0]?.email || companyProfile.User.email,
      websiteUrl: companyProfile.websiteUrl || "",
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
    businessType, 
    companySize,
    addressDetails,
    postcode,
    provinceId,
    districtId,
    subdistrictId,
    phoneNumber,
    email,
    websiteUrl,
    contactName,
    profileImage,
  } = req.body ?? {};

  console.log('📥 Received request body:', JSON.stringify(req.body, null, 2));
  console.log('📥 Extracted districtId:', districtId, 'subdistrictId:', subdistrictId);

  try {
    // Get or create company profile
    let companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    // Store address IDs - these are the primary source of truth
    // Convert empty strings to null for proper database storage
    const normalizedProvinceId = provinceId !== undefined ? (provinceId && provinceId.trim() !== "" ? provinceId.trim() : null) : undefined;
    const normalizedDistrictId = districtId !== undefined ? (districtId && districtId.trim() !== "" ? districtId.trim() : null) : undefined;
    const normalizedSubdistrictId = subdistrictId !== undefined ? (subdistrictId && subdistrictId.trim() !== "" ? subdistrictId.trim() : null) : undefined;

    if (companyProfile) {
      // Update existing profile
      const updateData: any = {
        companyName: companyName !== undefined ? companyName : companyProfile.companyName,
        about: companyDescription !== undefined ? companyDescription : companyProfile.about,
        businessType: businessType !== undefined ? businessType : companyProfile.businessType,
        companySize: companySize !== undefined ? companySize : companyProfile.companySize,
        addressDetails: addressDetails !== undefined ? addressDetails : companyProfile.addressDetails,
        postcode: postcode !== undefined ? postcode : companyProfile.postcode,
        recruiterName: contactName !== undefined ? contactName : companyProfile.recruiterName,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : companyProfile.websiteUrl,
        updatedAt: new Date(),
      };

      // Always update IDs if they were provided in the request
      // Check if the field was sent (not undefined), then use normalized value (which could be null for empty strings)
      if (provinceId !== undefined) {
        updateData.provinceId = normalizedProvinceId ?? null;
        // If province is cleared, also clear district and subdistrict
        if (normalizedProvinceId === null) {
          updateData.districtId = null;
          updateData.subdistrictId = null;
        }
      }
      if (districtId !== undefined) {
        updateData.districtId = normalizedDistrictId ?? null;
        // If district is cleared, also clear subdistrict
        if (normalizedDistrictId === null) {
          updateData.subdistrictId = null;
        }
      }
      if (subdistrictId !== undefined) {
        updateData.subdistrictId = normalizedSubdistrictId ?? null;
      }
      if (profileImage) updateData.logoURL = profileImage;

      console.log('📝 Updating CompanyProfile with data:', JSON.stringify(updateData, null, 2));
      console.log('📥 Received provinceId:', provinceId, '→ normalized:', normalizedProvinceId);
      console.log('📥 Received districtId:', districtId, '→ normalized:', normalizedDistrictId);
      console.log('📥 Received subdistrictId:', subdistrictId, '→ normalized:', normalizedSubdistrictId);

      companyProfile = await prisma.companyProfile.update({
        where: { userId },
        data: updateData,
      });

      console.log('✅ CompanyProfile updated successfully:', companyProfile.id);
      console.log('✅ Saved provinceId:', companyProfile.provinceId);
      console.log('✅ Saved districtId:', companyProfile.districtId);
      console.log('✅ Saved subdistrictId:', companyProfile.subdistrictId);
    } else {
      // Create new profile
      companyProfile = await prisma.companyProfile.create({
        data: {
          id: randomUUID(),
          userId,
          companyName: companyName || "Company",
          about: companyDescription || undefined,
          businessType: businessType || undefined,
          companySize: companySize || undefined,
          addressDetails: addressDetails || undefined,
          // Store the normalized IDs - these are the source of truth
          provinceId: normalizedProvinceId ?? null,
          districtId: normalizedDistrictId ?? null,
          subdistrictId: normalizedSubdistrictId ?? null,
          postcode: postcode || undefined,
          recruiterName: contactName || undefined,
          websiteUrl: websiteUrl || undefined,
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

const uploadCompanyLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/")
    isImage ? cb(null, true) : cb(new Error("Only image files allowed"))
  },
})

profilesRouter.post(
  "/companies/profile/logo",
  requireAuth, requireRole("COMPANY"),
  (req: AuthedRequest, res, next) => {
    uploadCompanyLogo.single("file")(req as any, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.message })
      next()
    })
  },
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id
    try {
      if (!req.file) return res.status(400).json({ error: "File is required" })

      const existing = await prisma.companyProfile.findUnique({
        where: { userId },
        select: { logoURL: true },
      })

      const result = await fileStorage.uploadFile(req.file, "company-logos")

      if (existing?.logoURL) {
        try {
          const oldKey = fileStorage.extractKeyFromUrl(existing.logoURL)
          if (oldKey) await fileStorage.deleteFile(oldKey)
        } catch (e) {
          console.error("Error deleting old logo:", e)
        }
      }

      // ถ้ามี profile อยู่แล้วให้ update logoURL ทันที
      if (existing) {
        await prisma.companyProfile.update({
          where: { userId },
          data: { logoURL: result.url, updatedAt: new Date() },
        })
      }

      return res.json({ url: result.url })
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Upload failed" })
    }
  }
)