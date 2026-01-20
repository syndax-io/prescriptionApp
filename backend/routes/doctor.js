const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { verifyToken, isDoctor } = require('../middleware/auth');
const { sendPrescriptionEmail } = require('../services/emailService');
const { generateReminders } = require('../services/reminderService');

const router = express.Router();

// Get all patients (for doctor to select when creating prescription)
router.get('/patients', verifyToken, isDoctor, async (req, res) => {
  try {
    const patients = await dbAll(`
      SELECT id, email, name, phone, whatsapp_number, date_of_birth, address
      FROM users 
      WHERE role = 'patient'
      ORDER BY name
    `);

    res.json({ patients });
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
      SELECT id, email, name, phone, whatsapp_number, date_of_birth, address
      FROM users 
      WHERE role = 'patient' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)
      ORDER BY name
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

    res.json({ patients });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ error: 'Failed to search patients' });
  }
});

// Get doctor's prescriptions
router.get('/prescriptions', verifyToken, isDoctor, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT p.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone
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

    // Fetch medicines for each prescription
    for (let prescription of prescriptions) {
      prescription.medicines = await dbAll(
        'SELECT * FROM medicines WHERE prescription_id = ?',
        [prescription.id]
      );
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

// Create new prescription
router.post('/prescriptions', verifyToken, isDoctor, async (req, res) => {
  try {
    const { patientId, diagnosis, notes, startDate, endDate, medicines } = req.body;

    // Validate required fields
    if (!patientId || !startDate || !medicines || medicines.length === 0) {
      return res.status(400).json({ 
        error: 'Patient, start date, and at least one medicine are required' 
      });
    }

    // Verify patient exists
    const patient = await dbGet('SELECT * FROM users WHERE id = ? AND role = ?', [patientId, 'patient']);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create prescription
    const prescriptionResult = await dbRun(`
      INSERT INTO prescriptions (doctor_id, patient_id, diagnosis, notes, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, patientId, diagnosis, notes, startDate, endDate]);

    const prescriptionId = prescriptionResult.lastID;

    // Add medicines
    for (const medicine of medicines) {
      await dbRun(`
        INSERT INTO medicines (
          prescription_id, name, dosage, frequency, duration_days, instructions,
          morning, afternoon, evening, night,
          morning_time, afternoon_time, evening_time, night_time, before_meal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prescriptionId,
        medicine.name,
        medicine.dosage,
        medicine.frequency,
        medicine.durationDays,
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
    await generateReminders(prescriptionId, patientId, startDate, endDate);

    // Get doctor info
    const doctor = await dbGet('SELECT name, specialization FROM users WHERE id = ?', [req.user.id]);

    // Send email to patient
    const allMedicines = await dbAll('SELECT * FROM medicines WHERE prescription_id = ?', [prescriptionId]);
    await sendPrescriptionEmail(patient, doctor, { 
      id: prescriptionId, 
      diagnosis, 
      notes, 
      startDate, 
      endDate,
      medicines: allMedicines 
    });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId
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
