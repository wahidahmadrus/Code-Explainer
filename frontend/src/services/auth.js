const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const TOKEN_KEY = "code_practice_token";
const USER_KEY = "code_practice_user";

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

function saveAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return {
    token: data.token,
    user: data.user,
  };
}

export function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userText = localStorage.getItem(USER_KEY);

  if (!token || !userText) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(userText),
    };
  } catch {
    logout();
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function authRequest(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(data.message || "Authentication failed.");
  }

  return saveAuth(data);
}

export async function signup({ name, email, password }) {
  return authRequest("/api/auth/signup", {
    name,
    email,
    password,
  });
}

export async function login({ email, password }) {
  return authRequest("/api/auth/login", {
    email,
    password,
  });
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    logout();
    throw new Error(data.message || "Please log in again.");
  }

  const nextAuth = {
    token,
    user: data.user,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return nextAuth;
}

