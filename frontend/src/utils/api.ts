import axios from 'axios';
import { CreateProductData, UpdateProductData } from '../types';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const authAPI = {
  signup: async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Product API calls
export const productAPI = {
  // Public endpoints
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Owner-only endpoints
  getAllProductsAdmin: async () => {
    const response = await api.get('/products/admin/all');
    return response.data;
  },

  getProductAdmin: async (id: string) => {
    const response = await api.get(`/products/admin/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductData) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  deactivateProduct: async (id: string) => {
    const response = await api.patch(`/products/${id}/deactivate`);
    return response.data;
  },

  activateProduct: async (id: string) => {
    const response = await api.patch(`/products/${id}/activate`);
    return response.data;
  },
};

// Tag API calls
export const tagAPI = {
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },

  createTag: async (name: string) => {
    const response = await api.post('/tags', { name });
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },
};

// Checkout API calls
export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ShippingAddressInput {
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

export const checkoutAPI = {
  createPaymentIntent: async (
    items: CheckoutItem[],
    email: string,
    shippingAddress?: ShippingAddressInput
  ) => {
    const response = await api.post('/checkout/create-payment-intent', {
      items,
      email,
      shippingAddress,
    });
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/checkout/orders/${orderId}`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/checkout/orders');
    return response.data;
  },

  getAllOrdersAdmin: async () => {
    const response = await api.get('/checkout/orders/admin/all');
    return response.data;
  },

  updateOrderAdmin: async (
    orderId: string,
    orderStatus: string,
    shippingInfo?: { company: string; trackingNumber: string }
  ) => {
    const response = await api.patch(`/checkout/orders/admin/${orderId}`, {
      orderStatus,
      shippingInfo,
    });
    return response.data;
  },

  refundOrder: async (orderId: string) => {
    const response = await api.post(`/checkout/orders/admin/${orderId}/refund`);
    return response.data;
  },
};
