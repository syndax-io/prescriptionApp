const cron = require('node-cron');
const { getPendingReminders, markReminderSent, getTodayReminders } = require('./reminderService');
const { sendMedicineReminder, sendDailySummary } = require('./whatsappService');
const { sendReminderEmail } = require('./emailService');
const { dbRun, dbAll } = require('../config/database');

// Process pending reminders
const processReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get reminders that should be sent now (within 5 minute window)
    const pendingReminders = await getPendingReminders(
      fiveMinutesAgo.toISOString(),
      fiveMinutesFromNow.toISOString()
    );

    console.log(`Found ${pendingReminders.length} pending reminders`);

    for (const reminder of pendingReminders) {
      try {
        // Send WhatsApp notification
        const whatsappResult = await sendMedicineReminder(
          {
            name: reminder.patient_name,
            whatsapp_number: reminder.whatsapp_number
          },
          {
            name: reminder.medicine_name,
            dosage: reminder.dosage,
            instructions: reminder.instructions,
            before_meal: reminder.before_meal
          },
          reminder.scheduled_time
        );

        // Also send email reminder
        await sendReminderEmail(
          {
            name: reminder.patient_name,
            email: reminder.patient_email
          },
          {
            name: reminder.medicine_name,
            dosage: reminder.dosage,
            instructions: reminder.instructions,
            before_meal: reminder.before_meal
          },
          reminder.scheduled_time
        );

        // Mark reminder as sent
        await markReminderSent(reminder.id);

        // Log notification
        await dbRun(`
          INSERT INTO notification_logs (user_id, type, subject, message, status)
          VALUES (?, ?, ?, ?, ?)
        `, [
          reminder.patient_id,
          'whatsapp',
          'Medicine Reminder',
          `Reminder for ${reminder.medicine_name}`,
          whatsappResult.success ? 'sent' : 'failed'
        ]);

        console.log(`Sent reminder for ${reminder.medicine_name} to ${reminder.patient_name}`);
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
};

// Send daily summary to patients
const sendDailySummaries = async () => {
  try {
    // Get all patients with active prescriptions
    const patients = await dbAll(`
      SELECT DISTINCT u.id, u.name, u.whatsapp_number
      FROM users u
      JOIN prescriptions p ON u.id = p.patient_id
      WHERE u.role = 'patient' 
        AND p.status = 'active'
        AND u.whatsapp_number IS NOT NULL
    `);

    for (const patient of patients) {
      const todayReminders = await getTodayReminders(patient.id);
      
      if (todayReminders.length > 0) {
        await sendDailySummary(patient, todayReminders);
        console.log(`Sent daily summary to ${patient.name}`);
      }
    }
  } catch (error) {
    console.error('Error sending daily summaries:', error);
  }
};

// Start the scheduler
const startReminderScheduler = () => {
  // Run reminder check every minute
  cron.schedule('* * * * *', () => {
    console.log('Checking for pending reminders...');
    processReminders();
  });

  // Send daily summary at 8 AM
  cron.schedule('0 8 * * *', () => {
    console.log('Sending daily summaries...');
    sendDailySummaries();
  });

  // Send evening summary at 8 PM
  cron.schedule('0 20 * * *', () => {
    console.log('Sending evening summaries...');
    sendDailySummaries();
  });

  console.log('Reminder scheduler initialized');
};

module.exports = { startReminderScheduler, processReminders, sendDailySummaries };
