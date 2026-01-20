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
