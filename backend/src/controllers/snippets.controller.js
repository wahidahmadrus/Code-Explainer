import mongoose from "mongoose";
import Snippet from "../models/Snippet.js";

function sendValidationError(res, message) {
  return res.status(400).json({ message });
}

function toSnippetResponse(snippet) {
  return {
    id: snippet._id.toString(),
    userId: snippet.userId.toString(),
    title: snippet.title,
    language: snippet.language,
    code: snippet.code,
    explanation: snippet.explanation,
    mode: snippet.mode,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
  };
}

export async function createSnippet(req, res) {
  const title = String(req.body.title || "").trim();
  const language = String(req.body.language || "").trim();
  const code = String(req.body.code || "");
  const mode = String(req.body.mode || "").trim();
  const explanation = req.body.explanation;

  if (!title) {
    return sendValidationError(res, "title is required");
  }

  if (!language) {
    return sendValidationError(res, "language is required");
  }

  if (!code.trim()) {
    return sendValidationError(res, "code is required");
  }

  if (!["explain", "generate"].includes(mode)) {
    return sendValidationError(res, "mode must be explain or generate");
  }

  if (explanation == null || typeof explanation !== "object") {
    return sendValidationError(res, "explanation is required");
  }

  const snippet = await Snippet.create({
    userId: req.user._id,
    title,
    language,
    code,
    explanation,
    mode,
  });

  return res.status(201).json(toSnippetResponse(snippet));
}

export async function listSnippets(req, res) {
  const snippets = await Snippet.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res.json(snippets.map(toSnippetResponse));
}

export async function getSnippet(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({
      message: "Snippet not found.",
    });
  }

  const snippet = await Snippet.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!snippet) {
    return res.status(404).json({
      message: "Snippet not found.",
    });
  }

  return res.json(toSnippetResponse(snippet));
}

export async function deleteSnippet(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({
      message: "Snippet not found.",
    });
  }

  const snippet = await Snippet.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!snippet) {
    return res.status(404).json({
      message: "Snippet not found.",
    });
  }

  return res.status(204).send();
}

