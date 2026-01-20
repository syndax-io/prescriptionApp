import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PatientPrescriptionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescription()
  }, [id])

  const fetchPrescription = async () => {
    try {
      const response = await api.get(`/patient/prescriptions/${id}`)
      setPrescription(response.data.prescription)
    } catch (error) {
      toast.error('Failed to load prescription')
      navigate('/patient/prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const formatSchedule = (medicine) => {
    const times = []
    if (medicine.morning) times.push({ time: medicine.morning_time, label: '🌅 Morning' })
    if (medicine.afternoon) times.push({ time: medicine.afternoon_time, label: '☀️ Afternoon' })
    if (medicine.evening) times.push({ time: medicine.evening_time, label: '🌆 Evening' })
    if (medicine.night) times.push({ time: medicine.night_time, label: '🌙 Night' })
    return times
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
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/patient/prescriptions" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
        ← Back to Prescriptions
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {prescription.diagnosis || 'Prescription'} #{prescription.id}
            </h1>
            <p className="text-gray-600">
              Prescribed by Dr. {prescription.doctor_name}
              {prescription.doctor_specialization && ` (${prescription.doctor_specialization})`}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            prescription.status === 'active' 
              ? 'bg-green-100 text-green-700'
              : prescription.status === 'completed'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {prescription.status}
          </span>
        </div>
      </div>

      {/* Prescription Info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Prescription Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Date Prescribed</p>
            <p className="font-medium">{format(new Date(prescription.created_at), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">
              {format(new Date(prescription.start_date), 'MMM d')}
              {prescription.end_date && ` - ${format(new Date(prescription.end_date), 'MMM d, yyyy')}`}
            </p>
          </div>
          {prescription.doctor_phone && (
            <div>
              <p className="text-sm text-gray-500">Doctor's Contact</p>
              <p className="font-medium">{prescription.doctor_phone}</p>
            </div>
          )}
        </div>
        {prescription.notes && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 font-medium mb-1">⚠️ Doctor's Notes:</p>
            <p className="text-yellow-800">{prescription.notes}</p>
          </div>
        )}
      </div>

      {/* Medicines */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">💊 Your Medicines</h2>
        <div className="space-y-6">
          {prescription.medicines?.map((medicine, index) => (
            <div key={medicine.id || index} className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">{medicine.name}</h3>
                  <p className="text-primary-600 font-semibold text-lg">{medicine.dosage}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medicine.before_meal 
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                  }`}>
                    {medicine.before_meal ? '🍽️ Before meal' : '🍽️ After meal'}
                  </span>
                  {medicine.duration_days && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {medicine.duration_days} days
                    </span>
                  )}
                </div>
              </div>
              
              {/* Schedule */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">When to take:</p>
                <div className="flex flex-wrap gap-3">
                  {formatSchedule(medicine).map((slot, i) => (
                    <div key={i} className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2">
                      <span>{slot.label}</span>
                      <span className="text-primary-600 font-medium">{slot.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {medicine.instructions && (
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Instructions:</span> {medicine.instructions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reminder Info */}
      <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-start gap-4">
          <span className="text-3xl">📱</span>
          <div>
            <h3 className="font-semibold text-green-800 mb-1">Reminders Active</h3>
            <p className="text-green-700 text-sm">
              You will receive WhatsApp notifications at the scheduled times to remind you to take your medicines.
            </p>
            <Link to="/patient/reminders" className="text-green-600 hover:underline text-sm font-medium mt-2 inline-block">
              View Today's Reminders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientPrescriptionDetail
