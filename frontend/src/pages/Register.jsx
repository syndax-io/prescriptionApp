import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsappNumber: '',
    role: 'patient',
    specialization: '',
    licenseNumber: '',
    dateOfBirth: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-fill WhatsApp number with phone number
      ...(name === 'phone' && !prev.whatsappNumber ? { whatsappNumber: value } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (formData.role === 'doctor' && (!formData.specialization || !formData.licenseNumber)) {
      toast.error('Doctors must provide specialization and license number')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...userData } = formData
      const user = await register(userData)
      toast.success('Registration successful!')
      navigate(`/${user.role}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            💊 PrescriptionApp
          </h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Role Selection */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
            className={`flex-1 py-4 rounded-lg border-2 transition-colors ${
              formData.role === 'patient'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl block mb-2">🏥</span>
            <span className="font-medium">I'm a Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
            className={`flex-1 py-4 rounded-lg border-2 transition-colors ${
              formData.role === 'doctor'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl block mb-2">👨‍⚕️</span>
            <span className="font-medium">I'm a Doctor</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Password *</label>
              <input
                type="password"
                name="password"
                className="input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="input"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsappNumber"
                className="input"
                placeholder="+1234567890 (for reminders)"
                value={formData.whatsappNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Doctor-specific fields */}
          {formData.role === 'doctor' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  className="input"
                  placeholder="e.g., General Medicine"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  className="input"
                  placeholder="Medical license number"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Patient-specific fields */}
          {formData.role === 'patient' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="input"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
