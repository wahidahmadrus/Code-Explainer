import { getAdminToken } from "./adminAuth.js";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function createHeaders() {
  const token = getAdminToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(data, status) {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return `The server returned an error (${status}).`;
}

async function requestJson(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...createHeaders(),
        ...(options.headers || {}),
      },
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, response.status));
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not connect to the backend. Make sure the backend server is running.");
    }

    throw error;
  }
}

export function getDashboardStats() {
  return requestJson("/api/admin/stats");
}

export function getUsers() {
  return requestJson("/api/admin/users");
}

export function updateUserRole(userId, role) {
  return requestJson(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function getSnippets() {
  return requestJson("/api/admin/snippets");
}

export function getSnippet(id) {
  return requestJson(`/api/admin/snippets/${id}`);
}

export function deleteSnippet(id) {
  return requestJson(`/api/admin/snippets/${id}`, {
    method: "DELETE",
  });
}

export function getAiRequests() {
  return requestJson("/api/admin/ai-requests");
}

export function getLanguages() {
  return requestJson("/api/admin/languages");
}

export function createLanguage(language) {
  return requestJson("/api/admin/languages", {
    method: "POST",
    body: JSON.stringify(language),
  });
}

export function updateLanguage(id, language) {
  return requestJson(`/api/admin/languages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(language),
  });
}

export function deleteLanguage(id) {
  return requestJson(`/api/admin/languages/${id}`, {
    method: "DELETE",
  });
}
