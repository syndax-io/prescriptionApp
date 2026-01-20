const { dbRun, dbGet, dbAll } = require('../config/database');

// Generate reminders for a prescription
const generateReminders = async (prescriptionId, patientId, startDate, endDate) => {
  try {
    // Get all medicines for this prescription
    const medicines = await dbAll(
      'SELECT * FROM medicines WHERE prescription_id = ?',
      [prescriptionId]
    );

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    for (const medicine of medicines) {
      const durationDays = medicine.duration_days || Math.ceil((end - start) / (24 * 60 * 60 * 1000));
      
      // Generate reminders for each day
      for (let day = 0; day < durationDays; day++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + day);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Generate reminder for each time slot
        if (medicine.morning) {
          await createReminder(medicine.id, patientId, `${dateStr}T${medicine.morning_time}:00`);
        }
        if (medicine.afternoon) {
          await createReminder(medicine.id, patientId, `${dateStr}T${medicine.afternoon_time}:00`);
        }
        if (medicine.evening) {
          await createReminder(medicine.id, patientId, `${dateStr}T${medicine.evening_time}:00`);
        }
        if (medicine.night) {
          await createReminder(medicine.id, patientId, `${dateStr}T${medicine.night_time}:00`);
        }
      }
    }

    console.log(`Generated reminders for prescription ${prescriptionId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to generate reminders:', error);
    return { success: false, error: error.message };
  }
};

// Create a single reminder
const createReminder = async (medicineId, patientId, scheduledTime) => {
  try {
    await dbRun(`
      INSERT INTO reminders (medicine_id, patient_id, scheduled_time)
      VALUES (?, ?, ?)
    `, [medicineId, patientId, scheduledTime]);
    return { success: true };
  } catch (error) {
    console.error('Failed to create reminder:', error);
    return { success: false, error: error.message };
  }
};

// Get pending reminders for a specific time window
const getPendingReminders = async (fromTime, toTime) => {
  try {
    const reminders = await dbAll(`
      SELECT r.*, m.name as medicine_name, m.dosage, m.instructions, m.before_meal,
             u.name as patient_name, u.email as patient_email, u.whatsapp_number,
             p.status as prescription_status
      FROM reminders r
      JOIN medicines m ON r.medicine_id = m.id
      JOIN users u ON r.patient_id = u.id
      JOIN prescriptions p ON m.prescription_id = p.id
      WHERE r.scheduled_time >= ? 
        AND r.scheduled_time <= ?
        AND r.sent = 0
        AND p.status = 'active'
      ORDER BY r.scheduled_time
    `, [fromTime, toTime]);

    return reminders;
  } catch (error) {
    console.error('Failed to get pending reminders:', error);
    return [];
  }
};

// Mark reminder as sent
const markReminderSent = async (reminderId) => {
  try {
    await dbRun(`
      UPDATE reminders 
      SET sent = 1, sent_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [reminderId]);
    return { success: true };
  } catch (error) {
    console.error('Failed to mark reminder as sent:', error);
    return { success: false };
  }
};

// Get today's reminders for a patient
const getTodayReminders = async (patientId) => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const reminders = await dbAll(`
      SELECT r.*, m.name as medicine_name, m.dosage, m.instructions, m.before_meal
      FROM reminders r
      JOIN medicines m ON r.medicine_id = m.id
      WHERE r.patient_id = ? AND DATE(r.scheduled_time) = ?
      ORDER BY r.scheduled_time
    `, [patientId, today]);

    return reminders;
  } catch (error) {
    console.error('Failed to get today reminders:', error);
    return [];
  }
};

module.exports = {
  generateReminders,
  createReminder,
  getPendingReminders,
  markReminderSent,
  getTodayReminders
};
