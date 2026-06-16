import type { IJob } from '.';

export interface FinancialReportResponse {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: FinancialSummary;
  paymentBreakdown: PaymentBreakdownItem[];
  jobs: IJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCashPayments: number;
  totalOnlinePayments: number;
  totalOtherPayments: number;
  completedJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
  inProgressJobs: number;
  totalJobs: number;
}

export interface PaymentBreakdownItem {
  paymentType: string;
  label: string;
  amount: number;
  jobCount: number;
}
