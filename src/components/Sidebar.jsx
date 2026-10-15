import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  Receipt, 
  FileText, 
  Settings, 
  Database,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, clinicSettings }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients (EHR)', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'treatments', label: 'Treatments & Catalog', icon: Stethoscope },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'prescriptions', label: 'Prescriptions (Rx)', icon: FileText },
    { id: 'settings', label: 'Clinic Settings & DB', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none no-print">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-bold text-xl">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 6 4 6 7c0 2.2 1.3 4.8 2.2 7.2.9 2.4 1.8 4.8 2.8 7.8.3 1 .9 1.5 1.5 1.5.6 0 1.2-.5 1.5-1.5 1-3 1.9-5.4 2.8-7.8.9-2.4 2.2-5 2.2-7.2 0-3-2.5-5-6-5zm-3 5c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3z"/>
            </svg>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-base leading-tight tracking-tight truncate">
              {clinicSettings?.clinic_name || 'DentCare Pro'}
            </h1>
            <p className="text-xs text-teal-400 flex items-center gap-1 font-medium mt-0.5">
              <Sparkles className="w-3 h-3" /> Dental Clinical OS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Clinical Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-700/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Embedded Database Status Pill */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Database className="w-3.5 h-3.5 text-teal-400" /> Embedded DB
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          SQLite engine is self-contained. No server setup or external database needed.
        </p>
      </div>

      {/* Doctor Info Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-800 text-teal-200 flex items-center justify-center font-bold text-sm border border-teal-600/40">
          DR
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-white truncate">
            {clinicSettings?.doctor_name || 'Dr. Sarah Mitchell'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {clinicSettings?.registration_no || 'DENT-REG-84920'}
          </p>
        </div>
      </div>
    </aside>
  );
}
