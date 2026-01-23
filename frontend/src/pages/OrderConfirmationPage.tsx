import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Order, PaymentStatus } from "../types";
import { checkoutAPI } from "../utils/api";
import { useCart } from "../contexts/CartContext";
import logo from "../assets/logo.png";

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);

  // Check payment status from URL params (Stripe redirect)
  const paymentIntentStatus = searchParams.get("redirect_status");

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await checkoutAPI.getOrder(id);
      setOrder(response.order);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  // Clear cart when payment is successful
  useEffect(() => {
    const isPaymentSuccessful =
      paymentIntentStatus === "succeeded" ||
      order?.paymentStatus === PaymentStatus.SUCCEEDED;

    if (isPaymentSuccessful && !cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [order, paymentIntentStatus, cartCleared, clearCart]);

  // Poll for order status update if payment succeeded but order not yet updated
  useEffect(() => {
    if (
      order &&
      paymentIntentStatus === "succeeded" &&
      order.paymentStatus === PaymentStatus.PENDING
    ) {
      const interval = setInterval(() => {
        fetchOrder(orderId!);
      }, 2000);

      // Stop polling after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [order, paymentIntentStatus, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="Addicted2Cardboard Logo"
                  className="h-10 w-auto"
                />
                <h1 className="text-xl font-bold text-gray-900">
                  Addicted2Cardboard
                </h1>
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error || "Unable to find your order."}</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccessful =
    order.paymentStatus === PaymentStatus.SUCCEEDED ||
    paymentIntentStatus === "succeeded";

  const isPending =
    order.paymentStatus === PaymentStatus.PENDING &&
    paymentIntentStatus === "succeeded";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Addicted2Cardboard Logo"
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Addicted2Cardboard
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      {/* Confirmation Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Header */}
        <div className="text-center mb-8">
          {isPaymentSuccessful ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPending ? "Processing Payment..." : "Thank You for Your Order!"}
              </h1>
              <p className="text-gray-600">
                {isPending
                  ? "Your payment is being confirmed. This page will update automatically."
                  : "Your payment was successful. A confirmation email will be sent shortly."}
              </p>
            </>
          ) : order.paymentStatus === PaymentStatus.FAILED ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600">
                Unfortunately, your payment could not be processed. Please try again.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Pending
              </h1>
              <p className="text-gray-600">
                Your order is being processed. Please wait for payment confirmation.
              </p>
            </>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <span className="text-sm text-gray-500">
              Order #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Order Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">Payment Status:</span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                order.paymentStatus === PaymentStatus.SUCCEEDED
                  ? "bg-green-100 text-green-800"
                  : order.paymentStatus === PaymentStatus.FAILED
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.paymentStatus === PaymentStatus.SUCCEEDED
                ? "Paid"
                : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>

          {/* Items */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.phoneNumber}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <p className="text-gray-600">{order.email}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            onClick={() => {
              // Ensure cart is cleared before navigating
              if (!cartCleared) {
                clearCart();
              }
            }}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
};
