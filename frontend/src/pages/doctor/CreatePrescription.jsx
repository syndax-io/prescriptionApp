import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

const CreatePrescription = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPatientId = searchParams.get('patientId')

  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(preselectedPatientId || '')
  const [patientSearch, setPatientSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    diagnosis: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  const [medicines, setMedicines] = useState([
    {
      name: '',
      dosage: '',
      frequency: 'daily',
      durationDays: 7,
      instructions: '',
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      morningTime: '08:00',
      afternoonTime: '13:00',
      eveningTime: '18:00',
      nightTime: '21:00',
      beforeMeal: false
    }
  ])

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const response = await api.get('/doctor/patients')
      setPatients(response.data.patients)
    } catch (error) {
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSearch = async (query) => {
    setPatientSearch(query)
    if (query.length > 2) {
      try {
        const response = await api.get(`/doctor/patients/search?query=${query}`)
        setPatients(response.data.patients)
      } catch (error) {
        console.error('Search failed:', error)
      }
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addMedicine = () => {
    setMedicines(prev => [
      ...prev,
      {
        name: '',
        dosage: '',
        frequency: 'daily',
        durationDays: 7,
        instructions: '',
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
        morningTime: '08:00',
        afternoonTime: '13:00',
        eveningTime: '18:00',
        nightTime: '21:00',
        beforeMeal: false
      }
    ])
  }

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }

    const validMedicines = medicines.filter(m => m.name && m.dosage)
    if (validMedicines.length === 0) {
      toast.error('Please add at least one medicine with name and dosage')
      return
    }

    // Check if at least one time slot is selected for each medicine
    for (const med of validMedicines) {
      if (!med.morning && !med.afternoon && !med.evening && !med.night) {
        toast.error(`Please select when to take "${med.name}"`)
        return
      }
    }

    setSubmitting(true)
    try {
      await api.post('/doctor/prescriptions', {
        patientId: selectedPatient,
        ...formData,
        medicines: validMedicines
      })
      toast.success('Prescription created successfully! Patient has been notified.')
      navigate('/doctor/prescriptions')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create prescription')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPatientData = patients.find(p => p.id.toString() === selectedPatient.toString())

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Prescription</h1>

      <form onSubmit={handleSubmit}>
        {/* Patient Selection */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">👤 Select Patient</h2>
          
          <input
            type="text"
            className="input mb-4"
            placeholder="Search patients..."
            value={patientSearch}
            onChange={(e) => handlePatientSearch(e.target.value)}
          />

          {loading ? (
            <p className="text-gray-500">Loading patients...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {patients.map(patient => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedPatient == patient.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{patient.name}</p>
                  <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                </button>
              ))}
            </div>
          )}

          {selectedPatientData && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <p className="font-medium text-primary-800">Selected: {selectedPatientData.name}</p>
              <p className="text-sm text-primary-600">{selectedPatientData.email}</p>
              {selectedPatientData.phone && (
                <p className="text-sm text-primary-600">📞 {selectedPatientData.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Prescription Details */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Prescription Details</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Diagnosis</label>
              <input
                type="text"
                name="diagnosis"
                className="input"
                placeholder="e.g., Common Cold, Fever"
                value={formData.diagnosis}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="input"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="input"
                  value={formData.endDate}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Notes for Patient</label>
            <textarea
              name="notes"
              className="input"
              rows="2"
              placeholder="Any special instructions or notes..."
              value={formData.notes}
              onChange={handleFormChange}
            />
          </div>
        </div>

        {/* Medicines */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">💊 Medicines</h2>
            <button
              type="button"
              onClick={addMedicine}
              className="btn btn-secondary text-sm"
            >
              + Add Medicine
            </button>
          </div>

          <div className="space-y-6">
            {medicines.map((medicine, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Medicine #{index + 1}</h3>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="label">Medicine Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Paracetamol"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Dosage *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 500mg, 1 tablet"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Duration (days)</label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      value={medicine.durationDays}
                      onChange={(e) => handleMedicineChange(index, 'durationDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="label">When to Take *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                      medicine.morning ? 'bg-yellow-50 border-yellow-400' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={medicine.morning}
                        onChange={(e) => handleMedicineChange(index, 'morning', e.target.checked)}
                      />
                      <span>🌅 Morning</span>
                      {medicine.morning && (
                        <input
                          type="time"
                          className="ml-auto text-sm border rounded px-2 py-1"
                          value={medicine.morningTime}
                          onChange={(e) => handleMedicineChange(index, 'morningTime', e.target.value)}
                        />
                      )}
                    </label>
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                      medicine.afternoon ? 'bg-orange-50 border-orange-400' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={medicine.afternoon}
                        onChange={(e) => handleMedicineChange(index, 'afternoon', e.target.checked)}
                      />
                      <span>☀️ Afternoon</span>
                      {medicine.afternoon && (
                        <input
                          type="time"
                          className="ml-auto text-sm border rounded px-2 py-1"
                          value={medicine.afternoonTime}
                          onChange={(e) => handleMedicineChange(index, 'afternoonTime', e.target.value)}
                        />
                      )}
                    </label>
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                      medicine.evening ? 'bg-purple-50 border-purple-400' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={medicine.evening}
                        onChange={(e) => handleMedicineChange(index, 'evening', e.target.checked)}
                      />
                      <span>🌆 Evening</span>
                      {medicine.evening && (
                        <input
                          type="time"
                          className="ml-auto text-sm border rounded px-2 py-1"
                          value={medicine.eveningTime}
                          onChange={(e) => handleMedicineChange(index, 'eveningTime', e.target.value)}
                        />
                      )}
                    </label>
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                      medicine.night ? 'bg-indigo-50 border-indigo-400' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={medicine.night}
                        onChange={(e) => handleMedicineChange(index, 'night', e.target.checked)}
                      />
                      <span>🌙 Night</span>
                      {medicine.night && (
                        <input
                          type="time"
                          className="ml-auto text-sm border rounded px-2 py-1"
                          value={medicine.nightTime}
                          onChange={(e) => handleMedicineChange(index, 'nightTime', e.target.value)}
                        />
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Instructions</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Take with water"
                      value={medicine.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={medicine.beforeMeal}
                        onChange={(e) => handleMedicineChange(index, 'beforeMeal', e.target.checked)}
                      />
                      <span className="text-gray-700">Take before meal</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/doctor/prescriptions')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? 'Creating Prescription...' : '📋 Create Prescription & Notify Patient'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePrescription
