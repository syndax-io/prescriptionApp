import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { format, formatDistanceToNow } from 'date-fns'

const PatientDashboard = () => {
  const [stats, setStats] = useState({
    activePrescriptions: 0,
    todayTotal: 0,
    todayTaken: 0
  })
  const [nextReminder, setNextReminder] = useState(null)
  const [recentPrescriptions, setRecentPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/patient/dashboard')
      setStats(response.data.stats)
      setNextReminder(response.data.nextReminder)
      setRecentPrescriptions(response.data.recentPrescriptions)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const progressPercentage = stats.todayTotal > 0 
    ? Math.round((stats.todayTaken / stats.todayTotal) * 100) 
    : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Health Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Today's Progress */}
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100">Today's Progress</p>
              <p className="text-4xl font-bold mt-2">{stats.todayTaken}/{stats.todayTotal}</p>
            </div>
            <div className="text-5xl opacity-80">💊</div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm mt-2 text-primary-100">{progressPercentage}% completed</p>
        </div>

        {/* Active Prescriptions */}
        <div className="card bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Prescriptions</p>
              <p className="text-4xl font-bold mt-2">{stats.activePrescriptions}</p>
            </div>
            <div className="text-5xl opacity-80">📋</div>
          </div>
          <Link 
            to="/patient/prescriptions" 
            className="inline-block mt-4 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
          >
            View All →
          </Link>
        </div>

        {/* Next Reminder */}
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Next Medicine</p>
              {nextReminder ? (
                <>
                  <p className="text-xl font-bold mt-2">{nextReminder.medicine_name}</p>
                  <p className="text-orange-100 text-sm">
                    {formatDistanceToNow(new Date(nextReminder.scheduled_time), { addSuffix: true })}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold mt-2">All done! 🎉</p>
              )}
            </div>
            <div className="text-5xl opacity-80">⏰</div>
          </div>
          <Link 
            to="/patient/reminders" 
            className="inline-block mt-4 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
          >
            View Reminders →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/patient/reminders" className="btn btn-primary">
            ⏰ Today's Reminders
          </Link>
          <Link to="/patient/prescriptions" className="btn btn-secondary">
            📋 My Prescriptions
          </Link>
          <Link to="/patient/profile" className="btn btn-secondary">
            👤 Update WhatsApp Number
          </Link>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Prescriptions</h2>
          <Link to="/patient/prescriptions" className="text-primary-600 hover:underline text-sm">
            View All →
          </Link>
        </div>

        {recentPrescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📋</p>
            <p>No prescriptions yet</p>
            <p className="text-sm">Your prescriptions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPrescriptions.map((prescription) => (
              <div 
                key={prescription.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    prescription.status === 'active' ? 'bg-green-500' :
                    prescription.status === 'completed' ? 'bg-gray-400' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Dr. {prescription.doctor_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {prescription.diagnosis || 'Prescription'} • 
                      {format(new Date(prescription.created_at), ' MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/patient/prescriptions/${prescription.id}`}
                  className="btn btn-secondary text-sm"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Reminder Info */}
      <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-start gap-4">
          <span className="text-4xl">📱</span>
          <div>
            <h3 className="font-semibold text-green-800 mb-2">WhatsApp Reminders</h3>
            <p className="text-green-700 text-sm">
              You'll receive medicine reminders on WhatsApp at the scheduled times. 
              Make sure your WhatsApp number is updated in your profile to receive notifications.
            </p>
            <Link to="/patient/profile" className="text-green-600 hover:underline text-sm font-medium mt-2 inline-block">
              Update WhatsApp Number →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
