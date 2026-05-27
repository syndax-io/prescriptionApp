import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import PatientQueue from '../../components/doctor/PatientQueue'
import PrescriptionForm from '../../components/doctor/PrescriptionForm'
import SuggestionSidebar from '../../components/doctor/SuggestionSidebar'
import RxPrescriptionSlip from '../../components/doctor/RxPrescriptionSlip'
import { Stethoscope, History, Pill, Clock, Printer, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function DoctorWorkspace() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Data from API
  const [patients, setPatients] = useState([])
  const [medications, setMedications] = useState([])
  const [issuedPrescriptions, setIssuedPrescriptions] = useState([])

  // Active patient & drafts
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientDrafts, setPatientDrafts] = useState({})

  // Current prescription state
  const [prescriptionId, setPrescriptionId] = useState('')
  const [prescriptionLines, setPrescriptionLines] = useState([])
  const [diagnosis, setDiagnosis] = useState('')
  const [generalNotes, setGeneralNotes] = useState('')
  const [followUp, setFollowUp] = useState('In 1 week')
  const [currentDate, setCurrentDate] = useState('')

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSlipOpen, setIsSlipOpen] = useState(false)
  const [activeInputFocus, setActiveInputFocus] = useState(false)
  const [activeViewTab, setActiveViewTab] = useState('prescribe')
  const [loadingData, setLoadingData] = useState(true)

  // Doctor info (from auth + profile)
  const [doctorInfo, setDoctorInfo] = useState({
    name: user?.name || 'Doctor',
    license_number: '',
    clinic_name: 'Medical Practice',
    clinic_address: '',
    phone: '',
    email: user?.email || ''
  })

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, formularyRes, prescriptionsRes, profileRes] = await Promise.all([
          api.get('/doctor/patients'),
          api.get('/doctor/formulary'),
          api.get('/doctor/prescriptions'),
          api.get('/auth/me')
        ])

        setPatients(patientsRes.data.patients || [])
        setMedications(formularyRes.data.medications || [])

        // Map issued prescriptions to workspace format
        const issued = (prescriptionsRes.data.prescriptions || []).map(p => ({
          prescriptionId: p.prescription_code || `RX-${p.id}`,
          patient: {
            id: p.patient_id,
            name: p.patient_name,
            age: p.patient_age,
            gender: p.patient_gender,
            weight: p.patient_weight,
            bp: p.patient_bp,
            avatar_url: p.patient_avatar
          },
          lines: (p.medicines || []).map(m => ({
            id: `MED-${m.id}`,
            medicationId: m.formulary_id,
            name: m.name,
            type: m.type || 'Tablet',
            strength: m.strength || m.dosage,
            quantity: m.quantity || 1,
            duration: m.duration || `${m.duration_days} Days`,
            frequency: m.frequency,
            instructions: m.instructions
          })),
          diagnosis: p.diagnosis,
          generalNotes: p.general_notes || p.notes,
          followUp: p.follow_up,
          date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }))
        setIssuedPrescriptions(issued)

        // Set doctor info from profile
        const profile = profileRes.data.user
        if (profile) {
          setDoctorInfo({
            name: profile.name || user?.name || 'Doctor',
            license_number: profile.license_number || '',
            clinic_name: profile.clinic_name || 'Medical Practice',
            clinic_address: profile.clinic_address || profile.address || '',
            phone: profile.phone || '',
            email: profile.email || user?.email || ''
          })
        }

        // Select first patient
        if (patientsRes.data.patients?.length > 0) {
          setSelectedPatient(patientsRes.data.patients[0])
        }
      } catch (err) {
        console.error('Failed to load workspace data:', err)
        toast.error('Failed to load workspace data')
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  // Generate a fresh prescription ID
  const generateRxId = () => `RX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  // Load/init draft on patient switch
  useEffect(() => {
    if (!selectedPatient) return
    const pid = selectedPatient.id

    if (patientDrafts[pid]) {
      const draft = patientDrafts[pid]
      setPrescriptionId(draft.prescriptionId)
      setPrescriptionLines(draft.lines)
      setDiagnosis(draft.diagnosis)
      setGeneralNotes(draft.generalNotes)
      setFollowUp(draft.followUp)
      setCurrentDate(draft.date)
    } else {
      setPrescriptionId(generateRxId())
      setPrescriptionLines([])
      setDiagnosis('')
      setGeneralNotes('')
      setFollowUp('In 1 week')
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    }
    setIsSidebarOpen(false)
    setActiveInputFocus(false)
  }, [selectedPatient])

  // Persist draft on change
  useEffect(() => {
    if (!selectedPatient) return
    setPatientDrafts(prev => ({
      ...prev,
      [selectedPatient.id]: { prescriptionId, lines: prescriptionLines, diagnosis, generalNotes, followUp, date: currentDate }
    }))
  }, [prescriptionLines, diagnosis, generalNotes, followUp, selectedPatient])

  const handleAddLine = (line) => {
    if (prescriptionLines.some(l => l.medicationId === line.medicationId)) return
    setPrescriptionLines(prev => [...prev, line])
  }

  // Issue prescription — POST to backend
  const handleIssueSubmit = async () => {
    if (!selectedPatient || prescriptionLines.length === 0) return

    try {
      const payload = {
        patientId: selectedPatient.id,
        diagnosis,
        generalNotes,
        followUp,
        prescriptionCode: prescriptionId,
        medicines: prescriptionLines.map(line => ({
          formularyId: line.medicationId || null,
          name: line.name,
          type: line.type,
          strength: line.strength,
          quantity: line.quantity,
          frequency: line.frequency,
          duration: line.duration,
          instructions: line.instructions
        }))
      }

      await api.post('/doctor/prescriptions', payload)
      toast.success('Prescription issued successfully')

      // Add to local history
      const newIssue = {
        prescriptionId,
        patient: selectedPatient,
        lines: prescriptionLines,
        diagnosis,
        generalNotes,
        followUp,
        date: currentDate
      }
      setIssuedPrescriptions(prev => [newIssue, ...prev])
      setIsSlipOpen(true)

      // Clear draft
      const cleaned = { ...patientDrafts }
      delete cleaned[selectedPatient.id]
      setPatientDrafts(cleaned)

      // Reset form
      setPrescriptionId(generateRxId())
      setPrescriptionLines([])
      setDiagnosis('')
      setGeneralNotes('')
      setFollowUp('In 1 week')
    } catch (err) {
      console.error('Failed to issue prescription:', err)
      toast.error('Failed to issue prescription')
    }
  }

  const handleReIssue = (hist) => {
    // Find the patient in the queue or use the history data
    const queuePatient = patients.find(p => p.id === hist.patient.id) || hist.patient
    setSelectedPatient(queuePatient)
    setTimeout(() => {
      setPrescriptionId(generateRxId())
      setPrescriptionLines(hist.lines.map(l => ({ ...l, id: `LINE-${Date.now()}-${Math.floor(Math.random() * 1000)}` })))
      setDiagnosis(hist.diagnosis)
      setGeneralNotes(hist.generalNotes)
      setFollowUp(hist.followUp)
      setActiveViewTab('prescribe')
    }, 50)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-zinc-400 text-sm">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 z-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-500 text-white dark:text-zinc-950 p-1.5 rounded-lg">
            <Stethoscope className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Vanguard Clinical Desk</span>
              <span className="text-[10px] bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-900 px-2 py-0.5 rounded-full font-mono text-teal-600 dark:text-teal-400">v1.2.0</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono hidden sm:block">
              Registered System: {doctorInfo.clinic_name}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveViewTab('prescribe')}
            className={`cursor-pointer px-4 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeViewTab === 'prescribe' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900/40'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Prescribe Desk
          </button>
          <button
            onClick={() => setActiveViewTab('history')}
            className={`cursor-pointer px-4 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeViewTab === 'history' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900/40'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Rx History
          </button>
        </div>

        {/* Doctor badge + Theme toggle + Logout */}
        <div className="items-center gap-3 hidden md:flex">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200 block">{doctorInfo.name}</span>
            <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">{doctorInfo.license_number}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { logout(); }}
            className="p-2 text-slate-400 dark:text-zinc-400 hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Patient Queue */}
        <div className="w-full md:w-[320px] lg:w-[350px] shrink-0 h-full flex-col hidden md:flex">
          <PatientQueue
            patients={patients}
            selectedPatientId={selectedPatient?.id}
            onSelectPatient={setSelectedPatient}
          />
        </div>

        {/* Right Area */}
        <div className="flex-1 h-full min-w-0 flex flex-col">
          {activeViewTab === 'prescribe' ? (
            <PrescriptionForm
              patient={selectedPatient}
              prescriptionLines={prescriptionLines}
              diagnosis={diagnosis}
              generalNotes={generalNotes}
              followUp={followUp}
              onUpdateLines={setPrescriptionLines}
              onUpdateDiagnosis={setDiagnosis}
              onUpdateGeneralNotes={setGeneralNotes}
              onUpdateFollowUp={setFollowUp}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onGeneratePrescription={handleIssueSubmit}
              activeInputFocus={activeInputFocus}
              setActiveInputFocus={setActiveInputFocus}
            />
          ) : (
            /* History View */
            <div className="flex-1 bg-slate-50 dark:bg-zinc-950 p-6 overflow-y-auto custom-scrollbar flex flex-col h-full">
              <div className="max-w-4xl mx-auto w-full mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Clinical Receipt Archives</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Review, print, or re-issue previously issued prescriptions.</p>
              </div>

              {issuedPrescriptions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 max-w-4xl mx-auto w-full">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-zinc-800 mb-3 stroke-[1.2]" />
                  <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">No prescriptions posted yet</p>
                  <p className="text-slate-400 dark:text-zinc-600 text-xs mt-1">Once you issue a prescription, it will appear here.</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto w-full space-y-4">
                  {issuedPrescriptions.map(hist => (
                    <div
                      key={hist.prescriptionId}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-2.5 py-0.5 rounded text-slate-500 dark:text-zinc-400">
                            {hist.prescriptionId}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-zinc-500">&#8226;</span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {hist.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={hist.patient.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(hist.patient.name)}`}
                            alt={hist.patient.name}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 object-cover"
                          />
                          <div>
                            <span className="font-semibold text-sm text-slate-800 dark:text-zinc-100 block">{hist.patient.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-500 block">
                              {hist.patient.age} y/o &#8226; {hist.patient.gender} &#8226; BP: {hist.patient.bp}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-950/60 rounded-lg p-3 border border-slate-200 dark:border-zinc-800/60">
                          <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Prescribed Stack</div>
                          <div className="flex flex-wrap gap-1.5">
                            {hist.lines.map(line => (
                              <span key={line.id} className="text-[11px] px-2.5 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded font-medium">
                                {line.name} ({line.strength}) — <span className="text-slate-400 dark:text-zinc-500">{line.quantity} pcs</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {hist.diagnosis && (
                          <div className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                            <span className="font-bold text-slate-500 dark:text-zinc-500">Diagnosis: </span>
                            <span className="italic">"{hist.diagnosis}"</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center md:flex-col gap-2 shrink-0 self-end md:self-stretch justify-end">
                        <button
                          onClick={() => handleReIssue(hist)}
                          className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-lg transition-colors border border-slate-200 dark:border-zinc-700 flex items-center gap-1 cursor-pointer"
                        >
                          Clone / Re-Issue
                        </button>
                        <button
                          onClick={() => {
                            const qp = patients.find(p => p.id === hist.patient.id) || hist.patient
                            setSelectedPatient(qp)
                            setPrescriptionId(hist.prescriptionId)
                            setPrescriptionLines(hist.lines)
                            setDiagnosis(hist.diagnosis)
                            setGeneralNotes(hist.generalNotes)
                            setFollowUp(hist.followUp)
                            setCurrentDate(hist.date)
                            setIsSlipOpen(true)
                          }}
                          className="px-4 py-2 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-500 text-teal-600 dark:text-teal-400 hover:text-white dark:hover:text-zinc-950 text-xs font-semibold rounded-lg transition-all border border-teal-200 dark:border-teal-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> View Rx Slip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggestion Sidebar */}
        <SuggestionSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          diagnosisText={diagnosis}
          prescriptionLines={prescriptionLines}
          onAddLine={handleAddLine}
          medications={medications}
        />
      </div>

      {/* Rx Slip Modal */}
      <RxPrescriptionSlip
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        patient={selectedPatient || {}}
        lines={prescriptionLines}
        diagnosis={diagnosis}
        generalNotes={generalNotes}
        followUp={followUp}
        prescriptionId={prescriptionId}
        date={currentDate}
        doctor={doctorInfo}
      />
    </div>
  )
}