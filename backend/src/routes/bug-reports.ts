import { Router } from "express";
import multer from "multer";
import prisma from "../utils/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { fileStorage } from "../utils/fileStorage";

export const bugReportsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    isImage ? cb(null, true) : cb(new Error("Only image files allowed"));
  },
});

bugReportsRouter.post(
  "/",
  requireAuth,
  (req: AuthedRequest, res, next) => {
    upload.single("screenshot")(req as any, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.message || "Upload failed" });
      return next();
    });
  },
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const descriptionRaw = typeof req.body?.description === "string" ? req.body.description : "";
    const description = descriptionRaw.trim();

    const pageUrl = typeof req.body?.pageUrl === "string" ? req.body.pageUrl.trim() : null;
    const referrerUrl = typeof req.body?.referrerUrl === "string" ? req.body.referrerUrl.trim() : null;
    const userAgent =
      typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;

    if (description.length < 10) {
      return res.status(400).json({ error: "Description must be at least 10 characters" });
    }

    let screenshotUrl: string | null = null;
    if (req.file) {
      const result = await fileStorage.uploadFile(req.file, "bug-reports");
      screenshotUrl = result.url;
    }

    const bugReport = await prisma.reportedBug.create({
      data: {
        reportedUserId: userId,
        description,
        pageUrl,
        referrerUrl,
        screenshotUrl,
        userAgent,
      },
    });

    return res.json({ success: true, bugReport });
  }
);

