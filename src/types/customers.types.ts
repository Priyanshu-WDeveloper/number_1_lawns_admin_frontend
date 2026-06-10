// Customer types
export interface ICustomer {
  _id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  status: 'active' | 'inactive' | 'expired';

  countryCode: string;
  phoneNumber: string;
  role: number;
  city: string;
  address: string;
  state: string;
  postalCode: string;
  country: string;
  profileImage?: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;

  location?: { type: 'Point'; coordinates: [number, number] };
  latitude?: number;

  longitude?: number;
}
