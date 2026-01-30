import express from "express";
import cors from "cors";
import prisma from "./prisma";
import { loadDotEnv } from "./env";
import { authRouter } from "../routes/auth";
import { candidatesRouter } from "../routes/candidates";
import { profilesRouter } from "../routes/profiles";
import { jobPostsRouter } from "../routes/job-posts";
import { universitiesRouter } from "../routes/universities";
import { bookmarksRouter } from "../routes/bookmarks";

const app = express();

loadDotEnv();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// DB connectivity test (hits Neon via Prisma)
app.get("/api/db-check", async (req, res) => {
  const userCount = await prisma.user.count();
  res.json({ ok: true, userCount });
});

app.use("/api/auth", authRouter);
app.use("/api/candidates", candidatesRouter);
app.use("/api", profilesRouter);
app.use("/api", jobPostsRouter);
app.use("/api/universities", universitiesRouter);
app.use("/api/bookmarks", bookmarksRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware (must be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  
  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with this value already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  if (err.code?.startsWith("P")) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});