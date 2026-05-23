import express from "express";
import { createSnippet, deleteSnippet, getSnippet, listSnippets } from "../controllers/snippets.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

function asyncHandler(controller) {
  return (req, res, next) => Promise.resolve(controller(req, res, next)).catch(next);
}

router.use(requireAuth);

router.post("/", asyncHandler(createSnippet));
router.get("/", asyncHandler(listSnippets));
router.get("/:id", asyncHandler(getSnippet));
router.delete("/:id", asyncHandler(deleteSnippet));

export default router;
