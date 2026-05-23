import "dotenv/config";
import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import authRoutes from "./routes/auth.routes.js";
import snippetsRoutes from "./routes/snippets.routes.js";
import { connectDB } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
const ADMIN_URL = (process.env.ADMIN_URL || "http://localhost:5174").replace(/\/$/, "");
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const hasGroqApiKey = Boolean(
  process.env.GROQ_API_KEY?.trim() && process.env.GROQ_API_KEY.trim() !== "your_groq_api_key_here",
);
const allowedOrigins = new Set([CLIENT_URL, ADMIN_URL].filter(Boolean));

console.log(`Groq API key configured: ${hasGroqApiKey ? "yes" : "no"}`);
console.log(`Groq base URL: ${GROQ_BASE_URL}`);
console.log(`Groq model: ${GROQ_MODEL}`);

// Allow the user app and admin app to call this API during local development.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

// Parse JSON request bodies so controllers can read req.body.
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/snippets", snippetsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    });
}

export default app;
