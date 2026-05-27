import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'

// Doctor Pages — new workspace replaces old pages
import DoctorWorkspace from './pages/doctor/Workspace'

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} />} />

      {/* Doctor — full-screen workspace (no Layout wrapper) */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorWorkspace />
        </ProtectedRoute>
      } />

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
