import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Stethoscope, 
  UserPlus, 
  CalendarPlus, 
  Receipt, 
  FileText,
  ChevronRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function Dashboard({ 
  stats, 
  clinicSettings, 
  doctors = [],
  onNavigate, 
  onSelectPatient,
  onUpdateApptStatus,
  onNewPatient,
  onNewAppointment
}) {
  const currency = clinicSettings?.currency || '₹';
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All Doctors');

  // Filter today's appointments by doctor if selected
  const todayAppts = (stats?.todayAppointments || []).filter(a => 
    selectedDoctorFilter === 'All Doctors' || a.doctor_name === selectedDoctorFilter
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              Multi-Doctor Dental OS • Embedded SQLite
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {clinicSettings?.clinic_name || 'SmileCraft Super Specialty Dental Clinic'}
            </h2>
            <p className="text-teal-200/80 text-sm mt-1 max-w-xl">
              Multi-doctor practice management with conflict-free scheduling and zero external database dependencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Doctor Filter in Banner */}
            <div className="bg-white/10 p-1 rounded-xl border border-white/20 backdrop-blur-md">
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="bg-transparent text-white text-xs font-bold px-2 py-1.5 focus:outline-none"
              >
                <option value="All Doctors" className="text-slate-900 font-semibold">👨‍⚕️ All Doctors</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.name} className="text-slate-900 font-semibold">
                    👨‍⚕️ {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onNewPatient}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg shadow-teal-500/20 transition"
            >
              <UserPlus className="w-4 h-4" /> Add Patient
            </button>
            <button
              onClick={onNewAppointment}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 transition backdrop-blur-sm"
            >
              <CalendarPlus className="w-4 h-4" /> Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards (in INR ₹) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Visits</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {todayAppts.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            {selectedDoctorFilter === 'All Doctors' ? 'Across all operatories' : `For ${selectedDoctorFilter}`}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Patients</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {stats?.totalPatients || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Active EHR profiles
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Procedures Done</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {stats?.completedTreatments || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> Completed clinical treatments
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue Collected</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="text-lg font-black">{currency}</span>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {currency}{(stats?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Pending dues: {currency}{(stats?.pendingDues || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Appointments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-base">Today's Appointment Queue</h3>
              </div>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View Full Calendar <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {todayAppts.length > 0 ? (
                todayAppts.map((appt) => (
                  <div key={appt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex flex-col items-center justify-center font-bold text-xs border border-teal-100 shrink-0">
                        <span>{appt.appointment_time}</span>
                        <span className="text-[10px] text-teal-600 font-normal">{appt.duration_minutes}m</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectPatient(appt.patient_id)}
                            className="font-bold text-slate-800 hover:text-teal-600 text-sm transition"
                          >
                            {appt.patient_name}
                          </button>
                          <span className="text-[11px] font-mono text-slate-400">
                            {appt.patient_code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          {appt.reason || 'General Dental Consultation'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            🪑 {appt.chair_number}
                          </span>
                          <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            👨‍⚕️ {appt.doctor_name || 'Dr. Sarah Mitchell'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={appt.status}
                        onChange={(e) => onUpdateApptStatus(appt.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition ${
                          appt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : appt.status === 'Waiting'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : appt.status === 'In-Treatment'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Waiting">In Waiting Room</option>
                        <option value="In-Treatment">In Chair / Treatment</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <p>No appointments scheduled for today{selectedDoctorFilter !== 'All Doctors' ? ` with ${selectedDoctorFilter}` : ''}.</p>
                  <button
                    onClick={onNewAppointment}
                    className="mt-2 text-xs font-bold text-teal-600 hover:underline"
                  >
                    + Book First Appointment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Clinical Treatments Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-base">Recent Clinical Treatments</h3>
              </div>
              <button
                onClick={() => onNavigate('treatments')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View Catalog <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {stats?.recentTreatments && stats.recentTreatments.length > 0 ? (
                stats.recentTreatments.map((t) => (
                  <div key={t.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t.procedure_name}</p>
                      <p className="text-xs text-slate-500">
                        Patient: <span className="font-semibold text-slate-700">{t.patient_name}</span> {t.tooth_number ? `• Tooth #${t.tooth_number}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">
                        {currency}{t.final_amount}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No treatments recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Doctor Directory & Safety Alerts */}
        <div className="space-y-6">
          {/* Multi-Doctor Clinical Team Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Specialist Doctors on Duty
              </h4>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[11px] font-bold text-teal-600 hover:underline"
              >
                Manage
              </button>
            </div>
            <div className="space-y-2">
              {doctors.map(d => (
                <div key={d.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.name}</p>
                    <p className="text-[10px] text-slate-500">{d.specialty}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    {currency}{d.consultation_fee}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Safety Watch */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Medical Safety Alert Watch</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed mb-3">
              Check patient alerts before administering local anesthesia (Lignocaine with Adrenaline) or prescribing antibiotics.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white/80 rounded-xl border border-rose-100 text-rose-950">
                <p className="font-bold">Eleanor Vance (PT-2026-001)</p>
                <p className="text-rose-700 font-semibold text-[11px] mt-0.5">
                  ⚠️ Severe Penicillin Allergy (Anaphylaxis risk)
                </p>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-rose-100 text-rose-950">
                <p className="font-bold">Marcus Holloway (PT-2026-002)</p>
                <p className="text-rose-700 font-semibold text-[11px] mt-0.5">
                  ⚠️ Type 2 Diabetes & Hypertension (Monitor BP)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Access Tiles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('prescriptions')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition group"
              >
                <FileText className="w-5 h-5 text-teal-600 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-slate-700">Write Rx</span>
                <span className="text-[10px] text-slate-400">Prescription</span>
              </button>

              <button
                onClick={() => onNavigate('billing')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition group"
              >
                <Receipt className="w-5 h-5 text-teal-600 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-slate-700">New Bill</span>
                <span className="text-[10px] text-slate-400">Invoice (₹)</span>
              </button>

              <button
                onClick={() => onNavigate('patients')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition group"
              >
                <Users className="w-5 h-5 text-teal-600 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-slate-700">Dental Chart</span>
                <span className="text-[10px] text-slate-400">Odontogram</span>
              </button>

              <button
                onClick={() => onNavigate('treatments')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition group"
              >
                <Stethoscope className="w-5 h-5 text-teal-600 group-hover:scale-110 transition mb-1" />
                <span className="text-xs font-bold text-slate-700">Treatments</span>
                <span className="text-[10px] text-slate-400">Price List</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
