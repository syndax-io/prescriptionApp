const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const prescriptionRoutes = require('./routes/prescription');

// Import reminder scheduler
const { startReminderScheduler } = require('./services/reminderScheduler');

// Initialize express app
const app = express();

// Log all incoming API requests (very helpful to debug container/proxy issues)
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'none'} | User-Agent: ${req.headers['user-agent']?.slice(0,60) || 'n/a'}`);
  next();
});

// Explicit OPTIONS preflight handler - MUST be early.
// Some reverse proxies, container port-forwarders, nginx, Traefik, etc.
// return 501/405 for OPTIONS before the request ever reaches normal routes.
// This guarantees browsers can complete CORS preflight for login etc.
app.options('*', (req, res) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  return res.status(204).end();
});

// Middleware - Allow CORS from any localhost port for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin (including 127.0.0.1 which some browsers use)
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
      return callback(null, true);
    }
    
    // Allow configured frontend URL
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Prescription App API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the reminder scheduler
  startReminderScheduler();
  console.log('Reminder scheduler started');
});

module.exports = app;
