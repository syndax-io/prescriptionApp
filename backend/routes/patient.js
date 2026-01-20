const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { verifyToken, isPatient } = require('../middleware/auth');

const router = express.Router();

// Get patient's prescriptions
router.get('/prescriptions', verifyToken, isPatient, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT p.*, u.name as doctor_name, u.specialization as doctor_specialization
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      WHERE p.patient_id = ?
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

// Get single prescription details
router.get('/prescriptions/:id', verifyToken, isPatient, async (req, res) => {
  try {
    const prescription = await dbGet(`
      SELECT p.*, u.name as doctor_name, u.specialization as doctor_specialization,
             u.phone as doctor_phone
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      WHERE p.id = ? AND p.patient_id = ?
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

// Get today's reminders
router.get('/reminders/today', verifyToken, isPatient, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const reminders = await dbAll(`
      SELECT r.*, m.name as medicine_name, m.dosage, m.instructions, m.before_meal
      FROM reminders r
      JOIN medicines m ON r.medicine_id = m.id
      WHERE r.patient_id = ? 
        AND DATE(r.scheduled_time) = ?
      ORDER BY r.scheduled_time
    `, [req.user.id, today]);

    res.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get upcoming reminders
router.get('/reminders/upcoming', verifyToken, isPatient, async (req, res) => {
  try {
    const now = new Date().toISOString();
    
    const reminders = await dbAll(`
      SELECT r.*, m.name as medicine_name, m.dosage, m.instructions, m.before_meal
      FROM reminders r
      JOIN medicines m ON r.medicine_id = m.id
      WHERE r.patient_id = ? 
        AND r.scheduled_time >= ?
        AND r.sent = 0
      ORDER BY r.scheduled_time
      LIMIT 10
    `, [req.user.id, now]);

    res.json({ reminders });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Acknowledge reminder (mark medicine as taken)
router.post('/reminders/:id/acknowledge', verifyToken, isPatient, async (req, res) => {
  try {
    const reminder = await dbGet(
      'SELECT * FROM reminders WHERE id = ? AND patient_id = ?',
      [req.params.id, req.user.id]
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    await dbRun(`
      UPDATE reminders 
      SET acknowledged = 1, acknowledged_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [req.params.id]);

    res.json({ message: 'Medicine marked as taken' });
  } catch (error) {
    console.error('Acknowledge reminder error:', error);
    res.status(500).json({ error: 'Failed to acknowledge reminder' });
  }
});

// Get patient dashboard
router.get('/dashboard', verifyToken, isPatient, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Active prescriptions count
    const activePrescriptions = await dbGet(`
      SELECT COUNT(*) as count 
      FROM prescriptions 
      WHERE patient_id = ? AND status = 'active'
    `, [req.user.id]);

    // Today's reminders count
    const todayReminders = await dbGet(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN acknowledged = 1 THEN 1 ELSE 0 END) as taken
      FROM reminders
      WHERE patient_id = ? AND DATE(scheduled_time) = ?
    `, [req.user.id, today]);

    // Next medicine reminder
    const nextReminder = await dbGet(`
      SELECT r.*, m.name as medicine_name, m.dosage
      FROM reminders r
      JOIN medicines m ON r.medicine_id = m.id
      WHERE r.patient_id = ? 
        AND r.scheduled_time >= ?
        AND r.acknowledged = 0
      ORDER BY r.scheduled_time
      LIMIT 1
    `, [req.user.id, now]);

    // Recent prescriptions
    const recentPrescriptions = await dbAll(`
      SELECT p.*, u.name as doctor_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
      LIMIT 3
    `, [req.user.id]);

    res.json({
      stats: {
        activePrescriptions: activePrescriptions.count,
        todayTotal: todayReminders.total || 0,
        todayTaken: todayReminders.taken || 0
      },
      nextReminder,
      recentPrescriptions
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Update WhatsApp number for notifications
router.put('/whatsapp', verifyToken, isPatient, async (req, res) => {
  try {
    const { whatsappNumber } = req.body;

    if (!whatsappNumber) {
      return res.status(400).json({ error: 'WhatsApp number is required' });
    }

    await dbRun(
      'UPDATE users SET whatsapp_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [whatsappNumber, req.user.id]
    );

    res.json({ message: 'WhatsApp number updated successfully' });
  } catch (error) {
    console.error('Update WhatsApp error:', error);
    res.status(500).json({ error: 'Failed to update WhatsApp number' });
  }
});

module.exports = router;
