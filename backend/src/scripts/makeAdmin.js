import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

async function makeAdmin() {
  const email = String(process.argv[2] || "").trim().toLowerCase();

  if (!email) {
    console.error("Usage: npm run make-admin -- user@example.com");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });

    if (!user) {
      console.error(`No user found with email ${email}.`);
      process.exitCode = 1;
      return;
    }

    console.log(`${user.email} is now an admin.`);
  } catch (error) {
    console.error("Could not update the user role:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();
