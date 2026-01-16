import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
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
      console.log("⚠️  Owner account already exists:", ownerEmail);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ownerPassword, salt);

    // Create owner account
    const owner = new User({
      email: ownerEmail,
      password: hashedPassword,
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
