import express from "express";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

function asyncHandler(controller) {
  return (req, res, next) => Promise.resolve(controller(req, res, next)).catch(next);
}

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(getMe));

export default router;
