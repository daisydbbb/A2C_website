import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

// Load environment variables FIRST before any other imports
const envPath = path.join(process.cwd(), ".env");
const envLoaded = dotenv.config({ path: envPath });

if (envLoaded.error) {
  console.warn("⚠️  .env file not found or couldn't be loaded:", envLoaded.error.message);
  console.warn(`   Looking for .env at: ${envPath}`);
  console.warn(`   Current working directory: ${process.cwd()}`);
} else {
  console.log("✅ Environment variables loaded from .env");

  // Verify Stripe key is loaded
  if (process.env.STRIPE_SECRET_KEY) {
    console.log("✅ STRIPE_SECRET_KEY found in environment");
  } else {
    console.warn("⚠️  STRIPE_SECRET_KEY not found in .env file");
    console.warn("   Make sure your .env file contains: STRIPE_SECRET_KEY=sk_test_...");
  }
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import tagRoutes from "./routes/tag.routes";
import checkoutRoutes from "./routes/checkout.routes";
import webhookRoutes from "./routes/webhook.routes";

const app = express();
const PORT = process.env.PORT || 5001;

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Webhook routes MUST come before express.json() middleware
// because Stripe webhooks need the raw body
app.use("/api/webhooks", webhookRoutes);

// JSON and cookie middleware for all other routes
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/addicted2cardboard";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/checkout", checkoutRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
