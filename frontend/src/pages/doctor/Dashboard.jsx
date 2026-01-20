import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { format } from 'date-fns'

const DoctorDashboard = () => {
  const [stats, setStats] = useState({ totalPatients: 0, activePrescriptions: 0 })
  const [recentPrescriptions, setRecentPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/doctor/dashboard')
      setStats(response.data.stats)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
        <Link to="/doctor/prescriptions/new" className="btn btn-primary">
          ➕ New Prescription
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">Total Patients</p>
              <p className="text-4xl font-bold mt-2">{stats.totalPatients}</p>
            </div>
            <div className="text-5xl opacity-80">👥</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Prescriptions</p>
              <p className="text-4xl font-bold mt-2">{stats.activePrescriptions}</p>
            </div>
            <div className="text-5xl opacity-80">📋</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Quick Actions</p>
              <div className="flex gap-2 mt-3">
                <Link to="/doctor/prescriptions/new" className="btn bg-white/20 hover:bg-white/30 text-white text-sm">
                  Add Prescription
                </Link>
              </div>
            </div>
            <div className="text-5xl opacity-80">⚡</div>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Prescriptions</h2>
          <Link to="/doctor/prescriptions" className="text-primary-600 hover:underline text-sm">
            View All →
          </Link>
        </div>

        {recentPrescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📋</p>
            <p>No prescriptions yet</p>
            <Link to="/doctor/prescriptions/new" className="text-primary-600 hover:underline">
              Create your first prescription
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Diagnosis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{prescription.patient_name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {prescription.diagnosis || 'Not specified'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(prescription.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : prescription.status === 'completed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        to={`/doctor/prescriptions/${prescription.id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
