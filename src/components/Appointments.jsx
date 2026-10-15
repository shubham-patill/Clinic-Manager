import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  Search,
  Filter,
  CalendarDays,
  AlertTriangle,
  ShieldAlert,
  Columns,
  List,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { 
  checkAppointmentConflict, 
  timeToMinutes, 
  minutesToTime, 
  intervalsOverlap 
} from '../services/api';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const CHAIRS = ['Chair 1', 'Chair 2', 'Surgery Room'];

export default function Appointments({ 
  appointments = [], 
  patients = [], 
  doctors = [],
  clinicSettings,
  onSaveAppointment, 
  onUpdateStatus, 
  onDeleteAppointment,
  onSelectPatient,
  isBookModalOpen,
  setIsBookModalOpen,
  preselectedPatient = null
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filterChair, setFilterChair] = useState('All');
  const [filterDoctor, setFilterDoctor] = useState('All Doctors');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'chair-grid'
  const [clashError, setClashError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patient_id: preselectedPatient ? preselectedPatient.id : '',
    appointment_date: todayStr,
    appointment_time: '10:00',
    duration_minutes: 30,
    chair_number: 'Chair 1',
    doctor_name: doctors[0]?.name || clinicSettings?.doctor_name || 'Dr. Sarah Mitchell',
    reason: '',
    status: 'Scheduled',
    notes: ''
  });

  const openBookModal = (pt = null) => {
    setClashError(null);
    setFormData({
      patient_id: pt ? pt.id : (patients[0]?.id || ''),
      appointment_date: selectedDate || todayStr,
      appointment_time: '10:00',
      duration_minutes: 30,
      chair_number: 'Chair 1',
      doctor_name: doctors[0]?.name || clinicSettings?.doctor_name || 'Dr. Sarah Mitchell',
      reason: '',
      status: 'Scheduled',
      notes: ''
    });
    setIsBookModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClashError(null);

    if (!formData.patient_id) {
      alert('Please select a patient for the appointment.');
      return;
    }

    try {
      await onSaveAppointment(formData);
      setIsBookModalOpen(false);
    } catch (err) {
      setClashError(err.message);
    }
  };

  // Find slot availability for the currently configured modal form
  const slotAvailabilityMap = useMemo(() => {
    if (!isBookModalOpen) return {};
    const map = {};
    const dayAppts = appointments.filter(a => 
      a.appointment_date === formData.appointment_date && a.status !== 'Cancelled'
    );

    for (const slot of TIME_SLOTS) {
      let isDoctorBusy = false;
      let isChairBusy = false;
      let busyDoctorReason = '';
      let busyChairReason = '';

      for (const existing of dayAppts) {
        const overlap = intervalsOverlap(slot, formData.duration_minutes, existing.appointment_time, existing.duration_minutes);
        if (overlap) {
          if (existing.doctor_name === formData.doctor_name) {
            isDoctorBusy = true;
            busyDoctorReason = `${existing.doctor_name} is with ${existing.patient_name} (${existing.chair_number})`;
          }
          if (existing.chair_number === formData.chair_number) {
            isChairBusy = true;
            busyChairReason = `${existing.chair_number} is occupied by ${existing.patient_name} (${existing.doctor_name})`;
          }
        }
      }

      map[slot] = {
        available: !isDoctorBusy && !isChairBusy,
        isDoctorBusy,
        isChairBusy,
        reason: isDoctorBusy ? busyDoctorReason : busyChairReason
      };
    }
    return map;
  }, [isBookModalOpen, appointments, formData.appointment_date, formData.doctor_name, formData.chair_number, formData.duration_minutes]);

  // Filter appointments for main view
  const filteredAppointments = appointments.filter(a => {
    if (selectedDate && a.appointment_date !== selectedDate) return false;
    if (filterChair !== 'All' && a.chair_number !== filterChair) return false;
    if (filterDoctor !== 'All Doctors' && a.doctor_name !== filterDoctor) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedDate === todayStr
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow.toISOString().split('T')[0]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tomorrow
          </button>

          <button
            onClick={() => setSelectedDate('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedDate === ''
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Dates
          </button>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Doctor, Chair, View Mode & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Doctor Filter (Multi-Doctor Practice) */}
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

          {/* Chair filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Chair:</span>
            <select
              value={filterChair}
              onChange={(e) => setFilterChair(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
            >
              <option value="All">All Chairs</option>
              {CHAIRS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('chair-grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'chair-grid' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Chair Operatory Grid"
            >
              <Columns className="w-3.5 h-3.5" /> Chair Grid
            </button>
          </div>

          <button
            onClick={() => openBookModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Main View: List or Chair Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-base">
                {selectedDate ? `Appointments for ${selectedDate}` : 'All Scheduled Appointments'}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {filteredAppointments.length} Bookings
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAppointments.map(appt => (
              <div key={appt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-800 flex flex-col items-center justify-center font-bold border border-teal-200/80 shrink-0">
                    <span className="text-sm">{appt.appointment_time}</span>
                    <span className="text-[10px] text-teal-600 font-semibold mt-0.5">{appt.duration_minutes} min</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectPatient(appt.patient_id)}
                        className="font-bold text-slate-800 text-base hover:text-teal-700 transition"
                      >
                        {appt.patient_name}
                      </button>
                      <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {appt.patient_code}
                      </span>
                      <span className="text-xs text-slate-500">
                        📞 {appt.patient_phone}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 mt-1">
                      Procedure: <span className="font-normal text-slate-600">{appt.reason || 'General Dental Consultation'}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        🪑 {appt.chair_number}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-teal-600" />
                        {appt.doctor_name || 'Dr. Sarah Mitchell'}
                      </span>
                      {appt.notes && <span className="italic text-slate-500">• "{appt.notes}"</span>}
                    </div>
                  </div>
                </div>

                {/* Status Selector & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={appt.status}
                    onChange={(e) => onUpdateStatus(appt.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition ${
                      appt.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : appt.status === 'Waiting'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : appt.status === 'In-Treatment'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Waiting">In Waiting Room</option>
                    <option value="In-Treatment">In Chair / Treatment</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No-Show">No Show</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm('Delete this appointment record?')) {
                        onDeleteAppointment(appt.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No appointments found for the selected criteria.</p>
                <button
                  onClick={() => openBookModal()}
                  className="mt-3 px-3.5 py-1.5 bg-teal-600 text-white font-bold rounded-lg"
                >
                  + Book Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Operatory / Chair Grid View (Side-by-side Chairs) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CHAIRS.map(chairName => {
            const chairAppts = filteredAppointments.filter(a => a.chair_number === chairName);
            return (
              <div key={chairName} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="px-5 py-3.5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                    <h4 className="font-bold text-sm tracking-tight">{chairName}</h4>
                  </div>
                  <span className="text-[11px] font-bold bg-teal-800/80 px-2 py-0.5 rounded-full text-teal-200">
                    {chairAppts.length} Booked
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-3 bg-slate-50/50 overflow-y-auto max-h-[600px]">
                  {chairAppts.map(appt => (
                    <div key={appt.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {appt.appointment_time} ({appt.duration_minutes}m)
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {appt.status}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-800 text-sm">{appt.patient_name}</p>
                        <p className="text-xs text-slate-500">{appt.reason || 'Dental Consultation'}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-teal-700">{appt.doctor_name}</span>
                        <select
                          value={appt.status}
                          onChange={(e) => onUpdateStatus(appt.id, e.target.value)}
                          className="text-[10px] font-bold p-1 rounded border border-slate-200 bg-slate-50"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Waiting">Waiting</option>
                          <option value="In-Treatment">In Chair</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {chairAppts.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Chair is completely free today.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Appointment Modal with Interactive Time Slots & Clash Prevention */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Schedule Patient Appointment</h3>
                <p className="text-xs text-teal-200">Smart Time Slot Reservation with Clash Prevention</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Clash Error Banner */}
              {clashError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2 text-rose-900 text-xs">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Booking Clash Detected: </span>
                    <span>{clashError}</span>
                  </div>
                </div>
              )}

              {/* Patient Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.patient_id}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor & Chair Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attending Doctor / Dentist <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dental Chair / Operatory <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.chair_number}
                    onChange={(e) => setFormData({ ...formData, chair_number: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
                  >
                    {CHAIRS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={15}>15 mins (Quick Checkup / Suture Removal)</option>
                    <option value={30}>30 mins (Consult / Filling)</option>
                    <option value={45}>45 mins (Scaling / Crown Prep)</option>
                    <option value={60}>60 mins (Root Canal / Surgical Extraction)</option>
                    <option value={90}>90 mins (Implant Surgery)</option>
                  </select>
                </div>
              </div>

              {/* Interactive Visual Time Slots Picker */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Select Available Time Slot
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Selected: <span className="font-extrabold text-teal-700">{formData.appointment_time}</span>
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                  {TIME_SLOTS.map(slot => {
                    const status = slotAvailabilityMap[slot] || { available: true };
                    const isSelected = formData.appointment_time === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!status.available && !isSelected}
                        onClick={() => {
                          setFormData({ ...formData, appointment_time: slot });
                          setClashError(null);
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400'
                            : status.isDoctorBusy
                            ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed opacity-60'
                            : status.isChairBusy
                            ? 'bg-amber-50 text-amber-500 border-amber-200 cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                        }`}
                        title={status.reason || `${slot} is free`}
                      >
                        <span>{slot}</span>
                        <span className="text-[9px] font-normal mt-0.5">
                          {isSelected ? 'Selected' : status.isDoctorBusy ? 'Dr Busy' : status.isChairBusy ? 'Chair Busy' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason / Procedure */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Procedure / Reason for Visit</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Toothache lower jaw, RCT Stage 2, Scaling..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Instructions / Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Needs pre-medication, patient anxious..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
