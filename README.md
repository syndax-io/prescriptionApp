# PrescriptionApp

A clinical prescription management system connecting doctors and patients. Doctors use a real-time workspace to diagnose, prescribe medications from a built-in formulary, and generate printable Rx slips. Patients receive email and WhatsApp reminders for their medicines.

## Features

### Doctor Workspace
- Full-screen clinical desk with patient queue, vitals monitoring, and diagnosis-driven prescription authoring
- Built-in medication formulary with keyword-based auto-suggestions (type "fever" or "infection" and matching drugs surface automatically)
- Editable prescription lines (quantity, frequency, duration, instructions) before issuing
- Printable Rx prescription slip generation
- Prescription history archive with clone / re-issue support
- Light and dark theme support

### Patient Portal
- View prescriptions and medicine details
- Receive WhatsApp reminders at scheduled times
- Email notifications for new prescriptions
- Mark medicines as taken, track daily progress

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js, Express, SQLite, JWT, Nodemailer, Twilio, node-cron |
| Frontend | React 18, Parcel, Tailwind CSS, Framer Motion, Lucide React, Axios |

## Project Structure

```
prescriptionApp/
├── backend/
│   ├── config/database.js            # SQLite connection + helpers
│   ├── middleware/auth.js            # JWT verification
│   ├── routes/
│   │   ├── auth.js                   # Register, login, profile
│   │   ├── doctor.js                 # Patients, formulary, prescriptions
│   │   ├── patient.js                # Patient dashboard, reminders
│   │   └── prescription.js           # Shared prescription access
│   ├── services/
│   │   ├── emailService.js           # Email notifications
│   │   ├── whatsappService.js        # WhatsApp via Twilio
│   │   ├── reminderService.js        # Reminder generation
│   │   └── reminderScheduler.js      # Cron scheduler
│   ├── scripts/initDb.js            # Database schema + seed data
│   ├── server.js                     # Express entry point
│   └── .env                          # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── doctor/               # Workspace components
│   │   │   │   ├── PatientQueue.jsx
│   │   │   │   ├── PrescriptionForm.jsx
│   │   │   │   ├── SuggestionSidebar.jsx
│   │   │   │   └── RxPrescriptionSlip.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── doctor/Workspace.jsx  # Main doctor workspace
│   │   │   ├── patient/              # Patient pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
├── start.sh                          # Single-command startup (bash)
├── start.js                          # Single-command startup (node)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+

### Quick Start

```bash
# Using the bash startup script
./start.sh

# Or using Node.js
npm start
```

This will:
1. Install backend and frontend dependencies (if missing)
2. Initialize the database with seed data (if missing)
3. Start the backend API server
4. Start the frontend dev server

### Manual Setup

```bash
# Backend
cd backend
npm install
npm run init-db
npm start

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Access

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:9000/api |
| API Health | http://localhost:9000/api/health |

Ports are configured in `backend/.env` (PORT) and `frontend/package.json` (--port flag). The startup scripts read these dynamically.

### Demo Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Doctor  | doctor@example.com  | doctor123   |
| Patient | patient@example.com | patient123  |

Additional test patients: clara@example.com, marcus@example.com, evelyn@example.com, liam@example.com (all use password `patient123`).

## Configuration

### Environment Variables

Create or edit `backend/.env`:

```env
PORT=9000
JWT_SECRET=your-secret-key

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=PrescriptionApp <your-email@gmail.com>

# WhatsApp via Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### WhatsApp Setup

1. Create a Twilio account at twilio.com
2. Enable the WhatsApp Sandbox in the Twilio Console
3. Add credentials to `backend/.env`
4. Patients opt in by sending the sandbox join message

### Email Setup

1. Enable 2FA on your Gmail account
2. Generate an App-Specific Password
3. Add the credentials to `backend/.env`

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Current user profile |
| PUT  | /api/auth/profile | Update profile |
| PUT  | /api/auth/change-password | Change password |

### Doctor

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/doctor/dashboard | Dashboard statistics |
| GET  | /api/doctor/patients | All patients with vitals |
| GET  | /api/doctor/patients/search | Search patients |
| GET  | /api/doctor/formulary | Medication catalog |
| GET  | /api/doctor/prescriptions | Prescription history |
| POST | /api/doctor/prescriptions | Issue new prescription |
| GET  | /api/doctor/prescriptions/:id | Single prescription |
| PATCH | /api/doctor/prescriptions/:id/status | Update status |

### Patient

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/patient/dashboard | Dashboard data |
| GET  | /api/patient/prescriptions | Prescription list |
| GET  | /api/patient/prescriptions/:id | Prescription detail |
| GET  | /api/patient/reminders/today | Today's reminders |
| GET  | /api/patient/reminders/upcoming | Upcoming reminders |
| POST | /api/patient/reminders/:id/acknowledge | Mark as taken |
| PUT  | /api/patient/whatsapp | Update WhatsApp number |

## Database Schema

### Users
Fields: id, email, password, name, phone, whatsapp_number, role, gender, avatar_url.
Doctor-specific: specialization, license_number, clinic_name, clinic_address.
Patient-specific: date_of_birth, address, weight, bp, heart_rate, spo2, temperature, condition, visit_reason.

### Medications Formulary
Fields: id, name, type, strength, default_quantity, default_duration, default_frequency, default_instructions, category, indications.

### Prescriptions
Fields: id, prescription_code, doctor_id, patient_id, diagnosis, notes, general_notes, follow_up, start_date, end_date, status.

### Medicines
Fields: id, prescription_id, formulary_id, name, type, strength, quantity, frequency, duration, instructions, timing flags (morning/afternoon/evening/night with times), before_meal.

### Reminders
Fields: id, medicine_id, patient_id, scheduled_time, sent, acknowledged, timestamps.

## License

MIT