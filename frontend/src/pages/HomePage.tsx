import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { UserRole, Product } from "../types";
import { productAPI } from "../utils/api";
import logo from "../assets/logo.png";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const cartItemCount = getCartItemCount();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getProducts();
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to Addicted2Cardboard
            </h2>
            <p className="text-lg opacity-90">
              Buy & Sell One Piece Trading Cards
            </p>
          </div>

          {/* Products Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Products</h3>

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No products available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100">
                      {product.imageUrls[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xl font-bold text-blue-600 mt-1">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.stockQty === 0 && (
                        <p className="text-sm text-red-500 mt-1">Out of Stock</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
