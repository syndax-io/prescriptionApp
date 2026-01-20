// WhatsApp notification service using Twilio
// To use this service, you need a Twilio account with WhatsApp enabled
// See: https://www.twilio.com/docs/whatsapp

const sendWhatsAppMessage = async (to, message) => {
  try {
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Twilio not configured. Skipping WhatsApp message.');
      console.log('Would send to:', to);
      console.log('Message:', message);
      return { success: true, message: 'WhatsApp skipped (not configured)' };
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Ensure the number is in WhatsApp format
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    const result = await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo
    });

    console.log('WhatsApp message sent:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return { success: false, message: error.message };
  }
};

// Send medicine reminder via WhatsApp
const sendMedicineReminder = async (patient, medicine, scheduledTime) => {
  const timeStr = new Date(scheduledTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const mealInstruction = medicine.before_meal ? 'before meal' : 'after meal';
  
  const message = `
⏰ *Medicine Reminder*

Hi ${patient.name}! 👋

It's time to take your medicine:

💊 *${medicine.name}*
📊 Dosage: ${medicine.dosage}
🍽️ Take ${mealInstruction}
${medicine.instructions ? `📝 Instructions: ${medicine.instructions}` : ''}

Stay healthy! 🌟

_Reply TAKEN when you've taken your medicine._
`.trim();

  return await sendWhatsAppMessage(patient.whatsapp_number, message);
};

// Send prescription notification via WhatsApp
const sendPrescriptionNotification = async (patient, doctor, prescription) => {
  const medicineList = prescription.medicines
    .map(med => `• ${med.name} - ${med.dosage}`)
    .join('\n');

  const message = `
📋 *New Prescription*

Hi ${patient.name}! 👋

You have received a new prescription from *Dr. ${doctor.name}*.

📅 Date: ${new Date().toLocaleDateString()}
🏥 Diagnosis: ${prescription.diagnosis || 'Not specified'}

*Medicines:*
${medicineList}

📧 Check your email for complete details.
📱 You'll receive reminders when it's time to take your medicines.

Stay healthy! 🌟
`.trim();

  return await sendWhatsAppMessage(patient.whatsapp_number, message);
};

// Send daily summary via WhatsApp
const sendDailySummary = async (patient, reminders) => {
  const reminderList = reminders
    .map(r => {
      const time = new Date(r.scheduled_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const status = r.acknowledged ? '✅' : '⏳';
      return `${status} ${time} - ${r.medicine_name}`;
    })
    .join('\n');

  const takenCount = reminders.filter(r => r.acknowledged).length;
  
  const message = `
📊 *Daily Medicine Summary*

Hi ${patient.name}! 👋

Here's your medicine schedule for today:

${reminderList}

Progress: ${takenCount}/${reminders.length} medicines taken

${takenCount === reminders.length ? '🎉 Great job! You\'ve taken all your medicines!' : '💪 Keep going! Your health matters.'}
`.trim();

  return await sendWhatsAppMessage(patient.whatsapp_number, message);
};

module.exports = {
  sendWhatsAppMessage,
  sendMedicineReminder,
  sendPrescriptionNotification,
  sendDailySummary
};
