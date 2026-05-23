import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

export async function getUserFromRequest(req) {
  const token = getBearerToken(req);

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");

    return user || null;
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Log in to continue.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT_SECRET is not configured.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    req.user = user;
    req.auth = {
      userId: payload.userId,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

