import { Router } from "express";
import prisma from "../utils/prisma";

export const universitiesRouter = Router();

// Get all universities (for dropdown/search)
universitiesRouter.get("/", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const universities = await prisma.university.findMany({
      where: search
        ? {
            OR: [
              // Exact code match (case-insensitive) - prioritized
              { code: { equals: search, mode: "insensitive" } },
              // Contains match for names and codes
              { name: { contains: search, mode: "insensitive" } },
              { thname: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        thname: true,
        code: true,
        province: true,
        country: true,
      },
      orderBy: { name: "asc" },
      // No limit for initial load, limit to 200 for search results
      ...(search ? { take: 200 } : {}),
    });
    
    // Post-process: If exact code matches exist, prioritize them
    if (search) {
      const searchLower = search.toLowerCase().trim();
      const exactCodeMatches = universities.filter(
        (uni) => uni.code?.toLowerCase() === searchLower
      );
      if (exactCodeMatches.length > 0) {
        // Return exact matches first, then others
        const others = universities.filter(
          (uni) => uni.code?.toLowerCase() !== searchLower
        );
        return res.json({ universities: [...exactCodeMatches, ...others] });
      }
    }

    return res.json({ universities });
  } catch (error: any) {
    console.error("Error fetching universities:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch universities",
    });
  }
});
