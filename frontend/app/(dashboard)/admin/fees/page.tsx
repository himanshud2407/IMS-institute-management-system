'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Eye, Plus, Receipt, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { feeService } from '../../../../services/fees';
import { studentService } from '../../../../services/users';
import { FeeInvoice, FeePayment, FeeSummary, Student } from '../../../../types';

const statusVariant = (status: string): BadgeProps['variant'] => {
  if (status === 'PAID') return 'success';
  if (status === 'PARTIAL') return 'info';
  if (status === 'OVERDUE') return 'danger';
  if (status === 'CANCELLED') return 'secondary';
  return 'warning';
};

const money = (value?: string | number | null) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function AdminFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [invoiceForm, setInvoiceForm] = useState({
    student: '',
    title: '',
    fee_type: 'TUITION',
    academic_year: '2026-27',
    amount: '',
    due_date: '',
    description: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    method: 'CASH',
    reference_number: '',
    notes: '',
  });

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const data = await feeService.getInvoices(params);
      setInvoices(Array.isArray(data) ? data : []);
      const summaryData = await feeService.getSummary();
      setSummary(summaryData);
    } catch {
      toast.error('Failed to load fees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchInvoices();
      const studentData = await studentService.getAll();
      setStudents(Array.isArray(studentData) ? studentData : []);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetInvoiceForm = () => setInvoiceForm({
    student: '',
    title: '',
    fee_type: 'TUITION',
    academic_year: '2026-27',
    amount: '',
    due_date: '',
    description: '',
  });

  const createInvoice = async () => {
    if (!invoiceForm.student || !invoiceForm.title || !invoiceForm.amount || !invoiceForm.due_date) {
      toast.error('Student, title, amount, and due date are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await feeService.createInvoice(invoiceForm as Partial<FeeInvoice>);
      toast.success('Invoice created');
      setIsCreateOpen(false);
      resetInvoiceForm();
      fetchInvoices();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to create invoice'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPayment = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balance_amount || '',
      payment_date: new Date().toISOString().split('T')[0],
      method: 'CASH',
      reference_number: '',
      notes: '',
    });
    setIsPaymentOpen(true);
  };

  const recordPayment = async () => {
    if (!selectedInvoice || !paymentForm.amount) {
      toast.error('Payment amount is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await feeService.recordPayment(selectedInvoice.id, paymentForm as Partial<FeePayment>);
      toast.success('Payment recorded');
      setIsPaymentOpen(false);
      fetchInvoices();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to record payment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteInvoice = async (invoice: FeeInvoice) => {
    if (!confirm(`Delete invoice "${invoice.title}"?`)) return;
    try {
      await feeService.deleteInvoice(invoice.id);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fee Management</h1>
          <p className="text-sm text-slate-500">Create invoices, track dues, and record student payments.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Invoiced</p><p className="text-2xl font-bold text-slate-800 mt-1">{money(summary?.total_invoiced)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Collected</p><p className="text-2xl font-bold text-emerald-600 mt-1">{money(summary?.total_paid)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Balance</p><p className="text-2xl font-bold text-amber-600 mt-1">{money(summary?.total_balance)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Overdue</p><p className="text-2xl font-bold text-rose-600 mt-1">{summary?.overdue_count ?? 0}</p></CardBody></Card>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
              <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchInvoices}>Apply Filters</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading invoices...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No fee invoices found.</p>
                    </td>
                  </tr>
                ) : invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{invoice.student_name}</p>
                      <p className="text-xs text-slate-400">{invoice.student_roll} - {invoice.course_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{invoice.title}</p>
                      <p className="text-xs text-slate-400">{invoice.fee_type} - {invoice.academic_year}</p>
                    </td>
                    <td className="px-6 py-4">{invoice.due_date}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{money(invoice.amount)}</p>
                      <p className="text-xs text-slate-400">Paid {money(invoice.paid_amount)} / Due {money(invoice.balance_amount)}</p>
                    </td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => { setSelectedInvoice(invoice); setIsDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="p-2 text-emerald-600 hover:text-emerald-700" disabled={invoice.status === 'PAID' || invoice.status === 'CANCELLED'} onClick={() => openPayment(invoice)}><CreditCard className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-rose-600" onClick={() => deleteInvoice(invoice)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Fee Invoice" size="xl" footer={<><Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button><Button onClick={createInvoice} isLoading={isSubmitting}>Create Invoice</Button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student *</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={invoiceForm.student} onChange={(e) => setInvoiceForm((value) => ({ ...value, student: e.target.value }))}>
              <option value="">Select student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.user.full_name} ({student.roll_number})</option>)}
            </select>
          </div>
          <Input label="Title *" value={invoiceForm.title} onChange={(e) => setInvoiceForm((value) => ({ ...value, title: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fee Type</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={invoiceForm.fee_type} onChange={(e) => setInvoiceForm((value) => ({ ...value, fee_type: e.target.value }))}>
              <option value="TUITION">Tuition</option>
              <option value="EXAM">Exam</option>
              <option value="LIBRARY">Library</option>
              <option value="HOSTEL">Hostel</option>
              <option value="TRANSPORT">Transport</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Input label="Academic Year" value={invoiceForm.academic_year} onChange={(e) => setInvoiceForm((value) => ({ ...value, academic_year: e.target.value }))} />
          <Input label="Amount *" type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm((value) => ({ ...value, amount: e.target.value }))} />
          <Input label="Due Date *" type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm((value) => ({ ...value, due_date: e.target.value }))} />
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
            <textarea className="w-full min-h-24 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={invoiceForm.description} onChange={(e) => setInvoiceForm((value) => ({ ...value, description: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title={`Record Payment: ${selectedInvoice?.title || ''}`} size="lg" footer={<><Button variant="outline" onClick={() => setIsPaymentOpen(false)} disabled={isSubmitting}>Cancel</Button><Button onClick={recordPayment} isLoading={isSubmitting}>Record Payment</Button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={`Amount * (Balance ${money(selectedInvoice?.balance_amount)})`} type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((value) => ({ ...value, amount: e.target.value }))} />
          <Input label="Payment Date" type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm((value) => ({ ...value, payment_date: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Method</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={paymentForm.method} onChange={(e) => setPaymentForm((value) => ({ ...value, method: e.target.value }))}>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <Input label="Reference Number" value={paymentForm.reference_number} onChange={(e) => setPaymentForm((value) => ({ ...value, reference_number: e.target.value }))} />
          <Input label="Notes" className="md:col-span-2" value={paymentForm.notes} onChange={(e) => setPaymentForm((value) => ({ ...value, notes: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedInvoice?.title || 'Invoice'} size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}>
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xl font-bold text-slate-800">{money(selectedInvoice.amount)}</p><p className="text-xs text-slate-500">Amount</p></div>
              <div className="rounded-lg bg-emerald-50 p-4"><p className="text-xl font-bold text-emerald-600">{money(selectedInvoice.paid_amount)}</p><p className="text-xs text-emerald-700">Paid</p></div>
              <div className="rounded-lg bg-amber-50 p-4"><p className="text-xl font-bold text-amber-600">{money(selectedInvoice.balance_amount)}</p><p className="text-xs text-amber-700">Balance</p></div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Amount</th><th className="px-4 py-3 text-left">Method</th><th className="px-4 py-3 text-left">Ref</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedInvoice.payments || []).length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No payments recorded.</td></tr>
                  ) : selectedInvoice.payments?.map((payment) => (
                    <tr key={payment.id}><td className="px-4 py-3">{payment.payment_date}</td><td className="px-4 py-3 font-semibold">{money(payment.amount)}</td><td className="px-4 py-3">{payment.method}</td><td className="px-4 py-3 text-slate-400">{payment.reference_number || '-'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
