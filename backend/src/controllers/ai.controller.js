import { explainCodeWithAI, generateCodeWithAI } from "../services/ai.service.js";

function sendValidationError(res, message) {
  return res.status(400).json({ message });
}

export async function explainCode(req, res) {
  const { language, code } = req.body;

  if (!language || !String(language).trim()) {
    return sendValidationError(res, "language is required");
  }

  if (!code || !String(code).trim()) {
    return sendValidationError(res, "code is required");
  }

  try {
    const explanation = await explainCodeWithAI(String(language).trim(), String(code));
    return res.json(explanation);
  } catch (error) {
    console.error("Explain code AI error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Could not explain the code. Please try again.",
    });
  }
}

export async function generateCode(req, res) {
  const { language, instruction } = req.body;

  if (!language || !String(language).trim()) {
    return sendValidationError(res, "language is required");
  }

  if (!instruction || !String(instruction).trim()) {
    return sendValidationError(res, "instruction is required");
  }

  try {
    const generatedCode = await generateCodeWithAI(String(language).trim(), String(instruction));
    return res.json(generatedCode);
  } catch (error) {
    console.error("Generate code AI error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Could not generate code. Please try again.",
    });
  }
}

