import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDoctor = user?.role === 'doctor'
  const baseRoute = isDoctor ? '/doctor' : '/patient'

  const doctorLinks = [
    { path: '/doctor', label: 'Dashboard', icon: '🏠' },
    { path: '/doctor/patients', label: 'Patients', icon: '👥' },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: '📋' },
    { path: '/doctor/prescriptions/new', label: 'New Prescription', icon: '➕' },
  ]

  const patientLinks = [
    { path: '/patient', label: 'Dashboard', icon: '🏠' },
    { path: '/patient/prescriptions', label: 'My Prescriptions', icon: '📋' },
    { path: '/patient/reminders', label: 'Reminders', icon: '⏰' },
  ]

  const links = isDoctor ? doctorLinks : patientLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-primary-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            💊 PrescriptionApp
          </h1>
          <p className="text-primary-200 text-sm mt-1">
            {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
          </p>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-100 hover:bg-primary-700'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-primary-200">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`${baseRoute}/profile`}
              className="flex-1 btn btn-secondary text-center text-sm"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 btn bg-primary-700 hover:bg-primary-600 text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">💊 PrescriptionApp</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-primary-800 text-white pt-16">
          <nav className="p-4">
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      location.pathname === link.path
                        ? 'bg-primary-700'
                        : 'hover:bg-primary-700'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={`${baseRoute}/profile`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-700"
                >
                  <span>👤</span>
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-700 w-full text-left"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-16 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
