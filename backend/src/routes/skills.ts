import { Router } from "express";
import prisma from "../utils/prisma";

export const skillsRouter = Router();

// Get all skills (for dropdown/search)
skillsRouter.get("/", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const skills = await prisma.skills.findMany({
      where: search
        ? {
            name: { contains: search, mode: "insensitive" },
          }
        : undefined,
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
      // Limit to 200 for search results, no limit for initial load
      ...(search ? { take: 200 } : {}),
    });

    return res.json({ skills });
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch skills",
    });
  }
});
