export interface Privilege {
  id?: number;
  user_id: number;
  menu_id: number;
  c: boolean; // create
  r: boolean; // read
  u: boolean; // update
  d: boolean; // delete
  created_at?: Date;
  updated_at?: Date;
  user?: any; // Optional user data
  menu?: any; // Optional menu data
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
