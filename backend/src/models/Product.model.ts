import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stockQty: number;
  imageUrls: string[];
  sku: string;
  tag?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generate a random SKU (less than 10 characters)
const generateSku = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sku = "";
  for (let i = 0; i < 8; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      maxlength: 10,
    },
    tag: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate SKU if not provided
productSchema.pre("save", async function (next) {
  if (!this.sku) {
    let newSku = generateSku();
    // Ensure SKU is unique
    const Product = mongoose.model<IProduct>("Product");
    let existing = await Product.findOne({ sku: newSku });
    while (existing) {
      newSku = generateSku();
      existing = await Product.findOne({ sku: newSku });
    }
    this.sku = newSku;
  }
  next();
});

// Index for efficient queries
productSchema.index({ isActive: 1 });
productSchema.index({ tag: 1 });
productSchema.index({ name: "text", description: "text" });
// Note: sku already has unique: true which creates an index

export const Product = mongoose.model<IProduct>("Product", productSchema);
