import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Trash2,
  FileCheck,
  AlertCircle,
  Stethoscope,
  IndianRupee
} from 'lucide-react';
import { triggerPrint } from '../services/api';

export default function Billing({ 
  invoices = [], 
  patients = [], 
  doctors = [],
  proceduresCatalog = [],
  clinicSettings,
  onCreateInvoice,
  onRecordPayment,
  currency = '₹',
  selectedInvoiceId = null,
  onClearSelectedInvoice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('All Doctors');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState(null);

  // New Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    patient_id: '',
    doctor_name: doctors[0]?.name || clinicSettings?.doctor_name || 'Dr. Sarah Mitchell',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    items: [
      { description: 'Comprehensive Dental Consultation & Charting', tooth_number: 'All', quantity: 1, unit_price: 500, total: 500 }
    ],
    discount_amount: 0,
    tax_amount: 0,
    paid_amount: 500,
    payment_method: 'UPI / QR Code',
    notes: 'Routine clinical consultation'
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'UPI / QR Code',
    reference_no: '',
    notes: ''
  });

  // Automatically open printable invoice if passed as prop
  useEffect(() => {
    if (selectedInvoiceId) {
      const inv = invoices.find(i => i.id === Number(selectedInvoiceId));
      if (inv) {
        setActiveInvoiceForPrint(inv);
      }
    }
  }, [selectedInvoiceId, invoices]);

  const handleOpenCreateModal = (pt = null) => {
    setInvoiceForm({
      patient_id: pt ? pt.id : (patients[0]?.id || ''),
      doctor_name: doctors[0]?.name || clinicSettings?.doctor_name || 'Dr. Sarah Mitchell',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      items: [
        { description: 'Comprehensive Dental Consultation & Charting', tooth_number: 'All', quantity: 1, unit_price: 500, total: 500 }
      ],
      discount_amount: 0,
      tax_amount: 0,
      paid_amount: 500,
      payment_method: 'UPI / QR Code',
      notes: 'Clinical consultation'
    });
    setIsCreateModalOpen(true);
  };

  const handleAddItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', tooth_number: '', quantity: 1, unit_price: 0, total: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (invoiceForm.items.length === 1) return;
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceForm.items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      const qty = Number(updated[index].quantity || 1);
      const price = Number(updated[index].unit_price || 0);
      updated[index].total = qty * price;
    }
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  const handleSelectProcedureForLine = (index, procId) => {
    const proc = proceduresCatalog.find(p => p.id === Number(procId));
    if (!proc) return;
    const updated = [...invoiceForm.items];
    updated[index].description = proc.name;
    updated[index].unit_price = proc.standard_fee;
    updated[index].total = Number(updated[index].quantity || 1) * proc.standard_fee;
    setInvoiceForm({ ...invoiceForm, items: updated });
  };

  const calculateSubtotal = () => {
    return invoiceForm.items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const disc = Number(invoiceForm.discount_amount || 0);
    const tax = Number(invoiceForm.tax_amount || 0);
    return Math.max(0, sub - disc + tax);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!invoiceForm.patient_id) {
      alert('Please select a patient.');
      return;
    }
    if (invoiceForm.items.some(i => !i.description.trim())) {
      alert('Please ensure all invoice line items have descriptions.');
      return;
    }
    onCreateInvoice(invoiceForm);
    setIsCreateModalOpen(false);
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!activeInvoiceForPay || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    onRecordPayment(
      activeInvoiceForPay.id,
      Number(paymentForm.amount),
      paymentForm.payment_method,
      paymentForm.reference_no,
      paymentForm.notes
    );
    setIsPayModalOpen(false);
    setActiveInvoiceForPay(null);
  };

  const filteredInvoices = invoices.filter(inv => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(s) ||
      (inv.patient_name && inv.patient_name.toLowerCase().includes(s)) ||
      (inv.patient_code && inv.patient_code.toLowerCase().includes(s)) ||
      (inv.doctor_name && inv.doctor_name.toLowerCase().includes(s));

    const matchesDoc = filterDoctor === 'All Doctors' || inv.doctor_name === filterDoctor;
    return matchesSearch && matchesDoc;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Search & Actions */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices by INV number, patient name, or doctor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Doctor:</span>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
            >
              <option value="All Doctors">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create New Bill (₹)
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-base">Billing & Invoices Ledger</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {filteredInvoices.length} Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-mono font-bold text-teal-700">
                    {inv.invoice_number}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {inv.invoice_date}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 block">{inv.patient_name}</span>
                    <span className="text-[11px] font-mono text-slate-400">{inv.patient_code}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {inv.doctor_name || 'Dr. Sarah Mitchell'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-800 text-sm">
                    {currency}{inv.total_amount}
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-600">
                    {currency}{inv.paid_amount}
                  </td>
                  <td className="py-4 px-4">
                    {inv.balance_due > 0 ? (
                      <span className="font-black text-rose-600 text-sm">{currency}{inv.balance_due}</span>
                    ) : (
                      <span className="text-slate-400 font-bold">Settled</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      inv.payment_status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inv.payment_status === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {inv.balance_due > 0 && (
                      <button
                        onClick={() => {
                          setActiveInvoiceForPay(inv);
                          setPaymentForm({
                            amount: inv.balance_due,
                            payment_method: 'UPI / QR Code',
                            reference_no: '',
                            notes: ''
                          });
                          setIsPayModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                      >
                        Collect Due
                      </button>
                    )}
                    <button
                      onClick={() => setActiveInvoiceForPrint(inv)}
                      className="px-2.5 py-1 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg text-xs shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 inline mr-1 text-teal-600" /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              No invoices found. Click "Create New Bill (₹)" to generate an invoice.
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Generate Official Dental Tax Invoice ({currency})</h3>
                <p className="text-xs text-teal-200">Itemized billing & clinical fee statement</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Patient, Doctor & Date Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Patient <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={invoiceForm.patient_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, patient_id: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.patient_id}) - {p.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor / Consultant <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={invoiceForm.doctor_name}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, doctor_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.invoice_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_date: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Itemized Clinical Services & Procedures
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {invoiceForm.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex-1 w-full sm:w-auto">
                        <select
                          onChange={(e) => handleSelectProcedureForLine(idx, e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-200 mb-1 bg-white"
                        >
                          <option value="">-- Fast Catalog Pick --</option>
                          {proceduresCatalog.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} - {currency}{p.standard_fee} ({p.doctor_name || 'All Doctors'})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Procedure description"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="text"
                          value={item.tooth_number}
                          onChange={(e) => handleItemChange(idx, 'tooth_number', e.target.value)}
                          placeholder="Tooth #"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="w-16">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          placeholder="Price"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="w-24 font-black text-slate-800 text-xs text-right pr-2">
                        {currency}{item.total}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-4 bg-slate-100 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Subtotal:</span>
                  <span>{currency}{calculateSubtotal()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Special Discount ({currency}):</span>
                  <input
                    type="number"
                    value={invoiceForm.discount_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discount_amount: Number(e.target.value) })}
                    className="w-28 text-right p-1 rounded-md border border-slate-300 text-xs bg-white font-bold"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Tax / GST ({currency}):</span>
                  <input
                    type="number"
                    value={invoiceForm.tax_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_amount: Number(e.target.value) })}
                    className="w-28 text-right p-1 rounded-md border border-slate-300 text-xs bg-white font-bold"
                  />
                </div>

                <div className="pt-2 border-t border-slate-300 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Grand Total:</span>
                  <span>{currency}{calculateTotal()}</span>
                </div>
              </div>

              {/* Initial Payment Collection */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-teal-900 mb-1">
                    Amount Paid Today ({currency})
                  </label>
                  <input
                    type="number"
                    value={invoiceForm.paid_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, paid_amount: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-teal-300 bg-white font-bold text-teal-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-900 mb-1">Payment Method</label>
                  <select
                    value={invoiceForm.payment_method}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, payment_method: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-teal-300 bg-white font-semibold"
                  >
                    <option value="UPI / QR Code">UPI / QR Code (Google Pay, PhonePe, Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit/Debit Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                    <option value="Dental Insurance">Dental Insurance / TPA</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Generate Invoice ({currency})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPayModalOpen && activeInvoiceForPay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Collect Balance Payment</h3>
                <p className="text-xs text-teal-200">Invoice: {activeInvoiceForPay.invoice_number}</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-bold">Patient: {activeInvoiceForPay.patient_name}</p>
                <p className="font-extrabold text-sm text-rose-600 mt-1">
                  Outstanding Balance: {currency}{activeInvoiceForPay.balance_due}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ({currency})</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  max={activeInvoiceForPay.balance_due}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="UPI / QR Code">UPI / QR Code (Google Pay, PhonePe)</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference / UTR / Transaction ID</label>
                <input
                  type="text"
                  value={paymentForm.reference_no}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                  placeholder="e.g. UPI-REF-894109"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Invoice Modal */}
      {activeInvoiceForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
            {/* Top Action Bar (hidden in print) */}
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-400">
                Official Clinical Tax Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerPrint()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => {
                    setActiveInvoiceForPrint(null);
                    if (onClearSelectedInvoice) onClearSelectedInvoice();
                  }}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable A4 Paper Invoice Format */}
            <div className="p-8 sm:p-12 print-container text-slate-800 space-y-6">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-teal-800 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-teal-900 tracking-tight">
                    {clinicSettings?.clinic_name || 'SmileCraft Super Specialty Dental Clinic'}
                  </h1>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">
                    {clinicSettings?.tagline || 'Advanced Multi-Specialty Dental Hospital'}
                  </p>
                  <p className="text-xs text-slate-700 font-bold mt-2">
                    Attending Doctor: {activeInvoiceForPrint.doctor_name || clinicSettings?.doctor_name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Reg No: {clinicSettings?.registration_no} • Phone: {clinicSettings?.phone}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {clinicSettings?.address}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs font-mono font-bold text-teal-900">
                    TAX INVOICE
                  </div>
                  <h3 className="text-lg font-black font-mono text-slate-900 mt-1">
                    {activeInvoiceForPrint.invoice_number}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: <span className="font-semibold">{activeInvoiceForPrint.invoice_date}</span>
                  </p>
                </div>
              </div>

              {/* Patient Demographics Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To (Patient)</span>
                  <span className="text-sm font-black text-slate-900 block">{activeInvoiceForPrint.patient_name}</span>
                  <span className="text-slate-500 font-mono">ID: {activeInvoiceForPrint.patient_code}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs mt-1 ${
                    activeInvoiceForPrint.payment_status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeInvoiceForPrint.payment_status}
                  </span>
                </div>
              </div>

              {/* Table of Procedures / Services */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-teal-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Procedure / Clinical Service</th>
                      <th className="py-2.5 px-3">Tooth</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Fee</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-500">1</td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        Dental Clinical Consultation & Specialized Treatments
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-700">-</td>
                      <td className="py-3 px-3 text-center">1</td>
                      <td className="py-3 px-4 text-right">{currency}{activeInvoiceForPrint.subtotal}</td>
                      <td className="py-3 px-4 text-right font-black">{currency}{activeInvoiceForPrint.subtotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5 border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">{currency}{activeInvoiceForPrint.subtotal}</span>
                  </div>
                  {activeInvoiceForPrint.discount_amount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-bold text-emerald-600">-{currency}{activeInvoiceForPrint.discount_amount}</span>
                    </div>
                  )}
                  {activeInvoiceForPrint.tax_amount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax / GST:</span>
                      <span className="font-bold">+{currency}{activeInvoiceForPrint.tax_amount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-slate-900 text-sm">
                    <span>Total Amount:</span>
                    <span>{currency}{activeInvoiceForPrint.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Amount Paid:</span>
                    <span>{currency}{activeInvoiceForPrint.paid_amount}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-black text-sm pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span>{currency}{activeInvoiceForPrint.balance_due}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Signature Block & Footer */}
              <div className="pt-8 flex items-end justify-between border-t border-slate-200 text-xs">
                <div className="max-w-md">
                  <p className="font-semibold text-slate-700">Thank you for your visit!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {clinicSettings?.invoice_footer || 'Wishing you a healthy, bright smile.'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-800">{activeInvoiceForPrint.doctor_name || clinicSettings?.doctor_name}</p>
                  <p className="text-[10px] text-slate-500">Authorized Doctor Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
