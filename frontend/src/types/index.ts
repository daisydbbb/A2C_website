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
