import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    explanation: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    mode: {
      type: String,
      enum: ["explain", "generate"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Snippet", snippetSchema);

