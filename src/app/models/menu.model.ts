export interface Menu {
  id?: number;
  nama_menu: string;
  url_link: string;
  icon?: string;
  parent?: number | null; // Laravel menggunakan 'parent' bukan 'parent_id'
  active?: string; // 'y' or 'n'
  children?: Menu[];
  allowed?: boolean; // For privileges
  permissions?: {
    c: boolean;
    r: boolean;
    u: boolean;
    d: boolean;
  };
  created_at?: Date;
  updated_at?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
