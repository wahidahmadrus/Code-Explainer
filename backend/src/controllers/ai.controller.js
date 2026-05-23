import { explainCodeWithAI, generateCodeWithAI } from "../services/ai.service.js";
import { getUserFromRequest } from "../middleware/auth.middleware.js";
import AiRequest from "../models/AiRequest.js";

function sendValidationError(res, message) {
  return res.status(400).json({ message });
}

async function saveAIRequestIfLoggedIn(req, request) {
  try {
    const authContext = await getUserFromRequest(req);

    if (!authContext) {
      return;
    }

    await AiRequest.create({
      userId: authContext._id,
      requestType: request.requestType,
      language: request.language,
      inputText: request.inputText,
      outputText: request.outputText,
    });
  } catch (error) {
    console.error("Optional AI request history error:", error);
  }
}

export async function explainCode(req, res) {
  const { language, code } = req.body;
  const cleanLanguage = String(language || "").trim();
  const cleanCode = String(code || "");

  if (!cleanLanguage) {
    return sendValidationError(res, "language is required");
  }

  if (!cleanCode.trim()) {
    return sendValidationError(res, "code is required");
  }

  try {
    const explanation = await explainCodeWithAI(cleanLanguage, cleanCode);
    await saveAIRequestIfLoggedIn(req, {
      requestType: "explain",
      language: cleanLanguage,
      inputText: cleanCode,
      outputText: explanation,
    });

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
  const cleanLanguage = String(language || "").trim();
  const cleanInstruction = String(instruction || "");

  if (!cleanLanguage) {
    return sendValidationError(res, "language is required");
  }

  if (!cleanInstruction.trim()) {
    return sendValidationError(res, "instruction is required");
  }

  try {
    const generatedCode = await generateCodeWithAI(cleanLanguage, cleanInstruction);
    await saveAIRequestIfLoggedIn(req, {
      requestType: "generate",
      language: cleanLanguage,
      inputText: cleanInstruction,
      outputText: generatedCode,
    });

    return res.json(generatedCode);
  } catch (error) {
    console.error("Generate code AI error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Could not generate code. Please try again.",
    });
  }
}
