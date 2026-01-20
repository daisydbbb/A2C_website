import express, { Request, Response } from "express";
import { Tag } from "../models/Tag.model";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/User.model";

const router = express.Router();

// Get all tags (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ tags });
  } catch (error: any) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Create tag (owner only)
router.post(
  "/",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tag name is required" });
      }

      // Check if tag already exists
      const existingTag = await Tag.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });
      if (existingTag) {
        return res.status(400).json({ error: "Tag already exists" });
      }

      const tag = new Tag({ name: name.trim() });
      await tag.save();

      res.status(201).json({
        message: "Tag created successfully",
        tag,
      });
    } catch (error: any) {
      console.error("Create tag error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

// Delete tag (owner only)
router.delete(
  "/:id",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const tag = await Tag.findByIdAndDelete(req.params.id);

      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }

      res.json({ message: "Tag deleted successfully" });
    } catch (error: any) {
      console.error("Delete tag error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

export default router;
