import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const DoctorPrescriptionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescription()
  }, [id])

  const fetchPrescription = async () => {
    try {
      const response = await api.get(`/doctor/prescriptions/${id}`)
      setPrescription(response.data.prescription)
    } catch (error) {
      toast.error('Failed to load prescription')
      navigate('/doctor/prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    try {
      await api.patch(`/doctor/prescriptions/${id}/status`, { status })
      toast.success(`Prescription marked as ${status}`)
      fetchPrescription()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const formatSchedule = (medicine) => {
    const times = []
    if (medicine.morning) times.push(`Morning (${medicine.morning_time})`)
    if (medicine.afternoon) times.push(`Afternoon (${medicine.afternoon_time})`)
    if (medicine.evening) times.push(`Evening (${medicine.evening_time})`)
    if (medicine.night) times.push(`Night (${medicine.night_time})`)
    return times.join(', ')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Prescription not found</p>
        <Link to="/doctor/prescriptions" className="text-primary-600 hover:underline">
          Back to prescriptions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/doctor/prescriptions" className="text-primary-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Prescriptions
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Prescription #{prescription.id}</h1>
        </div>
        <div className="flex gap-2">
          {prescription.status === 'active' && (
            <>
              <button
                onClick={() => updateStatus('completed')}
                className="btn btn-success"
              >
                ✅ Mark Completed
              </button>
              <button
                onClick={() => updateStatus('cancelled')}
                className="btn btn-danger"
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg mb-6 ${
        prescription.status === 'active' 
          ? 'bg-green-50 border border-green-200'
          : prescription.status === 'completed'
          ? 'bg-gray-50 border border-gray-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            prescription.status === 'active' ? 'bg-green-500' :
            prescription.status === 'completed' ? 'bg-gray-500' : 'bg-red-500'
          }`}></span>
          <span className="font-medium capitalize">{prescription.status}</span>
          <span className="text-gray-500 ml-4">
            Created on {format(new Date(prescription.created_at), 'MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">👤 Patient Information</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{prescription.patient_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{prescription.patient_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{prescription.patient_phone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Prescription Details */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Prescription Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Diagnosis</p>
            <p className="font-medium">{prescription.diagnosis || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">
              {format(new Date(prescription.start_date), 'MMM d, yyyy')}
              {prescription.end_date && ` - ${format(new Date(prescription.end_date), 'MMM d, yyyy')}`}
            </p>
          </div>
          {prescription.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{prescription.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Medicines */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">💊 Prescribed Medicines</h2>
        <div className="space-y-4">
          {prescription.medicines?.map((medicine, index) => (
            <div key={medicine.id || index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{medicine.name}</h3>
                  <p className="text-primary-600 font-medium">{medicine.dosage}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  medicine.before_meal 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {medicine.before_meal ? 'Before meal' : 'After meal'}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Schedule</p>
                  <p className="text-gray-800">{formatSchedule(medicine)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="text-gray-800">{medicine.duration_days || 'Not specified'} days</p>
                </div>
                {medicine.instructions && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Instructions</p>
                    <p className="text-gray-800">{medicine.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorPrescriptionDetail
