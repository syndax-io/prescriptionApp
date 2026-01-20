import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { format } from 'date-fns'

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [statusFilter])

  const fetchPrescriptions = async () => {
    try {
      const url = statusFilter 
        ? `/doctor/prescriptions?status=${statusFilter}`
        : '/doctor/prescriptions'
      const response = await api.get(url)
      setPrescriptions(response.data.prescriptions)
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error)
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
        <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
        <Link to="/doctor/prescriptions/new" className="btn btn-primary">
          ➕ New Prescription
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">Filter by status:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm ${
                statusFilter === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm ${
                statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm ${
                statusFilter === 'completed' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm ${
                statusFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="card">
        {prescriptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg">No prescriptions found</p>
            <Link to="/doctor/prescriptions/new" className="text-primary-600 hover:underline">
              Create a new prescription
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Diagnosis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Medicines</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">#{prescription.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{prescription.patient_name}</p>
                      <p className="text-sm text-gray-500">{prescription.patient_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {prescription.diagnosis || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm">
                        {prescription.medicines?.length || 0} medicines
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(prescription.start_date), 'MMM d, yyyy')}
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
                        View Details
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

export default DoctorPrescriptions
