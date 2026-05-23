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

function normalizeString(value) {
  return typeof value === "string" ? value : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === "string");
}

function normalizeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function validateExplainResponse(data) {
  const response = normalizeObject(data);

  return {
    summary: normalizeString(response.summary),
    lineByLine: normalizeStringArray(response.lineByLine),
    concepts: normalizeStringArray(response.concepts),
    mistakes: normalizeStringArray(response.mistakes),
    improvedCode: normalizeString(response.improvedCode),
  };
}

function validateGenerateResponse(data) {
  const response = normalizeObject(data);

  return {
    code: normalizeString(response.code),
    explanation: normalizeString(response.explanation),
    concepts: normalizeStringArray(response.concepts),
  };
}

async function createJsonCompletion(messages) {
  try {
    return await client.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.1,
      response_format: {
        type: "json_object",
      },
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
}

async function getJsonCompletion(messages) {
  ensureGroqApiKey();

  let completion = await createJsonCompletion(messages);

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    const error = new Error("Groq response was empty.");
    error.status = 502;
    throw error;
  }

  try {
    return parseAIJsonResponse(content);
  } catch (parseError) {
    completion = await createJsonCompletion([
      ...messages,
      {
        role: "user",
        content:
          "Your previous response was invalid JSON. Return only a valid JSON object matching the required structure.",
      },
    ]);

    const retryContent = completion.choices?.[0]?.message?.content;

    if (!retryContent) {
      const error = new Error("Groq response was empty.");
      error.status = 502;
      error.cause = parseError;
      throw error;
    }

    return parseAIJsonResponse(retryContent);
  }
}

export async function explainCodeWithAI(language, code) {
  const data = await getJsonCompletion([
    {
      role: "system",
      content:
        "You are an API that returns only valid JSON. Return a single JSON object. Do not use markdown. Do not use code fences. Do not include extra text outside JSON.",
    },
    {
      role: "user",
      content: `Explain this ${language} code.

Rules:
- Return JSON only.
- No markdown.
- No code fences.
- Escape all new lines and quotes correctly inside JSON strings.
- Explain like a friendly beginner programming tutor.
- Use simple English.
- Assume the user is a beginner.
- Keep the summary short.
- Make the line-by-line explanation practical and easy to follow.
- Mention important concepts.
- Only include realistic beginner mistakes related to this code.
- Set improvedCode to an empty string if the original code is already good.

Return exactly this JSON object:
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
        "You are an API that returns only valid JSON. Return a single JSON object. Do not use markdown. Do not use code fences. Do not include extra text outside JSON.",
    },
    {
      role: "user",
      content: `Generate beginner-friendly ${language} code for this request:
${instruction}

Rules:
- Return JSON only.
- No markdown.
- No triple-backtick code fences.
- Escape all new lines and quotes correctly inside JSON strings.
- The code value must be a valid JSON string.
- Do not put raw unescaped code outside the JSON string.
- Match the selected programming language.
- Prefer the simplest beginner-friendly solution.
- For basic programming requests, prefer console-based code.
- Do not use GUI libraries like tkinter unless the user specifically asks for a GUI, canvas, drawing, or graphics.
- Do not use recursion unless the user specifically asks for recursion.
- For pattern problems like pyramid, triangle, stars, or shapes, generate console pattern code by default.
- If the request is vague, choose the most common beginner interpretation.
- Include complete runnable code.
- Keep the code easy for a beginner to read.
- Add comments only where they help understanding.
- Explain what the code does.
- Explain the main loop or important logic.
- Keep the explanation short and beginner-friendly.
- Mention concepts used.

Return exactly this JSON object:
{
  "code": "string",
  "explanation": "string",
  "concepts": ["string"]
}`,
    },
  ]);

  return validateGenerateResponse(data);
}
