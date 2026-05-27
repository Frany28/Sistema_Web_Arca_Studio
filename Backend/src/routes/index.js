import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "arca-studio-backend",
  });
});

router.get("/health/database", async (_req, res) => {
  try {
    const result = await query("select now() as timestamp");

    res.status(200).json({
      status: "ok",
      service: "postgres",
      timestamp: result.rows[0].timestamp,
    });
  } catch (error) {
    console.error("Database health check failed", {
      code: error.code,
      message: error.message,
      name: error.name,
    });

    res.status(500).json({
      status: "error",
      code: error.code,
      message: error.message || "Database connection failed",
    });
  }
});

export default router;
