export interface BusinessUnit {
  id?: number;
  business_unit: string;
  user_id: number;
  active: 'y' | 'n';
  created_at?: Date;
  updated_at?: Date;
  user?: any; // Optional user data
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
