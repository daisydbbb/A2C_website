import express, { Request, Response } from "express";
import Stripe from "stripe";
import { Order, OrderStatus, PaymentStatus } from "../models/Order.model";
import { Product } from "../models/Product.model";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// Lazy initialization of Stripe (after env vars are loaded)
let stripeInstance: Stripe | null = null;

const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
};

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CheckoutRequest {
  items: CartItem[];
  email: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Create payment intent and order
router.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const { items, email, shippingAddress } = req.body as CheckoutRequest;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate items and calculate total from database prices (security)
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }

      if (!product.isActive) {
        return res.status(400).json({ error: `Product is not available: ${product.name}` });
      }

      if (product.stockQty < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQty}`
        });
      }

      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrls[0] || "",
      });

      subtotal += product.price * item.quantity;
    }

    const shipping = 0; // Free shipping for now
    const total = subtotal + shipping;

    // Convert to cents for Stripe
    const amountInCents = Math.round(total * 100);

    // Get Stripe instance (will throw if not configured)
    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch (error: any) {
      return res.status(500).json({
        error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
      });
    }

    // Create Stripe Payment Intent with Apple Pay support
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email,
        itemCount: validatedItems.length.toString(),
      },
      receipt_email: email,
    });

    // Get userId from auth if available
    let userId = undefined;
    if (req.cookies?.token) {
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.default.verify(
          req.cookies.token,
          process.env.JWT_SECRET || ""
        ) as { userId: string };
        userId = decoded.userId;
      } catch {
        // Not authenticated, continue without userId
      }
    }

    // Create order in database with pending status
    const order = new Order({
      userId,
      email,
      items: validatedItems,
      subtotal,
      shipping,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      shippingAddress,
    });

    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      total,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    
    // Return more helpful error messages
    let errorMessage = "Failed to create payment intent";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.type === "StripeInvalidRequestError") {
      errorMessage = `Stripe error: ${error.message || "Invalid request"}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get order by ID (for confirmation page)
router.get("/orders/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Don't expose client secret
    const orderData = {
      _id: order._id,
      email: order.email,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    };

    res.json({ order: orderData });
  } catch (error: any) {
    console.error("Get order error:", error);
    res.status(500).json({ error: error.message || "Failed to get order" });
  }
});

// Get user's orders (authenticated)
router.get("/orders", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const orders = await Order.find({ userId })
      .select("-stripeClientSecret")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: error.message || "Failed to get orders" });
  }
});

export default router;
