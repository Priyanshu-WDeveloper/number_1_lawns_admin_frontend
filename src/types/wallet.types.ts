export interface IWalletEmployeeRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  fullName: string;
  employeeId: string;
  wallet: number;
}

export interface IWalletAdminRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  companyName: string;
  fullName: string;
  adminId: number;
  wallet: number;
}

export interface IWalletJobRef {
  _id: string;
  jobDate: string;
  paymentType: string;
  price: number;
  receivePrice: number;
  status: string;
  jobId: string;
}

export interface IWalletCustomerRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  role: number;
  fullName: string;
}

export interface IWalletHistoryEntry {
  _id: string;
  adminId: string;
  type: string;
  amount: number;
  employeeId: IWalletEmployeeRef | string | null;
  jobId: IWalletJobRef | string | null;
  customerId: IWalletCustomerRef | string | null;
  fromEmployeeId: IWalletEmployeeRef | null;
  toAdminId: IWalletAdminRef | null;
  employeeWalletBalanceAfter: number;
  adminWalletBalanceAfter?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWalletHistoryResponse {
  message: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    wallet: number;
  };
  history: IWalletHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ISettlementPayload {
  adminId: string;
  fromEmployeeId: string;
  moneyReceiving: number;
}

export interface ISettlementResponse {
  message: string;
  admin: { _id: string; wallet: number };
  employee: {
    _id: string;
    wallet: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  history: IWalletHistoryEntry;
}

export interface WalletHistoryQueryParams {
  engineerId: string;
  page?: number;
  limit?: number;
}
