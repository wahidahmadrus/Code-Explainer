const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function createHeaders(accessToken) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

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

async function requestJson(path, options = {}) {
  try {
    const { accessToken, ...fetchOptions } = options;
    const response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers: createHeaders(accessToken),
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

async function postJson(path, body, accessToken) {
  return requestJson(path, {
    method: "POST",
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function explainCode(language, code, accessToken) {
  if (!code.trim()) {
    throw new Error("Add code before asking for an explanation.");
  }

  return postJson(
    "/api/ai/explain",
    {
      language,
      code,
    },
    accessToken,
  );
}

export async function generateCode(language, instruction, accessToken) {
  if (!instruction.trim()) {
    throw new Error("Describe what you want to build before generating code.");
  }

  return postJson(
    "/api/ai/generate",
    {
      language,
      instruction,
    },
    accessToken,
  );
}

export async function saveSnippet(snippet, accessToken) {
  return postJson("/api/snippets", snippet, accessToken);
}

export async function getSnippets(accessToken) {
  return requestJson("/api/snippets", {
    method: "GET",
    accessToken,
  });
}

export async function deleteSnippet(id, accessToken) {
  return requestJson(`/api/snippets/${id}`, {
    method: "DELETE",
    accessToken,
  });
}
