import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const DoctorPatients = () => {
  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients')
      setPatients(response.data.patients)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 2) {
      try {
        const response = await api.get(`/doctor/patients/search?query=${query}`)
        setPatients(response.data.patients)
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else if (query.length === 0) {
      fetchPatients()
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
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            className="input flex-1"
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="card">
        {patients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg">No patients found</p>
            <p className="text-sm mt-2">Patients will appear here once they register</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{patient.name}</h3>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                  {patient.phone && (
                    <p className="flex items-center gap-2">
                      <span>📞</span> {patient.phone}
                    </p>
                  )}
                  {patient.date_of_birth && (
                    <p className="flex items-center gap-2">
                      <span>🎂</span> {patient.date_of_birth}
                    </p>
                  )}
                  {patient.address && (
                    <p className="flex items-center gap-2">
                      <span>📍</span> {patient.address}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/doctor/prescriptions/new?patientId=${patient.id}`}
                    className="btn btn-primary text-sm flex-1 text-center"
                  >
                    Add Prescription
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorPatients
