import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Order, FulfillmentStatus, PaymentStatus, OrderStatus } from "../types";
import { checkoutAPI } from "../utils/api";

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form state for order status update
  const [selectedStatus, setSelectedStatus] = useState<FulfillmentStatus>(FulfillmentStatus.PENDING);
  const [shippingCompany, setShippingCompany] = useState("");
  const [customShippingCompany, setCustomShippingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  // Auto-set shipping company to "Other" when status changes to shipped
  useEffect(() => {
    if (selectedStatus === FulfillmentStatus.SHIPPED && (!shippingCompany || shippingCompany === "")) {
      setShippingCompany("Other");
    }
  }, [selectedStatus]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await checkoutAPI.getOrder(orderId);
      setOrder(response.order);
      // Initialize form state with current order data
      if (response.order) {
        setSelectedStatus(response.order.orderStatus);
        if (response.order.shippingInfo) {
          const company = response.order.shippingInfo.company;
          // Check if it's one of the standard companies
          if (["UPS", "USPS", "FedEx"].includes(company)) {
            setShippingCompany(company);
          } else {
            setShippingCompany("Other");
            setCustomShippingCompany(company);
          }
          setTrackingNumber(response.order.shippingInfo.trackingNumber);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;

    // Validate shipping info if status is shipped
    if (selectedStatus === FulfillmentStatus.SHIPPED) {
      // If no company selected, default to "Other"
      if (!shippingCompany || shippingCompany === "") {
        setShippingCompany("Other");
      }
      const finalCompany = shippingCompany === "Other" ? customShippingCompany.trim() : shippingCompany.trim();
      if (!finalCompany || !trackingNumber.trim()) {
        setUpdateError("Shipping company and tracking number are required when status is shipped");
        return;
      }
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      // If no company selected, default to "Other"
      let finalCompany = shippingCompany === "Other" ? customShippingCompany.trim() : shippingCompany.trim();
      if (selectedStatus === FulfillmentStatus.SHIPPED && !finalCompany) {
        finalCompany = customShippingCompany.trim() || "Other";
      }

      // Always include shipping info if status is shipped, even if status hasn't changed
      const shippingInfo =
        selectedStatus === FulfillmentStatus.SHIPPED
          ? {
              company: finalCompany,
              trackingNumber: trackingNumber.trim(),
            }
          : undefined;

      const response = await checkoutAPI.updateOrderAdmin(
        order._id,
        selectedStatus,
        shippingInfo
      );

      setOrder(response.order);
      setUpdateSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setUpdateError(err.response?.data?.error || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if there are changes to save
  const hasChanges = () => {
    if (!order) return false;

    // Check if order status changed
    if (selectedStatus !== order.orderStatus) {
      return true;
    }

    // Check if shipping info changed (when status is shipped)
    if (selectedStatus === FulfillmentStatus.SHIPPED) {
      const finalCompany = shippingCompany === "Other" ? customShippingCompany.trim() : shippingCompany.trim();
      const currentCompany = order.shippingInfo?.company || "";
      const currentTracking = order.shippingInfo?.trackingNumber || "";

      if (finalCompany !== currentCompany || trackingNumber.trim() !== currentTracking) {
        return true;
      }
    }

    return false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusColor = (status: PaymentStatus | OrderStatus) => {
    // Handle both PaymentStatus and OrderStatus (for "paid")
    if (status === PaymentStatus.SUCCEEDED || status === OrderStatus.PAID) {
      return "bg-green-100 text-green-800";
    }
    if (status === PaymentStatus.PENDING || status === OrderStatus.PENDING) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (status === PaymentStatus.FAILED || status === OrderStatus.FAILED) {
      return "bg-red-100 text-red-800";
    }
    if (status === PaymentStatus.REFUNDED) {
      return "bg-gray-100 text-gray-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const formatPaymentStatus = (status: PaymentStatus | OrderStatus) => {
    if (status === PaymentStatus.SUCCEEDED || status === OrderStatus.PAID) {
      return "Paid";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getCustomerDisplay = (order: Order) => {
    if (order.shippingAddress) {
      return {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        email: order.email,
      };
    }
    if (order.userId?.name) {
      return {
        name: order.userId.name,
        email: order.email,
      };
    }
    return {
      name: order.email.split("@")[0], // Use email prefix as fallback
      email: order.email,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error || "Unable to find the order."}</p>
            <Link
              to="/admin/orders"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Order Info Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {/* First row: Order Date, Customer, Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          <div className="md:col-span-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Order Date</h3>
            <p className="text-gray-900">{formatDate(order.createdAt)}</p>
          </div>
          <div className="md:col-span-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
            {(() => {
              const customer = getCustomerDisplay(order);
              return (
                <>
                  <p className="text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </>
              );
            })()}
          </div>
          <div className="md:col-span-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Payment</h3>
            <span
              className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getPaymentStatusColor(
                order.status
              )}`}
            >
              {formatPaymentStatus(order.status)}
            </span>
          </div>
        </div>

        {/* Second row: Order Status with dropdown */}
        <div className="border-t pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                    order.orderStatus === FulfillmentStatus.PENDING
                      ? "bg-gray-100 text-gray-800"
                      : order.orderStatus === FulfillmentStatus.SHIPPED
                      ? "bg-blue-100 text-blue-800"
                      : order.orderStatus === FulfillmentStatus.DELIVERED
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
                <div className="w-32">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as FulfillmentStatus)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value={FulfillmentStatus.PENDING}>Pending</option>
                    <option value={FulfillmentStatus.SHIPPED}>Shipped</option>
                    <option value={FulfillmentStatus.DELIVERED}>Delivered</option>
                    <option value={FulfillmentStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || !hasChanges()}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>

          {/* Show shipping info if exists in database - always show regardless of status */}
          {order.shippingInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">tracking:</span> {order.shippingInfo.company.toLowerCase()} - {order.shippingInfo.trackingNumber}
              </p>
            </div>
          )}

          {/* Shipping info fields - show when status is shipped */}
          {selectedStatus === FulfillmentStatus.SHIPPED && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Shipping Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shipping Company
                  </label>
                  {shippingCompany && shippingCompany !== "Other" && ["UPS", "USPS", "FedEx"].includes(shippingCompany) ? (
                    <select
                      value={shippingCompany}
                      onChange={(e) => {
                        if (e.target.value === "Other") {
                          setShippingCompany("Other");
                        } else {
                          setShippingCompany(e.target.value);
                        }
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                    >
                      <option value="UPS">UPS</option>
                      <option value="USPS">USPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customShippingCompany}
                      onChange={(e) => setCustomShippingCompany(e.target.value)}
                      placeholder="Enter shipping company name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success/Error messages */}
          {updateSuccess && (
            <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded">
              Order status updated successfully!
            </div>
          )}
          {updateError && (
            <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded">
              {updateError}
            </div>
          )}
        </div>
      </div>

      {/* Items Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
              <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
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
                <p className="text-sm text-gray-600 mt-1">
                  ${item.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t mt-6 pt-6 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>
              {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Shipping Address
          </h3>
          <div className="text-gray-600">
            <p className="font-medium text-gray-900">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="mt-1">{order.shippingAddress.phoneNumber}</p>
            <p className="mt-1">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p>{order.shippingAddress.line2}</p>
            )}
            <p className="mt-1">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}
    </div>
  );
};
