import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { format } from 'date-fns'

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [statusFilter])

  const fetchPrescriptions = async () => {
    try {
      const url = statusFilter 
        ? `/patient/prescriptions?status=${statusFilter}`
        : '/patient/prescriptions'
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Prescriptions</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <span className="text-gray-600">Filter:</span>
          <div className="flex gap-2 flex-wrap">
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
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg text-gray-600">No prescriptions found</p>
          <p className="text-gray-500">Your prescriptions from doctors will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${
                    prescription.status === 'active' ? 'bg-green-500' :
                    prescription.status === 'completed' ? 'bg-gray-400' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {prescription.diagnosis || 'Prescription'} #{prescription.id}
                    </h3>
                    <p className="text-gray-600">
                      By Dr. {prescription.doctor_name} 
                      {prescription.doctor_specialization && ` (${prescription.doctor_specialization})`}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>📅 {format(new Date(prescription.start_date), 'MMM d, yyyy')}</span>
                      {prescription.end_date && (
                        <span>→ {format(new Date(prescription.end_date), 'MMM d, yyyy')}</span>
                      )}
                      <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                        {prescription.medicines?.length || 0} medicines
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prescription.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : prescription.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {prescription.status}
                  </span>
                  <Link 
                    to={`/patient/prescriptions/${prescription.id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Medicine Preview */}
              {prescription.medicines && prescription.medicines.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Medicines:</p>
                  <div className="flex flex-wrap gap-2">
                    {prescription.medicines.slice(0, 4).map((med, idx) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        💊 {med.name}
                      </span>
                    ))}
                    {prescription.medicines.length > 4 && (
                      <span className="text-sm text-gray-500">
                        +{prescription.medicines.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientPrescriptions
