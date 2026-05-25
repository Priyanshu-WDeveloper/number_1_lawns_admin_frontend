export interface IAdmins {
  _id: string;
  adminId: number;

  firstName: string;
  lastName: string;
  fullName: string;

  email: string;

  status: 'active' | 'inactive' | 'expired';

  profileImage: string;
  companyName: string;
  gstNumber: string;
  bankAccountNumber: string;
  invoiceLogo?: string;

  countryCode: string;
  phoneNumber: string;

  role: number;

  city: string;
  address: string;
  state: string;
  postalCode: string;
  country: string;

  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  createdAt: string;
  updatedAt: string;
  validity?: string;
}
