import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorPatients from './pages/doctor/Patients'
import DoctorPrescriptions from './pages/doctor/Prescriptions'
import CreatePrescription from './pages/doctor/CreatePrescription'
import DoctorPrescriptionDetail from './pages/doctor/PrescriptionDetail'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientPrescriptions from './pages/patient/Prescriptions'
import PatientReminders from './pages/patient/Reminders'
import PatientPrescriptionDetail from './pages/patient/PrescriptionDetail'

// Common Pages
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} />} />

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="prescriptions/new" element={<CreatePrescription />} />
        <Route path="prescriptions/:id" element={<DoctorPrescriptionDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Patient Routes */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<PatientDashboard />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="prescriptions/:id" element={<PatientPrescriptionDetail />} />
        <Route path="reminders" element={<PatientReminders />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
