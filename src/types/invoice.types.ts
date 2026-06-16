export interface ResendInvoiceResponse {
  message: string;
  invoiceUrl?: string;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: string;
  paymentAmount?: string;
  paymentType?: string;
}

export interface UpdatePaymentStatusResponse {
  message: string;
  invoice: any;
}
