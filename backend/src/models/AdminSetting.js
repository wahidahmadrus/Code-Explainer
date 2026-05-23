import mongoose from "mongoose";

const adminSettingSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    settingValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AdminSetting", adminSettingSchema);

