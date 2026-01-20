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
  // Enable foreign keys
  await dbRun('PRAGMA foreign_keys = ON');

  // Users table (for both doctors and patients)
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
      date_of_birth DATE,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Prescriptions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      diagnosis TEXT,
      notes TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT CHECK(status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  // Medicines table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
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
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
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

  // Create indexes
  await dbRun('CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_medicines_prescription ON medicines(prescription_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_time, sent)');

  console.log('Database tables created successfully!');
};

const insertSampleData = async () => {
  const saltRounds = 10;
  
  // Hash passwords
  const doctorHash = await bcrypt.hash('doctor123', saltRounds);
  const patientHash = await bcrypt.hash('patient123', saltRounds);
  
  // Sample doctor
  await dbRun(`
    INSERT INTO users (email, password, name, phone, whatsapp_number, role, specialization, license_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['doctor@example.com', doctorHash, 'Dr. John Smith', '+1234567890', '+1234567890', 'doctor', 'General Medicine', 'MD12345']);
  console.log('Sample doctor created: doctor@example.com / doctor123');
  
  // Sample patient
  await dbRun(`
    INSERT INTO users (email, password, name, phone, whatsapp_number, role, date_of_birth, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, ['patient@example.com', patientHash, 'Jane Doe', '+1987654321', '+1987654321', 'patient', '1990-05-15', '123 Main St, City']);
  console.log('Sample patient created: patient@example.com / patient123');
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
