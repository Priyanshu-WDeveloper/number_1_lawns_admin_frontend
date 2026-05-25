// Customer types
export interface ICustomer {
  _id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  status: 'active' | 'inactive' | 'expired';
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  role: number;
  city: string;
  address: string;
  state: string;
  postalCode: string;
  country: string;
  balance: number;
  parentAdmin: string;
  active: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}
