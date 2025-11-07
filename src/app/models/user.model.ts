export interface User {
  id?: number;
  username: string;
  email?: string;
  password?: string;
  full_name?: string;
  level: string; // 'admin' or 'user'
  is_active: boolean;
  business_unit_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BusinessUnit {
  id?: number;
  business_unit: string;
  active: string; // 'y' or 'n'
  created_at?: Date;
  updated_at?: Date;
}

export interface PrivilegeUser {
  id?: number;
  user_id: number;
  menu_id: number;
  allowed: boolean;
  c: boolean;
  r: boolean;
  u: boolean;
  d: boolean;
  created_at?: Date;
  updated_at?: Date;
}
