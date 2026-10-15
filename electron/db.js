const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

let db = null;
let dbPath = '';

function getDatabasePath(app) {
  // Check for portable mode (if 'data' folder exists in current execution directory)
  const portableDir = path.join(process.cwd(), 'data');
  if (fs.existsSync(portableDir)) {
    return path.join(portableDir, 'dental_clinic.db');
  }

  // Otherwise, use standard user application data directory
  const userDataDir = app.getPath('userData');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, 'dental_clinic.db');
}

function initDatabase(app) {
  dbPath = getDatabasePath(app);
  console.log('Connecting to self-contained SQLite database at:', dbPath);

  db = new DatabaseSync(dbPath);
  
  // Enable foreign keys and WAL mode for high performance & reliability
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  createTables();
  seedInitialData();

  return db;
}

function createTables() {
  const schema = `
    -- Clinic Settings (Singleton)
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

    -- Doctors Master (Multi-Doctor Practice Support)
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

    -- Patients Master
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

    -- Odontogram (Dental Chart per Patient)
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

    -- Dental Procedures Catalog Master (with Doctor customization)
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

    -- Patient Treatments Record
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

    -- Appointments (with Doctor allocation and chair slot reservation)
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

    -- Invoices
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

    -- Invoice Line Items
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

    -- Payments Received
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

    -- Prescriptions
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

    -- Medications Master
    CREATE TABLE IF NOT EXISTS medications_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      default_dosage TEXT,
      default_frequency TEXT,
      default_duration TEXT,
      instructions TEXT
    );
  `;

  db.exec(schema);
}

function seedInitialData() {
  // Seed Clinic Settings if not present
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM clinic_settings').get();
  if (checkSettings.count === 0) {
    const insertSettings = db.prepare(`
      INSERT INTO clinic_settings (
        id, clinic_name, tagline, doctor_name, qualification, 
        registration_no, phone, email, address, currency, tax_rate, invoice_footer
      ) VALUES (
        1,
        'SmileCraft Super Specialty Dental Clinic',
        'Advanced Multi-Specialty Dental Hospital & Implant Center',
        'Dr. Sarah Mitchell, BDS, MDS',
        'Oral & Maxillofacial Surgeon, Implantologist',
        'DENT-REG-84920',
        '+91 98765 43210',
        'care@smilecraftdental.in',
        'Plot 14, Health City, Sector 4, MG Road',
        '₹',
        0,
        'Thank you for choosing SmileCraft Dental! Wishing you a healthy, radiant smile.'
      )
    `);
    insertSettings.run();
  }

  // Seed Multi-Specialty Doctors
  const checkDoctors = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
  if (checkDoctors.count === 0) {
    const defaultDoctors = [
      {
        name: 'Dr. Sarah Mitchell',
        specialty: 'Oral & Maxillofacial Surgery, Implantology',
        qualification: 'BDS, MDS',
        registration_no: 'DENT-REG-84920',
        phone: '+91 98765 43210',
        email: 'dr.sarah@smilecraftdental.in',
        color: '#0d9488',
        consultation_fee: 500
      },
      {
        name: 'Dr. Rajesh Sharma',
        specialty: 'Endodontics & Conservative Dentistry',
        qualification: 'BDS, MDS',
        registration_no: 'DENT-REG-51204',
        phone: '+91 98111 22334',
        email: 'dr.rajesh@smilecraftdental.in',
        color: '#7c3aed',
        consultation_fee: 600
      },
      {
        name: 'Dr. Priya Patel',
        specialty: 'Orthodontics & Dentofacial Orthopedics',
        qualification: 'BDS, MDS',
        registration_no: 'DENT-REG-63491',
        phone: '+91 98222 33445',
        email: 'dr.priya@smilecraftdental.in',
        color: '#ea580c',
        consultation_fee: 700
      },
      {
        name: 'Dr. Amit Verma',
        specialty: 'Periodontics & Aesthetic Dental Surgery',
        qualification: 'BDS',
        registration_no: 'DENT-REG-74198',
        phone: '+91 98333 44556',
        email: 'dr.amit@smilecraftdental.in',
        color: '#2563eb',
        consultation_fee: 400
      }
    ];

    const insertDoc = db.prepare(`
      INSERT INTO doctors (name, specialty, qualification, registration_no, phone, email, color, consultation_fee, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const d of defaultDoctors) {
      insertDoc.run(d.name, d.specialty, d.qualification, d.registration_no, d.phone, d.email, d.color, d.consultation_fee);
    }
  }

  // Seed Procedures Catalog if empty (with INR ₹ pricing and doctor affiliation)
  const checkProcedures = db.prepare('SELECT COUNT(*) as count FROM procedures_catalog').get();
  if (checkProcedures.count === 0) {
    const defaultProcedures = [
      { code: 'D0120', category: 'Diagnostic', name: 'Comprehensive Oral Evaluation & Diagnosis', fee: 500, desc: 'Full mouth clinical charting & diagnostic examination', doctor: 'All Doctors' },
      { code: 'D0210', category: 'Diagnostic', name: 'Digital Intraoral Radiograph (RVG X-Ray)', fee: 300, desc: 'High-resolution digital periapical X-ray', doctor: 'All Doctors' },
      { code: 'D1110', category: 'Preventive', name: 'Ultrasonic Scaling & Polishing (Full Mouth)', fee: 1500, desc: 'Deep calculus removal & stain cleanup', doctor: 'Dr. Amit Verma' },
      { code: 'D1206', category: 'Preventive', name: 'Topical Fluoride Treatment', fee: 800, desc: 'Enamel remineralization & cavity prevention', doctor: 'All Doctors' },
      { code: 'D2391', category: 'Restorative', name: 'Composite Aesthetic Filling (1 Surface)', fee: 1200, desc: 'Tooth-colored posterior/anterior composite filling', doctor: 'Dr. Rajesh Sharma' },
      { code: 'D2392', category: 'Restorative', name: 'Composite Aesthetic Filling (2 Surfaces)', fee: 1800, desc: 'Multi-surface aesthetic composite restoration', doctor: 'Dr. Rajesh Sharma' },
      { code: 'D3310', category: 'Endodontics', name: 'Root Canal Treatment (Anterior Tooth)', fee: 3500, desc: 'Single rooted incisor/canine endodontics', doctor: 'Dr. Rajesh Sharma' },
      { code: 'D3320', category: 'Endodontics', name: 'Root Canal Treatment (Premolar Tooth)', fee: 4200, desc: 'Premolar rotary biomechanical preparation & obturation', doctor: 'Dr. Rajesh Sharma' },
      { code: 'D3330', category: 'Endodontics', name: 'Root Canal Treatment (Molar Tooth)', fee: 5000, desc: 'Multi-canal rotary RCT & warm vertical obturation', doctor: 'Dr. Rajesh Sharma' },
      { code: 'D2740', category: 'Prosthodontics', name: 'CAD-CAM All-Ceramic Zirconia Crown', fee: 8500, desc: 'Monolithic high-translucency aesthetic crown with 10-yr warranty', doctor: 'Dr. Sarah Mitchell' },
      { code: 'D2750', category: 'Prosthodontics', name: 'Porcelain Fused to Metal (PFM) Crown', fee: 3500, desc: 'Durable metal ceramic crown', doctor: 'Dr. Sarah Mitchell' },
      { code: 'D7140', category: 'Oral Surgery', name: 'Simple Painless Tooth Extraction', fee: 1000, desc: 'Elevation & non-traumatic dental extraction', doctor: 'Dr. Sarah Mitchell' },
      { code: 'D7210', category: 'Oral Surgery', name: 'Surgical Extraction / Transalveolar Flap', fee: 2500, desc: 'Bone removal, sectioning, and sutures', doctor: 'Dr. Sarah Mitchell' },
      { code: 'D7240', category: 'Oral Surgery', name: 'Impacted Wisdom Tooth Surgical Disimpaction', fee: 5500, desc: 'Full surgical impaction removal under local anesthesia', doctor: 'Dr. Sarah Mitchell' },
      { code: 'D6010', category: 'Implantology', name: 'Dental Implant Fixture (Titanium Grade 5)', fee: 28000, desc: 'Osseointegrated premium dental implant fixture', doctor: 'Dr. Sarah Mitchell' },
      { code: 'D8080', category: 'Orthodontics', name: 'Orthodontic Braces / Clear Aligners Consultation', fee: 1000, desc: 'Cephalometric diagnosis & aligner digital treatment plan', doctor: 'Dr. Priya Patel' },
      { code: 'D8090', category: 'Orthodontics', name: 'Comprehensive Ceramic Braces / Aligners (Full Course)', fee: 45000, desc: 'Full orthodontic treatment with monthly adjustments', doctor: 'Dr. Priya Patel' },
      { code: 'D9972', category: 'Cosmetic', name: 'In-Office Laser Teeth Whitening (Bleaching)', fee: 7500, desc: 'Professional peroxide activation with laser enhancement', doctor: 'Dr. Amit Verma' }
    ];

    const insertProcedure = db.prepare(`
      INSERT INTO procedures_catalog (code, category, name, standard_fee, description, doctor_name, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    for (const p of defaultProcedures) {
      insertProcedure.run(p.code, p.category, p.name, p.fee, p.desc, p.doctor || 'All Doctors');
    }
  }

  // Seed Medications Master if empty
  const checkMeds = db.prepare('SELECT COUNT(*) as count FROM medications_master').get();
  if (checkMeds.count === 0) {
    const defaultMeds = [
      { name: 'Amoxicillin 500mg Capsule', category: 'Antibiotic', dosage: '500 mg', frequency: 'Three times daily (TDS)', duration: '5 days', instructions: 'Take after meals. Complete full course.' },
      { name: 'Augmentin 625mg (Amox + Clav)', category: 'Antibiotic', dosage: '625 mg', frequency: 'Twice daily (BD)', duration: '5 days', instructions: 'Take with start of a meal to prevent GI upset.' },
      { name: 'Metronidazole 400mg Tablet', category: 'Antibacterial / Anaerobic', dosage: '400 mg', frequency: 'Three times daily (TDS)', duration: '5 days', instructions: 'Strictly avoid alcohol during therapy.' },
      { name: 'Ibuprofen 400mg Tablet', category: 'NSAID / Analgesic', dosage: '400 mg', frequency: 'Three times daily (TDS)', duration: '3 days', instructions: 'Take after food. Drink plenty of water.' },
      { name: 'Paracetamol 650mg Tablet', category: 'Analgesic / Antipyretic', dosage: '650 mg', frequency: 'As needed (SOS / 6-8 hrs)', duration: '3 days', instructions: 'Max 4g per 24 hours.' },
      { name: 'Ketorolac Tromethamine 10mg (Ketorol-DT)', category: 'Strong Dental Analgesic', dosage: '10 mg', frequency: 'Twice daily (BD)', duration: '2-3 days', instructions: 'Disperse tablet in half glass water. For acute pain.' },
      { name: 'Aceclofenac 100mg + Paracetamol 325mg', category: 'Combination Analgesic', dosage: '1 tablet', frequency: 'Twice daily (BD)', duration: '3-5 days', instructions: 'Take strictly after food.' },
      { name: 'Pantoprazole 40mg Tablet', category: 'Antacid / PPI', dosage: '40 mg', frequency: 'Once daily (OD)', duration: '5 days', instructions: 'Take in the morning 30 minutes before breakfast.' },
      { name: 'Chlorhexidine Gluconate 0.2% Mouthwash', category: 'Antiseptic Rinse', dosage: '10-15 ml', frequency: 'Twice daily (BD)', duration: '14 days', instructions: 'Swish for 60 seconds and spit. Do not swallow or eat for 30 mins.' },
      { name: 'Kenalog in Orabase (Triamcinolone 0.1%)', category: 'Oral Paste', dosage: 'Pea-sized dab', frequency: 'At bedtime (HS)', duration: '5 days', instructions: 'Dab gently on ulcerated mucosa. Do not rub.' }
    ];

    const insertMed = db.prepare(`
      INSERT INTO medications_master (name, category, default_dosage, default_frequency, default_duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const m of defaultMeds) {
      insertMed.run(
        m.name, 
        m.category, 
        m.dosage || '', 
        m.frequency || '', 
        m.duration || '', 
        m.instructions || ''
      );
    }
  }

  // Seed sample patients if none exist
  const checkPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  if (checkPatients.count === 0) {
    const insertPatient = db.prepare(`
      INSERT INTO patients (
        patient_id, full_name, age, gender, phone, email, address, 
        emergency_contact, blood_group, medical_history, allergies, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPatient.run(
      'PT-2026-001', 'Eleanor Vance', 34, 'Female', '+91 98765 11001', 
      'eleanor.vance@example.com', '42 Willow Creek Rd, Green Park', 
      'David Vance (Spouse) - 98765 11002', 'A+',
      JSON.stringify(['Penicillin Allergy', 'Mild Asthma']),
      'Penicillin (Anaphylaxis risk) - Use Clindamycin or Macrolides',
      'Regular patient. Complaining of sensitivity on upper right molar.'
    );

    insertPatient.run(
      'PT-2026-002', 'Marcus Holloway', 48, 'Male', '+91 98765 22002', 
      'marcus.h@example.com', '128 Pinecrest Blvd, Sector 15', 
      'Sarah Holloway - 98765 22003', 'O+',
      JSON.stringify(['Type 2 Diabetes', 'Hypertension']),
      'None reported',
      'BP monitored before procedures. Planning lower left molar implant.'
    );

    insertPatient.run(
      'PT-2026-003', 'Sophia Chen', 26, 'Female', '+91 98765 33003', 
      'sophia.c@example.com', '89 Maple Court, Apt 3B', 
      'Wei Chen (Father) - 98765 33004', 'B+',
      JSON.stringify([]),
      'None',
      'Interested in clear aligner orthodontic evaluation and scaling.'
    );

    // Seed sample odontogram teeth for Eleanor (PT-2026-001)
    const insertTooth = db.prepare(`
      INSERT OR REPLACE INTO odontogram (patient_id, tooth_number, condition, surface, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertTooth.run(1, 16, 'Caries', 'O', 'Deep occlusal caries, sensitive to cold');
    insertTooth.run(1, 14, 'Restoration', 'MO', 'Sound composite filling placed 2024');
    insertTooth.run(1, 36, 'RCT', 'All', 'Completed endodontic treatment');
    insertTooth.run(1, 46, 'Missing', 'All', 'Extracted 5 years ago, space maintained');
    insertTooth.run(2, 36, 'Implant', 'All', 'Planned Osseointegrated implant site');
    insertTooth.run(2, 11, 'Crown', 'All', 'Zirconia aesthetic crown');

    // Seed sample non-clashing appointments
    const today = new Date().toISOString().split('T')[0];
    const insertAppt = db.prepare(`
      INSERT INTO appointments (patient_id, appointment_date, appointment_time, duration_minutes, chair_number, doctor_id, doctor_name, reason, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Appointment 1: 10:00 - 10:45 on Chair 1 with Dr. Sarah Mitchell
    insertAppt.run(1, today, '10:00', 45, 'Chair 1', 1, 'Dr. Sarah Mitchell', 'Implant Consultation #36', 'Waiting', 'Patient arrived in lobby');
    
    // Appointment 2: 10:00 - 10:30 on Chair 2 with Dr. Rajesh Sharma (DIFFERENT DOCTOR & DIFFERENT CHAIR - NO CLASH!)
    insertAppt.run(3, today, '10:00', 30, 'Chair 2', 2, 'Dr. Rajesh Sharma', 'Root Canal Evaluation #16', 'Scheduled', 'First visit for RCT');
    
    // Appointment 3: 11:30 - 12:30 on Chair 2 with Dr. Sarah Mitchell (Doctor is now free after Appt 1 - NO CLASH!)
    insertAppt.run(2, today, '11:30', 60, 'Chair 2', 1, 'Dr. Sarah Mitchell', 'Surgical Extraction Verification', 'Scheduled', 'Check BP first');

    // Seed sample treatment
    const insertTreatment = db.prepare(`
      INSERT INTO treatments (patient_id, procedure_id, procedure_name, tooth_number, doctor_name, status, cost, discount, final_amount, doctor_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTreatment.run(1, 3, 'Ultrasonic Scaling & Polishing (Full Mouth)', 'Full Mouth', 'Dr. Amit Verma', 'Completed', 1500, 0, 1500, 'Supragingival scaling completed smoothly.');
    insertTreatment.run(1, 9, 'Root Canal Treatment (Molar Tooth)', '16', 'Dr. Rajesh Sharma', 'In Progress', 5000, 500, 4500, 'Access opening done. Canal extirpation completed.');

    // Seed sample invoice (in ₹)
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (
        invoice_number, patient_id, invoice_date, due_date, subtotal, discount_amount, 
        discount_type, tax_amount, total_amount, paid_amount, balance_due, payment_status, doctor_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertInvoice.run(
      'INV-2026-0001', 1, today, today, 6500, 500, 'flat', 0, 6000, 6000, 0, 'Paid', 'Dr. Rajesh Sharma', 'Paid in full via UPI / Card'
    );

    const insertInvItem = db.prepare(`
      INSERT INTO invoice_items (invoice_id, treatment_id, description, tooth_number, quantity, unit_price, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertInvItem.run(1, 1, 'Ultrasonic Scaling & Polishing (Full Mouth)', 'Full Mouth', 1, 1500, 1500);
    insertInvItem.run(1, 2, 'Root Canal Treatment (Molar Tooth)', '16', 1, 5000, 5000);

    const insertPayment = db.prepare(`
      INSERT INTO payments (invoice_id, patient_id, payment_date, amount, payment_method, reference_no, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertPayment.run(1, 1, today, 6000, 'UPI / QR Code', 'UPI-REF-902482', 'Receipt handed to patient');

    // Seed sample prescription
    const insertRx = db.prepare(`
      INSERT INTO prescriptions (patient_id, doctor_name, diagnosis, rx_date, medicines, clinical_advice)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertRx.run(
      1,
      'Dr. Rajesh Sharma, BDS, MDS',
      'Acute Irreversible Pulpitis #16 with periapical periodontitis (Penicillin allergic)',
      today,
      JSON.stringify([
        {
          name: 'Ibuprofen 400mg Tablet',
          dosage: '400 mg',
          frequency: 'Three times daily (TDS)',
          duration: '3 days',
          timing: 'After food',
          instructions: 'Take with full glass of water. Discontinue if gastric irritation.'
        },
        {
          name: 'Pantoprazole 40mg Tablet',
          dosage: '40 mg',
          frequency: 'Once daily (OD)',
          duration: '3 days',
          timing: 'Before breakfast',
          instructions: 'Take 30 mins before morning meal.'
        },
        {
          name: 'Chlorhexidine Gluconate 0.2% Mouthwash',
          dosage: '10 ml',
          frequency: 'Twice daily (BD)',
          duration: '7 days',
          timing: 'After brushing',
          instructions: 'Rinse vigorously for 1 minute then spit. Do not swallow.'
        }
      ]),
      '1. Avoid chewing hard foods on the upper right side until permanent restoration.\n2. In case of sudden swelling or fever, contact the clinic emergency line immediately.\n3. Return on scheduled date for canal obturation.'
    );
  }
}

// Safe parameter sanitizer for SQLite
function sanitizeParams(params) {
  if (!params) return [];
  if (Array.isArray(params)) {
    return params.map(p => (p === undefined ? null : p));
  }
  return params;
}

// Database helper functions
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

function getDbFilePath() {
  return dbPath;
}

function backupDatabase(destPath) {
  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file does not exist to backup.');
  }
  // Checkpoint WAL first to flush pending changes
  db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  fs.copyFileSync(dbPath, destPath);
  return true;
}

function restoreDatabase(sourcePath, app) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error('Selected backup file not found.');
  }
  // Close current db connection
  db.close();
  // Overwrite database file
  fs.copyFileSync(sourcePath, dbPath);
  // Reconnect
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  return true;
}

module.exports = {
  initDatabase,
  queryAll,
  queryGet,
  execute,
  getDbFilePath,
  backupDatabase,
  restoreDatabase
};
