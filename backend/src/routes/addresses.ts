import { Router } from "express";
import prisma from "../utils/prisma";

export const addressesRouter = Router();

// Get all provinces
addressesRouter.get("/provinces", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const provinces = await prisma.province.findMany({
      where: search
        ? {
            OR: [
              { code: { equals: search, mode: "insensitive" } },
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
      },
      orderBy: { name: "asc" },
      ...(search ? { take: 200 } : {}),
    });

    // Post-process: If exact code matches exist, prioritize them
    if (search) {
      const searchLower = search.toLowerCase().trim();
      const exactCodeMatches = provinces.filter(
        (prov) => prov.code?.toLowerCase() === searchLower
      );
      if (exactCodeMatches.length > 0) {
        const others = provinces.filter(
          (prov) => prov.code?.toLowerCase() !== searchLower
        );
        return res.json({ provinces: [...exactCodeMatches, ...others] });
      }
    }

    return res.json({ provinces });
  } catch (error: any) {
    console.error("Error fetching provinces:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch provinces",
    });
  }
});

// Get districts by province
addressesRouter.get("/districts", async (req, res) => {
  try {
    const provinceId = typeof req.query.provinceId === "string" ? req.query.provinceId : null;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    if (!provinceId) {
      return res.status(400).json({ error: "provinceId is required" });
    }

    const districts = await prisma.district.findMany({
      where: {
        provinceId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { thname: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        thname: true,
        postalCode: true,
      },
      orderBy: { name: "asc" },
      ...(search ? { take: 200 } : {}),
    });


    return res.json({ districts });
  } catch (error: any) {
    console.error("Error fetching districts:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch districts",
    });
  }
});

// Get subdistricts by district
addressesRouter.get("/subdistricts", async (req, res) => {
  try {
    const districtId = typeof req.query.districtId === "string" ? req.query.districtId : null;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    if (!districtId) {
      return res.status(400).json({ error: "districtId is required" });
    }

    const subdistricts = await prisma.subdistrict.findMany({
      where: {
        districtId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { thname: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        thname: true,
      },
      orderBy: { name: "asc" },
      ...(search ? { take: 200 } : {}),
    });


    return res.json({ subdistricts });
  } catch (error: any) {
    console.error("Error fetching subdistricts:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch subdistricts",
    });
  }
});
