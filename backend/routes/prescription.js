const express = require('express');
const { dbGet, dbAll } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get prescription by ID (accessible by both doctor who created it and patient it belongs to)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'doctor') {
      query = `
        SELECT p.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone
        FROM prescriptions p
        JOIN users u ON p.patient_id = u.id
        WHERE p.id = ? AND p.doctor_id = ?
      `;
      params = [req.params.id, req.user.id];
    } else {
      query = `
        SELECT p.*, u.name as doctor_name, u.specialization as doctor_specialization
        FROM prescriptions p
        JOIN users u ON p.doctor_id = u.id
        WHERE p.id = ? AND p.patient_id = ?
      `;
      params = [req.params.id, req.user.id];
    }

    const prescription = await dbGet(query, params);

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

// Get medicines for a prescription
router.get('/:id/medicines', verifyToken, async (req, res) => {
  try {
    // First verify user has access to this prescription
    const prescription = await dbGet(`
      SELECT * FROM prescriptions 
      WHERE id = ? AND (doctor_id = ? OR patient_id = ?)
    `, [req.params.id, req.user.id, req.user.id]);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const medicines = await dbAll(
      'SELECT * FROM medicines WHERE prescription_id = ?',
      [req.params.id]
    );

    res.json({ medicines });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

module.exports = router;
