// Employee types
export interface IEmployee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  status: 'active' | 'inactive';
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  role: number;
  city: string;
  address: string;
  state: string;
  postalCode: string;
  country: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationMode?: 'map' | 'manual';
  balance: number;
  parentAdmin: string;
  active: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  validity?: string;
  wallet?: string;
  attachments?: Array<{ key: string; value: string }>;
}
export interface EmployeeRow {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  balance: number;
}
export interface EmployeesResponse {
  employees: IEmployee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  latitude?: number;
  longitude?: number;
  attachments?: Array<{ key: string; value: string }>;
}
export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: string;
}

// export interface UpdateEmployeePayload {
//   firstName: string;
//   lastName: string;
//   email: string;
//   profileImage: string;
//   countryCode: string;
//   phoneNumber: string;
//   address: string;
//   postalCode: string;
//   city: string;
//   state: string;
//   country: string;
//   balance: number;
// }
