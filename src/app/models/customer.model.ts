export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  business_unit_id?: number;
  business_unit?: {
    id: number;
    business_unit: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  business_unit_id?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
