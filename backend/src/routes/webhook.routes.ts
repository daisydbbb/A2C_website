import express, { Request, Response } from "express";
import Stripe from "stripe";
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from "../models/Order.model";
import { Product } from "../models/Product.model";
import { io } from "../index";

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

// Stripe webhook handler
// IMPORTANT: This route must use raw body parser, not JSON
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // Get Stripe instance (will throw if not configured)
    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch (error: any) {
      console.error("Stripe is not configured:", error.message);
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);

        try {
          // Find and update order
          const order = await Order.findOne({
            stripePaymentIntentId: paymentIntent.id,
          });

          if (order) {
            // Update payment status only, orderStatus remains pending for owner to update
            order.paymentStatus = PaymentStatus.SUCCEEDED;
            order.status = OrderStatus.PAID; // Keep for backward compatibility
            // orderStatus stays as PENDING - owner will update it manually
            await order.save();

            // Decrease stock for each item and emit real-time updates
            const stockUpdates: Array<{ productId: string; stockQty: number }> = [];
            
            for (const item of order.items) {
              const updatedProduct = await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stockQty: -item.quantity } },
                { new: true }
              );
              
              if (updatedProduct) {
                stockUpdates.push({
                  productId: updatedProduct._id.toString(),
                  stockQty: updatedProduct.stockQty,
                });
              }
            }

            // Emit stock update events to all connected clients
            if (stockUpdates.length > 0) {
              io.emit("stock-update", { updates: stockUpdates });
              console.log(`📡 Emitted stock updates for ${stockUpdates.length} products`);
            }

            console.log(`Order ${order._id} marked as paid`);
          } else {
            console.error(`Order not found for PaymentIntent ${paymentIntent.id}`);
          }
        } catch (error) {
          console.error("Error updating order:", error);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} failed`);

        try {
          const order = await Order.findOne({
            stripePaymentIntentId: paymentIntent.id,
          });

          if (order) {
            order.paymentStatus = PaymentStatus.FAILED;
            order.status = OrderStatus.FAILED;
            await order.save();
            console.log(`Order ${order._id} marked as failed`);
          }
        } catch (error) {
          console.error("Error updating order:", error);
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} canceled`);

        try {
          const order = await Order.findOne({
            stripePaymentIntentId: paymentIntent.id,
          });

          if (order) {
            order.paymentStatus = PaymentStatus.FAILED;
            order.status = OrderStatus.CANCELLED;
            await order.save();
            console.log(`Order ${order._id} marked as cancelled`);
          }
        } catch (error) {
          console.error("Error updating order:", error);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        console.log(`Charge refunded for PaymentIntent ${paymentIntentId}`);

        try {
          const order = await Order.findOne({
            stripePaymentIntentId: paymentIntentId,
          });

          if (order) {
            order.paymentStatus = PaymentStatus.REFUNDED;
            await order.save();

            // Restore stock for each item and emit real-time updates
            const stockUpdates: Array<{ productId: string; stockQty: number }> = [];
            
            for (const item of order.items) {
              const updatedProduct = await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stockQty: item.quantity } },
                { new: true }
              );
              
              if (updatedProduct) {
                stockUpdates.push({
                  productId: updatedProduct._id.toString(),
                  stockQty: updatedProduct.stockQty,
                });
              }
            }

            // Emit stock update events to all connected clients
            if (stockUpdates.length > 0) {
              io.emit("stock-update", { updates: stockUpdates });
              console.log(`📡 Emitted stock updates for ${stockUpdates.length} products (refund)`);
            }

            console.log(`Order ${order._id} marked as refunded, stock restored`);
          }
        } catch (error) {
          console.error("Error updating order:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

export default router;
