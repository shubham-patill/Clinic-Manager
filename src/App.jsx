import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientProfile from './components/PatientProfile';
import Appointments from './components/Appointments';
import Treatments from './components/Treatments';
import Billing from './components/Billing';
import Prescriptions from './components/Prescriptions';
import Settings from './components/Settings';

import {
  getClinicSettings,
  getDashboardStats,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getPatients,
  getAppointments,
  getProceduresCatalog,
  getInvoices,
  getPatientPrescriptions,
  getMedicationsCatalog,
  createPatient,
  updatePatient,
  deletePatient,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  createProcedure,
  deleteProcedure,
  createInvoice,
  recordPayment,
  createPrescription,
  deletePrescription
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clinicSettings, setClinicSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [proceduresCatalog, setProceduresCatalog] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicationsCatalog, setMedicationsCatalog] = useState([]);

  // Selected state
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Global modals
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isBookApptModalOpen, setIsBookApptModalOpen] = useState(false);

  // Load all foundational data
  const refreshAllData = async () => {
    try {
      const [settings, dashboardStats, docsList, ptList, apptList, procList, invList, rxList, medList] = await Promise.all([
        getClinicSettings(),
        getDashboardStats(),
        getDoctors(),
        getPatients(),
        getAppointments(),
        getProceduresCatalog(),
        getInvoices(),
        getPatientPrescriptions(null),
        getMedicationsCatalog()
      ]);

      setClinicSettings(settings);
      setStats(dashboardStats);
      setDoctors(docsList || []);
      setPatients(ptList || []);
      setAppointments(apptList || []);
      setProceduresCatalog(procList || []);
      setInvoices(invList || []);
      setPrescriptions(rxList || []);
      setMedicationsCatalog(medList || []);
    } catch (err) {
      console.error('Error loading clinic data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers for Patient actions
  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab('patient-profile');
  };

  const handleSavePatient = async (formData, patientId = null) => {
    if (patientId) {
      await updatePatient(patientId, formData);
    } else {
      await createPatient(formData);
    }
    refreshAllData();
  };

  const handleDeletePatient = async (patientId) => {
    await deletePatient(patientId);
    if (selectedPatientId === patientId) {
      setSelectedPatientId(null);
      setActiveTab('patients');
    }
    refreshAllData();
  };

  // Handlers for Appointment actions
  const handleSaveAppointment = async (formData) => {
    await createAppointment(formData);
    refreshAllData();
  };

  const handleUpdateApptStatus = async (id, status) => {
    await updateAppointmentStatus(id, status);
    refreshAllData();
  };

  const handleDeleteAppointment = async (id) => {
    await deleteAppointment(id);
    refreshAllData();
  };

  // Handlers for Procedure Catalog
  const handleSaveProcedure = async (proc) => {
    await createProcedure(proc);
    refreshAllData();
  };

  const handleDeleteProcedure = async (id) => {
    await deleteProcedure(id);
    refreshAllData();
  };

  // Handlers for Doctors (Multi-Doctor Team)
  const handleSaveDoctor = async (formData, doctorId = null) => {
    if (doctorId) {
      await updateDoctor(doctorId, formData);
    } else {
      await createDoctor(formData);
    }
    refreshAllData();
  };

  const handleDeleteDoctor = async (doctorId) => {
    await deleteDoctor(doctorId);
    refreshAllData();
  };

  // Handlers for Invoices
  const handleCreateInvoice = async (invoiceData) => {
    const res = await createInvoice(invoiceData);
    refreshAllData();
    if (res && res.id) {
      setSelectedInvoiceId(res.id);
      setActiveTab('billing');
    }
  };

  const handleRecordPayment = async (invoiceId, amount, method, refNo, notes) => {
    await recordPayment(invoiceId, amount, method, refNo, notes);
    refreshAllData();
  };

  // Handlers for Prescriptions
  const handleCreatePrescription = async (rxData) => {
    await createPrescription(rxData);
    refreshAllData();
  };

  const handleDeletePrescription = async (id) => {
    await deletePrescription(id);
    refreshAllData();
  };

  // Navigation shortcuts from profile
  const handleProfileBookAppt = (patient) => {
    setIsBookApptModalOpen(true);
  };

  const handleProfileNewInvoice = (patient) => {
    setActiveTab('billing');
  };

  const handleProfileNewRx = (patient) => {
    setActiveTab('prescriptions');
  };

  const handleProfilePrintInvoice = (invId) => {
    setSelectedInvoiceId(invId);
    setActiveTab('billing');
  };

  const handleProfilePrintRx = (rx) => {
    setSelectedPrescription(rx);
    setActiveTab('prescriptions');
  };

  // Selected patient object
  const currentPatient = patients.find(p => p.id === Number(selectedPatientId));

  // Determine page title
  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Clinic Operations Dashboard', subtitle: 'Overview of appointments, clinical procedures, and billing ledger' };
      case 'patients':
        return { title: 'Patient Directory (EHR / EMR)', subtitle: 'Comprehensive patient health records with clinical safety alerts' };
      case 'patient-profile':
        return { title: `Patient EHR: ${currentPatient?.full_name || 'Patient'}`, subtitle: `ID: ${currentPatient?.patient_id || ''} • Interactive Dental Chart & Timeline` };
      case 'appointments':
        return { title: 'Appointments & Chair Schedule', subtitle: 'Daily operatory reservations, doctor allocations, and patient queue' };
      case 'treatments':
        return { title: 'Treatments & Procedure Price List', subtitle: 'Master catalog of standardized dental procedures and fees' };
      case 'billing':
        return { title: 'Billing, Invoicing & Payments', subtitle: 'Itemized clinical invoices, tax statements, and payment receipts' };
      case 'prescriptions':
        return { title: 'Prescriptions (Rx)', subtitle: 'Dental pharmacotherapy generator with drug allergy cross-referencing' };
      case 'settings':
        return { title: 'Clinic Settings & Embedded Database', subtitle: 'Practice branding, doctor qualifications, and one-click SQLite backups' };
      default:
        return { title: 'DentCare Pro', subtitle: 'Dental Clinic Management System' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab === 'patient-profile' ? 'patients' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'patients') {
            setSelectedPatientId(null);
          }
          setActiveTab(tab);
        }}
        clinicSettings={clinicSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onNewPatient={() => {
            setIsAddPatientModalOpen(true);
            if (activeTab !== 'patients') setActiveTab('patients');
          }}
          onNewAppointment={() => setIsBookApptModalOpen(true)}
          onRefresh={refreshAllData}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              clinicSettings={clinicSettings}
              doctors={doctors}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectPatient={handleSelectPatient}
              onUpdateApptStatus={handleUpdateApptStatus}
              onNewPatient={() => {
                setIsAddPatientModalOpen(true);
                setActiveTab('patients');
              }}
              onNewAppointment={() => setIsBookApptModalOpen(true)}
            />
          )}

          {activeTab === 'patients' && (
            <Patients
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onSavePatient={handleSavePatient}
              onDeletePatient={handleDeletePatient}
              isAddModalOpen={isAddPatientModalOpen}
              setIsAddModalOpen={setIsAddPatientModalOpen}
            />
          )}

          {activeTab === 'patient-profile' && currentPatient && (
            <PatientProfile
              patient={currentPatient}
              doctors={doctors}
              onBack={() => setActiveTab('patients')}
              onNewAppointment={handleProfileBookAppt}
              onNewInvoice={handleProfileNewInvoice}
              onNewPrescription={handleProfileNewRx}
              onPrintInvoice={handleProfilePrintInvoice}
              onPrintPrescription={handleProfilePrintRx}
              currency={clinicSettings?.currency || '₹'}
            />
          )}

          {activeTab === 'appointments' && (
            <Appointments
              appointments={appointments}
              patients={patients}
              doctors={doctors}
              clinicSettings={clinicSettings}
              onSaveAppointment={handleSaveAppointment}
              onUpdateStatus={handleUpdateApptStatus}
              onDeleteAppointment={handleDeleteAppointment}
              onSelectPatient={handleSelectPatient}
              isBookModalOpen={isBookApptModalOpen}
              setIsBookModalOpen={setIsBookApptModalOpen}
            />
          )}

          {activeTab === 'treatments' && (
            <Treatments
              procedures={proceduresCatalog}
              doctors={doctors}
              onSaveProcedure={handleSaveProcedure}
              onDeleteProcedure={handleDeleteProcedure}
              currency={clinicSettings?.currency || '₹'}
            />
          )}

          {activeTab === 'billing' && (
            <Billing
              invoices={invoices}
              patients={patients}
              doctors={doctors}
              proceduresCatalog={proceduresCatalog}
              clinicSettings={clinicSettings}
              onCreateInvoice={handleCreateInvoice}
              onRecordPayment={handleRecordPayment}
              currency={clinicSettings?.currency || '₹'}
              selectedInvoiceId={selectedInvoiceId}
              onClearSelectedInvoice={() => setSelectedInvoiceId(null)}
            />
          )}

          {activeTab === 'prescriptions' && (
            <Prescriptions
              prescriptions={prescriptions}
              patients={patients}
              doctors={doctors}
              medicationsCatalog={medicationsCatalog}
              clinicSettings={clinicSettings}
              onCreatePrescription={handleCreatePrescription}
              onDeletePrescription={handleDeletePrescription}
              selectedPrescription={selectedPrescription}
              onClearSelectedPrescription={() => setSelectedPrescription(null)}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              clinicSettings={clinicSettings}
              doctors={doctors}
              onSettingsUpdated={(newSettings) => setClinicSettings(newSettings)}
              onSaveDoctor={handleSaveDoctor}
              onDeleteDoctor={handleDeleteDoctor}
            />
          )}
        </main>
      </div>
    </div>
  );
}
