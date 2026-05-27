import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, Search, Plus, X, Sparkles, ChevronRight } from 'lucide-react'

const CLINICAL_KEYWORDS = [
  'fever', 'pain', 'headache', 'cough', 'cold', 'infection',
  'asthma', 'allergy', 'allergic', 'hypertension', 'diabetes',
  'reflux', 'acidity', 'nausea', 'vomiting', 'diarrhea',
  'inflammation', 'anxiety', 'depression', 'insomnia',
  'migraine', 'arthritis', 'bronchitis', 'pneumonia',
  'sinusitis', 'thyroid', 'cholesterol', 'ulcer',
]

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'At bedtime',
]

const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '60 days',
  '90 days',
]

const SuggestionSidebar = ({
  isOpen,
  onClose,
  diagnosisText,
  prescriptionLines,
  onAddLine,
  medications,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [medSettings, setMedSettings] = useState({})

  const getSettings = useCallback(
    (med) => {
      if (medSettings[med.id]) return medSettings[med.id]
      return {
        quantity: med.default_quantity || 1,
        strength: med.strength || '',
        duration: med.default_duration || '7 days',
        frequency: med.default_frequency || 'Once daily',
        instructions: med.default_instructions || '',
      }
    },
    [medSettings],
  )

  const updateSetting = useCallback((medId, field, value) => {
    setMedSettings((prev) => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        [field]: value,
      },
    }))
  }, [])

  const initSettings = useCallback(
    (med) => {
      if (!medSettings[med.id]) {
        setMedSettings((prev) => ({
          ...prev,
          [med.id]: {
            quantity: med.default_quantity || 1,
            strength: med.strength || '',
            duration: med.default_duration || '7 days',
            frequency: med.default_frequency || 'Once daily',
            instructions: med.default_instructions || '',
          },
        }))
      }
    },
    [medSettings],
  )

  const detectedKeywords = useMemo(() => {
    if (!diagnosisText) return []
    const lower = diagnosisText.toLowerCase()
    return CLINICAL_KEYWORDS.filter((kw) => lower.includes(kw))
  }, [diagnosisText])

  const addedMedIds = useMemo(
    () => new Set((prescriptionLines || []).map((l) => l.medicationId)),
    [prescriptionLines],
  )

  const filteredMedications = useMemo(() => {
    if (!medications || medications.length === 0) return []

    const available = medications.filter((m) => !addedMedIds.has(m.id))

    const query = searchQuery.trim().toLowerCase()

    return available.filter((med) => {
      if (query) {
        const haystack = `${med.name} ${med.type} ${med.category || ''} ${(med.indications || []).join(' ')}`.toLowerCase()
        return haystack.includes(query)
      }

      if (detectedKeywords.length > 0) {
        const indText = (med.indications || []).join(' ').toLowerCase()
        const catText = (med.category || '').toLowerCase()
        return detectedKeywords.some(
          (kw) => indText.includes(kw) || catText.includes(kw),
        )
      }

      return true
    })
  }, [medications, addedMedIds, searchQuery, detectedKeywords])

  const handleQuickAdd = useCallback(
    (med) => {
      const settings = getSettings(med)
      onAddLine({
        id: `LINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        medicationId: med.id,
        name: med.name,
        type: med.type,
        strength: med.strength || settings.strength,
        quantity: settings.quantity,
        duration: settings.duration,
        frequency: settings.frequency,
        instructions: settings.instructions,
      })
    },
    [getSettings, onAddLine],
  )

  const handleCustomizeAdd = useCallback(
    (med) => {
      const settings = getSettings(med)
      onAddLine({
        id: `LINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        medicationId: med.id,
        name: med.name,
        type: med.type,
        strength: med.strength || settings.strength,
        quantity: settings.quantity,
        duration: settings.duration,
        frequency: settings.frequency,
        instructions: settings.instructions,
      })
    },
    [getSettings, onAddLine],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.div
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-900 z-50 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-zinc-750">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-500 dark:text-teal-350" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
                  Suggested Medicines
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Keyword banner ── */}
            {detectedKeywords.length > 0 && (
              <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-750">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-450 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-500 dark:text-teal-350" />
                  Detected clinical keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-350 border border-teal-200 dark:border-teal-500/25"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Search ── */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-zinc-750">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search formulary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/50 transition-colors"
                />
              </div>
            </div>

            {/* ── Medication list ── */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {filteredMedications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-zinc-500">
                  <Pill className="w-10 h-10 mb-3 text-slate-300 dark:text-zinc-600" />
                  <p className="text-sm font-medium">No matching medications</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1">
                    Try a different search or diagnosis
                  </p>
                </div>
              ) : (
                filteredMedications.map((med) => {
                  const settings = getSettings(med)
                  return (
                    <MedicationCard
                      key={med.id}
                      med={med}
                      settings={settings}
                      onInit={() => initSettings(med)}
                      onUpdateSetting={(field, value) =>
                        updateSetting(med.id, field, value)
                      }
                      onQuickAdd={() => handleQuickAdd(med)}
                      onCustomizeAdd={() => handleCustomizeAdd(med)}
                    />
                  )
                })
              )}
            </div>

            {/* ── Footer count ── */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-850">
              <p className="text-xs text-slate-500 dark:text-zinc-500 text-center">
                {filteredMedications.length} medication
                {filteredMedications.length !== 1 ? 's' : ''} available
                {addedMedIds.size > 0 && (
                  <span className="text-teal-600 dark:text-teal-350">
                    {' '}&middot; {addedMedIds.size} already in Rx
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────── Medication Card ─────────────────────────── */

const MedicationCard = ({
  med,
  settings,
  onInit,
  onUpdateSetting,
  onQuickAdd,
  onCustomizeAdd,
}) => {
  const [expanded, setExpanded] = useState(false)

  const handleExpand = () => {
    onInit()
    setExpanded((v) => !v)
  }

  const typeBadgeColor = {
    tablet: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    capsule: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    syrup: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    injection: 'bg-red-500/15 text-red-400 border-red-500/25',
    cream: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
    drops: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    inhaler: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  }

  const badge =
    typeBadgeColor[(med.type || '').toLowerCase()] ||
    'bg-zinc-700/50 text-zinc-400 border-zinc-600/25'

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 overflow-hidden">
      {/* ─ Top row ─ */}
      <div className="flex items-start gap-3 p-3.5">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Pill className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
              {med.name}
            </h3>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded border flex-shrink-0 ${badge}`}
            >
              {med.type}
            </span>
          </div>
          {med.strength && (
            <p className="text-xs text-slate-500 dark:text-zinc-450 mb-1">{med.strength}</p>
          )}
          {med.category && (
            <p className="text-[11px] text-slate-400 dark:text-zinc-550">{med.category}</p>
          )}
        </div>

        {/* Quick add */}
        <button
          onClick={onQuickAdd}
          title="Quick add to Rx"
          className="p-1.5 rounded-lg text-teal-500 dark:text-teal-350 hover:bg-teal-50 dark:hover:bg-teal-500/15 transition-colors flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* ─ Expand toggle ─ */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors border-t border-slate-200 dark:border-zinc-750/60"
      >
        <span>{expanded ? 'Hide options' : 'Customize'}</span>
        <ChevronRight
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* ─ Expanded settings ─ */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-200 dark:border-zinc-750/60 space-y-3">
          {/* Quantity row */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide mb-1 block">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdateSetting(
                    'quantity',
                    Math.max(1, (settings.quantity || 1) - 1),
                  )
                }
                className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-sm font-medium transition-colors"
              >
                &minus;
              </button>
              <span className="w-10 text-center text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {settings.quantity || 1}
              </span>
              <button
                onClick={() =>
                  onUpdateSetting('quantity', (settings.quantity || 1) + 1)
                }
                className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-sm font-medium transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide mb-1 block">
              Frequency
            </label>
            <select
              value={settings.frequency}
              onChange={(e) => onUpdateSetting('frequency', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-colors"
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide mb-1 block">
              Duration
            </label>
            <select
              value={settings.duration}
              onChange={(e) => onUpdateSetting('duration', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-colors"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide mb-1 block">
              Instructions
            </label>
            <input
              type="text"
              value={settings.instructions}
              onChange={(e) => onUpdateSetting('instructions', e.target.value)}
              placeholder="e.g. Take after meals"
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-colors"
            />
          </div>

          {/* Indications */}
          {med.indications && med.indications.length > 0 && (
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide mb-1 block">
                Indications
              </label>
              <div className="flex flex-wrap gap-1">
                {med.indications.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={onCustomizeAdd}
            className="w-full py-2 rounded-lg bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-350 text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-500/25 border border-teal-200 dark:border-teal-500/25 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Customize &amp; Add to Rx
          </button>
        </div>
      )}
    </div>
  )
}

export default SuggestionSidebar
