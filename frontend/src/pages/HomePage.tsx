import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";
import logo from "../assets/logo.png";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

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
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Addicted2Cardboard Logo"
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Addicted2Cardboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
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
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Addicted2Cardboard
            </h2>
            <p className="text-gray-600 mb-6">
              Buy & Sell One Piece Trading Cards
            </p>
            {user ? (
              <div className="space-y-2">
                <p className="text-green-600">
                  You are logged in as: {user.email}
                </p>
                <p className="text-sm text-gray-500">Role: {user.role}</p>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/signup"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
