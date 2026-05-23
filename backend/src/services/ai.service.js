import OpenAI from "openai";

const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || "";
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL;
const GROQ_MODEL = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

const client = new OpenAI({
  apiKey: GROQ_API_KEY || "missing_groq_api_key",
  baseURL: GROQ_BASE_URL,
});

function ensureGroqApiKey() {
  if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key_here") {
    const error = new Error("Groq API key is missing or invalid.");
    error.status = 401;
    throw error;
  }
}

function createInvalidResponseError(cause) {
  const error = new Error("AI returned an invalid response format.");
  error.status = 502;
  error.cause = cause;
  return error;
}

function stripCodeFence(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fencedMatch ? fencedMatch[1].trim() : trimmed;
}

function extractFirstJsonObject(text) {
  const start = text.indexOf("{");

  if (start === -1) {
    return "";
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = start; index < text.length; index += 1) {
    const character = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (character === "\\") {
      isEscaped = true;
      continue;
    }

    if (character === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return "";
}

export function parseAIJsonResponse(rawText) {
  if (typeof rawText !== "string") {
    throw createInvalidResponseError();
  }

  const cleanedText = stripCodeFence(rawText);

  try {
    return JSON.parse(cleanedText);
  } catch (parseError) {
    const extractedJson = extractFirstJsonObject(cleanedText);

    if (!extractedJson) {
      throw createInvalidResponseError(parseError);
    }

    try {
      return JSON.parse(extractedJson);
    } catch (extractError) {
      throw createInvalidResponseError(extractError);
    }
  }
}

function requireString(value, fieldName) {
  if (typeof value !== "string") {
    throw createInvalidResponseError(new Error(`AI response field "${fieldName}" must be a string.`));
  }
}

function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createInvalidResponseError(new Error("AI response must be a JSON object."));
  }
}

function requireStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw createInvalidResponseError(new Error(`AI response field "${fieldName}" must be an array of strings.`));
  }
}

function validateExplainResponse(data) {
  requireObject(data);
  requireString(data.summary, "summary");
  requireStringArray(data.lineByLine, "lineByLine");
  requireStringArray(data.concepts, "concepts");
  requireStringArray(data.mistakes, "mistakes");

  if (data.improvedCode == null) {
    data.improvedCode = "";
  }

  requireString(data.improvedCode, "improvedCode");

  return {
    summary: data.summary,
    lineByLine: data.lineByLine,
    concepts: data.concepts,
    mistakes: data.mistakes,
    improvedCode: data.improvedCode,
  };
}

function validateGenerateResponse(data) {
  requireObject(data);
  requireString(data.code, "code");
  requireString(data.explanation, "explanation");
  requireStringArray(data.concepts, "concepts");

  return {
    code: data.code,
    explanation: data.explanation,
    concepts: data.concepts,
  };
}

async function getJsonCompletion(messages) {
  ensureGroqApiKey();

  let completion;

  try {
    completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.2,
    });
  } catch (requestError) {
    if (requestError.status === 401 || requestError.message?.includes("Invalid API Key")) {
      const error = new Error("Groq API key is missing or invalid.");
      error.status = 401;
      error.cause = requestError;
      throw error;
    }

    throw requestError;
  }

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    const error = new Error("Groq response was empty.");
    error.status = 502;
    throw error;
  }

  return parseAIJsonResponse(content);
}

export async function explainCodeWithAI(language, code) {
  const data = await getJsonCompletion([
    {
      role: "system",
      content:
        "You are a friendly beginner programming tutor. Use simple English. Return JSON only. Do not use markdown. Do not use code fences. Do not include extra text outside JSON.",
    },
    {
      role: "user",
      content: `Explain this ${language} code.

Rules:
- Explain like a friendly beginner programming tutor.
- Use simple English.
- Assume the user is a beginner.
- Keep the summary short.
- Make the line-by-line explanation practical and easy to follow.
- Mention important concepts.
- Only include realistic beginner mistakes related to this code.
- Set improvedCode to an empty string if the original code is already good.
- Return JSON only.
- Do not use markdown.
- Do not use code fences.
- Do not include extra text outside the JSON object.

Return this exact JSON structure:
{
  "summary": "string",
  "lineByLine": ["string"],
  "concepts": ["string"],
  "mistakes": ["string"],
  "improvedCode": "string"
}

Code:
${code}`,
    },
  ]);

  return validateExplainResponse(data);
}

export async function generateCodeWithAI(language, instruction) {
  const data = await getJsonCompletion([
    {
      role: "system",
      content:
        "You convert beginner programming requests into clean code. Return JSON only. Do not use markdown. Do not use code fences. Do not include extra text outside JSON.",
    },
    {
      role: "user",
      content: `Generate beginner-friendly ${language} code for this request:
${instruction}

Rules:
- Generate beginner-friendly code.
- Match the selected programming language.
- Keep the code clean and beginner-friendly.
- Add comments only when useful.
- Keep the explanation short.
- Mention concepts used.
- Return JSON only.
- Do not use markdown.
- Do not use code fences.
- Do not include extra text outside the JSON object.

Return this exact JSON structure:
{
  "code": "string",
  "explanation": "string",
  "concepts": ["string"]
}`,
    },
  ]);

  return validateGenerateResponse(data);
}
