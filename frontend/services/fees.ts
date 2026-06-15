import { api } from './api';
import { FeeInvoice, FeePayment, FeeSummary } from '@/types';

const unwrap = <T>(payload: unknown): T => {
  const responsePayload = payload as { data?: unknown };
  const data = responsePayload.data ?? payload;
  const paginated = data as { results?: unknown };
  return (paginated.results ?? data) as T;
};

export const feeService = {
  getInvoices: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/fees/invoices/${query}`);
    return unwrap<FeeInvoice[]>(response.data);
  },

  getInvoice: async (id: string) => {
    const response = await api.get(`/fees/invoices/${id}/`);
    return unwrap<FeeInvoice>(response.data);
  },

  createInvoice: async (data: Partial<FeeInvoice>) => {
    const response = await api.post('/fees/invoices/', data);
    return unwrap<FeeInvoice>(response.data);
  },

  updateInvoice: async (id: string, data: Partial<FeeInvoice>) => {
    const response = await api.patch(`/fees/invoices/${id}/`, data);
    return unwrap<FeeInvoice>(response.data);
  },

  deleteInvoice: async (id: string) => {
    await api.delete(`/fees/invoices/${id}/`);
  },

  recordPayment: async (invoiceId: string, data: Partial<FeePayment>) => {
    const response = await api.post(`/fees/invoices/${invoiceId}/record-payment/`, data);
    return unwrap<FeePayment>(response.data);
  },

  getPayments: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/fees/payments/${query}`);
    return unwrap<FeePayment[]>(response.data);
  },

  getSummary: async () => {
    const response = await api.get('/fees/invoices/summary/');
    return unwrap<FeeSummary>(response.data);
  },
};
