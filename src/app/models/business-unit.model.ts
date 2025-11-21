export interface BusinessUnit {
  id?: number;
  business_unit: string;
  active: 'y' | 'n';
  created_at?: Date;
  updated_at?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
