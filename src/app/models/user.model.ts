export interface User {
  id?: number;
  username: string;
  email?: string;
  password?: string;
  full_name?: string;
  level: string; // 'admin' or 'user'
  is_active: boolean;
  business_unit_id?: number;  // Single business unit
  business_unit?: string;      // Business unit name (from join)
  business_units?: BusinessUnit[];  // Array of accessible business units
  menus?: Menu[];  // Array of accessible menus
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

// User Access structure - Menu permissions only
export interface UserAccess {
  user: User;
  menus: Menu[];  // Array of accessible menus with permissions
}

export interface Menu {
  id: number;
  nama_menu: string;
  url_link: string;
  icon?: string;
  parent: number | null;
  active: string;
  permissions?: {
    c: boolean;  // Create
    r: boolean;  // Read
    u: boolean;  // Update
    d: boolean;  // Delete
  };
}

// For updating user menu access
export interface UserAccessForm {
  user_id: number;
  menu_ids: number[];  // Array of menu IDs user can access
}
