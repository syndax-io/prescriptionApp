const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'prescription_app.db');

// Remove existing database for fresh start
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new sqlite3.Database(DB_PATH);

// Promisified db.run
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const initDatabase = async () => {
  await dbRun('PRAGMA foreign_keys = ON');

  // Users table — doctors and patients with optional vitals for patients
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      whatsapp_number TEXT,
      role TEXT CHECK(role IN ('doctor', 'patient')) NOT NULL,
      specialization TEXT,
      license_number TEXT,
      clinic_name TEXT,
      clinic_address TEXT,
      date_of_birth DATE,
      address TEXT,
      avatar_url TEXT,
      weight TEXT,
      bp TEXT,
      heart_rate INTEGER,
      spo2 INTEGER,
      temperature TEXT,
      condition TEXT,
      visit_reason TEXT,
      gender TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Medications formulary — the catalog of available drugs
  await dbRun(`
    CREATE TABLE IF NOT EXISTS medications_formulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      strength TEXT NOT NULL,
      default_quantity INTEGER DEFAULT 1,
      default_duration TEXT,
      default_frequency TEXT,
      default_instructions TEXT,
      category TEXT,
      indications TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Prescriptions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_code TEXT,
      doctor_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      diagnosis TEXT,
      notes TEXT,
      general_notes TEXT,
      follow_up TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT CHECK(status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  // Medicines table — items on a prescription
  await dbRun(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      formulary_id INTEGER,
      name TEXT NOT NULL,
      type TEXT,
      strength TEXT,
      dosage TEXT,
      quantity INTEGER DEFAULT 1,
      frequency TEXT NOT NULL,
      duration TEXT,
      duration_days INTEGER,
      instructions TEXT,
      morning BOOLEAN DEFAULT 0,
      afternoon BOOLEAN DEFAULT 0,
      evening BOOLEAN DEFAULT 0,
      night BOOLEAN DEFAULT 0,
      morning_time TIME DEFAULT '08:00',
      afternoon_time TIME DEFAULT '13:00',
      evening_time TIME DEFAULT '18:00',
      night_time TIME DEFAULT '21:00',
      before_meal BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
      FOREIGN KEY (formulary_id) REFERENCES medications_formulary(id)
    )
  `);

  // Reminders table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      scheduled_time DATETIME NOT NULL,
      sent BOOLEAN DEFAULT 0,
      sent_at DATETIME,
      acknowledged BOOLEAN DEFAULT 0,
      acknowledged_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  // Notification logs table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('email', 'whatsapp', 'push')) NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT CHECK(status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Indexes
  await dbRun('CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_medicines_prescription ON medicines(prescription_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_time, sent)');

  console.log('Database tables created successfully!');
};

const insertSampleData = async () => {
  const saltRounds = 10;
  const doctorHash = await bcrypt.hash('doctor123', saltRounds);
  const patientHash = await bcrypt.hash('patient123', saltRounds);

  // --- Doctor ---
  await dbRun(`
    INSERT INTO users (email, password, name, phone, whatsapp_number, role, specialization, license_number, clinic_name, clinic_address, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'doctor@example.com', doctorHash, 'Dr. Eleanor Vance, MD',
    '(555) 019-2831', '(555) 019-2831', 'doctor',
    'General Medicine', 'LIC-2024-99843',
    'Vanguard Medical Group', '742 Medical Center Plaza, Suite 400', 'Female'
  ]);
  console.log('Doctor created: doctor@example.com / doctor123');

  // --- Patients with vitals ---
  const patients = [
    ['patient@example.com', patientHash, 'Arthur Pendelton', '+1987654321', '+1987654321', 'patient', '1978-03-12', '45 Oak Lane, Hartford', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', '84 kg', '142/92 mmHg', 81, 98, '98.4 °F', 'Hypertension / Mild Headache', 'Routine blood pressure monitoring and follow-up on persistent tension headaches over the last two weeks.', 'Male'],
    ['clara@example.com', patientHash, 'Clara Esparza', '+1987654322', '+1987654322', 'patient', '2000-08-22', '88 Elm St, Boston', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', '59 kg', '115/75 mmHg', 72, 99, '101.5 °F', 'Acute Flu Symptoms', 'Patient reports sudden onset of fever, shivering, body aches, severe cough, and sore throat starting yesterday evening.', 'Female'],
    ['marcus@example.com', patientHash, 'Marcus Sterling', '+1987654323', '+1987654323', 'patient', '2014-01-05', '12 Pine Rd, Springfield', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120', '38 kg', '105/68 mmHg', 92, 94, '98.1 °F', 'Allergic Asthma Exacerbation', 'Brought in by parent due to wheezing, chest tightness, dry cough, and mild shortness of breath triggered by seasonal pollen.', 'Male'],
    ['evelyn@example.com', patientHash, 'Evelyn Sterling', '+1987654324', '+1987654324', 'patient', '1959-11-30', '9 Maple Ave, New Haven', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', '68 kg', '128/82 mmHg', 68, 97, '97.9 °F', 'Type 2 Diabetes & Acid Reflux', 'Quarterly review of blood glucose control and prescription renewal. Complains of recent nighttime heartburn/acid reflux.', 'Female'],
    ['liam@example.com', patientHash, 'Liam O\'Connor', '+1987654325', '+1987654325', 'patient', '1992-06-17', '33 Cedar Blvd, Stamford', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120', '91 kg', '135/85 mmHg', 78, 98, '99.2 °F', 'Infected Right Hand Laceration', 'Sustained a minor cut while gardening 3 days ago. The wound has become increasingly red, warm, painful, and swollen.', 'Male']
  ];

  for (const p of patients) {
    await dbRun(`
      INSERT INTO users (email, password, name, phone, whatsapp_number, role, date_of_birth, address, avatar_url, weight, bp, heart_rate, spo2, temperature, condition, visit_reason, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, p);
  }
  console.log('5 patients created (password: patient123 for all)');

  // --- Medications Formulary ---
  const meds = [
    ['Paracetamol (Acetaminophen)', 'Tablet', '500mg', 20, '5 Days', 'Three Times Daily', 'Take after meals, or as needed for pain/fever. Space doses at least 6 hours apart.', 'Analgesic & Antipyretic', 'fever,pain,headache,shivering,ache,flu,sore throat,swelling,infection'],
    ['Ibuprofen', 'Tablet', '400mg', 15, '5 Days', 'Twice Daily', 'Take strictly after food to avoid stomach irritation. Do not exceed 1200mg daily.', 'NSAID / Antiflammatory', 'pain,headache,inflammation,fever,body aches,swelling,laceration,wound,throat'],
    ['Amoxicillin', 'Capsule', '500mg', 21, '7 Days', 'Three Times Daily', 'Complete the full course even if you feel better. Can be taken with or without food.', 'Penicillin Antibiotic', 'infection,infected,laceration,redness,swollen,wound,bacterial,throat,shivering'],
    ['Azithromycin', 'Tablet', '250mg', 6, '5 Days', 'Once Daily', 'Take 1 hour before or 2 hours after a meal. Day 1: 500mg, Day 2-5: 250mg.', 'Macrolide Antibiotic', 'infection,bronchitis,cough,throat,bacterial,chest tightness'],
    ['Amoxicillin / Clavulanate (Augmentin)', 'Tablet', '875mg/125mg', 14, '7 Days', 'Twice Daily', 'Take at the start of a meal to enhance absorption and minimize stomach upset.', 'Antibacterial Complex', 'infection,wound,bacterial,swollen,infected'],
    ['Dextromethorphan (Robitussin)', 'Syrup', '15mg/5mL', 1, '5 Days', 'Every 6 Hours (As Needed)', 'Measure 10mL using the provided cup. Max 40mL in 24 hours. May cause mild drowsiness.', 'Antitussive (Cough Suppressant)', 'cough,dry cough,flu,throat'],
    ['Albuterol (Salbutamol) HFA Inhaler', 'Inhaler', '90mcg/actuation', 1, 'As Needed', 'Every 4 Hours (As Needed)', '1 to 2 puffs every 4-6 hours for acute shortness of breath or wheezing. Rinse mouth after use.', 'Short-Acting Beta-2 Agonist', 'asthma,wheezing,shortness of breath,breath,tightness,cough'],
    ['Fluticasone Propionate (Flonase)', 'Drops', '50mcg/spray', 1, '1 Month', 'Once Daily', 'Gently blow nose. Instill 1 to 2 sprays in each nostril daily. Shake well before use.', 'Corticosteroid Nasal Spray', 'allergy,allergies,pollen,nasal,congestion,sneezing,asthma'],
    ['Montelukast (Singulair)', 'Tablet', '10mg', 30, '30 Days', 'Once Daily (At Bedtime)', 'Take regularly at night. Helps prevent asthma symptoms and relieves indoor/outdoor allergies.', 'Leukotriene Receptor Antagonist', 'asthma,allergy,allergies,pollen,wheezing,cough,sneezing'],
    ['Lisinopril', 'Tablet', '10mg', 30, '30 Days', 'Once Daily', 'Take at approximately the same time each morning. Avoid potassium-rich diets.', 'ACE Inhibitor (Hypertension)', 'hypertension,blood pressure,bp,cardiovascular'],
    ['Amlodipine', 'Tablet', '5mg', 30, '30 Days', 'Once Daily', 'Can be taken with or without food. Monitor blood pressure weekly.', 'Calcium Channel Blocker', 'hypertension,blood pressure,bp'],
    ['Metformin Hydrochloride', 'Tablet', '500mg ER', 60, '30 Days', 'Twice Daily', 'Take with meals (breakfast and dinner). Do not crush, chew, or break tablets.', 'Biguanide Antidiabetic', 'diabetes,glucose,control,sugar,insulin resistance'],
    ['Omeprazole', 'Capsule', '20mg', 14, '14 Days', 'Once Daily (Before Breakfast)', 'Take 30 to 60 minutes before breakfast. Swallow whole; do not open capsule.', 'Proton Pump Inhibitor (PPI)', 'reflux,heartburn,acid,gerd,stomach,indigestion'],
    ['Cetirizine Hydrochloride', 'Tablet', '10mg', 30, '30 Days', 'Once Daily', 'May be taken with or without meals. May cause mild drowsiness, avoid alcohol.', 'Second-Generation Antihistamine', 'allergy,allergies,sneezing,pollen,hives,itchy,rash'],
    ['Fluconazole', 'Capsule', '150mg', 1, 'Single Dose', 'Once', 'Take as a single dose with water. Report serious rashes or abdominal cramps immediately.', 'Systemic Antifungal', 'fungal,yeast,infection,itchy'],
    ['Hydrocortisone Cream 1%', 'Ointment', '10mg/g', 1, '7 Days', 'Twice Daily', 'Apply a thin layer to the affected clean skin area. Do not cover with airtight bandages.', 'Topical Mild Corticosteroid', 'rash,itchy,inflammation,bite,eczema,laceration'],
    ['Mupirocin 2% Ointment', 'Ointment', '20mg/g', 1, '10 Days', 'Three Times Daily', 'Cleanse skin, apply small amount to infected skin. Wound can be covered in porous gauze.', 'Topical Antibacterial', 'infection,infected,wound,laceration,redness,swollen']
  ];

  for (const m of meds) {
    await dbRun(`
      INSERT INTO medications_formulary (name, type, strength, default_quantity, default_duration, default_frequency, default_instructions, category, indications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, m);
  }
  console.log('17 medications added to formulary');
};

// Run initialization
(async () => {
  try {
    await initDatabase();
    await insertSampleData();
    console.log('Database setup complete!');
    db.close();
  } catch (err) {
    console.error('Database initialization failed:', err);
    db.close();
    process.exit(1);
  }
})();
