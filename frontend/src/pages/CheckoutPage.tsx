import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { checkoutAPI } from "../utils/api";
import logo from "../assets/logo.png";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  total: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  orderId,
  total,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred during payment.");
      setIsProcessing(false);
    } else {
      // Payment succeeded, redirect will happen automatically
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { items, getCartTotal, clearCart, getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
    setLoading(false);
  }, [items, navigate]);

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));

      const shippingAddress = {
        firstName,
        lastName,
        phoneNumber,
        line1: addressLine1,
        line2: addressLine2 || undefined,
        city,
        state,
        postalCode,
        country: "US",
      };

      const response = await checkoutAPI.createPaymentIntent(
        checkoutItems,
        email,
        shippingAddress
      );

      setClientSecret(response.clientSecret);
      setOrderId(response.orderId);
      setTotal(response.total);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to initialize checkout");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/cart" className="text-blue-600 hover:text-blue-800">
            Cart
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Checkout</span>
        </nav>
      </div>

      {/* Checkout Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {!showPayment ? (
              <form onSubmit={handleContinueToPayment}>
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="addressLine1"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="addressLine2"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="CA"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment
                  </h2>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit Shipping
                  </button>
                </div>

                {/* Shipping Summary */}
                <div className="bg-gray-50 rounded-md p-4 mb-6 text-sm">
                  <p className="font-medium">{firstName} {lastName}</p>
                  <p className="text-gray-600">{phoneNumber}</p>
                  <p className="text-gray-600">{addressLine1}</p>
                  {addressLine2 && (
                    <p className="text-gray-600">{addressLine2}</p>
                  )}
                  <p className="text-gray-600">
                    {city}, {state} {postalCode}
                  </p>
                  <p className="text-gray-600">{email}</p>
                </div>

                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#2563eb",
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      clientSecret={clientSecret}
                      orderId={orderId!}
                      total={total}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
