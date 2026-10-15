import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Pill,
  Sparkles,
  Stethoscope,
  UserCheck
} from 'lucide-react';
import { triggerPrint } from '../services/api';

export default function Prescriptions({ 
  prescriptions = [], 
  patients = [], 
  doctors = [],
  medicationsCatalog = [], 
  clinicSettings,
  onCreatePrescription,
  onDeletePrescription,
  selectedPrescription = null,
  onClearSelectedPrescription
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('All Doctors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRxForPrint, setActiveRxForPrint] = useState(null);

  // Form State
  const [rxForm, setRxForm] = useState({
    patient_id: '',
    doctor_name: doctors[0]?.name || clinicSettings?.doctor_name || 'Dr. Sarah Mitchell',
    diagnosis: '',
    rx_date: new Date().toISOString().split('T')[0],
    medicines: [
      { name: 'Ibuprofen 400mg Tablet', dosage: '400 mg', frequency: 'Three times daily (TDS)', duration: '3 days', timing: 'After food', instructions: 'Take with full glass of water.' }
    ],
    clinical_advice: '1. Take all medications strictly after food.\n2. Maintain gentle brushing around treated area.\n3. Call clinic immediately if allergic rash develops.'
  });

  useEffect(() => {
    if (selectedPrescription) {
      setActiveRxForPrint(selectedPrescription);
    }
  }, [selectedPrescription]);

  const handleOpenModal = (pt = null) => {
    setRxForm({
      patient_id: pt ? pt.id : (patients[0]?.id || ''),
      doctor_name: doctors[0]?.name || clinicSettings?.doctor_name || 'Dr. Sarah Mitchell',
      diagnosis: '',
      rx_date: new Date().toISOString().split('T')[0],
      medicines: [
        { name: 'Ibuprofen 400mg Tablet', dosage: '400 mg', frequency: 'Three times daily (TDS)', duration: '3 days', timing: 'After food', instructions: 'Take with full glass of water.' }
      ],
      clinical_advice: '1. Take all medications strictly after food.\n2. Maintain gentle brushing around treated area.\n3. Call clinic immediately if allergic rash develops.'
    });
    setIsModalOpen(true);
  };

  const handleAddMedicine = () => {
    setRxForm(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '', frequency: 'Twice daily (BD)', duration: '5 days', timing: 'After food', instructions: '' }
      ]
    }));
  };

  const handleRemoveMedicine = (idx) => {
    if (rxForm.medicines.length === 1) return;
    setRxForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };

  const handleMedChange = (idx, field, value) => {
    const updated = [...rxForm.medicines];
    updated[idx][field] = value;
    setRxForm({ ...rxForm, medicines: updated });
  };

  const handlePickMedFromCatalog = (idx, medId) => {
    const med = medicationsCatalog.find(m => m.id === Number(medId));
    if (!med) return;
    const updated = [...rxForm.medicines];
    updated[idx].name = med.name;
    updated[idx].dosage = med.default_dosage || '';
    updated[idx].frequency = med.default_frequency || 'Twice daily (BD)';
    updated[idx].duration = med.default_duration || '5 days';
    updated[idx].instructions = med.instructions || '';
    setRxForm({ ...rxForm, medicines: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rxForm.patient_id) {
      alert('Please select a patient.');
      return;
    }
    if (rxForm.medicines.some(m => !m.name.trim())) {
      alert('Please ensure all medicine rows have names.');
      return;
    }
    onCreatePrescription(rxForm);
    setIsModalOpen(false);
  };

  // Find selected patient to check allergies
  const selectedPatientObj = patients.find(p => p.id === Number(rxForm.patient_id));
  let patientAlerts = [];
  try {
    patientAlerts = typeof selectedPatientObj?.medical_history === 'string'
      ? JSON.parse(selectedPatientObj.medical_history)
      : (selectedPatientObj?.medical_history || []);
  } catch {
    patientAlerts = [];
  }

  const filteredRxList = prescriptions.filter(rx => {
    const s = searchTerm.toLowerCase();
    const pt = patients.find(p => p.id === rx.patient_id);
    const ptName = (rx.patient_name || pt?.full_name || '').toLowerCase();
    const ptCode = (rx.patient_code || pt?.patient_id || '').toLowerCase();
    const matchesSearch = 
      (rx.diagnosis && rx.diagnosis.toLowerCase().includes(s)) ||
      ptName.includes(s) ||
      ptCode.includes(s) ||
      (rx.doctor_name && rx.doctor_name.toLowerCase().includes(s));

    const matchesDoc = filterDoctor === 'All Doctors' || rx.doctor_name === filterDoctor;
    return matchesSearch && matchesDoc;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search & Actions Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prescriptions by patient name, ID, or diagnosis..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter by Doctor */}
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
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> + Write New Prescription (Rx)
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-base">Prescription Records</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {filteredRxList.length} Prescriptions
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRxList.map(rx => {
            const pt = patients.find(p => p.id === rx.patient_id);
            const ptName = rx.patient_name || pt?.full_name || 'Patient';
            const ptCode = rx.patient_code || pt?.patient_id || 'ID';
            let meds = [];
            try {
              meds = typeof rx.medicines === 'string' ? JSON.parse(rx.medicines) : (rx.medicines || []);
            } catch {
              meds = [];
            }

            return (
              <div key={rx.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{ptName}</span>
                    <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {ptCode}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Date: {rx.rx_date}
                    </span>
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      👨‍⚕️ {rx.doctor_name}
                    </span>
                  </div>

                  {rx.diagnosis && (
                    <p className="text-xs text-slate-700 font-semibold">
                      Diagnosis: <span className="font-normal text-slate-600">{rx.diagnosis}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meds.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        <Pill className="w-3 h-3 text-teal-600" /> {m.name} ({m.frequency})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveRxForPrint(rx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" /> Print Rx Slip
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this prescription record?')) {
                        onDeletePrescription(rx.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Prescription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRxList.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              No prescriptions found. Click "+ Write New Prescription (Rx)" to create one.
            </div>
          )}
        </div>
      </div>

      {/* New Prescription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Write Medical Prescription (Rx)</h3>
                <p className="text-xs text-teal-200">Dental pharmacotherapy with drug allergy checks</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Doctor & Patient Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Patient <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={rxForm.patient_id}
                    onChange={(e) => setRxForm({ ...rxForm, patient_id: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
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
                    Prescribing Doctor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={rxForm.doctor_name}
                    onChange={(e) => setRxForm({ ...rxForm, doctor_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Allergy Warning Bar */}
              {(patientAlerts.length > 0 || selectedPatientObj?.allergies) && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-900 text-xs">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold">Patient Drug Allergies / Conditions: </span>
                    <span>{patientAlerts.join(', ')} {selectedPatientObj?.allergies ? `• ${selectedPatientObj.allergies}` : ''}</span>
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={rxForm.diagnosis}
                  onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                  placeholder="e.g. Acute periapical abscess #16, Dry socket, Post-op prophylaxis..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Medicines Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Prescribed Medications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2">
                  {rxForm.medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Drug Quick Pick Dropdown */}
                        <select
                          onChange={(e) => handlePickMedFromCatalog(idx, e.target.value)}
                          className="w-56 text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="">-- Choose Common Drug --</option>
                          {medicationsCatalog.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          required
                          value={med.name}
                          onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                          placeholder="Medicine name & strength (e.g. Amoxicillin 500mg)"
                          className="flex-1 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                            placeholder="e.g. 500 mg / 1 tab"
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Frequency</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                            placeholder="e.g. TDS (3x daily) / BD"
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Duration</label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                            placeholder="e.g. 5 days"
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          placeholder="Instructions: Take after meals, with water..."
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Advice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Post-Treatment Advice & Instructions
                </label>
                <textarea
                  rows="3"
                  value={rxForm.clinical_advice}
                  onChange={(e) => setRxForm({ ...rxForm, clinical_advice: e.target.value })}
                  placeholder="Patient care instructions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Save & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Rx Slip Modal */}
      {activeRxForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            {/* Top Bar */}
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-400">
                Official Medical Prescription Slip Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerPrint()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Rx Slip
                </button>
                <button
                  onClick={() => {
                    setActiveRxForPrint(null);
                    if (onClearSelectedPrescription) onClearSelectedPrescription();
                  }}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Paper Prescription Slip Format */}
            <div className="p-8 sm:p-12 print-container text-slate-800 space-y-6">
              {/* Doctor & Clinic Letterhead */}
              <div className="border-b-2 border-teal-800 pb-5 flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black text-teal-900 tracking-tight">
                    {clinicSettings?.clinic_name || 'SmileCraft Super Specialty Dental Clinic'}
                  </h1>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {activeRxForPrint.doctor_name || clinicSettings?.doctor_name}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {(() => {
                      const doc = doctors.find(d => d.name === activeRxForPrint.doctor_name);
                      return doc ? `${doc.qualification} • ${doc.specialty}` : clinicSettings?.qualification;
                    })()}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Reg No: {(() => {
                      const doc = doctors.find(d => d.name === activeRxForPrint.doctor_name);
                      return doc ? doc.registration_no : clinicSettings?.registration_no;
                    })()} • Phone: {clinicSettings?.phone}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {clinicSettings?.address}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-teal-800 font-serif">
                    ℞
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Date: <span className="font-semibold">{activeRxForPrint.rx_date}</span>
                  </p>
                </div>
              </div>

              {/* Patient Info Row */}
              {(() => {
                const pt = patients.find(p => p.id === activeRxForPrint.patient_id);
                const ptName = activeRxForPrint.patient_name || pt?.full_name || 'Patient';
                const ptCode = activeRxForPrint.patient_code || pt?.patient_id || '-';
                const ptAge = activeRxForPrint.patient_age || pt?.age || '-';
                const ptGender = activeRxForPrint.patient_gender || pt?.gender || '-';

                return (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                    <div>
                      <span className="text-slate-500">Patient: </span>
                      <span className="font-bold text-slate-900">{ptName}</span>
                      <span className="text-slate-500 ml-2">Age/Gender: </span>
                      <span className="font-semibold">{ptAge} / {ptGender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Patient ID: </span>
                      <span className="font-mono font-bold text-teal-700">{ptCode}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Diagnosis */}
              {activeRxForPrint.diagnosis && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Diagnosis: </span>
                  <span className="italic text-slate-800">{activeRxForPrint.diagnosis}</span>
                </div>
              )}

              {/* Medicines List Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-teal-900 text-white font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Medicine & Strength</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-4">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(() => {
                      let list = [];
                      try {
                        list = typeof activeRxForPrint.medicines === 'string'
                          ? JSON.parse(activeRxForPrint.medicines)
                          : (activeRxForPrint.medicines || []);
                      } catch {
                        list = [];
                      }
                      return list.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">{m.name}</td>
                          <td className="py-3 px-3">{m.dosage || '-'}</td>
                          <td className="py-3 px-3 font-semibold text-teal-800">{m.frequency}</td>
                          <td className="py-3 px-3">{m.duration}</td>
                          <td className="py-3 px-4 text-slate-600">{m.instructions || m.timing || '-'}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Clinical Advice */}
              {activeRxForPrint.clinical_advice && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                    Clinical Advice & Precautions:
                  </h4>
                  <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {activeRxForPrint.clinical_advice}
                  </p>
                </div>
              )}

              {/* Signature Line */}
              <div className="pt-12 flex justify-end text-xs">
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-900">{activeRxForPrint.doctor_name || clinicSettings?.doctor_name}</p>
                  <p className="text-[10px] text-slate-500">Registered Dental Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
