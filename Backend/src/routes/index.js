import { Router } from "express";
import { query } from "../config/db.js";
import { isShuttingDown } from "../services/lifecycle.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "arca-studio-backend",
  });
});

router.get("/health/database", async (_req, res) => {
  if (isShuttingDown()) {
    res.status(503).json({ status: "shutting_down", service: "arca-studio-backend" });
    return;
  }
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
      code: "DATABASE_UNAVAILABLE",
      message: "Database health check failed",
    });
  }
});

export default router;
