import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";
import logo from "../assets/logo.png";

export const CartPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } =
    useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

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
            <div className="flex items-center space-x-4">
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="text-gray-700 hover:text-gray-900"
                    title="Account Settings"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </Link>
                  <span className="text-sm text-gray-700">
                    {user.email} ({user.role})
                  </span>
                  {user.role === UserRole.OWNER && (
                    <Link
                      to="/admin"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
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
          <span className="text-gray-600">Cart</span>
        </nav>
      </div>

      {/* Cart Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items yet.
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow-md p-4 flex gap-4"
                >
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.productId}`}
                    className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden"
                  >
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
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-blue-600 font-bold mt-1">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stockQty}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    {item.quantity >= item.stockQty && (
                      <p className="text-xs text-orange-600 mt-1">
                        Max quantity reached
                      </p>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/"
                  className="block text-center text-blue-600 hover:text-blue-800 mt-4 text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
