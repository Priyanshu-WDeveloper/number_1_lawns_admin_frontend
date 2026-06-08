export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'expired';
  active?: boolean;
  sort?: 'a_z' | 'z_a' | 'newest' | 'oldest' | 'date_asc' | 'date_desc';
  [key: string]: unknown;
}
