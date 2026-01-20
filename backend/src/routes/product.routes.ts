import express, { Request, Response } from "express";
import { Product } from "../models/Product.model";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/User.model";

const router = express.Router();

// Get all products (public - only active products)
router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json({ products });
  } catch (error: any) {
    console.error("Get products error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get all products including inactive (owner only)
router.get(
  "/admin/all",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json({ products });
    } catch (error: any) {
      console.error("Get all products error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

// Get single product by ID (public - only if active)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product });
  } catch (error: any) {
    console.error("Get product error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get single product by ID (owner only - includes inactive)
router.get(
  "/admin/:id",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ product });
    } catch (error: any) {
      console.error("Get product (admin) error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

// Create product (owner only)
router.post(
  "/",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const { name, description, price, stockQty, imageUrls, sku, tag } = req.body;

      // Validation
      if (!name || !description || price === undefined) {
        return res
          .status(400)
          .json({ error: "Name, description, and price are required" });
      }

      if (typeof price !== "number" || price < 0) {
        return res
          .status(400)
          .json({ error: "Price must be a non-negative number" });
      }

      if (stockQty !== undefined && (typeof stockQty !== "number" || stockQty < 0)) {
        return res
          .status(400)
          .json({ error: "Stock quantity must be a non-negative number" });
      }

      if (imageUrls !== undefined && !Array.isArray(imageUrls)) {
        return res.status(400).json({ error: "Image URLs must be an array" });
      }

      if (sku !== undefined && sku.length > 10) {
        return res.status(400).json({ error: "SKU must be 10 characters or less" });
      }

      // Check if SKU already exists (if provided)
      if (sku) {
        const existingSku = await Product.findOne({ sku });
        if (existingSku) {
          return res.status(400).json({ error: "SKU already exists" });
        }
      }

      const product = new Product({
        name,
        description,
        price,
        stockQty: stockQty ?? 0,
        imageUrls: imageUrls ?? [],
        sku: sku || undefined, // Let the model auto-generate if not provided
        tag: tag || undefined,
        isActive: true,
      });

      await product.save();

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error: any) {
      console.error("Create product error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

// Update product (owner only)
router.put(
  "/:id",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const { name, description, price, stockQty, imageUrls, isActive, sku, tag } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Validation
      if (price !== undefined && (typeof price !== "number" || price < 0)) {
        return res
          .status(400)
          .json({ error: "Price must be a non-negative number" });
      }

      if (stockQty !== undefined && (typeof stockQty !== "number" || stockQty < 0)) {
        return res
          .status(400)
          .json({ error: "Stock quantity must be a non-negative number" });
      }

      if (imageUrls !== undefined && !Array.isArray(imageUrls)) {
        return res.status(400).json({ error: "Image URLs must be an array" });
      }

      if (sku !== undefined && sku.length > 10) {
        return res.status(400).json({ error: "SKU must be 10 characters or less" });
      }

      // Check if SKU already exists (if changed)
      if (sku && sku !== product.sku) {
        const existingSku = await Product.findOne({ sku });
        if (existingSku) {
          return res.status(400).json({ error: "SKU already exists" });
        }
      }

      // Update fields if provided
      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = price;
      if (stockQty !== undefined) product.stockQty = stockQty;
      if (imageUrls !== undefined) product.imageUrls = imageUrls;
      if (isActive !== undefined) product.isActive = isActive;
      if (sku !== undefined) product.sku = sku;
      if (tag !== undefined) product.tag = tag;

      await product.save();

      res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error: any) {
      console.error("Update product error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

// Deactivate product (owner only) - soft delete
router.patch(
  "/:id/deactivate",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      product.isActive = false;
      await product.save();

      res.json({
        message: "Product deactivated successfully",
        product,
      });
    } catch (error: any) {
      console.error("Deactivate product error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

// Reactivate product (owner only)
router.patch(
  "/:id/activate",
  authenticate,
  requireRole(UserRole.OWNER),
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      product.isActive = true;
      await product.save();

      res.json({
        message: "Product activated successfully",
        product,
      });
    } catch (error: any) {
      console.error("Activate product error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

export default router;
