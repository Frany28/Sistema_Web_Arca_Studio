import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors(corsOptions()));
app.use(express.json());
app.use("/api", routes);

export default app;
