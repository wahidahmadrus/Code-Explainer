import mongoose from "mongoose";

const aiRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    requestType: {
      type: String,
      enum: ["explain", "generate"],
      required: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    inputText: {
      type: String,
      required: true,
    },
    outputText: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AiRequest", aiRequestSchema);

