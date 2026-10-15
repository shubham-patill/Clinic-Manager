// Unified API service for DentCare Pro
// Automatically connects to local SQLite via Electron IPC bridge,
// with safe local storage fallback for web browser previews.

const isElectron = typeof window !== 'undefined' && window.electronAPI && window.electronAPI.isElectron;

// Helper: Convert "HH:MM" to minutes from midnight
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Helper: Convert minutes from midnight back to "HH:MM"
export function minutesToTime(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper: Check if two time intervals overlap
export function intervalsOverlap(start1, dur1, start2, dur2) {
  const s1 = timeToMinutes(start1);
  const e1 = s1 + Number(dur1 || 30);
  const s2 = timeToMinutes(start2);
  const e2 = s2 + Number(dur2 || 30);
  return Math.max(s1, s2) < Math.min(e1, e2);
}

// In-browser mock storage fallback if run outside Electron
class WebFallbackStorage {
  constructor() {
    this.storageKey = 'dentcare_pro_web_db_v2';
    this.init();
  }

  init() {
    const today = new Date().toISOString().split('T')[0];
    const existing = localStorage.getItem(this.storageKey);

    if (!existing) {
      const initialData = {
        clinic_settings: {
          id: 1,
          clinic_name: 'SmileCraft Super Specialty Dental Clinic',
          tagline: 'Advanced Multi-Specialty Dental Hospital & Implant Center',
          doctor_name: 'Dr. Sarah Mitchell, BDS, MDS',
          qualification: 'Oral & Maxillofacial Surgeon, Implantologist',
          registration_no: 'DENT-REG-84920',
          phone: '+91 98765 43210',
          email: 'care@smilecraftdental.in',
          address: 'Plot 14, Health City, Sector 4, MG Road',
          currency: '₹',
          tax_rate: 0,
          invoice_footer: 'Thank you for choosing SmileCraft Dental! Wishing you a healthy, radiant smile.'
        },
        doctors: [
          {
            id: 1,
            name: 'Dr. Sarah Mitchell',
            specialty: 'Oral & Maxillofacial Surgery, Implantology',
            qualification: 'BDS, MDS',
            registration_no: 'DENT-REG-84920',
            phone: '+91 98765 43210',
            email: 'dr.sarah@smilecraftdental.in',
            color: '#0d9488',
            consultation_fee: 500,
            is_active: 1
          },
          {
            id: 2,
            name: 'Dr. Rajesh Sharma',
            specialty: 'Endodontics & Conservative Dentistry',
            qualification: 'BDS, MDS',
            registration_no: 'DENT-REG-51204',
            phone: '+91 98111 22334',
            email: 'dr.rajesh@smilecraftdental.in',
            color: '#7c3aed',
            consultation_fee: 600,
            is_active: 1
          },
          {
            id: 3,
            name: 'Dr. Priya Patel',
            specialty: 'Orthodontics & Dentofacial Orthopedics',
            qualification: 'BDS, MDS',
            registration_no: 'DENT-REG-63491',
            phone: '+91 98222 33445',
            email: 'dr.priya@smilecraftdental.in',
            color: '#ea580c',
            consultation_fee: 700,
            is_active: 1
          },
          {
            id: 4,
            name: 'Dr. Amit Verma',
            specialty: 'Periodontics & Aesthetic Dental Surgery',
            qualification: 'BDS',
            registration_no: 'DENT-REG-74198',
            phone: '+91 98333 44556',
            email: 'dr.amit@smilecraftdental.in',
            color: '#2563eb',
            consultation_fee: 400,
            is_active: 1
          }
        ],
        patients: [
          {
            id: 1,
            patient_id: 'PT-2026-001',
            full_name: 'Eleanor Vance',
            age: 34,
            gender: 'Female',
            phone: '+91 98765 11001',
            email: 'eleanor.vance@example.com',
            address: '42 Willow Creek Rd, Green Park',
            emergency_contact: 'David Vance (Spouse) - 98765 11002',
            blood_group: 'A+',
            medical_history: JSON.stringify(['Penicillin Allergy', 'Mild Asthma']),
            allergies: 'Penicillin (Anaphylaxis risk) - Use Clindamycin or Macrolides',
            notes: 'Regular patient. Sensitive to cold on upper right molar.',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            patient_id: 'PT-2026-002',
            full_name: 'Marcus Holloway',
            age: 48,
            gender: 'Male',
            phone: '+91 98765 22002',
            email: 'marcus.h@example.com',
            address: '128 Pinecrest Blvd, Sector 15',
            emergency_contact: 'Sarah Holloway - 98765 22003',
            blood_group: 'O+',
            medical_history: JSON.stringify(['Type 2 Diabetes', 'Hypertension']),
            allergies: 'None reported',
            notes: 'Pre-op blood sugar checked before surgical appointments.',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            patient_id: 'PT-2026-003',
            full_name: 'Sophia Chen',
            age: 26,
            gender: 'Female',
            phone: '+91 98765 33003',
            email: 'sophia.c@example.com',
            address: '89 Maple Court, Apt 3B',
            emergency_contact: 'Wei Chen - 98765 33004',
            blood_group: 'B+',
            medical_history: JSON.stringify([]),
            allergies: 'None',
            notes: 'Clear aligners evaluation requested.',
            created_at: new Date().toISOString()
          }
        ],
        odontogram: [
          { id: 1, patient_id: 1, tooth_number: 16, condition: 'Caries', surface: 'O', notes: 'Deep occlusal caries' },
          { id: 2, patient_id: 1, tooth_number: 14, condition: 'Restoration', surface: 'MO', notes: 'Sound composite filling' },
          { id: 3, patient_id: 1, tooth_number: 36, condition: 'RCT', surface: 'All', notes: 'Completed RCT' },
          { id: 4, patient_id: 1, tooth_number: 46, condition: 'Missing', surface: 'All', notes: 'Extracted 5 yrs ago' },
          { id: 5, patient_id: 2, tooth_number: 36, condition: 'Implant', surface: 'All', notes: 'Implant placed' },
          { id: 6, patient_id: 2, tooth_number: 11, condition: 'Crown', surface: 'All', notes: 'Zirconia Crown' }
        ],
        procedures_catalog: [
          { id: 1, code: 'D0120', category: 'Diagnostic', name: 'Comprehensive Oral Evaluation & Diagnosis', standard_fee: 500, description: 'Full mouth clinical charting & diagnostic examination', doctor_name: 'All Doctors', is_active: 1 },
          { id: 2, code: 'D0210', category: 'Diagnostic', name: 'Digital Intraoral Radiograph (RVG X-Ray)', standard_fee: 300, description: 'High-resolution digital periapical X-ray', doctor_name: 'All Doctors', is_active: 1 },
          { id: 3, code: 'D1110', category: 'Preventive', name: 'Ultrasonic Scaling & Polishing (Full Mouth)', standard_fee: 1500, description: 'Deep calculus removal & stain cleanup', doctor_name: 'Dr. Amit Verma', is_active: 1 },
          { id: 4, code: 'D1206', category: 'Preventive', name: 'Topical Fluoride Treatment', standard_fee: 800, description: 'Enamel remineralization & cavity prevention', doctor_name: 'All Doctors', is_active: 1 },
          { id: 5, code: 'D2391', category: 'Restorative', name: 'Composite Aesthetic Filling (1 Surface)', standard_fee: 1200, description: 'Tooth-colored posterior/anterior composite filling', doctor_name: 'Dr. Rajesh Sharma', is_active: 1 },
          { id: 6, code: 'D2392', category: 'Restorative', name: 'Composite Aesthetic Filling (2 Surfaces)', standard_fee: 1800, description: 'Multi-surface aesthetic composite restoration', doctor_name: 'Dr. Rajesh Sharma', is_active: 1 },
          { id: 7, code: 'D3310', category: 'Endodontics', name: 'Root Canal Treatment (Anterior Tooth)', standard_fee: 3500, description: 'Single rooted incisor/canine endodontics', doctor_name: 'Dr. Rajesh Sharma', is_active: 1 },
          { id: 8, code: 'D3320', category: 'Endodontics', name: 'Root Canal Treatment (Premolar Tooth)', standard_fee: 4200, description: 'Premolar rotary biomechanical preparation & obturation', doctor_name: 'Dr. Rajesh Sharma', is_active: 1 },
          { id: 9, code: 'D3330', category: 'Endodontics', name: 'Root Canal Treatment (Molar Tooth)', standard_fee: 5000, description: 'Multi-canal rotary RCT & warm vertical obturation', doctor_name: 'Dr. Rajesh Sharma', is_active: 1 },
          { id: 10, code: 'D2740', category: 'Prosthodontics', name: 'CAD-CAM All-Ceramic Zirconia Crown', standard_fee: 8500, description: 'Monolithic high-translucency aesthetic crown', doctor_name: 'Dr. Sarah Mitchell', is_active: 1 },
          { id: 11, code: 'D2750', category: 'Prosthodontics', name: 'Porcelain Fused to Metal (PFM) Crown', standard_fee: 3500, description: 'Durable metal ceramic crown', doctor_name: 'Dr. Sarah Mitchell', is_active: 1 },
          { id: 12, code: 'D7140', category: 'Oral Surgery', name: 'Simple Painless Tooth Extraction', standard_fee: 1000, description: 'Elevation & non-traumatic dental extraction', doctor_name: 'Dr. Sarah Mitchell', is_active: 1 },
          { id: 13, code: 'D7210', category: 'Oral Surgery', name: 'Surgical Extraction / Transalveolar Flap', standard_fee: 2500, description: 'Bone removal, sectioning, and sutures', doctor_name: 'Dr. Sarah Mitchell', is_active: 1 },
          { id: 14, code: 'D7240', category: 'Oral Surgery', name: 'Impacted Wisdom Tooth Surgical Disimpaction', standard_fee: 5500, description: 'Full surgical impaction removal under local anesthesia', doctor_name: 'Dr. Sarah Mitchell', is_active: 1 },
          { id: 15, code: 'D6010', category: 'Implantology', name: 'Dental Implant Fixture (Titanium Grade 5)', standard_fee: 28000, description: 'Osseointegrated premium dental implant fixture', doctor_name: 'Dr. Sarah Mitchell', is_active: 1 },
          { id: 16, code: 'D8080', category: 'Orthodontics', name: 'Orthodontic Braces / Clear Aligners Consultation', standard_fee: 1000, description: 'Cephalometric diagnosis & treatment plan', doctor_name: 'Dr. Priya Patel', is_active: 1 },
          { id: 17, code: 'D8090', category: 'Orthodontics', name: 'Comprehensive Ceramic Braces / Aligners (Full Course)', standard_fee: 45000, description: 'Full orthodontic treatment with monthly adjustments', doctor_name: 'Dr. Priya Patel', is_active: 1 },
          { id: 18, code: 'D9972', category: 'Cosmetic', name: 'In-Office Laser Teeth Whitening (Bleaching)', standard_fee: 7500, description: 'Professional peroxide activation with laser enhancement', doctor_name: 'Dr. Amit Verma', is_active: 1 }
        ],
        treatments: [
          { id: 1, patient_id: 1, procedure_id: 3, procedure_name: 'Ultrasonic Scaling & Polishing (Full Mouth)', tooth_number: 'Full Mouth', doctor_name: 'Dr. Amit Verma', status: 'Completed', cost: 1500, discount: 0, final_amount: 1500, doctor_notes: 'Completed smoothly', performed_at: new Date().toISOString() },
          { id: 2, patient_id: 1, procedure_id: 9, procedure_name: 'Root Canal Treatment (Molar Tooth)', tooth_number: '16', doctor_name: 'Dr. Rajesh Sharma', status: 'In Progress', cost: 5000, discount: 500, final_amount: 4500, doctor_notes: 'Canal extirpation done', performed_at: new Date().toISOString() }
        ],
        // GUARANTEED NON-CLASHING SEED APPOINTMENTS
        appointments: [
          // 10:00 - 10:45 on Chair 1 with Dr. Sarah Mitchell
          { id: 1, patient_id: 1, appointment_date: today, appointment_time: '10:00', duration_minutes: 45, chair_number: 'Chair 1', doctor_name: 'Dr. Sarah Mitchell', reason: 'Implant Consultation #36', status: 'Waiting', notes: 'Patient in lobby' },
          // 10:00 - 10:30 on Chair 2 with Dr. Rajesh Sharma (DIFFERENT CHAIR, DIFFERENT DOCTOR -> NO CLASH!)
          { id: 2, patient_id: 3, appointment_date: today, appointment_time: '10:00', duration_minutes: 30, chair_number: 'Chair 2', doctor_name: 'Dr. Rajesh Sharma', reason: 'Root Canal Evaluation #16', status: 'Scheduled', notes: 'First visit for RCT' },
          // 11:30 - 12:30 on Chair 2 with Dr. Sarah Mitchell (Sarah is free after 10:45 -> NO CLASH!)
          { id: 3, patient_id: 2, appointment_date: today, appointment_time: '11:30', duration_minutes: 60, chair_number: 'Chair 2', doctor_name: 'Dr. Sarah Mitchell', reason: 'Surgical Extraction Verification', status: 'Scheduled', notes: 'Check BP first' },
          // 14:00 - 14:30 on Chair 1 with Dr. Priya Patel (NO CLASH!)
          { id: 4, patient_id: 3, appointment_date: today, appointment_time: '14:00', duration_minutes: 30, chair_number: 'Chair 1', doctor_name: 'Dr. Priya Patel', reason: 'Aligners & Orthodontic Consultation', status: 'Scheduled', notes: 'Records review' }
        ],
        invoices: [
          { id: 1, invoice_number: 'INV-2026-0001', patient_id: 1, invoice_date: today, due_date: today, subtotal: 6500, discount_amount: 500, discount_type: 'flat', tax_amount: 0, total_amount: 6000, paid_amount: 6000, balance_due: 0, payment_status: 'Paid', doctor_name: 'Dr. Rajesh Sharma', notes: 'Paid in full via UPI' }
        ],
        invoice_items: [
          { id: 1, invoice_id: 1, treatment_id: 1, description: 'Ultrasonic Scaling & Polishing (Full Mouth)', tooth_number: 'Full Mouth', quantity: 1, unit_price: 1500, total: 1500 },
          { id: 2, invoice_id: 1, treatment_id: 2, description: 'Root Canal Treatment (Molar Tooth)', tooth_number: '16', quantity: 1, unit_price: 5000, total: 5000 }
        ],
        payments: [
          { id: 1, invoice_id: 1, patient_id: 1, payment_date: today, amount: 6000, payment_method: 'UPI / QR Code', reference_no: 'UPI-REF-902482', notes: 'Receipt handed to patient' }
        ],
        prescriptions: [
          {
            id: 1,
            patient_id: 1,
            doctor_name: 'Dr. Rajesh Sharma, BDS, MDS',
            diagnosis: 'Acute Irreversible Pulpitis #16 (Penicillin allergic)',
            rx_date: today,
            medicines: JSON.stringify([
              { name: 'Ibuprofen 400mg Tablet', dosage: '400 mg', frequency: 'Three times daily (TDS)', duration: '3 days', timing: 'After food', instructions: 'Take with water.' },
              { name: 'Pantoprazole 40mg Tablet', dosage: '40 mg', frequency: 'Once daily (OD)', duration: '3 days', timing: 'Before breakfast', instructions: 'Take 30 mins before morning meal.' },
              { name: 'Chlorhexidine 0.2% Rinse', dosage: '10 ml', frequency: 'Twice daily (BD)', duration: '7 days', timing: 'After brushing', instructions: 'Rinse 60 secs and spit.' }
            ]),
            clinical_advice: '1. Avoid chewing hard foods on right upper side.\n2. In case of swelling, call emergency contact immediately.\n3. Return on scheduled date for canal filling.'
          }
        ],
        medications_master: [
          { id: 1, name: 'Amoxicillin 500mg Capsule', category: 'Antibiotic', default_dosage: '500 mg', default_frequency: 'Three times daily (TDS)', default_duration: '5 days', instructions: 'Take after meals.' },
          { id: 2, name: 'Augmentin 625mg (Amox + Clav)', category: 'Antibiotic', default_dosage: '625 mg', default_frequency: 'Twice daily (BD)', default_duration: '5 days', instructions: 'Take at start of meals.' },
          { id: 3, name: 'Metronidazole 400mg Tablet', category: 'Antibacterial', default_dosage: '400 mg', default_frequency: 'Three times daily (TDS)', default_duration: '5 days', instructions: 'Strictly avoid alcohol.' },
          { id: 4, name: 'Ibuprofen 400mg Tablet', category: 'NSAID / Pain Relief', default_dosage: '400 mg', default_frequency: 'Three times daily (TDS)', default_duration: '3 days', instructions: 'Take after food.' },
          { id: 5, name: 'Paracetamol 650mg Tablet', category: 'Analgesic', default_dosage: '650 mg', default_frequency: 'Every 6-8 hrs (SOS)', default_duration: '3 days', instructions: 'Max 4g/day.' },
          { id: 6, name: 'Ketorolac Tromethamine 10mg (Ketorol-DT)', category: 'Analgesic', default_dosage: '10 mg', default_frequency: 'Twice daily (BD)', duration: '2-3 days', instructions: 'Disperse in water. Acute pain.' },
          { id: 7, name: 'Pantoprazole 40mg Tablet', category: 'Antacid', default_dosage: '40 mg', default_frequency: 'Once daily (OD)', default_duration: '5 days', instructions: '30 mins before breakfast.' },
          { id: 8, name: 'Chlorhexidine Gluconate 0.2% Oral Rinse', category: 'Antiseptic', default_dosage: '10-15 ml', default_frequency: 'Twice daily (BD)', default_duration: '14 days', instructions: 'Swish for 60s, do not swallow.' }
        ]
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  setData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}

const webFallback = new WebFallbackStorage();

// Universal Database Execution Wrapper
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

// ==========================================
// CLINIC SETTINGS API
// ==========================================
export async function getClinicSettings() {
  if (isElectron) {
    const row = await window.electronAPI.queryGet('SELECT * FROM clinic_settings WHERE id = 1');
    if (row) return row;
  }
  return webFallback.getData().clinic_settings;
}

export async function updateClinicSettings(settings) {
  if (isElectron) {
    return await window.electronAPI.execute(
      `UPDATE clinic_settings SET 
        clinic_name = ?, tagline = ?, doctor_name = ?, qualification = ?,
        registration_no = ?, phone = ?, email = ?, address = ?,
        currency = ?, tax_rate = ?, invoice_footer = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        settings.clinic_name, settings.tagline, settings.doctor_name,
        settings.qualification, settings.registration_no, settings.phone,
        settings.email, settings.address, settings.currency || '₹', settings.tax_rate,
        settings.invoice_footer
      ]
    );
  }
  const data = webFallback.getData();
  data.clinic_settings = { ...data.clinic_settings, ...settings };
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// DOCTORS (MULTI-DOCTOR PRACTICE) API
// ==========================================
export async function getDoctors() {
  if (isElectron) {
    return await window.electronAPI.queryAll(
      'SELECT * FROM doctors WHERE is_active = 1 ORDER BY id ASC'
    );
  }
  const data = webFallback.getData();
  return (data.doctors || []).filter(d => d.is_active !== 0);
}

export async function createDoctor(doc) {
  if (isElectron) {
    const res = await window.electronAPI.execute(
      `INSERT INTO doctors (name, specialty, qualification, registration_no, phone, email, color, consultation_fee, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        doc.name, doc.specialty, doc.qualification || '', doc.registration_no || '',
        doc.phone || '', doc.email || '', doc.color || '#0d9488', doc.consultation_fee || 500
      ]
    );
    return { id: res.lastInsertRowid };
  }
  const data = webFallback.getData();
  if (!data.doctors) data.doctors = [];
  const newDoc = { ...doc, id: Date.now(), is_active: 1 };
  data.doctors.push(newDoc);
  webFallback.setData(data);
  return { id: newDoc.id };
}

export async function updateDoctor(id, doc) {
  if (isElectron) {
    return await window.electronAPI.execute(
      `UPDATE doctors SET 
        name = ?, specialty = ?, qualification = ?, registration_no = ?,
        phone = ?, email = ?, color = ?, consultation_fee = ?
       WHERE id = ?`,
      [
        doc.name, doc.specialty, doc.qualification, doc.registration_no,
        doc.phone, doc.email, doc.color, doc.consultation_fee, id
      ]
    );
  }
  const data = webFallback.getData();
  const idx = data.doctors.findIndex(d => d.id === Number(id));
  if (idx !== -1) {
    data.doctors[idx] = { ...data.doctors[idx], ...doc };
    webFallback.setData(data);
  }
  return { success: true };
}

export async function deleteDoctor(id) {
  if (isElectron) {
    return await window.electronAPI.execute('UPDATE doctors SET is_active = 0 WHERE id = ?', [id]);
  }
  const data = webFallback.getData();
  data.doctors = data.doctors.filter(d => d.id !== Number(id));
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// PATIENTS API
// ==========================================
export async function getPatients(search = '') {
  if (isElectron) {
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      return await window.electronAPI.queryAll(
        `SELECT * FROM patients 
         WHERE full_name LIKE ? OR phone LIKE ? OR patient_id LIKE ? 
         ORDER BY id DESC`,
        [term, term, term]
      );
    }
    return await window.electronAPI.queryAll('SELECT * FROM patients ORDER BY id DESC');
  }

  let list = webFallback.getData().patients;
  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(p => 
      p.full_name.toLowerCase().includes(s) || 
      p.phone.includes(s) || 
      p.patient_id.toLowerCase().includes(s)
    );
  }
  return list.sort((a, b) => b.id - a.id);
}

export async function getPatientById(id) {
  if (isElectron) {
    return await window.electronAPI.queryGet('SELECT * FROM patients WHERE id = ?', [id]);
  }
  return webFallback.getData().patients.find(p => p.id === Number(id)) || null;
}

export async function createPatient(patient) {
  if (isElectron) {
    const countRow = await window.electronAPI.queryGet('SELECT COUNT(*) as count FROM patients');
    const seq = (countRow.count + 1).toString().padStart(3, '0');
    const patient_id = patient.patient_id || `PT-${new Date().getFullYear()}-${seq}`;

    const res = await window.electronAPI.execute(
      `INSERT INTO patients (
        patient_id, full_name, age, gender, phone, email, address,
        emergency_contact, blood_group, medical_history, allergies, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id, patient.full_name, patient.age || null, patient.gender,
        patient.phone, patient.email || '', patient.address || '',
        patient.emergency_contact || '', patient.blood_group || '',
        JSON.stringify(patient.medical_history || []),
        patient.allergies || '', patient.notes || ''
      ]
    );
    return { id: res.lastInsertRowid, patient_id };
  }

  const data = webFallback.getData();
  const id = Date.now();
  const seq = (data.patients.length + 1).toString().padStart(3, '0');
  const patient_id = patient.patient_id || `PT-${new Date().getFullYear()}-${seq}`;
  const newP = {
    ...patient,
    id,
    patient_id,
    medical_history: JSON.stringify(patient.medical_history || []),
    created_at: new Date().toISOString()
  };
  data.patients.push(newP);
  webFallback.setData(data);
  return { id, patient_id };
}

export async function updatePatient(id, patient) {
  if (isElectron) {
    return await window.electronAPI.execute(
      `UPDATE patients SET 
        full_name = ?, age = ?, gender = ?, phone = ?, email = ?, 
        address = ?, emergency_contact = ?, blood_group = ?, 
        medical_history = ?, allergies = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        patient.full_name, patient.age, patient.gender, patient.phone,
        patient.email, patient.address, patient.emergency_contact,
        patient.blood_group, JSON.stringify(patient.medical_history || []),
        patient.allergies, patient.notes, id
      ]
    );
  }
  const data = webFallback.getData();
  const idx = data.patients.findIndex(p => p.id === Number(id));
  if (idx !== -1) {
    data.patients[idx] = {
      ...data.patients[idx],
      ...patient,
      medical_history: JSON.stringify(patient.medical_history || [])
    };
    webFallback.setData(data);
  }
  return { success: true };
}

export async function deletePatient(id) {
  if (isElectron) {
    return await window.electronAPI.execute('DELETE FROM patients WHERE id = ?', [id]);
  }
  const data = webFallback.getData();
  data.patients = data.patients.filter(p => p.id !== Number(id));
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// ODONTOGRAM (DENTAL CHART) API
// ==========================================
export async function getPatientOdontogram(patientId) {
  if (isElectron) {
    return await window.electronAPI.queryAll(
      'SELECT * FROM odontogram WHERE patient_id = ? ORDER BY tooth_number ASC',
      [patientId]
    );
  }
  return webFallback.getData().odontogram.filter(o => o.patient_id === Number(patientId));
}

export async function saveToothCondition(patientId, toothNumber, condition, surface = 'All', notes = '') {
  if (isElectron) {
    if (condition === 'Healthy') {
      return await window.electronAPI.execute(
        'DELETE FROM odontogram WHERE patient_id = ? AND tooth_number = ?',
        [patientId, toothNumber]
      );
    }
    return await window.electronAPI.execute(
      `INSERT INTO odontogram (patient_id, tooth_number, condition, surface, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(patient_id, tooth_number) DO UPDATE SET
         condition = excluded.condition,
         surface = excluded.surface,
         notes = excluded.notes,
         updated_at = CURRENT_TIMESTAMP`,
      [patientId, toothNumber, condition, surface, notes]
    );
  }

  const data = webFallback.getData();
  data.odontogram = data.odontogram.filter(
    o => !(o.patient_id === Number(patientId) && o.tooth_number === Number(toothNumber))
  );
  if (condition !== 'Healthy') {
    data.odontogram.push({
      id: Date.now(),
      patient_id: Number(patientId),
      tooth_number: Number(toothNumber),
      condition,
      surface,
      notes
    });
  }
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// PROCEDURES CATALOG API (WITH DOCTOR FILTER)
// ==========================================
export async function getProceduresCatalog(doctorFilter = '') {
  if (isElectron) {
    if (doctorFilter && doctorFilter !== 'All Doctors') {
      return await window.electronAPI.queryAll(
        `SELECT * FROM procedures_catalog 
         WHERE is_active = 1 AND (doctor_name = ? OR doctor_name = 'All Doctors' OR doctor_name IS NULL)
         ORDER BY category, name ASC`,
        [doctorFilter]
      );
    }
    return await window.electronAPI.queryAll(
      'SELECT * FROM procedures_catalog WHERE is_active = 1 ORDER BY category, name ASC'
    );
  }
  const list = webFallback.getData().procedures_catalog;
  if (doctorFilter && doctorFilter !== 'All Doctors') {
    return list.filter(p => p.doctor_name === doctorFilter || p.doctor_name === 'All Doctors' || !p.doctor_name);
  }
  return list;
}

export async function createProcedure(proc) {
  if (isElectron) {
    return await window.electronAPI.execute(
      `INSERT INTO procedures_catalog (code, category, name, standard_fee, description, doctor_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        proc.code || null, proc.category, proc.name, proc.standard_fee,
        proc.description || '', proc.doctor_name || 'All Doctors'
      ]
    );
  }
  const data = webFallback.getData();
  const newProc = { ...proc, id: Date.now(), is_active: 1 };
  data.procedures_catalog.push(newProc);
  webFallback.setData(data);
  return { id: newProc.id };
}

export async function deleteProcedure(id) {
  if (isElectron) {
    return await window.electronAPI.execute('UPDATE procedures_catalog SET is_active = 0 WHERE id = ?', [id]);
  }
  const data = webFallback.getData();
  data.procedures_catalog = data.procedures_catalog.filter(p => p.id !== Number(id));
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// TREATMENTS API
// ==========================================
export async function getPatientTreatments(patientId) {
  if (isElectron) {
    return await window.electronAPI.queryAll(
      `SELECT t.*, p.category 
       FROM treatments t
       LEFT JOIN procedures_catalog p ON t.procedure_id = p.id
       WHERE t.patient_id = ?
       ORDER BY t.id DESC`,
      [patientId]
    );
  }
  return webFallback.getData().treatments.filter(t => t.patient_id === Number(patientId));
}

export async function createTreatment(treatment) {
  const finalAmount = Number(treatment.cost || 0) - Number(treatment.discount || 0);
  if (isElectron) {
    return await window.electronAPI.execute(
      `INSERT INTO treatments (
        patient_id, procedure_id, procedure_name, tooth_number, doctor_name, status,
        cost, discount, final_amount, doctor_notes, performed_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [
        treatment.patient_id, treatment.procedure_id || null, treatment.procedure_name,
        treatment.tooth_number || '', treatment.doctor_name || '', treatment.status || 'Planned',
        treatment.cost, treatment.discount || 0, finalAmount,
        treatment.doctor_notes || '',
        treatment.status === 'Completed' ? new Date().toISOString() : null
      ]
    );
  }
  const data = webFallback.getData();
  const newT = {
    ...treatment,
    id: Date.now(),
    final_amount: finalAmount,
    performed_at: new Date().toISOString()
  };
  data.treatments.push(newT);
  webFallback.setData(data);
  return { id: newT.id };
}

export async function updateTreatmentStatus(id, status) {
  const completedAt = status === 'Completed' ? new Date().toISOString() : null;
  if (isElectron) {
    return await window.electronAPI.execute(
      'UPDATE treatments SET status = ?, completed_at = ? WHERE id = ?',
      [status, completedAt, id]
    );
  }
  const data = webFallback.getData();
  const item = data.treatments.find(t => t.id === Number(id));
  if (item) {
    item.status = status;
    item.completed_at = completedAt;
    webFallback.setData(data);
  }
  return { success: true };
}

export async function deleteTreatment(id) {
  if (isElectron) {
    return await window.electronAPI.execute('DELETE FROM treatments WHERE id = ?', [id]);
  }
  const data = webFallback.getData();
  data.treatments = data.treatments.filter(t => t.id !== Number(id));
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// APPOINTMENTS & CLASH DETECTION API
// ==========================================
export async function getAppointments(date = '', doctorName = '') {
  let list = [];
  if (isElectron) {
    let sql = `SELECT a.*, p.full_name as patient_name, p.phone as patient_phone, p.patient_id as patient_code
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE 1=1`;
    const params = [];
    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }
    if (doctorName && doctorName !== 'All Doctors') {
      sql += ' AND a.doctor_name = ?';
      params.push(doctorName);
    }
    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
    list = await window.electronAPI.queryAll(sql, params);
  } else {
    const data = webFallback.getData();
    list = data.appointments.map(a => {
      const pt = data.patients.find(p => p.id === a.patient_id);
      return {
        ...a,
        patient_name: pt ? pt.full_name : 'Unknown',
        patient_phone: pt ? pt.phone : '',
        patient_code: pt ? pt.patient_id : ''
      };
    });
    if (date) {
      list = list.filter(a => a.appointment_date === date);
    }
    if (doctorName && doctorName !== 'All Doctors') {
      list = list.filter(a => a.doctor_name === doctorName);
    }
    list = list.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }
  return list;
}

// Clash Detection Function:
// Checks if another appointment conflicts on Doctor OR Chair
export async function checkAppointmentConflict(appt, excludeId = null) {
  const existingAppts = await getAppointments(appt.appointment_date);
  const activeAppts = existingAppts.filter(a => 
    a.id !== Number(excludeId) && a.status !== 'Cancelled'
  );

  for (const existing of activeAppts) {
    const isOverlapping = intervalsOverlap(
      appt.appointment_time,
      appt.duration_minutes || 30,
      existing.appointment_time,
      existing.duration_minutes || 30
    );

    if (isOverlapping) {
      const existingEnd = minutesToTime(timeToMinutes(existing.appointment_time) + Number(existing.duration_minutes || 30));
      
      // Conflict Type 1: Same Doctor at the same time!
      if (appt.doctor_name && existing.doctor_name && appt.doctor_name === existing.doctor_name) {
        return {
          hasConflict: true,
          type: 'doctor',
          message: `Doctor Clash: ${appt.doctor_name} is already booked with ${existing.patient_name} from ${existing.appointment_time} to ${existingEnd} in ${existing.chair_number}. Please pick another time slot.`
        };
      }

      // Conflict Type 2: Same Chair at the same time!
      if (appt.chair_number && existing.chair_number && appt.chair_number === existing.chair_number) {
        return {
          hasConflict: true,
          type: 'chair',
          message: `Chair Clash: ${appt.chair_number} is already occupied by ${existing.patient_name} from ${existing.appointment_time} to ${existingEnd} with ${existing.doctor_name}. Please pick another chair or time slot.`
        };
      }
    }
  }

  return { hasConflict: false };
}

export async function createAppointment(appt) {
  // Validate clash before saving
  const clash = await checkAppointmentConflict(appt);
  if (clash.hasConflict) {
    throw new Error(clash.message);
  }

  if (isElectron) {
    return await window.electronAPI.execute(
      `INSERT INTO appointments (
        patient_id, appointment_date, appointment_time, duration_minutes,
        chair_number, doctor_id, doctor_name, reason, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appt.patient_id, appt.appointment_date, appt.appointment_time,
        appt.duration_minutes || 30, appt.chair_number || 'Chair 1',
        appt.doctor_id || null, appt.doctor_name || '', appt.reason || '',
        appt.status || 'Scheduled', appt.notes || ''
      ]
    );
  }
  const data = webFallback.getData();
  const newAppt = { ...appt, id: Date.now() };
  data.appointments.push(newAppt);
  webFallback.setData(data);
  return { id: newAppt.id };
}

export async function updateAppointmentStatus(id, status) {
  if (isElectron) {
    return await window.electronAPI.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
  }
  const data = webFallback.getData();
  const item = data.appointments.find(a => a.id === Number(id));
  if (item) {
    item.status = status;
    webFallback.setData(data);
  }
  return { success: true };
}

export async function deleteAppointment(id) {
  if (isElectron) {
    return await window.electronAPI.execute('DELETE FROM appointments WHERE id = ?', [id]);
  }
  const data = webFallback.getData();
  data.appointments = data.appointments.filter(a => a.id !== Number(id));
  webFallback.setData(data);
  return { success: true };
}

// ==========================================
// INVOICES & BILLING API
// ==========================================
export async function getInvoices(patientId = null, doctorName = '') {
  if (isElectron) {
    let sql = `SELECT i.*, p.full_name as patient_name, p.phone as patient_phone, p.patient_id as patient_code
               FROM invoices i
               JOIN patients p ON i.patient_id = p.id
               WHERE 1=1`;
    const params = [];
    if (patientId) {
      sql += ' AND i.patient_id = ?';
      params.push(patientId);
    }
    if (doctorName && doctorName !== 'All Doctors') {
      sql += ' AND i.doctor_name = ?';
      params.push(doctorName);
    }
    sql += ' ORDER BY i.id DESC';
    return await window.electronAPI.queryAll(sql, params);
  }

  const data = webFallback.getData();
  let list = data.invoices.map(inv => {
    const pt = data.patients.find(p => p.id === inv.patient_id);
    return {
      ...inv,
      patient_name: pt ? pt.full_name : 'Unknown',
      patient_phone: pt ? pt.phone : '',
      patient_code: pt ? pt.patient_id : ''
    };
  });
  if (patientId) {
    list = list.filter(i => i.patient_id === Number(patientId));
  }
  if (doctorName && doctorName !== 'All Doctors') {
    list = list.filter(i => i.doctor_name === doctorName);
  }
  return list.sort((a, b) => b.id - a.id);
}

export async function createInvoice(invoiceData) {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + Number(item.total), 0);
  const discount = Number(invoiceData.discount_amount || 0);
  const tax = Number(invoiceData.tax_amount || 0);
  const totalAmount = Math.max(0, subtotal - discount + tax);
  const paidAmount = Number(invoiceData.paid_amount || 0);
  const balanceDue = Math.max(0, totalAmount - paidAmount);
  const paymentStatus = balanceDue === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid');

  if (isElectron) {
    const countRow = await window.electronAPI.queryGet('SELECT COUNT(*) as count FROM invoices');
    const seq = (countRow.count + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-${new Date().getFullYear()}-${seq}`;

    const res = await window.electronAPI.execute(
      `INSERT INTO invoices (
        invoice_number, patient_id, invoice_date, due_date, subtotal,
        discount_amount, discount_type, tax_amount, total_amount, paid_amount,
        balance_due, payment_status, doctor_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber, invoiceData.patient_id, invoiceData.invoice_date,
        invoiceData.due_date || invoiceData.invoice_date, subtotal, discount,
        invoiceData.discount_type || 'flat', tax, totalAmount, paidAmount,
        balanceDue, paymentStatus, invoiceData.doctor_name || 'Dr. Sarah Mitchell',
        invoiceData.notes || ''
      ]
    );

    const invoiceId = res.lastInsertRowid;

    for (const item of invoiceData.items) {
      await window.electronAPI.execute(
        `INSERT INTO invoice_items (invoice_id, treatment_id, description, tooth_number, quantity, unit_price, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.treatment_id || null, item.description, item.tooth_number || '', item.quantity || 1, item.unit_price, item.total]
      );
    }

    if (paidAmount > 0) {
      await window.electronAPI.execute(
        `INSERT INTO payments (invoice_id, patient_id, payment_date, amount, payment_method, reference_no, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, invoiceData.patient_id, invoiceData.invoice_date, paidAmount, invoiceData.payment_method || 'UPI / QR Code', '', 'Initial payment at invoice generation']
      );
    }

    return { id: invoiceId, invoiceNumber };
  }

  const data = webFallback.getData();
  const invoiceId = Date.now();
  const seq = (data.invoices.length + 1).toString().padStart(4, '0');
  const invoiceNumber = `INV-${new Date().getFullYear()}-${seq}`;

  const newInv = {
    id: invoiceId,
    invoice_number: invoiceNumber,
    patient_id: Number(invoiceData.patient_id),
    invoice_date: invoiceData.invoice_date,
    due_date: invoiceData.due_date || invoiceData.invoice_date,
    subtotal,
    discount_amount: discount,
    discount_type: invoiceData.discount_type || 'flat',
    tax_amount: tax,
    total_amount: totalAmount,
    paid_amount: paidAmount,
    balance_due: balanceDue,
    payment_status: paymentStatus,
    doctor_name: invoiceData.doctor_name || 'Dr. Sarah Mitchell',
    notes: invoiceData.notes || ''
  };
  data.invoices.push(newInv);

  for (const item of invoiceData.items) {
    data.invoice_items.push({
      id: Date.now() + Math.random(),
      invoice_id: invoiceId,
      treatment_id: item.treatment_id || null,
      description: item.description,
      tooth_number: item.tooth_number || '',
      quantity: item.quantity || 1,
      unit_price: item.unit_price,
      total: item.total
    });
  }

  if (paidAmount > 0) {
    data.payments.push({
      id: Date.now() + 1,
      invoice_id: invoiceId,
      patient_id: Number(invoiceData.patient_id),
      payment_date: invoiceData.invoice_date,
      amount: paidAmount,
      payment_method: invoiceData.payment_method || 'UPI / QR Code',
      reference_no: '',
      notes: 'Initial payment'
    });
  }

  webFallback.setData(data);
  return { id: invoiceId, invoiceNumber };
}

export async function recordPayment(invoiceId, amount, paymentMethod, referenceNo = '', notes = '') {
  if (isElectron) {
    const inv = await window.electronAPI.queryGet('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (!inv) throw new Error('Invoice not found');

    const newPaid = Number(inv.paid_amount) + Number(amount);
    const newBalance = Math.max(0, Number(inv.total_amount) - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

    await window.electronAPI.execute(
      `INSERT INTO payments (invoice_id, patient_id, payment_date, amount, payment_method, reference_no, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, inv.patient_id, new Date().toISOString().split('T')[0], amount, paymentMethod, referenceNo, notes]
    );

    await window.electronAPI.execute(
      'UPDATE invoices SET paid_amount = ?, balance_due = ?, payment_status = ? WHERE id = ?',
      [newPaid, newBalance, newStatus, invoiceId]
    );

    return { success: true };
  }

  const data = webFallback.getData();
  const inv = data.invoices.find(i => i.id === Number(invoiceId));
  if (inv) {
    const newPaid = Number(inv.paid_amount) + Number(amount);
    inv.paid_amount = newPaid;
    inv.balance_due = Math.max(0, Number(inv.total_amount) - newPaid);
    inv.payment_status = inv.balance_due === 0 ? 'Paid' : 'Partial';

    data.payments.push({
      id: Date.now(),
      invoice_id: Number(invoiceId),
      patient_id: inv.patient_id,
      payment_date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      payment_method: paymentMethod,
      reference_no: referenceNo,
      notes
    });
    webFallback.setData(data);
  }
  return { success: true };
}

// ==========================================
// PRESCRIPTIONS API (FIXED FOR ALL VIEWS)
// ==========================================
export async function getPatientPrescriptions(patientId = null) {
  if (isElectron) {
    if (patientId) {
      return await window.electronAPI.queryAll(
        `SELECT pr.*, p.full_name as patient_name, p.patient_id as patient_code, 
                p.phone as patient_phone, p.age as patient_age, p.gender as patient_gender
         FROM prescriptions pr
         JOIN patients p ON pr.patient_id = p.id
         WHERE pr.patient_id = ? 
         ORDER BY pr.id DESC`,
        [patientId]
      );
    }
    return await window.electronAPI.queryAll(
      `SELECT pr.*, p.full_name as patient_name, p.patient_id as patient_code, 
              p.phone as patient_phone, p.age as patient_age, p.gender as patient_gender
       FROM prescriptions pr
       JOIN patients p ON pr.patient_id = p.id
       ORDER BY pr.id DESC`
    );
  }

  const data = webFallback.getData();
  let list = (data.prescriptions || []).map(pr => {
    const pt = data.patients.find(p => p.id === pr.patient_id);
    return {
      ...pr,
      patient_name: pt ? pt.full_name : 'Unknown',
      patient_code: pt ? pt.patient_id : '',
      patient_phone: pt ? pt.phone : '',
      patient_age: pt ? pt.age : '',
      patient_gender: pt ? pt.gender : ''
    };
  });
  if (patientId) {
    list = list.filter(p => p.patient_id === Number(patientId));
  }
  return list.sort((a, b) => b.id - a.id);
}

export async function createPrescription(rx) {
  if (isElectron) {
    return await window.electronAPI.execute(
      `INSERT INTO prescriptions (patient_id, doctor_name, diagnosis, rx_date, medicines, clinical_advice)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rx.patient_id, rx.doctor_name, rx.diagnosis || '', rx.rx_date, JSON.stringify(rx.medicines), rx.clinical_advice || '']
    );
  }
  const data = webFallback.getData();
  const newRx = {
    ...rx,
    id: Date.now(),
    medicines: JSON.stringify(rx.medicines)
  };
  data.prescriptions.push(newRx);
  webFallback.setData(data);
  return { id: newRx.id };
}

export async function deletePrescription(id) {
  if (isElectron) {
    return await window.electronAPI.execute('DELETE FROM prescriptions WHERE id = ?', [id]);
  }
  const data = webFallback.getData();
  data.prescriptions = data.prescriptions.filter(p => p.id !== Number(id));
  webFallback.setData(data);
  return { success: true };
}

export async function getMedicationsCatalog() {
  if (isElectron) {
    return await window.electronAPI.queryAll('SELECT * FROM medications_master ORDER BY category, name ASC');
  }
  return webFallback.getData().medications_master;
}

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================
export async function getDashboardStats(doctorFilter = '') {
  const today = new Date().toISOString().split('T')[0];

  if (isElectron) {
    const totalPatients = (await window.electronAPI.queryGet('SELECT COUNT(*) as count FROM patients')).count;
    
    let apptSql = `SELECT a.*, p.full_name as patient_name, p.phone as patient_phone, p.patient_id as patient_code
                   FROM appointments a
                   JOIN patients p ON a.patient_id = p.id
                   WHERE a.appointment_date = ?`;
    const apptParams = [today];
    if (doctorFilter && doctorFilter !== 'All Doctors') {
      apptSql += ' AND a.doctor_name = ?';
      apptParams.push(doctorFilter);
    }
    apptSql += ' ORDER BY a.appointment_time ASC';
    const todayAppointments = await window.electronAPI.queryAll(apptSql, apptParams);

    const completedTreatments = (await window.electronAPI.queryGet("SELECT COUNT(*) as count FROM treatments WHERE status = 'Completed'")).count;
    
    const revRow = await window.electronAPI.queryGet('SELECT SUM(paid_amount) as totalRevenue, SUM(balance_due) as pendingDues FROM invoices');
    const totalRevenue = revRow ? (revRow.totalRevenue || 0) : 0;
    const pendingDues = revRow ? (revRow.pendingDues || 0) : 0;

    const recentTreatments = await window.electronAPI.queryAll(
      `SELECT t.*, p.full_name as patient_name, p.patient_id as patient_code
       FROM treatments t
       JOIN patients p ON t.patient_id = p.id
       ORDER BY t.id DESC LIMIT 5`
    );

    return {
      totalPatients,
      todayAppointments,
      completedTreatments,
      totalRevenue,
      pendingDues,
      recentTreatments
    };
  }

  const data = webFallback.getData();
  const totalPatients = data.patients.length;
  let todayAppointments = data.appointments
    .filter(a => a.appointment_date === today)
    .map(a => {
      const pt = data.patients.find(p => p.id === a.patient_id);
      return {
        ...a,
        patient_name: pt ? pt.full_name : 'Unknown',
        patient_phone: pt ? pt.phone : '',
        patient_code: pt ? pt.patient_id : ''
      };
    });
  if (doctorFilter && doctorFilter !== 'All Doctors') {
    todayAppointments = todayAppointments.filter(a => a.doctor_name === doctorFilter);
  }

  const completedTreatments = data.treatments.filter(t => t.status === 'Completed').length;
  const totalRevenue = data.invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const pendingDues = data.invoices.reduce((sum, i) => sum + (i.balance_due || 0), 0);
  const recentTreatments = data.treatments.slice(-5).reverse().map(t => {
    const pt = data.patients.find(p => p.id === t.patient_id);
    return {
      ...t,
      patient_name: pt ? pt.full_name : 'Unknown',
      patient_code: pt ? pt.patient_id : ''
    };
  });

  return {
    totalPatients,
    todayAppointments,
    completedTreatments,
    totalRevenue,
    pendingDues,
    recentTreatments
  };
}

// ==========================================
// SYSTEM & PRINT
// ==========================================
export async function getDatabaseInfo() {
  if (isElectron) {
    return await window.electronAPI.getDbInfo();
  }
  return {
    path: 'Browser IndexedDB / LocalStorage',
    sizeReadable: '~45 KB',
    mode: 'Web Fallback Mode',
    status: 'Ready'
  };
}

export async function backupDatabase() {
  if (isElectron) {
    return await window.electronAPI.backupDatabase();
  }
  const jsonStr = localStorage.getItem('dentcare_pro_web_db_v2');
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DentCare_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  return { success: true, path: a.download };
}

export async function restoreDatabase() {
  if (isElectron) {
    return await window.electronAPI.restoreDatabase();
  }
  alert('In browser mode, please use Electron desktop executable for direct .db binary restore.');
  return { success: false };
}

export function triggerPrint() {
  if (isElectron) {
    window.electronAPI.printWindow();
  } else {
    window.print();
  }
}
