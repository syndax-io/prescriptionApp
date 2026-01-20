const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Format medicine schedule
const formatMedicineSchedule = (medicine) => {
  const times = [];
  if (medicine.morning) times.push(`Morning (${medicine.morning_time})`);
  if (medicine.afternoon) times.push(`Afternoon (${medicine.afternoon_time})`);
  if (medicine.evening) times.push(`Evening (${medicine.evening_time})`);
  if (medicine.night) times.push(`Night (${medicine.night_time})`);
  return times.join(', ');
};

// Send prescription email to patient
const sendPrescriptionEmail = async (patient, doctor, prescription) => {
  try {
    // Skip if email credentials not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Skipping email send.');
      console.log('Would send prescription email to:', patient.email);
      return { success: true, message: 'Email skipped (not configured)' };
    }

    const transporter = createTransporter();

    // Build medicine list HTML
    const medicineList = prescription.medicines.map(med => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${med.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${med.dosage}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${formatMedicineSchedule(med)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${med.before_meal ? 'Before meal' : 'After meal'}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${med.instructions || '-'}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #4CAF50; color: white; padding: 10px; text-align: left; }
          .info-box { background: #e7f3fe; border-left: 4px solid #2196F3; padding: 10px; margin: 15px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Prescription</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${patient.name}</strong>,</p>
            <p>You have received a new prescription from <strong>Dr. ${doctor.name}</strong> (${doctor.specialization || 'General Medicine'}).</p>
            
            <div class="info-box">
              <strong>Prescription ID:</strong> #${prescription.id}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Diagnosis:</strong> ${prescription.diagnosis || 'Not specified'}<br>
              <strong>Duration:</strong> ${prescription.startDate} to ${prescription.endDate || 'Ongoing'}
            </div>

            <h3>💊 Prescribed Medicines</h3>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>When to Take</th>
                  <th>Meal</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${medicineList}
              </tbody>
            </table>

            ${prescription.notes ? `
              <div class="warning">
                <strong>⚠️ Doctor's Notes:</strong><br>
                ${prescription.notes}
              </div>
            ` : ''}

            <p>You will receive WhatsApp reminders to take your medicines on time. Make sure your WhatsApp number is updated in the app.</p>
            
            <p>Please log in to the PrescriptionApp to view your full prescription details and manage your reminders.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from PrescriptionApp. Do not reply to this email.</p>
            <p>If you have any questions, please contact your healthcare provider.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PrescriptionApp <noreply@prescriptionapp.com>',
      to: patient.email,
      subject: `New Prescription from Dr. ${doctor.name} - PrescriptionApp`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log('Prescription email sent to:', patient.email);
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Failed to send prescription email:', error);
    return { success: false, message: error.message };
  }
};

// Send reminder email
const sendReminderEmail = async (patient, medicine, scheduledTime) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Skipping reminder email.');
      return { success: true, message: 'Email skipped (not configured)' };
    }

    const transporter = createTransporter();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .reminder-box { background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center; }
          .medicine-name { font-size: 24px; color: #1976d2; }
        </style>
      </head>
      <body>
        <div class="reminder-box">
          <h2>⏰ Medicine Reminder</h2>
          <p>Hi ${patient.name},</p>
          <p>It's time to take your medicine:</p>
          <p class="medicine-name">💊 ${medicine.name}</p>
          <p><strong>Dosage:</strong> ${medicine.dosage}</p>
          <p><strong>Instructions:</strong> ${medicine.instructions || 'Take as directed'}</p>
          <p>${medicine.before_meal ? 'Take before meal' : 'Take after meal'}</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PrescriptionApp <noreply@prescriptionapp.com>',
      to: patient.email,
      subject: `⏰ Medicine Reminder: ${medicine.name}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendPrescriptionEmail, sendReminderEmail };
