import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Order, FulfillmentStatus, PaymentStatus } from "../types";
import { checkoutAPI } from "../utils/api";

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkoutAPI.getAllOrdersAdmin();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: FulfillmentStatus) => {
    switch (status) {
      case FulfillmentStatus.PENDING:
        return "bg-gray-100 text-gray-800";
      case FulfillmentStatus.SHIPPED:
        return "bg-blue-100 text-blue-800";
      case FulfillmentStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case FulfillmentStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.SUCCEEDED:
        return "bg-blue-100 text-blue-800";
      case PaymentStatus.REFUNDED:
        return "bg-gray-100 text-gray-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCustomerDisplayInfo = (order: Order) => {
    if (order.shippingAddress) {
      const fullName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim();
      return {
        name: fullName || "N/A",
        email: order.email,
      };
    }
    // Fallback to email if no shipping address
    return {
      name: order.userId?.name || "N/A",
      email: order.email,
    };
  };

  const formatPaymentStatus = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return "Paid";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Order Management Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Order Management
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No orders found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const firstItem = order.items[0];
                  const customerInfo = getCustomerDisplayInfo(order);
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order._id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {firstItem?.imageUrl ? (
                          <img
                            src={firstItem.imageUrl}
                            alt={firstItem.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customerInfo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customerInfo.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {formatPaymentStatus(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() +
                            order.orderStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
