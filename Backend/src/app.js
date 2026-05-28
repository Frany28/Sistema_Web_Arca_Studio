import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import authRoutes from "./routes/auth.js";
import routes from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);
app.use(cors(corsOptions()));
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", authRoutes);
app.use("/api", routes);

app.use((error, _req, res, _next) => {
  console.error("Unhandled request error", {
    code: error.code,
    message: error.message,
    name: error.name,
  });

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Ocurrio un error inesperado.",
  });
});

export default app;
