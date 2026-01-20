# 💊 PrescriptionApp - Medicine Reminder System

A comprehensive prescription management system that connects doctors and patients. Doctors can create digital prescriptions, and patients receive timely WhatsApp reminders to take their medicines.

## ✨ Features

### For Doctors
- 🩺 Create digital prescriptions with multiple medicines
- 👥 Manage and view all patients
- ⏰ Set medicine schedules (morning, afternoon, evening, night)
- 📧 Automatic email notifications to patients
- 📊 Dashboard with prescription statistics
- 📋 View and manage all prescriptions

### For Patients
- 📱 Receive WhatsApp reminders for medicines
- 📧 Email notifications for new prescriptions
- ✅ Mark medicines as taken
- 📊 Track daily medicine progress
- 📋 View all prescriptions and details
- 👤 Update profile and WhatsApp number

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Twilio** for WhatsApp notifications
- **node-cron** for scheduling reminders

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **react-hot-toast** for notifications

## 📁 Project Structure

```
prescription-app/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite database configuration
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── doctor.js            # Doctor-specific routes
│   │   ├── patient.js           # Patient-specific routes
│   │   └── prescription.js      # Prescription routes
│   ├── services/
│   │   ├── emailService.js      # Email notification service
│   │   ├── whatsappService.js   # WhatsApp notification service
│   │   ├── reminderService.js   # Reminder generation service
│   │   └── reminderScheduler.js # Cron job for sending reminders
│   ├── scripts/
│   │   └── initDb.js            # Database initialization script
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx        # Main layout with sidebar
    │   │   └── ProtectedRoute.jsx # Route protection component
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── doctor/           # Doctor pages
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Patients.jsx
    │   │   │   ├── Prescriptions.jsx
    │   │   │   ├── CreatePrescription.jsx
    │   │   │   └── PrescriptionDetail.jsx
    │   │   ├── patient/          # Patient pages
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Prescriptions.jsx
    │   │   │   ├── PrescriptionDetail.jsx
    │   │   │   └── Reminders.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   └── api.js            # Axios API configuration
    │   ├── App.jsx               # Main app with routing
    │   ├── main.jsx              # React entry point
    │   └── index.css             # Tailwind CSS styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Quick Start (Single Command)

```bash
# Option 1: Using Node.js script
npm start

# Option 2: Using bash script
./start.sh
```

This will automatically:
1. ✅ Check and install dependencies
2. ✅ Initialize the database with sample data
3. ✅ Start the backend server (port 5000)
4. ✅ Start the frontend dev server (port 3000)

### First Time Setup

If running for the first time, you can also use:

```bash
# Install all dependencies and setup database
npm run setup

# Then start the app
npm start
```

### Manual Installation

If you prefer to run things separately:

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run init-db   # Initialize database
   npm start         # Start backend server
   ```

2. **Setup Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm install
   npm run dev       # Start frontend server
   ```

### Access the Application
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000/api

### Demo Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Doctor  | doctor@example.com  | doctor123   |
| Patient | patient@example.com | patient123  |

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` in the backend folder and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=PrescriptionApp <your-email@gmail.com>

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Setting up WhatsApp Notifications

1. Create a Twilio account at https://www.twilio.com
2. Enable WhatsApp Sandbox in Twilio Console
3. Add your Twilio credentials to `.env`
4. Patients need to opt-in to the WhatsApp sandbox by sending a message
5. Update patient WhatsApp numbers in their profiles

### Setting up Email Notifications

1. For Gmail, enable 2-Factor Authentication
2. Generate an App-Specific Password
3. Add email credentials to `.env`

## 📱 How It Works

### Creating a Prescription (Doctor)

1. Doctor logs in
2. Goes to "New Prescription"
3. Selects a patient
4. Adds diagnosis and notes
5. Adds medicines with:
   - Medicine name and dosage
   - Schedule (morning, afternoon, evening, night)
   - Time for each slot
   - Before/after meal instructions
   - Duration in days
6. Submits the prescription
7. Patient receives an email with prescription details
8. Reminders are automatically generated

### Receiving Reminders (Patient)

1. Patient receives email notification about new prescription
2. At scheduled times, patient receives WhatsApp messages
3. Patient can log in to the app to:
   - View prescription details
   - See today's schedule
   - Mark medicines as taken
   - Track progress

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Doctor Routes
- `GET /api/doctor/dashboard` - Dashboard stats
- `GET /api/doctor/patients` - List all patients
- `GET /api/doctor/patients/search` - Search patients
- `GET /api/doctor/prescriptions` - List prescriptions
- `POST /api/doctor/prescriptions` - Create prescription
- `GET /api/doctor/prescriptions/:id` - Get prescription
- `PATCH /api/doctor/prescriptions/:id/status` - Update status

### Patient Routes
- `GET /api/patient/dashboard` - Dashboard data
- `GET /api/patient/prescriptions` - List prescriptions
- `GET /api/patient/prescriptions/:id` - Get prescription
- `GET /api/patient/reminders/today` - Today's reminders
- `GET /api/patient/reminders/upcoming` - Upcoming reminders
- `POST /api/patient/reminders/:id/acknowledge` - Mark as taken
- `PUT /api/patient/whatsapp` - Update WhatsApp number

## 📦 Database Schema

### Users
- id, email, password, name, phone, whatsapp_number, role
- Doctor: specialization, license_number
- Patient: date_of_birth, address

### Prescriptions
- id, doctor_id, patient_id, diagnosis, notes
- start_date, end_date, status

### Medicines
- id, prescription_id, name, dosage, frequency
- morning, afternoon, evening, night (with times)
- duration_days, instructions, before_meal

### Reminders
- id, medicine_id, patient_id, scheduled_time
- sent, sent_at, acknowledged, acknowledged_at

## 🎨 Screenshots

The app includes:
- Modern, responsive landing page
- Clean login/register forms
- Doctor dashboard with stats
- Patient dashboard with medicine tracker
- Prescription creation with medicine schedule
- Interactive reminder checklist

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 💬 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ for better healthcare