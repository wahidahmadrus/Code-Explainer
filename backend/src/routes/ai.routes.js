import express from "express";
import { explainCode, generateCode } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/explain", explainCode);
router.post("/generate", generateCode);

export default router;
