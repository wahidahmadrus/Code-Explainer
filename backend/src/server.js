import "dotenv/config";
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const hasGroqApiKey = Boolean(
  process.env.GROQ_API_KEY?.trim() && process.env.GROQ_API_KEY.trim() !== "your_groq_api_key_here",
);

console.log(`Groq API key configured: ${hasGroqApiKey ? "yes" : "no"}`);
console.log(`Groq base URL: ${GROQ_BASE_URL}`);
console.log(`Groq model: ${GROQ_MODEL}`);

// Allow the React app to call this API during local development.
app.use(
  cors({
    origin: CLIENT_URL,
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

app.use("/api/ai", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
