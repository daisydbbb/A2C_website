import mongoose, { Document, Schema } from "mongoose";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  email: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId: string;
  stripeClientSecret?: string;
  shippingAddress?: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "US" },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeClientSecret: {
      type: String,
    },
    shippingAddress: {
      type: shippingAddressSchema,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
// Note: stripePaymentIntentId already has unique: true which creates an index
orderSchema.index({ userId: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
