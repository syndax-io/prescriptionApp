import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsappNumber: user?.whatsappNumber || user?.whatsapp_number || '',
    address: user?.address || '',
    specialization: user?.specialization || ''
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success('Password changed successfully')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

      {/* Profile Info Card */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input bg-gray-100"
              value={user?.email}
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="input"
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
                placeholder="For medicine reminders"
                value={formData.whatsappNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {user?.role === 'doctor' && (
            <div>
              <label className="label">Specialization</label>
              <input
                type="text"
                name="specialization"
                className="input"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>
          )}

          {user?.role === 'patient' && (
            <div>
              <label className="label">Address</label>
              <textarea
                name="address"
                className="input"
                rows="2"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              className="input"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="input"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="input"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn btn-primary"
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Account Information</h3>
        <p className="text-sm text-gray-500">
          Role: <span className="capitalize font-medium text-gray-700">{user?.role}</span>
        </p>
        <p className="text-sm text-gray-500">
          Account ID: <span className="font-medium text-gray-700">#{user?.id}</span>
        </p>
      </div>
    </div>
  )
}

export default Profile
