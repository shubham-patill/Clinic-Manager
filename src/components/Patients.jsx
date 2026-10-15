import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Eye, 
  Smile, 
  Receipt, 
  FileText,
  Filter,
  ShieldAlert
} from 'lucide-react';

const COMMON_MEDICAL_ALERTS = [
  'Penicillin Allergy',
  'Sulfa Drug Allergy',
  'NSAID / Aspirin Allergy',
  'Hypertension (High BP)',
  'Type 2 Diabetes',
  'Type 1 Diabetes',
  'Bleeding Disorder (Anticoagulants/Warfarin)',
  'Asthma / Respiratory',
  'Cardiac Condition / Pacemaker',
  'Hepatitis B / C',
  'Pregnancy (Trimester alert)',
  'Epilepsy / Seizures'
];

export default function Patients({ 
  patients = [], 
  onSelectPatient, 
  onSavePatient, 
  onDeletePatient,
  isAddModalOpen,
  setIsAddModalOpen
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Form State for Add / Edit Modal
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    blood_group: 'O+',
    medical_history: [],
    allergies: '',
    notes: ''
  });

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({
      full_name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      emergency_contact: '',
      blood_group: 'O+',
      medical_history: [],
      allergies: '',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPatient(p);
    let parsedHistory = [];
    try {
      parsedHistory = typeof p.medical_history === 'string' ? JSON.parse(p.medical_history) : (p.medical_history || []);
    } catch {
      parsedHistory = [];
    }

    setFormData({
      full_name: p.full_name || '',
      age: p.age || '',
      gender: p.gender || 'Male',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      emergency_contact: p.emergency_contact || '',
      blood_group: p.blood_group || 'O+',
      medical_history: parsedHistory,
      allergies: p.allergies || '',
      notes: p.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      alert('Please fill out patient name and contact phone number.');
      return;
    }
    onSavePatient(formData, editingPatient ? editingPatient.id : null);
    setIsAddModalOpen(false);
  };

  const toggleMedicalAlert = (alertName) => {
    setFormData(prev => {
      const exists = prev.medical_history.includes(alertName);
      return {
        ...prev,
        medical_history: exists
          ? prev.medical_history.filter(a => a !== alertName)
          : [...prev.medical_history, alertName]
      };
    });
  };

  // Filter logic
  const filteredPatients = patients.filter(p => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      p.full_name.toLowerCase().includes(s) || 
      p.phone.includes(s) || 
      p.patient_id.toLowerCase().includes(s);

    if (!matchesSearch) return false;

    if (filterAlertOnly) {
      let alerts = [];
      try {
        alerts = typeof p.medical_history === 'string' ? JSON.parse(p.medical_history) : (p.medical_history || []);
      } catch {
        alerts = [];
      }
      return alerts.length > 0 || (p.allergies && p.allergies.trim().length > 0);
    }

    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, phone, or ID (e.g. PT-2026)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterAlertOnly(!filterAlertOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              filterAlertOnly 
                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Medical Alerts Only</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Directory Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map(patient => {
          let alerts = [];
          try {
            alerts = typeof patient.medical_history === 'string' ? JSON.parse(patient.medical_history) : (patient.medical_history || []);
          } catch {
            alerts = [];
          }

          return (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {patient.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base leading-tight group-hover:text-teal-700 transition">
                        {patient.full_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {patient.patient_id}
                        </span>
                        <span className="text-xs text-slate-500">
                          {patient.age ? `${patient.age} yrs` : ''} • {patient.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  {patient.blood_group && (
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      {patient.blood_group}
                    </span>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-1.5 text-xs text-slate-600 my-3">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.phone}</span>
                  </p>
                  {patient.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{patient.email}</span>
                    </p>
                  )}
                </div>

                {/* Medical Safety Alerts Badges */}
                {alerts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 mb-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Medical Alerts:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {alerts.map((al, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          {al}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" /> 360° EHR Profile
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(patient)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                    title="Edit Patient"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete patient "${patient.full_name}"? All associated treatments and dental charts will be removed.`)) {
                        onDeletePatient(patient.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Patient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No patients found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new patient in the system.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            + Register New Patient
          </button>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingPatient ? 'Edit Patient Details' : 'Register New Dental Patient'}
                </h3>
                <p className="text-xs text-teal-200">
                  Electronic Health Record (EHR) • Zero-cloud local storage
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Demographics Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Johnathan Doe"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 32"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Demographics Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 555-0192"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Email & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="Spouse/Parent Name - Phone"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Medical History & Alerts Multi-Selector */}
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Medical Alerts & Pre-existing Conditions
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  Select any condition that influences dental anesthesia, bleeding, or antibiotic prescription:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {COMMON_MEDICAL_ALERTS.map(alertItem => {
                    const checked = formData.medical_history.includes(alertItem);
                    return (
                      <button
                        key={alertItem}
                        type="button"
                        onClick={() => toggleMedicalAlert(alertItem)}
                        className={`text-left text-xs p-2 rounded-xl border transition flex items-center gap-1.5 ${
                          checked
                            ? 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-100/50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                          checked ? 'bg-white border-white' : 'border-slate-300'
                        }`}>
                          {checked && <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>}
                        </span>
                        <span className="truncate">{alertItem}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-rose-900 mb-1">Specific Drug Allergies / Notes</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g. Severe Penicillin allergy, allergic to Latex gloves..."
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">General Clinical Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Patient concerns, aesthetic requests, dental anxieties..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                >
                  {editingPatient ? 'Save Changes' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
