import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import prisma from "./prisma";
import { loadDotEnv } from "./env";
import { authRouter } from "../routes/auth";
import { candidatesRouter } from "../routes/candidates";
import { profilesRouter } from "../routes/profiles";
import { jobPostsRouter } from "../routes/job-posts";
import { universitiesRouter } from "../routes/universities";
import { skillsRouter } from "../routes/skills";
import { addressesRouter } from "../routes/addresses";
import { bookmarksRouter } from "../routes/bookmarks";
import messagesRouter from "../routes/messages";
import { internRouter } from "../routes/intern";
import { githubRouter } from "../routes/githubCheck";
import uploadRouter from "../routes/upload";
import aiRouter from "../routes/ai"; // ← เพิ่ม
import { bugReportsRouter } from "../routes/bug-reports";

const app = express();

loadDotEnv();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) ?? ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.FILE_STORAGE_PROVIDER !== "s3") {
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/db-check", async (req, res) => {
  const userCount = await prisma.user.count();
  res.json({ ok: true, userCount });
});

app.use("/api/auth", authRouter);
app.use("/api/candidates", candidatesRouter);
app.use("/api", profilesRouter);
app.use("/api", jobPostsRouter);
app.use("/api/universities", universitiesRouter);
app.use("/api/skills", skillsRouter);
app.use('/api/github', githubRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/intern", internRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/ai", aiRouter); // ← เพิ่ม
app.use("/api/bug-reports", bugReportsRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);

  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with this value already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  if (err.code?.startsWith("P")) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});