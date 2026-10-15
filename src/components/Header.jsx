import React from 'react';
import { 
  UserPlus, 
  CalendarPlus, 
  Receipt, 
  Database, 
  Calendar as CalendarIcon,
  HardDriveDownload,
  CheckCircle2
} from 'lucide-react';
import { backupDatabase } from '../services/api';

export default function Header({ 
  title, 
  subtitle, 
  onNewPatient, 
  onNewAppointment, 
  onNewInvoice,
  onRefresh
}) {
  const [backupStatus, setBackupStatus] = React.useState(null);

  const handleQuickBackup = async () => {
    try {
      const res = await backupDatabase();
      if (res && res.success) {
        setBackupStatus('Backup Saved!');
        setTimeout(() => setBackupStatus(null), 3000);
      }
    } catch (err) {
      alert('Backup failed: ' + err.message);
    }
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print shrink-0">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
          <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
          <span>{todayStr}</span>
        </div>

        {/* Quick DB Backup Button */}
        <button
          onClick={handleQuickBackup}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          title="Export instant SQLite database backup file"
        >
          {backupStatus ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">{backupStatus}</span>
            </>
          ) : (
            <>
              <HardDriveDownload className="w-3.5 h-3.5 text-teal-600" />
              <span>Backup DB</span>
            </>
          )}
        </button>

        {/* Action: Book Appointment */}
        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        )}

        {/* Action: New Patient */}
        {onNewPatient && (
          <button
            onClick={onNewPatient}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition shadow-teal-600/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Patient</span>
          </button>
        )}
      </div>
    </header>
  );
}
