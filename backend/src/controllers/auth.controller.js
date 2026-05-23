import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function sendValidationError(res, message) {
  return res.status(400).json({ message });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured.");
    error.status = 500;
    throw error;
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function signup(req, res) {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name) {
    return sendValidationError(res, "name is required");
  }

  if (!email || !isValidEmail(email)) {
    return sendValidationError(res, "Enter a valid email address.");
  }

  if (password.length < 6) {
    return sendValidationError(res, "Password must be at least 6 characters.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = createToken(user);

  return res.status(201).json({
    token,
    user: toSafeUser(user),
  });
}

export async function login(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !isValidEmail(email)) {
    return sendValidationError(res, "Enter a valid email address.");
  }

  if (!password) {
    return sendValidationError(res, "password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Email or password is incorrect.",
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Email or password is incorrect.",
    });
  }

  const token = createToken(user);

  return res.json({
    token,
    user: toSafeUser(user),
  });
}

export async function getMe(req, res) {
  return res.json({
    user: toSafeUser(req.user),
  });
}

