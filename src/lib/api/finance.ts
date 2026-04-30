import { apiClient } from "../api-client";
import { Contract } from "@/lib/data/contracts";
import { Invoice } from "@/lib/data/invoices";

export interface PayrollEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface PayrollItem {
  id: string;
  invoiceNo: string;
  title: string;
  amount: number;
  paidIn: string;
  status: string;
  issueDate: string;
  employee: PayrollEmployee;
}

export interface PayrollResult {
  invoiceId: string;
  status: "success" | "failed";
  error?: string;
}

export interface RunPayrollResponse {
  results: PayrollResult[];
  succeeded: number;
  failed: number;
  total: number;
}

export interface RunPayrollInput {
  invoiceIds: string[];
  providerId?: "monnify" | "flutterwave";
}

interface DepositRequest {
  amount: number;
  provider?: "monnify" | "flutterwave";
  redirectUrl?: string;
}

interface DepositResponse {
  reference: string;
  provider: string;
  checkoutUrl?: string;
  paymentUrl?: string;
  authorizationUrl?: string;
  status: string;
  amount: number;
  currency: string;
}

export class FinanceService {
  static async getPendingPayroll(): Promise<PayrollItem[]> {
    return apiClient.get<PayrollItem[]>("/api/v1/finance/payroll");
  }

  static async submitPayroll(data: RunPayrollInput): Promise<RunPayrollResponse> {
    return apiClient.post<RunPayrollResponse>("/api/v1/finance/payroll", data);
  }

  static async getContracts(): Promise<Contract[]> {
    return apiClient.get<Contract[]>("/api/v1/finance/contracts");
  }

  static async getInvoices(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>("/api/v1/finance/invoices");
  }

  static async initializeDeposit(request: DepositRequest): Promise<DepositResponse> {
    return apiClient.post<DepositResponse>("/api/v1/finance/fiat/deposit", request);
  }
}
