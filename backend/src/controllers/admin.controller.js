import mongoose from "mongoose";
import AiRequest from "../models/AiRequest.js";
import Snippet from "../models/Snippet.js";
import SupportedLanguage from "../models/SupportedLanguage.js";
import User from "../models/User.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toSafeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toLanguageResponse(language) {
  return {
    id: language._id.toString(),
    name: language.name,
    isActive: language.isActive,
    createdAt: language.createdAt,
    updatedAt: language.updatedAt,
  };
}

function toSnippetResponse(snippet) {
  return {
    id: snippet._id.toString(),
    user: toSafeUser(snippet.userId),
    title: snippet.title,
    language: snippet.language,
    code: snippet.code,
    explanation: snippet.explanation,
    mode: snippet.mode,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
  };
}

function toAiRequestResponse(aiRequest) {
  return {
    id: aiRequest._id.toString(),
    user: toSafeUser(aiRequest.userId),
    requestType: aiRequest.requestType,
    language: aiRequest.language,
    inputText: aiRequest.inputText,
    outputText: aiRequest.outputText,
    createdAt: aiRequest.createdAt,
    updatedAt: aiRequest.updatedAt,
  };
}

function sendValidationError(res, message) {
  return res.status(400).json({ message });
}

export async function getStats(req, res) {
  const [totalUsers, totalSnippets, totalAiRequests, totalLanguages, recentUsers, recentAiRequests] =
    await Promise.all([
      User.countDocuments(),
      Snippet.countDocuments(),
      AiRequest.countDocuments(),
      SupportedLanguage.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5),
      AiRequest.find().sort({ createdAt: -1 }).limit(8).populate("userId", "name email role createdAt updatedAt"),
    ]);

  return res.json({
    totalUsers,
    totalSnippets,
    totalAiRequests,
    totalLanguages,
    recentUsers: recentUsers.map(toSafeUser),
    recentAiRequests: recentAiRequests.map(toAiRequestResponse),
  });
}

export async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });

  return res.json(users.map(toSafeUser));
}

export async function updateUserRole(req, res) {
  const { id } = req.params;
  const role = String(req.body.role || "").trim();

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!["user", "admin"].includes(role)) {
    return sendValidationError(res, "role must be user or admin");
  }

  if (req.user._id.toString() === id && role !== "admin") {
    return sendValidationError(res, "You cannot remove your own admin role.");
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json(toSafeUser(user));
}

export async function listSnippets(req, res) {
  const snippets = await Snippet.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email role createdAt updatedAt");

  return res.json(snippets.map(toSnippetResponse));
}

export async function getSnippet(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Snippet not found." });
  }

  const snippet = await Snippet.findById(id).populate("userId", "name email role createdAt updatedAt");

  if (!snippet) {
    return res.status(404).json({ message: "Snippet not found." });
  }

  return res.json(toSnippetResponse(snippet));
}

export async function deleteSnippet(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Snippet not found." });
  }

  const snippet = await Snippet.findByIdAndDelete(id);

  if (!snippet) {
    return res.status(404).json({ message: "Snippet not found." });
  }

  return res.status(204).send();
}

export async function listAiRequests(req, res) {
  const aiRequests = await AiRequest.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name email role createdAt updatedAt");

  return res.json(aiRequests.map(toAiRequestResponse));
}

export async function listLanguages(req, res) {
  const languages = await SupportedLanguage.find().sort({ name: 1 });

  return res.json(languages.map(toLanguageResponse));
}

export async function createLanguage(req, res) {
  const name = String(req.body.name || "").trim();
  const isActive = req.body.isActive === undefined ? true : Boolean(req.body.isActive);

  if (!name) {
    return sendValidationError(res, "name is required");
  }

  const existingLanguage = await SupportedLanguage.findOne({
    name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });

  if (existingLanguage) {
    return res.status(409).json({ message: "That language already exists." });
  }

  const language = await SupportedLanguage.create({ name, isActive });

  return res.status(201).json(toLanguageResponse(language));
}

export async function updateLanguage(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Language not found." });
  }

  const updates = {};

  if (req.body.name !== undefined) {
    const name = String(req.body.name || "").trim();

    if (!name) {
      return sendValidationError(res, "name is required");
    }

    const existingLanguage = await SupportedLanguage.findOne({
      _id: { $ne: id },
      name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });

    if (existingLanguage) {
      return res.status(409).json({ message: "That language already exists." });
    }

    updates.name = name;
  }

  if (req.body.isActive !== undefined) {
    updates.isActive = Boolean(req.body.isActive);
  }

  const language = await SupportedLanguage.findByIdAndUpdate(id, updates, { new: true });

  if (!language) {
    return res.status(404).json({ message: "Language not found." });
  }

  return res.json(toLanguageResponse(language));
}

export async function deleteLanguage(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ message: "Language not found." });
  }

  const language = await SupportedLanguage.findById(id);

  if (!language) {
    return res.status(404).json({ message: "Language not found." });
  }

  const [snippetCount, aiRequestCount] = await Promise.all([
    Snippet.countDocuments({ language: language.name }),
    AiRequest.countDocuments({ language: language.name }),
  ]);

  if (snippetCount > 0 || aiRequestCount > 0) {
    return res.status(409).json({
      message: "This language is already used by snippets or AI requests. Disable it instead.",
    });
  }

  await language.deleteOne();

  return res.status(204).send();
}
