'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Card, CardBody } from '../../../../components/ui/Card';
import { feeService } from '../../../../services/fees';
import { FeeInvoice, FeeSummary } from '../../../../types';

const statusVariant = (status: string): BadgeProps['variant'] => {
  if (status === 'PAID') return 'success';
  if (status === 'PARTIAL') return 'info';
  if (status === 'OVERDUE') return 'danger';
  if (status === 'CANCELLED') return 'secondary';
  return 'warning';
};

const money = (value?: string | number | null) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setIsLoading(true);
        const [invoiceData, summaryData] = await Promise.all([
          feeService.getInvoices(),
          feeService.getSummary(),
        ]);
        setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
        setSummary(summaryData);
      } catch {
        toast.error('Failed to load fee details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Fees</h1>
        <p className="text-sm text-slate-500">Track invoices, dues, and payment history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Fees</p><p className="text-2xl font-bold text-slate-800 mt-1">{money(summary?.total_invoiced)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Paid</p><p className="text-2xl font-bold text-emerald-600 mt-1">{money(summary?.total_paid)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Balance</p><p className="text-2xl font-bold text-amber-600 mt-1">{money(summary?.total_balance)}</p></CardBody></Card>
      </div>

      {isLoading ? (
        <Card><CardBody className="py-12 text-center text-slate-400">Loading fee details...</CardBody></Card>
      ) : invoices.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No fee invoices found.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="overflow-hidden">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{invoice.title}</h3>
                    <p className="text-sm text-slate-500">{invoice.fee_type} - {invoice.academic_year}</p>
                  </div>
                  <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-3"><p className="text-lg font-bold text-slate-800">{money(invoice.amount)}</p><p className="text-xs text-slate-500">Amount</p></div>
                  <div className="rounded-lg bg-emerald-50 p-3"><p className="text-lg font-bold text-emerald-600">{money(invoice.paid_amount)}</p><p className="text-xs text-emerald-700">Paid</p></div>
                  <div className="rounded-lg bg-amber-50 p-3"><p className="text-lg font-bold text-amber-600">{money(invoice.balance_amount)}</p><p className="text-xs text-amber-700">Due</p></div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Due date: {invoice.due_date}</span>
                  {invoice.is_overdue && <span className="text-rose-600 font-semibold">Overdue</span>}
                </div>
                {(invoice.payments || []).length > 0 && (
                  <div className="rounded-lg border border-slate-100 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" /> Payments
                    </div>
                    <div className="divide-y divide-slate-100">
                      {invoice.payments?.map((payment) => (
                        <div key={payment.id} className="px-3 py-2 flex justify-between text-sm">
                          <span className="text-slate-500">{payment.payment_date} - {payment.method}</span>
                          <span className="font-semibold text-slate-800">{money(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
