import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { loadSession } from "./middlewares/auth.js";
import { requireTrustedOrigin } from "./middlewares/trustedOrigin.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import geoapifyRoutes from "./routes/geoapify.js";
import projectRequestRoutes from "./routes/projectRequests.js";
import projectRoutes from "./routes/projects.js";
import routes from "./routes/index.js";
import supportRoutes from "./routes/support.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions()));
app.use(express.json({ limit: "100kb" }));
app.use(loadSession);
app.use(requireTrustedOrigin);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/geoapify", geoapifyRoutes);
app.use("/api/project-requests", projectRequestRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/support", supportRoutes);
app.use("/api", routes);

app.use("/api", (req, res) => {
  res.status(404).json({
    code: "API_ROUTE_NOT_FOUND",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    service: "arca-studio-backend",
  });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled request error", {
    code: error.code,
    message: error.message,
    name: error.name,
  });

  res.status(error.status || 500).json({
    code: error.code || "INTERNAL_SERVER_ERROR",
    message: error.publicMessage || "Ocurrio un error inesperado.",
  });
});

export default app;
