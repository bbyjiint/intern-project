import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { parseResume } from "../utils/resumeParser";

const router = express.Router();
const upload = multer({ dest: "uploads/resumes" });

router.post(
  "/parse-resume",
  upload.single("resume"),
  async (req, res) => {
    console.log("🔥 AI ROUTE HIT");
    try {
      const filePath = req.file?.path;
      if (!filePath) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      console.log("📄 Parsing file at:", filePath);
      const parsedData = await parseResume(filePath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.log("⚠️ Failed to delete file:", err);
      }
      return res.json({ success: true, parsedData });
    } catch (err) {
      console.error("💥 AI Route Error:", err);
      return res.status(500).json({ error: "Failed to parse resume" });
    }
  }
);

export default router;