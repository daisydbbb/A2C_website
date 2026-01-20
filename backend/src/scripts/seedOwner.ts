import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, UserRole } from "../models/User.model";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/addicted2cardboard";

async function seedOwner() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Owner credentials
    const ownerEmail =
      process.env.OWNER_EMAIL || "owner@addicted2cardboard.com";
    const ownerPassword = process.env.OWNER_PASSWORD || "owner123456";

    // Check if owner already exists
    const existingOwner = await User.findOne({ email: ownerEmail });
    if (existingOwner) {
      // Delete existing owner so we can recreate with correct password
      await User.deleteOne({ email: ownerEmail });
      console.log("⚠️  Existing owner account deleted, recreating...");
    }

    // Create owner account (password will be hashed by the User model pre-save hook)
    const owner = new User({
      email: ownerEmail,
      password: ownerPassword, // Don't hash here - the model does it automatically
      role: UserRole.OWNER,
      name: "Store Owner",
    });

    await owner.save();
    console.log("✅ Owner account created successfully!");
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Password: ${ownerPassword}`);
    console.log("   ⚠️  Please change the password after first login!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding owner:", error);
    process.exit(1);
  }
}

seedOwner();
