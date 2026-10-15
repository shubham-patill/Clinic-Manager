import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Smile, 
  Stethoscope, 
  Receipt, 
  FileText, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ShieldAlert,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import Odontogram from './Odontogram';
import { 
  getPatientOdontogram, 
  saveToothCondition, 
  getPatientTreatments, 
  createTreatment,
  updateTreatmentStatus,
  getInvoices,
  getPatientPrescriptions,
  getProceduresCatalog
} from '../services/api';

export default function PatientProfile({ 
  patient, 
  doctors = [],
  onBack, 
  onNewAppointment,
  onNewInvoice,
  onNewPrescription,
  onPrintInvoice,
  onPrintPrescription,
  currency = '₹'
}) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'treatments' | 'billing' | 'prescriptions'
  const [odontogramData, setOdontogramData] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [proceduresCatalog, setProceduresCatalog] = useState([]);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

  // New Treatment Form
  const [newTreatment, setNewTreatment] = useState({
    procedure_id: '',
    procedure_name: '',
    tooth_number: '',
    doctor_name: doctors[0]?.name || 'Dr. Sarah Mitchell',
    status: 'Planned',
    cost: 0,
    discount: 0,
    doctor_notes: ''
  });

  const loadPatientData = async () => {
    if (!patient) return;
    try {
      const [chart, treat, inv, rx, procs] = await Promise.all([
        getPatientOdontogram(patient.id),
        getPatientTreatments(patient.id),
        getInvoices(patient.id),
        getPatientPrescriptions(patient.id),
        getProceduresCatalog()
      ]);
      setOdontogramData(chart || []);
      setTreatments(treat || []);
      setInvoices(inv || []);
      setPrescriptions(rx || []);
      setProceduresCatalog(procs || []);
    } catch (err) {
      console.error('Error loading patient details:', err);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patient?.id]);

  const handleSaveTooth = async (toothNumber, condition, surface, notes) => {
    await saveToothCondition(patient.id, toothNumber, condition, surface, notes);
    loadPatientData();
  };

  const handlePlanTreatmentFromTooth = (toothNumber, condition) => {
    setNewTreatment({
      procedure_id: '',
      procedure_name: condition === 'Caries' ? 'Composite Aesthetic Filling' : condition === 'RCT' ? 'Root Canal Treatment' : condition === 'Crown' ? 'CAD-CAM Zirconia Crown' : '',
      tooth_number: String(toothNumber),
      doctor_name: condition === 'RCT' ? 'Dr. Rajesh Sharma' : condition === 'Crown' ? 'Dr. Sarah Mitchell' : (doctors[0]?.name || 'Dr. Sarah Mitchell'),
      status: 'Planned',
      cost: condition === 'RCT' ? 4500 : condition === 'Crown' ? 8500 : 1200,
      discount: 0,
      doctor_notes: `Planned for tooth #${toothNumber} (${condition})`
    });
    setIsTreatmentModalOpen(true);
  };

  const handleCreateTreatment = async (e) => {
    e.preventDefault();
    if (!newTreatment.procedure_name.trim()) {
      alert('Please select or specify a procedure name.');
      return;
    }
    await createTreatment({
      ...newTreatment,
      patient_id: patient.id
    });
    setIsTreatmentModalOpen(false);
    loadPatientData();
  };

  const handleToggleTreatmentStatus = async (treatmentId, newStatus) => {
    await updateTreatmentStatus(treatmentId, newStatus);
    loadPatientData();
  };

  let alerts = [];
  try {
    alerts = typeof patient?.medical_history === 'string' ? JSON.parse(patient.medical_history) : (patient?.medical_history || []);
  } catch {
    alerts = [];
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNewAppointment(patient)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Calendar className="w-3.5 h-3.5" /> Book Appointment
          </button>
          <button
            onClick={() => onNewInvoice(patient)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Receipt className="w-3.5 h-3.5" /> Generate Bill
          </button>
          <button
            onClick={() => onNewPrescription(patient)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" /> Write Rx
          </button>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
              {patient?.full_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-slate-800">{patient?.full_name}</h2>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {patient?.patient_id}
                </span>
                {patient?.blood_group && (
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {patient.blood_group}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {patient?.age ? `${patient.age} years old` : 'Age not recorded'} • {patient?.gender}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <span className="block text-slate-400 font-medium">Contact Phone</span>
              <span className="font-bold text-slate-800">{patient?.phone}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Email Address</span>
              <span className="font-semibold text-slate-700">{patient?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Emergency Contact</span>
              <span className="font-semibold text-slate-700">{patient?.emergency_contact || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* High-Risk Medical Alerts Banner */}
        {(alerts.length > 0 || patient?.allergies) && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Critical Medical Safety Alerts
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {alerts.map((al, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-xs"
                  >
                    ⚠️ {al}
                  </span>
                ))}
              </div>
              {patient?.allergies && (
                <p className="text-xs font-semibold text-rose-800 mt-1.5">
                  Allergy Notes: {patient.allergies}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-sm font-bold">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'chart'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Smile className="w-4 h-4" /> Dental Chart (Odontogram)
        </button>

        <button
          onClick={() => setActiveTab('treatments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'treatments'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Treatments ({treatments.length})
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'billing'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" /> Billing & Invoices ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Prescriptions ({prescriptions.length})
        </button>
      </div>

      {/* Tab 1: Odontogram */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          <Odontogram
            odontogramData={odontogramData}
            onSaveTooth={handleSaveTooth}
            onPlanTreatment={handlePlanTreatmentFromTooth}
            patientName={patient?.full_name}
          />
        </div>
      )}

      {/* Tab 2: Treatments */}
      {activeTab === 'treatments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Clinical Treatments Plan & Log</h3>
              <p className="text-xs text-slate-500">All planned and completed dental procedures for this patient.</p>
            </div>
            <button
              onClick={() => {
                setNewTreatment({
                  procedure_id: '',
                  procedure_name: '',
                  tooth_number: '',
                  status: 'Planned',
                  cost: 0,
                  discount: 0,
                  doctor_notes: ''
                });
                setIsTreatmentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> + Plan / Add Procedure
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Procedure</th>
                  <th className="py-3 px-4">Tooth #</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treatments.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {t.procedure_name}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {new Date(t.performed_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-teal-700">
                      {t.tooth_number ? `#${t.tooth_number}` : 'Full Mouth'}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-800">
                      {currency}{t.final_amount}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleToggleTreatmentStatus(t.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : t.status === 'In Progress'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-slate-500 max-w-xs truncate">
                      {t.doctor_notes || '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {t.status !== 'Completed' && (
                        <button
                          onClick={() => handleToggleTreatmentStatus(t.id, 'Completed')}
                          className="text-xs text-emerald-600 font-bold hover:underline"
                        >
                          Mark Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {treatments.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No treatments planned or performed yet. Click "+ Plan / Add Procedure" to record one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Invoices */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Invoices & Payment History</h3>
              <p className="text-xs text-slate-500">Financial records, tax invoices, and payment receipts.</p>
            </div>
            <button
              onClick={() => onNewInvoice(patient)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Invoice
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{inv.invoice_number}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      inv.payment_status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inv.payment_status === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.payment_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: {inv.invoice_date} {inv.notes ? `• ${inv.notes}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total: <span className="font-bold text-slate-800">{currency}{inv.total_amount}</span></p>
                    <p className="text-xs text-emerald-600 font-semibold">Paid: {currency}{inv.paid_amount}</p>
                    {inv.balance_due > 0 && (
                      <p className="text-xs text-rose-600 font-bold">Due: {currency}{inv.balance_due}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onPrintInvoice(inv.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" /> View & Print
                  </button>
                </div>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No invoices generated for this patient yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Prescription Records (Rx)</h3>
              <p className="text-xs text-slate-500">Official medical prescriptions issued to this patient.</p>
            </div>
            <button
              onClick={() => onNewPrescription(patient)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> + Write New Rx
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {prescriptions.map((rx) => {
              let meds = [];
              try {
                meds = typeof rx.medicines === 'string' ? JSON.parse(rx.medicines) : (rx.medicines || []);
              } catch {
                meds = [];
              }

              return (
                <div key={rx.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-teal-700 text-sm">Rx Issued: {rx.rx_date}</span>
                      <span className="text-xs text-slate-500 font-medium">by {rx.doctor_name}</span>
                    </div>
                    {rx.diagnosis && (
                      <p className="text-xs font-semibold text-slate-700">
                        Diagnosis: {rx.diagnosis}
                      </p>
                    )}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {meds.map((m, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                          <span className="font-bold text-slate-900">{m.name}</span> • {m.dosage} • {m.frequency} • {m.duration}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onPrintPrescription(rx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold shrink-0 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" /> Print Rx Slip
                  </button>
                </div>
              );
            })}

            {prescriptions.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No prescriptions issued yet. Click "+ Write New Rx" to generate a prescription.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Treatment Modal */}
      {isTreatmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Plan / Record Dental Treatment</h3>
              <button
                onClick={() => setIsTreatmentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTreatment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Procedure Catalog Selection
                </label>
                <select
                  value={newTreatment.procedure_id}
                  onChange={(e) => {
                    const procId = e.target.value;
                    const proc = proceduresCatalog.find(p => p.id === Number(procId));
                    if (proc) {
                      setNewTreatment({
                        ...newTreatment,
                        procedure_id: proc.id,
                        procedure_name: proc.name,
                        cost: proc.standard_fee
                      });
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Choose from Standard Catalog or Custom Below --</option>
                  {proceduresCatalog.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name} - {currency}{p.standard_fee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Performing Doctor / Dentist
                </label>
                <select
                  value={newTreatment.doctor_name}
                  onChange={(e) => setNewTreatment({ ...newTreatment, doctor_name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Procedure Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTreatment.procedure_name}
                  onChange={(e) => setNewTreatment({ ...newTreatment, procedure_name: e.target.value })}
                  placeholder="e.g. Composite Restoration"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tooth #(s)</label>
                  <input
                    type="text"
                    value={newTreatment.tooth_number}
                    onChange={(e) => setNewTreatment({ ...newTreatment, tooth_number: e.target.value })}
                    placeholder="e.g. 16, or Full Mouth"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Status</label>
                  <select
                    value={newTreatment.status}
                    onChange={(e) => setNewTreatment({ ...newTreatment, status: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed Now</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standard Fee ({currency})</label>
                  <input
                    type="number"
                    value={newTreatment.cost}
                    onChange={(e) => setNewTreatment({ ...newTreatment, cost: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount ({currency})</label>
                  <input
                    type="number"
                    value={newTreatment.discount}
                    onChange={(e) => setNewTreatment({ ...newTreatment, discount: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical / Doctor Notes</label>
                <textarea
                  rows="2"
                  value={newTreatment.doctor_notes}
                  onChange={(e) => setNewTreatment({ ...newTreatment, doctor_notes: e.target.value })}
                  placeholder="Shade selected, anesthesia given, post-op instructions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTreatmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
