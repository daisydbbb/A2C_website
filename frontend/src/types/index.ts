export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQty: number;
  imageUrls: string[];
  sku: string;
  tag?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stockQty?: number;
  imageUrls?: string[];
  sku?: string;
  tag?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stockQty?: number;
  imageUrls?: string[];
  sku?: string;
  tag?: string;
  isActive?: boolean;
}

export interface Tag {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stockQty: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

// Order Types
export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
}

export enum FulfillmentStatus {
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingInfo {
  company: string;
  trackingNumber: string;
}

export interface Order {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  orderStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: ShippingAddress;
  shippingInfo?: ShippingInfo;
  createdAt: string;
}
