# DentCare Pro — Dental Clinic Management System (Desktop Windows Application)

> **Zero-Configuration Desktop Software with a 100% Self-Contained Embedded Database.**  
> Built with **Electron + React 19 + Tailwind CSS + Node.js Native SQLite (`node:sqlite`)**.

---

## 🌟 Key Highlights

- **Embedded Self-Contained Database**: No MySQL, PostgreSQL, SQL Server, or Docker required! Uses an embedded SQLite 3 database engine running directly inside the desktop application with WAL (Write-Ahead Logging) and Foreign Keys enabled.
- **Stand-Alone Windows `.exe`**: Can be packaged into a single Windows installer (`DentCare Pro Setup.exe`) or portable executable (`DentCare-Pro-Portable.exe`) that runs straight from a USB pen-drive.
- **Multi-Doctor Practice Architecture**: Built for multi-dentist and specialist clinics (General Dentists, Endodontists, Orthodontists, Periodontists, Implantologists). Filter appointments, treatments, prescriptions, and invoices by individual doctor or view practice-wide metrics.
- **Interactive Time-Slot Booking with Clash Prevention**: 
  - Visual time-slot grid (30-min intervals).
  - Strict conflict detection: **Doctor Clash Prevention** (the same doctor cannot have overlapping appointments in different chairs) and **Operatory Clash Prevention** (a chair cannot be booked for two doctors at the same time).
  - Dynamic status tags (`Available`, `Dr Busy`, `Chair Busy`) and instant warning alerts.
- **Custom Doctor Treatments & Price List**: Doctors can create and manage their own treatments, customize procedure fees in Indian Rupees (`₹`), and assign specific treatments to specialists or all doctors.
- **Prescription (Rx) Generator & Directory**: Seamless prescription creation with preloaded dental pharmacotherapy (Amoxicillin, Augmentin, Ibuprofen, Ketorolac, Chlorhexidine), allergy cross-referencing, doctor qualifications, and **Printable Rx Slips**.
- **Interactive Odontogram (Dental Chart)**: Visual 32-tooth adult dentition (FDI & Universal notation) and 20-tooth pediatric deciduous dentition. Click any tooth to tag caries, restorations, RCT, crowns, implants, or missing teeth, with a 1-click shortcut to plan treatments!
- **Electronic Health Records (EHR) with Safety Watch**: Records patient demographics, blood groups, and high-visibility **Medical Safety Alert badges** (Penicillin allergy, diabetes, hypertension, bleeding disorders).
- **Billing, Invoicing & Payments in ₹ (INR)**: Itemized clinical bills, UPI/QR Code and cash/card payment collection, partial payment tracking, tax calculation, and **Official Printable A4 Invoices** with doctor signature.
- **1-Click Database Backup & Restore**: Safeguard clinic data anytime with timestamped `.db` backup file exports.

---

## 🚀 Quick Start Guide

### 1. Run Development Mode
To test the software with instant hot-reload:
```powershell
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. All clinical features, odontograms, billing, and Rx generators run smoothly with the local database simulation.

To run inside the native Electron desktop window:
```powershell
npm run electron:dev
```

### 2. Run the Production Desktop Application
To launch the compiled desktop app:
```powershell
npm run build
npm start
```

### 3. Generate Windows `.exe` Executables
To create the standalone Windows installation `.exe` (NSIS setup wizard):
```powershell
npm run build:exe
```

To create a **Portable `.exe`** (single executable file, no installer, run anywhere from a USB drive):
```powershell
npm run build:portable
```
The output `.exe` files will be placed into the `./release/` directory.

---

## 📁 Project Architecture

```
Clinic Manage/
├── electron/
│   ├── main.js             # Electron main process & IPC handlers
│   ├── preload.js          # Secure contextBridge API (window.electronAPI)
│   └── db.js               # Self-contained SQLite3 database layer (node:sqlite)
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Daily metrics, appointment queue, safety alerts
│   │   ├── Patients.jsx        # Patient directory with allergy filters & EHR modals
│   │   ├── PatientProfile.jsx  # 360° patient record, history & tabs
│   │   ├── Odontogram.jsx      # Interactive adult & pediatric dental chart
│   │   ├── Appointments.jsx    # Chair scheduling & queue management
│   │   ├── Treatments.jsx      # Master procedure catalog & pricing
│   │   ├── Billing.jsx         # Invoices, partial payments & printable bills
│   │   ├── Prescriptions.jsx   # Dental Rx generator & printable slips
│   │   ├── Settings.jsx        # Clinic branding & SQLite backup control center
│   │   ├── Header.jsx          # Top bar with quick DB backup & new patient shortcuts
│   │   └── Sidebar.jsx         # Clinical navigation & embedded DB status
│   ├── services/
│   │   └── api.js              # Universal database bridge (Electron IPC / Fallback)
│   ├── App.jsx                 # Master application controller & state
│   ├── main.jsx                # React root entry
│   └── index.css               # Clinical theme, scrollbars & print styles
├── dist/                       # Compiled production frontend assets
├── package.json                # electron-builder & dependencies config
└── vite.config.mjs             # Vite configuration
```

---

## 🗄️ Database Storage & Portability

- **Default Location**: The database is stored at:  
  `%APPDATA%\dentcare-pro\dental_clinic.db`
- **Portable USB Mode**: If a folder named `data/` exists next to the application executable, DentCare Pro will automatically store and read `dental_clinic.db` directly inside `data/dental_clinic.db`. This allows the clinic to run the software and database entirely from a portable drive.
- **Backups**: The "Backup DB" button in the header or in Settings exports a point-in-time `.db` snapshot that can be restored on any computer running DentCare Pro.

---

## 🖨️ Printing & PDF Export
- Both **Invoices** and **Prescriptions (Rx)** feature formatted medical letterhead templates.
- Clicking **"Print / Save PDF"** invokes the native system print dialog, allowing instant printing to thermal/laser printers or saving directly as a clean PDF file.
