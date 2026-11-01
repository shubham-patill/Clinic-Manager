# DentCare Pro — Dental Clinic Management System

## Technical Documentation

**Version:** 1.0.0  
**Platform:** Windows Desktop Application  
**Technology Stack:** Electron 44 + React 19 + Tailwind CSS 4 + SQLite (node:sqlite)  
**License:** MIT  
**Author:** DentCare Systems

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Seed Data](#seed-data)
6. [Core Features](#core-features)
7. [Component Reference](#component-reference)
8. [API Service Layer](#api-service-layer)
9. [IPC Communication](#ipc-communication)
10. [Build & Packaging](#build--packaging)
11. [Deployment](#deployment)
12. [Development Guide](#development-guide)

---

## Project Overview

### Description

DentCare Pro is a zero-configuration, standalone desktop application for dental clinic management. It features a 100% self-contained embedded SQLite database requiring no external database server (MySQL, PostgreSQL, or SQL Server).

The application is designed for multi-dentist and specialist clinics, supporting:
- General Dentists
- Endodontists
- Orthodontists
- Periodontists
- Implantologists

### Key Selling Points

1. **Embedded Self-Contained Database** — SQLite 3 running directly inside the desktop application with WAL (Write-Ahead Logging) and Foreign Keys enabled
2. **Stand-Alone Windows .exe** — Packageable as a single Windows installer or portable executable
3. **Multi-Doctor Practice Architecture** — Filter appointments, treatments, prescriptions, and invoices by individual doctor
4. **Interactive Time-Slot Booking with Clash Prevention** — Strict conflict detection for doctor and chair overlaps
5. **Custom Doctor Treatments & Price List** — Doctors create and manage their own treatments with INR pricing
6. **Prescription (Rx) Generator & Directory** — Seamless prescription creation with dental pharmacotherapy
7. **Interactive Odontogram (Dental Chart)** — Visual 32-tooth adult and 20-tooth pediatric dentition
8. **Electronic Health Records (EHR)** — Patient demographics, blood groups, medical safety alerts
9. **Billing, Invoicing & Payments in INR** — Itemized clinical bills, UPI/QR Code and cash/card payments
10. **1-Click Database Backup & Restore** — Timestamped .db backup file exports

### Target Users

- Single-dentist practices
- Multi-specialty dental clinics
- Dental hospitals
- Portable clinic setups (USB-run capability)

---

## Architecture

### Project Structure

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
├── vite.config.mjs             # Vite configuration
├── index.html                  # HTML entry point
├── server.js                   # Production web server (Node.js HTTP)
└── render.yaml                 # Render.com deployment configuration
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (UI Layer)                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Components (Dashboard, Patients, Appointments, etc.)  │ │
│  └───────────────────────────┬─────────────────────────────┘ │
│                              │                                 │
│  ┌───────────────────────────▼─────────────────────────────┐ │
│  │              API Service Layer (src/services/api.js)    │ │
│  │  - Electron IPC bridge (window.electronAPI)             │ │
│  │  - Web Fallback Storage (localStorage)                  │ │
│  └───────────────────────────┬─────────────────────────────┘ │
│                              │                                 │
├──────────────────────────────┼──────────────────────────────┤
│                              │                                 │
│  Electron Environment        │  Web Browser Fallback         │
│  ┌─────────────────────┐     │  ┌─────────────────────────┐  │
│  │  window.electronAPI │────▶│  │ localStorage            │  │
│  └─────────┬───────────┘     │  │ (WebFallbackStorage)    │  │
│            │                 │  └─────────────────────────┘  │
│  ┌─────────▼───────────┐     │                               │
│  │  contextBridge      │     │                               │
│  │  (preload.js)       │     │                               │
│  └─────────┬───────────┘     │                               │
│            │                 │                               │
│  ┌─────────▼───────────┐     │                               │
│  │  IPC Handlers       │     │                               │
│  │  (main.js)          │     │                               │
│  └─────────┬───────────┘     │                               │
│            │                 │                               │
│  ┌─────────▼───────────┐     │                               │
│  │  SQLite Database    │     │                               │
│  │  (node:sqlite)      │     │                               │
│  └─────────────────────┘     │                               │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Environment Support

The application supports two execution modes:

1. **Electron Desktop Mode** — Full SQLite access via IPC bridge, native printing, file dialogs
2. **Web Browser Fallback** — localStorage-based simulated database for preview/testing

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.3.0 | UI library |
| react-dom | ^19.3.0 | React DOM renderer |
| tailwindcss | ^4.3.3 | CSS framework |
| @tailwindcss/vite | ^4.3.3 | Tailwind Vite plugin |
| @vitejs/plugin-react | ^6.1.2 | React Vite plugin |
| vite | ^8.3.4 | Build tool & dev server |
| electron | ^44.7.0 | Desktop framework |
| electron-builder | ^26.15.3 | Windows executable builder |
| sql.js | ^1.14.2 | SQLite WASM (fallback) |
| lucide-react | ^1.55.0 | Icon library |
| clsx | ^2.1.1 | Class name utility |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| concurrently | ^10.0.6 | Run multiple commands |
| wait-on | ^9.5.1 | Wait for resource availability |

### Native Modules

- **node:sqlite** — Built-in Node.js SQLite module (Electron main process)
- **node:fs** — File system operations for backup/restore
- **node:path** — Path resolution
- **node:http** — Production web server

---

## Database Schema

### Overview

The SQLite database uses the following configuration:
- **WAL Mode** (Write-Ahead Logging) for high performance and reliability
- **Foreign Keys** enabled for referential integrity
- Stored at `%APPDATA%\dentcare-pro\dental_clinic.db`
- Portable mode: `data/dental_clinic.db` (when `data/` folder exists next to executable)

### Table Definitions

#### 1. clinic_settings

Singleton table for clinic configuration.

```sql
CREATE TABLE IF NOT EXISTS clinic_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  clinic_name TEXT NOT NULL,
  tagline TEXT,
  doctor_name TEXT NOT NULL,
  qualification TEXT,
  registration_no TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  currency TEXT DEFAULT '₹',
  tax_rate REAL DEFAULT 0,
  invoice_footer TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key (must be 1) |
| clinic_name | TEXT | Clinic/practice name |
| tagline | TEXT | Clinic tagline/sub-heading |
| doctor_name | TEXT | Medical director/head doctor |
| qualification | TEXT | Qualifications & specialties |
| registration_no | TEXT | Registration/license number |
| phone | TEXT | Clinic phone |
| email | TEXT | Clinic email |
| address | TEXT | Physical address |
| currency | TEXT | Currency symbol (default: ₹) |
| tax_rate | REAL | Tax rate (default: 0) |
| invoice_footer | TEXT | Footer note on invoices |
| updated_at | DATETIME | Last update timestamp |

---

#### 2. doctors

Multi-doctor practice support.

```sql
CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  registration_no TEXT,
  phone TEXT,
  email TEXT,
  color TEXT DEFAULT '#0d9488',
  consultation_fee REAL DEFAULT 500,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| name | TEXT | Doctor full name |
| specialty | TEXT | Dental specialty |
| qualification | TEXT | Degrees (BDS, MDS, etc.) |
| registration_no | TEXT | Registration number |
| phone | TEXT | Contact phone |
| email | TEXT | Email address |
| color | TEXT | UI color identifier (hex) |
| consultation_fee | REAL | Consultation fee in INR |
| is_active | INTEGER | Active status (1/0) |
| created_at | DATETIME | Creation timestamp |

---

#### 3. patients

Patient master record with EHR data.

```sql
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  blood_group TEXT,
  medical_history TEXT DEFAULT '[]',
  allergies TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| patient_id | TEXT | Unique patient identifier (e.g., PT-2026-001) |
| full_name | TEXT | Patient full name |
| age | INTEGER | Age in years |
| gender | TEXT | Male/Female/Other |
| phone | TEXT | Contact phone (required) |
| email | TEXT | Email address |
| address | TEXT | Residential address |
| emergency_contact | TEXT | Emergency contact name & phone |
| blood_group | TEXT | Blood group (A+, O-, etc.) |
| medical_history | TEXT | JSON array of conditions (e.g., ["Penicillin Allergy", "Diabetes"]) |
| allergies | TEXT | Specific drug allergies/notes |
| notes | TEXT | General clinical notes |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

---

#### 4. odontogram

Dental chart per patient (tooth-by-tooth conditions).

```sql
CREATE TABLE IF NOT EXISTS odontogram (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  tooth_number INTEGER NOT NULL,
  condition TEXT NOT NULL,
  surface TEXT DEFAULT 'All',
  notes TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  UNIQUE(patient_id, tooth_number)
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| patient_id | INTEGER | FK to patients table |
| tooth_number | INTEGER | FDI tooth number (1-32 for adult) |
| condition | TEXT | Condition type (Healthy, Caries, RCT, Crown, etc.) |
| surface | TEXT | Affected surface (O, M, D, B, L, MO, DO, MOD) |
| notes | TEXT | Clinical notes for the tooth |
| updated_at | DATETIME | Last update timestamp |

**Unique Constraint:** `(patient_id, tooth_number)` — one condition per tooth per patient

---

#### 5. procedures_catalog

Master dental procedure catalog with pricing.

```sql
CREATE TABLE IF NOT EXISTS procedures_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  standard_fee REAL NOT NULL,
  description TEXT,
  doctor_name TEXT DEFAULT 'All Doctors',
  is_active INTEGER DEFAULT 1
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| code | TEXT | Procedure code (e.g., D0120, D3330) |
| category | TEXT | Category (Diagnostic, Preventive, Restorative, etc.) |
| name | TEXT | Procedure name |
| standard_fee | REAL | Standard fee in INR |
| description | TEXT | Procedure description |
| doctor_name | TEXT | Assigned doctor or 'All Doctors' |
| is_active | INTEGER | Active status (1/0) |

---

#### 6. treatments

Patient treatments record.

```sql
CREATE TABLE IF NOT EXISTS treatments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  procedure_id INTEGER,
  procedure_name TEXT NOT NULL,
  tooth_number TEXT,
  doctor_name TEXT,
  status TEXT DEFAULT 'Planned',
  cost REAL NOT NULL,
  discount REAL DEFAULT 0,
  final_amount REAL NOT NULL,
  doctor_notes TEXT,
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (procedure_id) REFERENCES procedures_catalog(id) ON DELETE SET NULL
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| patient_id | INTEGER | FK to patients table |
| procedure_id | INTEGER | FK to procedures_catalog (nullable) |
| procedure_name | TEXT | Procedure name |
| tooth_number | TEXT | Affected tooth number(s) |
| doctor_name | TEXT | Performing doctor |
| status | TEXT | Planned/In Progress/Completed/Cancelled |
| cost | REAL | Standard cost in INR |
| discount | REAL | Discount amount in INR |
| final_amount | REAL | Cost minus discount |
| doctor_notes | TEXT | Clinical notes |
| performed_at | DATETIME | Treatment start timestamp |
| completed_at | DATETIME | Completion timestamp (set when status=Completed) |

---

#### 7. appointments

Appointments with doctor allocation and chair slot reservation.

```sql
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  chair_number TEXT DEFAULT 'Chair 1',
  doctor_id INTEGER,
  doctor_name TEXT,
  reason TEXT,
  status TEXT DEFAULT 'Scheduled',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| patient_id | INTEGER | FK to patients table |
| appointment_date | TEXT | Date (ISO format: YYYY-MM-DD) |
| appointment_time | TEXT | Time (HH:MM format) |
| duration_minutes | INTEGER | Duration in minutes (default: 30) |
| chair_number | TEXT | Operatory chair (Chair 1, Chair 2, Surgery Room) |
| doctor_id | INTEGER | FK to doctors table (nullable) |
| doctor_name | TEXT | Doctor name |
| reason | TEXT | Appointment reason |
| status | TEXT | Scheduled/Waiting/In-Treatment/Completed/Cancelled |
| notes | TEXT | Appointment notes |
| created_at | DATETIME | Creation timestamp |

---

#### 8. invoices

Invoices with payment tracking.

```sql
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  patient_id INTEGER NOT NULL,
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  discount_type TEXT DEFAULT 'flat',
  tax_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  balance_due REAL NOT NULL,
  payment_status TEXT DEFAULT 'Unpaid',
  doctor_name TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| invoice_number | TEXT | Unique invoice number (INV-YYYY-NNNN) |
| patient_id | INTEGER | FK to patients table |
| invoice_date | TEXT | Invoice date (ISO format) |
| due_date | TEXT | Due date (ISO format) |
| subtotal | REAL | Subtotal before discount/tax |
| discount_amount | REAL | Discount amount |
| discount_type | TEXT | flat/percentage |
| tax_amount | REAL | Tax/GST amount |
| total_amount | REAL | Final total (subtotal - discount + tax) |
| paid_amount | REAL | Amount received |
| balance_due | REAL | Outstanding balance |
| payment_status | TEXT | Unpaid/Partial/Paid |
| doctor_name | TEXT | Treating doctor |
| notes | TEXT | Invoice notes |
| created_at | DATETIME | Creation timestamp |

---

#### 9. invoice_items

Invoice line items.

```sql
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  treatment_id INTEGER,
  description TEXT NOT NULL,
  tooth_number TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price REAL NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| invoice_id | INTEGER | FK to invoices table |
| treatment_id | INTEGER | FK to treatments (nullable) |
| description | TEXT | Line item description |
| tooth_number | TEXT | Affected tooth (if applicable) |
| quantity | INTEGER | Quantity (default: 1) |
| unit_price | REAL | Price per unit |
| total | REAL | quantity × unit_price |

---

#### 10. payments

Payments received.

```sql
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  reference_no TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| invoice_id | INTEGER | FK to invoices table |
| patient_id | INTEGER | FK to patients table |
| payment_date | TEXT | Payment date (ISO format) |
| amount | REAL | Payment amount |
| payment_method | TEXT | UPI/QR Code/Cash/Credit Card/Bank Transfer |
| reference_no | TEXT | Transaction reference/UTR |
| notes | TEXT | Payment notes |
| created_at | DATETIME | Creation timestamp |

---

#### 11. prescriptions

Prescriptions (Rx) records.

```sql
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_name TEXT NOT NULL,
  diagnosis TEXT,
  rx_date TEXT NOT NULL,
  medicines TEXT NOT NULL,
  clinical_advice TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| patient_id | INTEGER | FK to patients table |
| doctor_name | TEXT | Prescribing doctor |
| diagnosis | TEXT | Clinical diagnosis |
| rx_date | TEXT | Prescription date (ISO format) |
| medicines | TEXT | JSON array of medicine objects |
| clinical_advice | TEXT | Post-treatment instructions |
| created_at | DATETIME | Creation timestamp |

**Medicines JSON Format:**
```json
[
  {
    "name": "Ibuprofen 400mg Tablet",
    "dosage": "400 mg",
    "frequency": "Three times daily (TDS)",
    "duration": "3 days",
    "timing": "After food",
    "instructions": "Take with full glass of water."
  }
]
```

---

#### 12. medications_master

Master medication catalog for prescription generation.

```sql
CREATE TABLE IF NOT EXISTS medications_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_dosage TEXT,
  default_frequency TEXT,
  default_duration TEXT,
  instructions TEXT
);
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| name | TEXT | Medication name & strength |
| category | TEXT | Antibiotic/NSAID/Analgesic/etc. |
| default_dosage | TEXT | Default dosage |
| default_frequency | TEXT | Default frequency (TDS, BD, OD, etc.) |
| default_duration | TEXT | Default duration |
| instructions | TEXT | Usage instructions |

---

## Seed Data

### Clinic Settings (Default)

| Field | Value |
|-------|-------|
| clinic_name | SmileCraft Super Specialty Dental Clinic |
| tagline | Advanced Multi-Specialty Dental Hospital & Implant Center |
| doctor_name | Dr. Sarah Mitchell, BDS, MDS |
| qualification | Oral & Maxillofacial Surgeon, Implantologist |
| registration_no | DENT-REG-84920 |
| phone | +91 98765 43210 |
| email | care@smilecraftdental.in |
| address | Plot 14, Health City, Sector 4, MG Road |
| currency | ₹ |
| tax_rate | 0 |
| invoice_footer | Thank you for choosing SmileCraft Dental! Wishing you a healthy, radiant smile. |

---

### Doctors (4 Seeded)

| ID | Name | Specialty | Qualification | Reg No | Consult Fee | Color |
|----|------|-----------|---------------|--------|-------------|-------|
| 1 | Dr. Sarah Mitchell | Oral & Maxillofacial Surgery, Implantology | BDS, MDS | DENT-REG-84920 | ₹500 | #0d9488 (Teal) |
| 2 | Dr. Rajesh Sharma | Endodontics & Conservative Dentistry | BDS, MDS | DENT-REG-51204 | ₹600 | #7c3aed (Purple) |
| 3 | Dr. Priya Patel | Orthodontics & Dentofacial Orthopedics | BDS, MDS | DENT-REG-63491 | ₹700 | #ea580c (Orange) |
| 4 | Dr. Amit Verma | Periodontics & Aesthetic Dental Surgery | BDS | DENT-REG-74198 | ₹400 | #2563eb (Blue) |

---

### Procedures Catalog (18 Seeded)

| ID | Code | Category | Name | Standard Fee (₹) | Assigned Doctor |
|----|------|----------|------|-------------------|-----------------|
| 1 | D0120 | Diagnostic | Comprehensive Oral Evaluation & Diagnosis | 500 | All Doctors |
| 2 | D0210 | Diagnostic | Digital Intraoral Radiograph (RVG X-Ray) | 300 | All Doctors |
| 3 | D1110 | Preventive | Ultrasonic Scaling & Polishing (Full Mouth) | 1,500 | Dr. Amit Verma |
| 4 | D1206 | Preventive | Topical Fluoride Treatment | 800 | All Doctors |
| 5 | D2391 | Restorative | Composite Aesthetic Filling (1 Surface) | 1,200 | Dr. Rajesh Sharma |
| 6 | D2392 | Restorative | Composite Aesthetic Filling (2 Surfaces) | 1,800 | Dr. Rajesh Sharma |
| 7 | D3310 | Endodontics | Root Canal Treatment (Anterior Tooth) | 3,500 | Dr. Rajesh Sharma |
| 8 | D3320 | Endodontics | Root Canal Treatment (Premolar Tooth) | 4,200 | Dr. Rajesh Sharma |
| 9 | D3330 | Endodontics | Root Canal Treatment (Molar Tooth) | 5,000 | Dr. Rajesh Sharma |
| 10 | D2740 | Prosthodontics | CAD-CAM All-Ceramic Zirconia Crown | 8,500 | Dr. Sarah Mitchell |
| 11 | D2750 | Prosthodontics | Porcelain Fused to Metal (PFM) Crown | 3,500 | Dr. Sarah Mitchell |
| 12 | D7140 | Oral Surgery | Simple Painless Tooth Extraction | 1,000 | Dr. Sarah Mitchell |
| 13 | D7210 | Oral Surgery | Surgical Extraction / Transalveolar Flap | 2,500 | Dr. Sarah Mitchell |
| 14 | D7240 | Oral Surgery | Impacted Wisdom Tooth Surgical Disimpaction | 5,500 | Dr. Sarah Mitchell |
| 15 | D6010 | Implantology | Dental Implant Fixture (Titanium Grade 5) | 28,000 | Dr. Sarah Mitchell |
| 16 | D8080 | Orthodontics | Orthodontic Braces / Clear Aligners Consultation | 1,000 | Dr. Priya Patel |
| 17 | D8090 | Orthodontics | Comprehensive Ceramic Braces / Aligners (Full Course) | 45,000 | Dr. Priya Patel |
| 18 | D9972 | Cosmetic | In-Office Laser Teeth Whitening (Bleaching) | 7,500 | Dr. Amit Verma |

---

### Medications Master (8 Seeded)

| ID | Name | Category | Default Dosage | Default Frequency | Default Duration |
|----|------|----------|----------------|-------------------|------------------|
| 1 | Amoxicillin 500mg Capsule | Antibiotic | 500 mg | TDS (3x daily) | 5 days |
| 2 | Augmentin 625mg (Amox + Clav) | Antibiotic | 625 mg | BD (2x daily) | 5 days |
| 3 | Metronidazole 400mg Tablet | Antibacterial/Anaerobic | 400 mg | TDS (3x daily) | 5 days |
| 4 | Ibuprofen 400mg Tablet | NSAID/Pain Relief | 400 mg | TDS (3x daily) | 3 days |
| 5 | Paracetamol 650mg Tablet | Analgesic | 650 mg | SOS (6-8 hrs) | 3 days |
| 6 | Ketorolac Tromethamine 10mg | Analgesic | 10 mg | BD (2x daily) | 2-3 days |
| 7 | Pantoprazole 40mg Tablet | Antacid | 40 mg | OD (1x daily) | 5 days |
| 8 | Chlorhexidine Gluconate 0.2% Oral Rinse | Antiseptic | 10-15 ml | BD (2x daily) | 14 days |

---

### Patients (3 Seeded)

| ID | Patient ID | Name | Age | Gender | Phone | Blood Group | Medical Alerts |
|----|------------|------|-----|--------|-------|-------------|----------------|
| 1 | PT-2026-001 | Eleanor Vance | 34 | Female | +91 98765 11001 | A+ | Penicillin Allergy, Mild Asthma |
| 2 | PT-2026-002 | Marcus Holloway | 48 | Male | +91 98765 22002 | O+ | Type 2 Diabetes, Hypertension |
| 3 | PT-2026-003 | Sophia Chen | 26 | Female | +91 98765 33003 | B+ | None |

---

### Sample Odontogram Records

| Patient | Tooth # | Condition | Surface | Notes |
|---------|---------|-----------|---------|-------|
| Eleanor Vance | 16 | Caries | O | Deep occlusal caries, sensitive to cold |
| Eleanor Vance | 14 | Restoration | MO | Sound composite filling placed 2024 |
| Eleanor Vance | 36 | RCT | All | Completed endodontic treatment |
| Eleanor Vance | 46 | Missing | All | Extracted 5 years ago, space maintained |
| Marcus Holloway | 36 | Implant | All | Planned Osseointegrated implant site |
| Marcus Holloway | 11 | Crown | All | Zirconia aesthetic crown |

---

### Sample Appointments (Non-Clashing)

All seed appointments are guaranteed non-clashing:

| ID | Patient | Date | Time | Duration | Chair | Doctor | Reason | Status |
|----|---------|------|------|----------|-------|--------|--------|--------|
| 1 | Eleanor Vance | Today | 10:00 | 45 min | Chair 1 | Dr. Sarah Mitchell | Implant Consultation #36 | Waiting |
| 2 | Sophia Chen | Today | 10:00 | 30 min | Chair 2 | Dr. Rajesh Sharma | Root Canal Evaluation #16 | Scheduled |
| 3 | Marcus Holloway | Today | 11:30 | 60 min | Chair 2 | Dr. Sarah Mitchell | Surgical Extraction Verification | Scheduled |
| 4 | Sophia Chen | Today | 14:00 | 30 min | Chair 1 | Dr. Priya Patel | Aligners & Orthodontic Consultation | Scheduled |

**Clash Verification:**
- Appointment 1 & 2: Same time, different chairs, different doctors → NO CLASH
- Appointment 1 & 3: Same doctor, but different times (Sarah free after 10:45) → NO CLASH
- Appointment 3 & 4: Same chair, different times → NO CLASH

---

### Sample Treatments

| ID | Patient | Procedure | Tooth | Doctor | Status | Cost | Discount | Final |
|----|---------|-----------|-------|--------|--------|------|----------|-------|
| 1 | Eleanor Vance | Ultrasonic Scaling & Polishing | Full Mouth | Dr. Amit Verma | Completed | ₹1,500 | ₹0 | ₹1,500 |
| 2 | Eleanor Vance | Root Canal Treatment (Molar) | 16 | Dr. Rajesh Sharma | In Progress | ₹5,000 | ₹500 | ₹4,500 |

---

### Sample Invoice

| Field | Value |
|-------|-------|
| Invoice Number | INV-2026-0001 |
| Patient | Eleanor Vance (PT-2026-001) |
| Date | Today |
| Subtotal | ₹6,500 |
| Discount | ₹500 (flat) |
| Tax | ₹0 |
| Total | ₹6,000 |
| Paid | ₹6,000 |
| Balance | ₹0 |
| Status | Paid |
| Payment Method | UPI / QR Code |
| Reference | UPI-REF-902482 |

**Line Items:**
1. Ultrasonic Scaling & Polishing (Full Mouth) — ₹1,500
2. Root Canal Treatment (Molar Tooth) #16 — ₹5,000

---

### Sample Prescription

| Field | Value |
|-------|-------|
| Patient | Eleanor Vance (PT-2026-001) |
| Doctor | Dr. Rajesh Sharma, BDS, MDS |
| Date | Today |
| Diagnosis | Acute Irreversible Pulpitis #16 with periapical periodontitis (Penicillin allergic) |

**Medicines:**
1. Ibuprofen 400mg Tablet — 400 mg TDS × 3 days (After food)
2. Pantoprazole 40mg Tablet — 40 mg OD × 3 days (Before breakfast)
3. Chlorhexidine Gluconate 0.2% Mouthwash — 10 ml BD × 7 days (After brushing)

**Clinical Advice:**
1. Avoid chewing hard foods on the upper right side until permanent restoration.
2. In case of sudden swelling or fever, contact the clinic emergency line immediately.
3. Return on scheduled date for canal obturation.

---

## Core Features

### 1. Dashboard

**Location:** `src/components/Dashboard.jsx`

**Features:**
- Welcome banner with clinic name and multi-doctor filter
- 4 metric cards: Today's Visits, Registered Patients, Procedures Done, Revenue Collected (all in INR ₹)
- Today's Appointment Queue with status toggles (Scheduled → Waiting → In-Treatment → Completed → Cancelled)
- Recent Clinical Treatments activity feed
- Multi-Doctor Clinical Team directory
- Medical Safety Alert Watch (highlights patients with Penicillin allergy, diabetes, hypertension)
- Quick Access Tiles (Write Rx, New Bill, Dental Chart, Treatments)

**Data Sources:**
- `getDashboardStats()` — from `api.js`
- Real-time doctor filter integration

---

### 2. Patient Directory (EHR)

**Location:** `src/components/Patients.jsx`

**Features:**
- Patient card grid with search (name, phone, ID)
- Medical Alerts Only filter toggle
- Patient cards showing: name, ID, age, gender, blood group, contact info, medical alert badges
- CRUD operations: Add, Edit, Delete patients
- Medical history multi-selector with 12 common alerts:
  - Penicillin Allergy, Sulfa Drug Allergy, NSAID/Aspirin Allergy
  - Hypertension, Type 2 Diabetes, Type 1 Diabetes
  - Bleeding Disorder, Asthma/Respiratory, Cardiac Condition/Pacemaker
  - Hepatitis B/C, Pregnancy, Epilepsy/Seizures

**Data Flow:**
- `getPatients(search)` — filtered query
- `createPatient(formData)` — with auto-generated patient_id (PT-YYYY-NNN)
- `updatePatient(id, formData)` — updates medical_history as JSON
- `deletePatient(id)` — CASCADE deletes odontogram, treatments, appointments, invoices, prescriptions

---

### 3. Patient Profile (360° EHR)

**Location:** `src/components/PatientProfile.jsx`

**Tabs:**
1. **Dental Chart (Odontogram)** — Interactive tooth chart with condition editing
2. **Treatments** — Treatment plan & log table with status management
3. **Billing & Invoices** — Patient's invoice history with print capability
4. **Prescriptions** — Patient's Rx history with print capability

**Features:**
- Patient header with blood group, alerts banner
- Quick action buttons: Book Appointment, Generate Bill, Write Rx
- Treatment planner modal with procedure catalog dropdown
- Treatment status workflow: Planned → In Progress → Completed
- Invoice list with payment status badges

---

### 4. Interactive Odontogram (Dental Chart)

**Location:** `src/components/Odontogram.jsx`

**Features:**
- Adult dentition (32 teeth, FDI notation) and Pediatric dentition (20 teeth)
- FDI ↔ Universal numbering system toggle
- Visual tooth representation with SVG (upper jaw roots-up, lower jaw roots-down)
- Color-coded conditions:
  - Healthy (emerald), Caries (rose), Restoration (sky), RCT (purple)
  - Crown (amber), Implant (teal), Missing (slate with X mark)
  - Fracture (orange), Impacted (indigo)
- Click-to-edit tooth record modal:
  - Condition selection grid
  - Surface selection (All, O, M, D, B, L, MO, DO, MOD)
  - Clinical notes textarea
  - "Plan Treatment" quick action
- Legend bar showing all condition types

**Data Flow:**
- `getPatientOdontogram(patientId)` — loads tooth conditions
- `saveToothCondition(patientId, toothNumber, condition, surface, notes)` — UPSERT with ON CONFLICT
- `handlePlanTreatmentFromTooth(toothNumber, condition)` — pre-fills treatment modal

---

### 5. Appointments & Chair Schedule

**Location:** `src/components/Appointments.jsx`

**Features:**
- Date navigation: Today, Tomorrow, All Dates, custom date picker
- Doctor filter (All Doctors or specific doctor)
- Chair filter (All, Chair 1, Chair 2, Surgery Room)
- View mode: List view / Chair-grid view
- Time-slot booking modal with:
  - Patient selection
  - Date, time, duration, chair, doctor selection
  - Real-time slot availability map (green=available, red=clash)
  - Clash error display with specific conflict message
- Appointment list with status dropdowns
- Clash prevention algorithm:
  - **Doctor Clash:** Same doctor cannot have overlapping appointments
  - **Chair Clash:** Same chair cannot be booked for two doctors simultaneously

**Time Slots (30-min intervals):**
09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30

**Clash Detection Algorithm:**
```javascript
// From api.js
export function intervalsOverlap(start1, dur1, start2, dur2) {
  const s1 = timeToMinutes(start1);
  const e1 = s1 + Number(dur1 || 30);
  const s2 = timeToMinutes(start2);
  const e2 = s2 + Number(dur2 || 30);
  return Math.max(s1, s2) < Math.min(e1, e2);
}
```

---

### 6. Treatments & Procedure Price List

**Location:** `src/components/Treatments.jsx`

**Features:**
- Category-grouped procedure catalog display
- Doctor assignment column (shows which doctor performs each procedure)
- Standard fee in INR (₹)
- Procedure code (CDT/ADA codes)
- Create new procedure modal
- Delete procedure (soft delete via is_active flag)
- Doctor filter to show procedures available to specific doctors

**Categories:**
- Diagnostic, Preventive, Restorative, Endodontics, Prosthodontics, Oral Surgery, Implantology, Orthodontics, Cosmetic

---

### 7. Billing, Invoicing & Payments

**Location:** `src/components/Billing.jsx`

**Features:**
- Invoice ledger with search (invoice number, patient name, doctor)
- Doctor filter
- Create Invoice modal:
  - Patient selection with patient_id display
  - Doctor selection
  - Date and due date
  - Line items with procedure catalog fast-pick dropdown
  - Manual description, tooth number, quantity, unit price, total
  - Add/remove line items
  - Financial summary: Subtotal, Discount, Tax/GST, Grand Total
  - Initial payment collection with method selection (UPI/QR, Cash, Card, Bank Transfer, Insurance)
- Invoice list table:
  - Invoice #, Date, Patient, Doctor, Total, Paid, Balance, Status, Actions
  - "Collect Due" button for unpaid/partial invoices
  - "Print" button for printable invoice
- Record Payment modal:
  - Shows patient name and outstanding balance
  - Payment amount, method, reference/UTR, notes
- Official Printable Invoice modal (A4 format):
  - Clinic letterhead with doctor info
  - TAX INVOICE header with invoice number
  - Patient demographics section
  - Line items table
  - Financial calculation summary
  - Doctor signature block
  - Print/Save PDF button

**Payment Status Logic:**
```javascript
const paymentStatus = balanceDue === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid');
```

---

### 8. Prescriptions (Rx) Generator

**Location:** `src/components/Prescriptions.jsx`

**Features:**
- Prescription records list with search
- Doctor filter
- Write New Rx modal:
  - Patient selection (with allergy warning bar if patient has alerts)
  - Doctor selection
  - Clinical diagnosis input
  - Medications rows:
    - Drug quick-pick from medications_master catalog
    - Manual name entry
    - Dosage, frequency, duration fields
    - Instructions textarea
    - Add/remove medicine rows
  - Clinical advice textarea
- Drug Allergy Cross-Referencing:
  - Displays patient's medical history alerts
  - Shows specific drug allergies
  - Rose-colored warning bar when patient has allergies
- Printable Rx Slip modal (A4 format):
  - Rx header with date and doctor
  - Patient info
  - Diagnosis
  - Medicine list with dosage, frequency, duration
  - Clinical advice section
  - Print/Save PDF button

**Patient Allergy Warning:**
The prescription form checks the selected patient's `medical_history` JSON array and displays any conditions that affect medication choices (Penicillin Allergy, etc.) before the doctor writes the prescription.

---

### 9. Settings & Database Management

**Location:** `src/components/Settings.jsx`

**Features:**
- **Embedded Database Status Card:**
  - SQLite engine status (Active & Healthy)
  - Database architecture info (SQLite3 WAL Mode + Foreign Keys)
  - Database file size
  - Portability mode info
  - File path display
  - Export Backup (.db) button
  - Restore (.db) button with confirmation dialog

- **Multi-Doctor Team Management:**
  - List of all doctors with color indicator, specialty, qualification, reg no, consult fee, phone
  - Add Doctor modal (name, specialty, qualification, reg no, consult fee, phone, email, color)
  - Edit Doctor modal
  - Delete Doctor (removes from active list)

- **Clinic Profile & Official Letterhead:**
  - Clinic name (required)
  - Tagline
  - Medical director/head doctor (required)
  - Qualifications & specialties
  - Registration/license number
  - Clinic phone
  - Email address
  - Currency symbol (default: ₹)
  - Physical address
  - Invoice footer note
  - Save Clinic Settings button

---

### 10. Header & Sidebar Navigation

**Header** (`src/components/Header.jsx`):
- Page title and subtitle display
- Current date display
- Quick DB Backup button with success feedback
- Book Appointment button (context-aware)
- + New Patient button (teal-themed primary action)

**Sidebar** (`src/components/Sidebar.jsx`):
- Brand header with clinic name and "Dental Clinical OS" tag
- 7 navigation items: Dashboard, Patients (EHR), Appointments, Treatments & Catalog, Billing & Invoices, Prescriptions (Rx), Clinic Settings & DB
- Embedded DB status pill (Active/Healthy indicator)
- Doctor info footer (shows medical director name and registration number)

---

## API Service Layer

**Location:** `src/services/api.js`

### Architecture

The API service provides a unified interface that automatically routes to:
1. **Electron IPC bridge** when running in desktop mode (`window.electronAPI.isElectron === true`)
2. **Web Fallback Storage** (localStorage-based) when running in browser preview mode

### Helper Functions

```javascript
// Time conversion helpers
timeToMinutes(timeStr)  // "HH:MM" → minutes from midnight
minutesToTime(totalMins) // minutes → "HH:MM"
intervalsOverlap(start1, dur1, start2, dur2) // checks time overlap
```

### WebFallbackStorage Class

In-browser fallback that simulates the database using localStorage:

- Key: `dentcare_pro_web_db_v2`
- Initializes with full seed data on first access
- Provides `getData()` and `setData()` methods
- All CRUD operations work identically to Electron mode

### API Categories

#### Clinic Settings
- `getClinicSettings()` — Returns clinic_settings row or fallback object
- `updateClinicSettings(settings)` — Updates all clinic fields

#### Doctors
- `getDoctors()` — Returns active doctors list
- `createDoctor(doc)` — Inserts new doctor
- `updateDoctor(id, doc)` — Updates doctor fields
- `deleteDoctor(id)` — Sets is_active = 0 (soft delete)

#### Patients
- `getPatients(search)` — Returns patients with optional search filter
- `getPatientById(id)` — Returns single patient by ID
- `createPatient(patient)` — Creates patient with auto-generated patient_id
- `updatePatient(id, patient)` — Updates patient fields
- `deletePatient(id)` — Deletes patient (CASCADE)

#### Odontogram
- `getPatientOdontogram(patientId)` — Returns tooth conditions for patient
- `saveToothCondition(patientId, toothNumber, condition, surface, notes)` — UPSERT tooth record

#### Procedures Catalog
- `getProceduresCatalog(doctorFilter)` — Returns procedures with optional doctor filter
- `createProcedure(proc)` — Creates new procedure
- `deleteProcedure(id)` — Soft deletes procedure

#### Treatments
- `getPatientTreatments(patientId)` — Returns treatments for patient
- `createTreatment(treatment)` — Creates treatment with final_amount calculation
- `updateTreatmentStatus(id, status)` — Updates status and completed_at
- `deleteTreatment(id)` — Deletes treatment

#### Appointments
- `getAppointments(date, doctorName)` — Returns appointments with optional filters
- `checkAppointmentConflict(appt, excludeId)` — Returns conflict info or {hasConflict: false}
- `createAppointment(appt)` — Creates appointment after clash validation
- `updateAppointmentStatus(id, status)` — Updates appointment status
- `deleteAppointment(id)` — Deletes appointment

#### Invoices & Billing
- `getInvoices(patientId, doctorName)` — Returns invoices with optional filters
- `createInvoice(invoiceData)` — Creates invoice with line items and optional payment
- `recordPayment(invoiceId, amount, paymentMethod, referenceNo, notes)` — Adds payment and updates invoice

#### Prescriptions
- `getPatientPrescriptions(patientId)` — Returns prescriptions with optional patient filter
- `createPrescription(rx)` — Creates prescription with JSON.stringify medicines
- `deletePrescription(id)` — Deletes prescription
- `getMedicationsCatalog()` — Returns medications_master list

#### Dashboard Analytics
- `getDashboardStats(doctorFilter)` — Returns: totalPatients, todayAppointments, completedTreatments, totalRevenue, pendingDues, recentTreatments

#### System & Print
- `getDatabaseInfo()` — Returns DB path, size, mode, status
- `backupDatabase()` — Triggers backup dialog (Electron) or JSON download (web)
- `restoreDatabase()` — Triggers restore dialog (Electron) or alert (web)
- `triggerPrint()` — Calls Electron print or window.print()

### Electron IPC Wrapper Functions

```javascript
export async function executeQuery(sql, params = []) {
  if (isElectron) {
    return await window.electronAPI.queryAll(sql, params);
  }
  return [];
}

export async function executeGet(sql, params = []) {
  if (isElectron) {
    return await window.electronAPI.queryGet(sql, params);
  }
  return null;
}

export async function executeRun(sql, params = []) {
  if (isElectron) {
    return await window.electronAPI.execute(sql, params);
  }
  return { changes: 1, lastInsertRowid: Date.now() };
}
```

---

## IPC Communication

### Preload Script (`electron/preload.js`)

Exposes `window.electronAPI` to the renderer process via `contextBridge`:

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  // Database Queries
  queryAll: (sql, params) => ipcRenderer.invoke('db:queryAll', sql, params),
  queryGet: (sql, params) => ipcRenderer.invoke('db:queryGet', sql, params),
  execute: (sql, params) => ipcRenderer.invoke('db:execute', sql, params),

  // Database Management
  getDbInfo: () => ipcRenderer.invoke('db:getInfo'),
  backupDatabase: () => ipcRenderer.invoke('db:backup'),
  restoreDatabase: () => ipcRenderer.invoke('db:restore'),

  // Printing & Native Features
  printWindow: () => ipcRenderer.invoke('app:print'),

  // App Info
  isElectron: true,
  platform: process.platform,
});
```

### Main Process IPC Handlers (`electron/main.js`)

| Channel | Method | Description |
|---------|--------|-------------|
| `db:queryAll` | `ipcMain.handle` | Executes SQL and returns all rows |
| `db:queryGet` | `ipcMain.handle` | Executes SQL and returns first row |
| `db:execute` | `ipcMain.handle` | Executes SQL (INSERT/UPDATE/DELETE) |
| `db:getInfo` | `ipcMain.handle` | Returns DB path, size, status |
| `db:backup` | `ipcMain.handle` | Shows save dialog, copies DB file |
| `db:restore` | `ipcMain.handle` | Shows open dialog, restores DB from backup |
| `app:print` | `ipcMain.handle` | Triggers native print dialog |

### Database Query Methods (`electron/db.js`)

```javascript
// Prepare and execute SQL with parameter sanitization
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...sanitizeParams(params));
}

function queryGet(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...sanitizeParams(params));
}

function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...sanitizeParams(params));
}
```

### Parameter Sanitization

```javascript
function sanitizeParams(params) {
  if (!params) return [];
  if (Array.isArray(params)) {
    return params.map(p => (p === undefined ? null : p));
  }
  return params;
}
```

Converts `undefined` values to `null` for SQLite compatibility.

---

## Build & Packaging

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start Vite dev server (hot reload) at http://localhost:5173 |
| `build` | `vite build` | Build production frontend to `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `start` | `node server.js` | Start production web server on port 10000 |
| `electron` | `electron .` | Run Electron with production build |
| `electron:dev` | `concurrently -k "vite" "wait-on tcp:5173 && electron . --dev"` | Run Electron with dev server |
| `build:exe` | `vite build && electron-builder --win nsis --x64` | Build NSIS installer |
| `build:portable` | `vite build && electron-builder --win portable --x64` | Build portable .exe |
| `dist` | `vite build && electron-builder --win --x64` | Build both installer and portable |

### Electron Builder Configuration (`package.json`)

```json
{
  "build": {
    "appId": "com.dentcare.clinicmanage",
    "productName": "DentCare Pro",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "DentCare Pro"
    },
    "portable": {
      "artifactName": "DentCare-Pro-Portable.exe"
    }
  }
}
```

### Output Artifacts

- **NSIS Installer:** `release/DentCare Pro Setup.exe` — Standard Windows installer with shortcut creation
- **Portable Executable:** `release/DentCare-Pro-Portable.exe` — Single file, no installation, runs from USB

---

## Deployment

### Production Web Server (`server.js`)

A Node.js HTTP server for hosting the built frontend:

- **Port:** 10000 (configurable via `PORT` env variable)
- **Auto-build:** Triggers `npm run build` if `dist/` doesn't exist
- **MIME types:** Proper content-type headers for all file types
- **SPA fallback:** Routes all non-file requests to `index.html`
- **Cache control:** HTML no-cache, static assets 1-year cache

### Render.com Deployment (`render.yaml`)

```yaml
services:
  - type: web
    name: clinic-manager
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node server.js
```

Deploys to Render's free tier web service.

### Database Storage Locations

| Mode | Path |
|------|------|
| **Standard** | `%APPDATA%\dentcare-pro\dental_clinic.db` |
| **Portable USB** | `data/dental_clinic.db` (when `data/` folder exists next to executable) |

### Portable Mode Detection

```javascript
function getDatabasePath(app) {
  const portableDir = path.join(process.cwd(), 'data');
  if (fs.existsSync(portableDir)) {
    return path.join(portableDir, 'dental_clinic.db');
  }
  const userDataDir = app.getPath('userData');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, 'dental_clinic.db');
}
```

---

## Development Guide

### Prerequisites

- Node.js (version compatible with Electron 44)
- npm or bun package manager

### Quick Start

```bash
# Install dependencies
npm install

# Development mode (browser preview with hot reload)
npm run dev
# Open http://localhost:5173

# Electron development mode
npm run electron:dev

# Production build
npm run build

# Run production app
npm start

# Build Windows installer
npm run build:exe

# Build portable executable
npm run build:portable
```

### Development Workflow

1. **Frontend Development:** Use `npm run dev` for hot-reload browser preview
2. **Electron Testing:** Use `npm run electron:dev` to test in native window
3. **Production Testing:** Use `npm run build && npm start` to test the server mode
4. **Packaging:** Use `npm run build:exe` or `npm run build:portable` for distribution

### Database Reset

To reset the database to seed state:
1. Close the application
2. Delete `%APPDATA%\dentcare-pro\dental_clinic.db` (or portable `data/dental_clinic.db`)
3. Restart the application — seed data will be recreated

### Adding New Features

1. **Database changes:** Add tables/columns in `electron/db.js` `createTables()` and update seed data in `seedInitialData()`
2. **API changes:** Add functions in `src/services/api.js` following the existing pattern
3. **Component changes:** Add or modify components in `src/components/`
4. **State management:** Update `src/App.jsx` to wire new data and handlers

### Code Conventions

- **React 19:** Uses functional components with hooks (useState, useEffect, useMemo)
- **Tailwind CSS 4:** Uses `@import "tailwindcss"` and `@layer base` for custom styles
- **Lucide React:** Icons imported from `lucide-react`
- **Classnames:** Direct Tailwind classes in JSX; `clsx` available for conditional classes
- **Currency:** All monetary values in INR (₹) with the `currency` prop from clinic settings

### Print Styles

Custom print CSS is defined in `src/index.css`:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
  }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .print-container {
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
```

---

## Security Considerations

### Electron Security Configuration

```javascript
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: false,        // Node.js not exposed to renderer
    contextIsolation: true,        // Isolated context
    sandbox: false,                // Disabled for SQLite access
  },
});
```

### Context Isolation

The preload script uses `contextBridge` to expose only specific APIs to the renderer, preventing direct Node.js access.

### SQL Injection Prevention

All database queries use parameterized statements:
```javascript
db.prepare(sql).all(...sanitizeParams(params));
```

### Directory Traversal Prevention

The production server validates file paths:
```javascript
if (!filePath.startsWith(DIST_DIR)) {
  res.writeHead(403, { 'Content-Type': 'text/plain' });
  res.end('403 Forbidden');
  return;
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database not initializing | Check if `%APPDATA%\dentcare-pro\` has write permissions |
| Backup fails | Ensure the target directory is writable |
| Restore fails | The backup file may be corrupted; use a known good backup |
| Electron won't start | Check if the `dist/` folder exists from a previous `npm run build` |
| Web preview shows old data | Clear browser localStorage (`dentcare_pro_web_db_v2`) |

### Log Locations

- **Electron:** Developer Console (Ctrl+Shift+I → Console tab)
- **Web Server:** Terminal output from `node server.js`

---

## Appendix: FDI Tooth Numbering Reference

### Permanent Dentition (Adult, 32 teeth)

```
Upper Right (Q1):  18 17 16 15 14 13 12 11
                    |  |  |  |  |  |  |  |
Midline            ←  |  |  |  |  |  |  →  Upper Left (Q2)
                                       21 22 23 24 25 26 27 28

Lower Right (Q4):  48 47 46 45 44 43 42 41
                    |  |  |  |  |  |  |  |
Midline            ←  |  |  |  |  |  |  →  Lower Left (Q3)
                                       31 32 33 34 35 36 37 38
```

### Deciduous Dentition (Pediatric, 20 teeth)

```
Upper Right:  55 54 53 52 51
Upper Left:   61 62 63 64 65
Lower Left:   71 72 73 74 75
Lower Right:  85 84 83 82 81
```

### FDI to Universal Mapping (Adult)

| FDI | Universal | | FDI | Universal | | FDI | Universal |
|-----|-----------|-|-----|-----------|-|-----|-----------|
| 18  | 1         | | 28  | 16        | | 38  | 17        |
| 17  | 2         | | 27  | 15        | | 37  | 18        |
| 16  | 3         | | 26  | 14        | | 36  | 19        |
| 15  | 4         | | 25  | 13        | | 35  | 20        |
| 14  | 5         | | 24  | 12        | | 34  | 21        |
| 13  | 6         | | 23  | 11        | | 33  | 22        |
| 12  | 7         | | 22  | 10        | | 32  | 23        |
| 11  | 8         | | 21  | 9         | | 31  | 24        |
|     |           | |     |           | | 41  | 25        |
|     |           | |     |           | | 42  | 26        |
|     |           | |     |           | | 43  | 27        |
|     |           | |     |           | | 44  | 28        |
|     |           | |     |           | | 45  | 29        |
|     |           | |     |           | | 46  | 30        |
|     |           | |     |           | | 47  | 31        |
|     |           | |     |           | | 48  | 32        |

---

*Documentation generated for DentCare Pro v1.0.0*
