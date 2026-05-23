import express from "express";
import {
  createLanguage,
  deleteLanguage,
  deleteSnippet,
  getSnippet,
  getStats,
  listAiRequests,
  listLanguages,
  listSnippets,
  listUsers,
  updateLanguage,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

router.get("/snippets", listSnippets);
router.get("/snippets/:id", getSnippet);
router.delete("/snippets/:id", deleteSnippet);

router.get("/ai-requests", listAiRequests);

router.get("/languages", listLanguages);
router.post("/languages", createLanguage);
router.patch("/languages/:id", updateLanguage);
router.delete("/languages/:id", deleteLanguage);

export default router;
