const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const TOKEN_KEY = "code_explainer_admin_token";

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
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
    const response = await fetch(`${API_URL}${path}`, options);
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

export async function getCurrentAdmin() {
  const token = getAdminToken();

  if (!token) {
    return null;
  }

  const data = await requestJson("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (data.user?.role !== "admin") {
    logoutAdmin();
    throw new Error("You do not have admin access.");
  }

  return data.user;
}

export async function loginAdmin(email, password) {
  const data = await requestJson("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  setAdminToken(data.token);

  try {
    const user = await getCurrentAdmin();
    return { token: data.token, user };
  } catch (error) {
    logoutAdmin();
    throw error;
  }
}
