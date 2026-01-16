import { useAuth } from "../contexts/AuthContext";

export const AdminPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Owner Admin Panel
          </h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Welcome, {user?.email}! This is the owner/admin dashboard.
            </p>
            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">
                Owner Features (Coming Soon):
              </h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Product Management</li>
                <li>Inventory Management</li>
                <li>Order Management</li>
                <li>Refund Processing</li>
                <li>Customer Messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
