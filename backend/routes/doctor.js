const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { verifyToken, isDoctor } = require('../middleware/auth');
const { sendPrescriptionEmail } = require('../services/emailService');
const { generateReminders } = require('../services/reminderService');

const router = express.Router();

// Get all patients with vitals
router.get('/patients', verifyToken, isDoctor, async (req, res) => {
  try {
    const patients = await dbAll(`
      SELECT id, email, name, phone, whatsapp_number, date_of_birth, address,
             avatar_url, weight, bp, heart_rate, spo2, temperature, condition,
             visit_reason, gender
      FROM users 
      WHERE role = 'patient'
      ORDER BY name
    `);

    // Compute age from date_of_birth
    const enriched = patients.map(p => {
      let age = null;
      if (p.date_of_birth) {
        const dob = new Date(p.date_of_birth);
        age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      return { ...p, age };
    });

    res.json({ patients: enriched });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Search patients
router.get('/patients/search', verifyToken, isDoctor, async (req, res) => {
  try {
    const { query } = req.query;
    
    const patients = await dbAll(`
      SELECT id, email, name, phone, whatsapp_number, date_of_birth, address,
             avatar_url, weight, bp, heart_rate, spo2, temperature, condition,
             visit_reason, gender
      FROM users 
      WHERE role = 'patient' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR condition LIKE ?)
      ORDER BY name
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    const enriched = patients.map(p => {
      let age = null;
      if (p.date_of_birth) {
        const dob = new Date(p.date_of_birth);
        age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      return { ...p, age };
    });

    res.json({ patients: enriched });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ error: 'Failed to search patients' });
  }
});

// Get medications formulary
router.get('/formulary', verifyToken, isDoctor, async (req, res) => {
  try {
    const medications = await dbAll('SELECT * FROM medications_formulary ORDER BY name');
    // Parse indications from CSV to array
    const enriched = medications.map(m => ({
      ...m,
      indications: m.indications ? m.indications.split(',').map(s => s.trim()) : []
    }));
    res.json({ medications: enriched });
  } catch (error) {
    console.error('Get formulary error:', error);
    res.status(500).json({ error: 'Failed to fetch formulary' });
  }
});

// Get doctor's prescriptions
router.get('/prescriptions', verifyToken, isDoctor, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT p.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone,
             u.avatar_url as patient_avatar, u.gender as patient_gender,
             u.weight as patient_weight, u.bp as patient_bp, u.heart_rate as patient_heart_rate,
             u.spo2 as patient_spo2, u.temperature as patient_temperature,
             u.condition as patient_condition, u.visit_reason as patient_visit_reason,
             u.date_of_birth as patient_dob
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      WHERE p.doctor_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.created_at DESC';

    const prescriptions = await dbAll(query, params);

    // Fetch medicines + compute patient age
    for (let prescription of prescriptions) {
      prescription.medicines = await dbAll(
        'SELECT * FROM medicines WHERE prescription_id = ?',
        [prescription.id]
      );
      if (prescription.patient_dob) {
        const dob = new Date(prescription.patient_dob);
        prescription.patient_age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    res.json({ prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get single prescription
router.get('/prescriptions/:id', verifyToken, isDoctor, async (req, res) => {
  try {
    const prescription = await dbGet(`
      SELECT p.*, u.name as patient_name, u.email as patient_email, 
             u.phone as patient_phone, u.whatsapp_number as patient_whatsapp
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      WHERE p.id = ? AND p.doctor_id = ?
    `, [req.params.id, req.user.id]);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    prescription.medicines = await dbAll(
      'SELECT * FROM medicines WHERE prescription_id = ?',
      [prescription.id]
    );

    res.json({ prescription });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Create new prescription (supports both legacy and new workspace format)
router.post('/prescriptions', verifyToken, isDoctor, async (req, res) => {
  try {
    const { patientId, diagnosis, notes, generalNotes, followUp, startDate, endDate, medicines, prescriptionCode } = req.body;

    // Validate required fields
    const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];
    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({ 
        error: 'Patient and at least one medicine are required' 
      });
    }

    // Verify patient exists
    const patient = await dbGet('SELECT * FROM users WHERE id = ? AND role = ?', [patientId, 'patient']);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Generate prescription code if not provided
    const code = prescriptionCode || `RX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create prescription
    const prescriptionResult = await dbRun(`
      INSERT INTO prescriptions (doctor_id, patient_id, diagnosis, notes, general_notes, follow_up, start_date, end_date, prescription_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, patientId, diagnosis, notes, generalNotes, followUp, effectiveStartDate, endDate, code]);

    const prescriptionId = prescriptionResult.lastID;

    // Add medicines — supports both old format (dosage/durationDays) and new format (type/strength/quantity/duration)
    for (const medicine of medicines) {
      await dbRun(`
        INSERT INTO medicines (
          prescription_id, formulary_id, name, type, strength, dosage, quantity, frequency, duration, duration_days, instructions,
          morning, afternoon, evening, night,
          morning_time, afternoon_time, evening_time, night_time, before_meal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prescriptionId,
        medicine.formularyId || null,
        medicine.name,
        medicine.type || null,
        medicine.strength || null,
        medicine.dosage || medicine.strength || null,
        medicine.quantity || 1,
        medicine.frequency,
        medicine.duration || null,
        medicine.durationDays || null,
        medicine.instructions,
        medicine.morning ? 1 : 0,
        medicine.afternoon ? 1 : 0,
        medicine.evening ? 1 : 0,
        medicine.night ? 1 : 0,
        medicine.morningTime || '08:00',
        medicine.afternoonTime || '13:00',
        medicine.eveningTime || '18:00',
        medicine.nightTime || '21:00',
        medicine.beforeMeal ? 1 : 0
      ]);
    }

    // Generate reminders for the patient
    try {
      await generateReminders(prescriptionId, patientId, effectiveStartDate, endDate);
    } catch (e) {
      console.warn('Reminder generation skipped:', e.message);
    }

    // Get doctor info
    const doctor = await dbGet('SELECT name, specialization FROM users WHERE id = ?', [req.user.id]);

    // Send email to patient
    try {
      const allMedicines = await dbAll('SELECT * FROM medicines WHERE prescription_id = ?', [prescriptionId]);
      await sendPrescriptionEmail(patient, doctor, { 
        id: prescriptionId, 
        diagnosis, 
        notes, 
        startDate: effectiveStartDate, 
        endDate,
        medicines: allMedicines 
      });
    } catch (e) {
      console.warn('Email notification skipped:', e.message);
    }

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId,
      prescriptionCode: code
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Update prescription status
router.patch('/prescriptions/:id/status', verifyToken, isDoctor, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const prescription = await dbGet(
      'SELECT * FROM prescriptions WHERE id = ? AND doctor_id = ?',
      [req.params.id, req.user.id]
    );

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    await dbRun(
      'UPDATE prescriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'Prescription status updated successfully' });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ error: 'Failed to update prescription status' });
  }
});

// Get doctor's dashboard stats
router.get('/dashboard', verifyToken, isDoctor, async (req, res) => {
  try {
    const totalPatients = await dbGet(`
      SELECT COUNT(DISTINCT patient_id) as count 
      FROM prescriptions 
      WHERE doctor_id = ?
    `, [req.user.id]);

    const activePrescriptions = await dbGet(`
      SELECT COUNT(*) as count 
      FROM prescriptions 
      WHERE doctor_id = ? AND status = 'active'
    `, [req.user.id]);

    const recentPrescriptions = await dbAll(`
      SELECT p.*, u.name as patient_name
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({
      stats: {
        totalPatients: totalPatients.count,
        activePrescriptions: activePrescriptions.count
      },
      recentPrescriptions
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
