const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function readResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function getServerErrorMessage(data, status) {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return `The server returned an error (${status}).`;
}

async function postJson(path, body) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      throw new Error(getServerErrorMessage(data, response.status));
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not connect to the backend. Make sure the backend server is running.");
    }

    throw error;
  }
}

export async function explainCode(language, code) {
  if (!code.trim()) {
    throw new Error("Add code before asking for an explanation.");
  }

  return postJson("/api/ai/explain", {
    language,
    code,
  });
}

export async function generateCode(language, instruction) {
  if (!instruction.trim()) {
    throw new Error("Describe what you want to build before generating code.");
  }

  return postJson("/api/ai/generate", {
    language,
    instruction,
  });
}
