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

export interface BusinessUnit {
  id: number;
  business_unit: string;
  user_id?: number;
  active: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface MenuPermission {
  c: boolean; // Create
  r: boolean; // Read
  u: boolean; // Update
  d: boolean; // Delete
}

export interface UserPrivileges {
  user: User;
  business_unit: BusinessUnit;
  menus: Array<{
    id: number;
    nama_menu: string;
    url_link: string;
    parent: number | null;
    allowed: boolean;
    permissions: MenuPermission;
  }>;
}

export interface LoginRequest {
  username: string;
  password: string;
  business_unit_id: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    business_unit: BusinessUnit;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
