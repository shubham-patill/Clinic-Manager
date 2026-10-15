import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Save, 
  HardDriveDownload, 
  HardDriveUpload, 
  CheckCircle2, 
  ShieldCheck, 
  Folder, 
  Info,
  Building,
  AlertTriangle,
  UserPlus,
  Trash2,
  Edit,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { 
  getClinicSettings, 
  updateClinicSettings, 
  getDatabaseInfo, 
  backupDatabase, 
  restoreDatabase 
} from '../services/api';

export default function Settings({ 
  clinicSettings, 
  doctors = [],
  onSettingsUpdated,
  onSaveDoctor,
  onDeleteDoctor
}) {
  const [formData, setFormData] = useState({
    clinic_name: '',
    tagline: '',
    doctor_name: '',
    qualification: '',
    registration_no: '',
    phone: '',
    email: '',
    address: '',
    currency: '₹',
    tax_rate: 0,
    invoice_footer: ''
  });

  const [dbInfo, setDbInfo] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);
  const [restoreSuccess, setRestoreSuccess] = useState(null);

  // Doctor Form Modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: 'Conservative Dentistry & Endodontics',
    qualification: 'BDS, MDS',
    registration_no: '',
    phone: '',
    email: '',
    consultation_fee: 500,
    color: '#0d9488'
  });

  useEffect(() => {
    if (clinicSettings) {
      setFormData({
        clinic_name: clinicSettings.clinic_name || '',
        tagline: clinicSettings.tagline || '',
        doctor_name: clinicSettings.doctor_name || '',
        qualification: clinicSettings.qualification || '',
        registration_no: clinicSettings.registration_no || '',
        phone: clinicSettings.phone || '',
        email: clinicSettings.email || '',
        address: clinicSettings.address || '',
        currency: clinicSettings.currency || '₹',
        tax_rate: clinicSettings.tax_rate || 0,
        invoice_footer: clinicSettings.invoice_footer || ''
      });
    }

    // Fetch DB info
    getDatabaseInfo().then(info => setDbInfo(info));
  }, [clinicSettings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await updateClinicSettings(formData);
    setSaveSuccess(true);
    if (onSettingsUpdated) onSettingsUpdated(formData);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBackup = async () => {
    try {
      const res = await backupDatabase();
      if (res && res.success) {
        setBackupSuccess(res.path || 'Backup exported successfully!');
        setTimeout(() => setBackupSuccess(null), 5000);
      }
    } catch (err) {
      alert('Backup failed: ' + err.message);
    }
  };

  const handleRestore = async () => {
    if (!confirm('CAUTION: Restoring a backup will overwrite the current database with the backup file. Proceed?')) {
      return;
    }
    try {
      const res = await restoreDatabase();
      if (res && res.success) {
        setRestoreSuccess('Database successfully restored! Please restart the software if needed.');
        getDatabaseInfo().then(info => setDbInfo(info));
        setTimeout(() => setRestoreSuccess(null), 5000);
      }
    } catch (err) {
      alert('Restore failed: ' + err.message);
    }
  };

  const openAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({
      name: '',
      specialty: 'Endodontics & Conservative Dentistry',
      qualification: 'BDS, MDS',
      registration_no: '',
      phone: '',
      email: '',
      consultation_fee: 500,
      color: '#0d9488'
    });
    setIsDoctorModalOpen(true);
  };

  const openEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name || '',
      specialty: doc.specialty || '',
      qualification: doc.qualification || '',
      registration_no: doc.registration_no || '',
      phone: doc.phone || '',
      email: doc.email || '',
      consultation_fee: doc.consultation_fee || 500,
      color: doc.color || '#0d9488'
    });
    setIsDoctorModalOpen(true);
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) {
      alert('Please enter doctor name.');
      return;
    }
    await onSaveDoctor(doctorForm, editingDoctor ? editingDoctor.id : null);
    setIsDoctorModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-teal-600" /> Clinic Settings & Multi-Doctor Team
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage clinic branding, multiple doctors, default currency (₹), and embedded SQLite backups.
        </p>
      </div>

      {/* Embedded Database Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Self-Contained Embedded Database Engine</h3>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active & Healthy
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                SQLite 3 engine is embedded directly inside this application. No MySQL, PostgreSQL, or SQL Server installation required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackup}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/30 transition"
            >
              <HardDriveDownload className="w-4 h-4" /> Export Backup (.db)
            </button>
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-600 transition"
            >
              <HardDriveUpload className="w-4 h-4" /> Restore (.db)
            </button>
          </div>
        </div>

        {/* Success feedback pills */}
        {backupSuccess && (
          <div className="p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Backup created successfully: {backupSuccess}</span>
          </div>
        )}

        {restoreSuccess && (
          <div className="p-3 bg-teal-900/60 border border-teal-500 text-teal-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{restoreSuccess}</span>
          </div>
        )}

        {/* DB Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Database Architecture</span>
            <span className="font-bold text-slate-200">SQLite3 (WAL Mode + Foreign Keys)</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Database File Size</span>
            <span className="font-bold text-teal-400">{dbInfo?.sizeReadable || 'Calculating...'}</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Portability Mode</span>
            <span className="font-bold text-slate-200">Zero-Config Standalone</span>
          </div>
        </div>

        {dbInfo?.path && (
          <div className="text-[11px] text-slate-400 font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">File on disk: {dbInfo.path}</span>
          </div>
        )}
      </div>

      {/* Multi-Doctor Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-8 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              Multi-Doctor Team & Specialists
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add multiple dentists and specialists. Each doctor can be booked without schedule clashes.
            </p>
          </div>

          <button
            onClick={openAddDoctor}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition"
          >
            <UserPlus className="w-4 h-4" /> Add Doctor
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map(d => (
            <div key={d.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color || '#0d9488' }}></span>
                  <span className="font-extrabold text-slate-800 text-sm">{d.name}</span>
                </div>
                <p className="text-xs font-bold text-teal-700">{d.specialty}</p>
                <p className="text-[11px] text-slate-500">
                  {d.qualification} {d.registration_no ? `• Reg: ${d.registration_no}` : ''}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                  <span>Consult Fee: <strong className="text-slate-900">{formData.currency}{d.consultation_fee || 500}</strong></span>
                  {d.phone && <span>• 📞 {d.phone}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditDoctor(d)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
                  title="Edit Doctor"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${d.name} from active doctors?`)) {
                      onDeleteDoctor(d.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Delete Doctor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinic Profile & Branding Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-teal-600" />
              Clinic Profile & Official Letterhead
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on printed tax invoices, prescriptions (Rx), and reports.
            </p>
          </div>

          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Row 1: Clinic Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinic / Practice Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline / Sub-heading
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Row 2: Doctor Name, Degrees, Registration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medical Director / Head Doctor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qualifications & Specialties
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registration / License No.
              </label>
              <input
                type="text"
                value={formData.registration_no}
                onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Row 3: Contact & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="₹"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Footer Note</label>
            <textarea
              rows="2"
              value={formData.invoice_footer}
              onChange={(e) => setFormData({ ...formData, invoice_footer: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition"
            >
              <Save className="w-4 h-4" /> Save Clinic Settings
            </button>
          </div>
        </form>
      </div>

      {/* Doctor Add / Edit Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingDoctor ? 'Edit Doctor Profile' : 'Add New Dental Specialist'}
                </h3>
                <p className="text-xs text-teal-200">Doctor credentials & specialty</p>
              </div>
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDoctorSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                  placeholder="e.g. Endodontist & Conservative Dentistry"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    placeholder="e.g. BDS, MDS"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registration No.</label>
                  <input
                    type="text"
                    value={doctorForm.registration_no}
                    onChange={(e) => setDoctorForm({ ...doctorForm, registration_no: e.target.value })}
                    placeholder="e.g. DENT-REG-51204"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ({formData.currency})</label>
                  <input
                    type="number"
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: Number(e.target.value) })}
                    placeholder="e.g. 500"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    placeholder="e.g. +91 98111 22334"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  placeholder="doctor@smilecraftdental.in"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
