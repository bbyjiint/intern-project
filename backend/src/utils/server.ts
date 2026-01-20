import express from "express";
import cors from "cors";
import prisma from "./prisma";
import { loadDotEnv } from "./env";
import { authRouter } from "../routes/auth";
import { candidatesRouter } from "../routes/candidates";

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

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});