import React from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Clipboard,
  Heart,
  Thermometer,
  Droplets,
  ArrowRight,
  Pill,
  Sparkles,
  Activity,
} from 'lucide-react';

const FREQUENCIES = [
  'Once Daily',
  'Once Daily (At Bedtime)',
  'Once Daily (Before Breakfast)',
  'Twice Daily',
  'Three Times Daily',
  'Four Times Daily',
  'Every 4 Hours (As Needed)',
  'Every 6 Hours (As Needed)',
  'Once',
];

const DURATIONS = [
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '30 Days',
  'As Needed',
];

export default function PrescriptionForm({
  patient,
  prescriptionLines,
  diagnosis,
  generalNotes,
  followUp,
  onUpdateLines,
  onUpdateDiagnosis,
  onUpdateGeneralNotes,
  onUpdateFollowUp,
  onOpenSidebar,
  onGeneratePrescription,
}) {
  /* ── line helpers ─────────────────────────────────── */

  const updateLine = (index, field, value) => {
    const updated = prescriptionLines.map((line, i) =>
      i === index ? { ...line, [field]: value } : line,
    );
    onUpdateLines(updated);
  };

  const removeLine = (index) => {
    onUpdateLines(prescriptionLines.filter((_, i) => i !== index));
  };

  /* ── vitals helpers ──────────────────────────────── */

  const getTempSeverity = (tempRaw) => {
    const temp = parseFloat(tempRaw);
    if (isNaN(temp)) return 'normal';
    if (temp >= 101) return 'high';
    if (temp >= 99.5) return 'warm';
    return 'normal';
  };

  const getBPSeverity = (bp) => {
    const sys = parseInt(bp.split('/')[0]);
    if (isNaN(sys)) return 'normal';
    if (sys >= 140) return 'high';
    if (sys >= 130) return 'borderline';
    return 'normal';
  };

  const getSpO2Severity = (spo2) => {
    const val = parseInt(spo2);
    if (isNaN(val)) return 'normal';
    if (val < 95) return 'low';
    return 'normal';
  };

  const vitalCardClass = (severity) => {
    const base =
      'flex flex-col items-center rounded-lg px-3 py-2 min-w-[80px] border';
    if (severity === 'high')
      return `${base} bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-350`;
    if (severity === 'warm' || severity === 'borderline')
      return `${base} bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400`;
    if (severity === 'low')
      return `${base} bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-350`;
    return `${base} bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-600 dark:text-zinc-300`;
  };

  const hasMedicines = prescriptionLines.length > 0;

  /* ── render ──────────────────────────────────────── */

  if (!patient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-550">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Select a patient</p>
          <p className="text-sm mt-1">
            Choose a patient from the queue to begin prescribing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
      {/* ── Patient info bar ────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {patient.avatar_url ? (
            <img
              src={patient.avatar_url}
              alt={patient.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 dark:ring-zinc-700"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-zinc-750 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-zinc-400 ring-2 ring-slate-200 dark:ring-zinc-700">
              {patient.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}

          {/* Name + demographics */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
              {patient.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-450 mt-0.5">
              {patient.age}y &middot; {patient.gender}
              {patient.weight ? ` · ${patient.weight} kg` : ''}
            </p>
          </div>

          {/* Live vitals cards */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {patient.temperature && (
              <div className={vitalCardClass(getTempSeverity(patient.temperature))}>
                <Thermometer size={14} className="mb-0.5" />
                <span className="text-xs font-semibold">
                  {patient.temperature}°F
                </span>
                <span className="text-[10px] opacity-60">Temp</span>
              </div>
            )}
            {patient.bp && (
              <div className={vitalCardClass(getBPSeverity(patient.bp))}>
                <Heart size={14} className="mb-0.5" />
                <span className="text-xs font-semibold">{patient.bp}</span>
                <span className="text-[10px] opacity-60">BP</span>
              </div>
            )}
            {patient.heart_rate && (
              <div className={vitalCardClass('normal')}>
                <Activity size={14} className="mb-0.5" />
                <span className="text-xs font-semibold">
                  {patient.heart_rate}
                </span>
                <span className="text-[10px] opacity-60">HR</span>
              </div>
            )}
            {patient.spo2 && (
              <div className={vitalCardClass(getSpO2Severity(patient.spo2))}>
                <Droplets size={14} className="mb-0.5" />
                <span className="text-xs font-semibold">{patient.spo2}%</span>
                <span className="text-[10px] opacity-60">SpO₂</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────── */}
      <div className="flex-1 px-6 py-5 space-y-6">
        {/* ── Diagnosis ──────────────────────────────── */}
        <section>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            <Clipboard size={14} className="text-teal-500 dark:text-teal-350" />
            Diagnosis
          </label>
          <textarea
            rows={2}
            placeholder="Enter diagnosis (e.g. Acute bronchitis, Hypertension)…"
            value={diagnosis}
            onChange={(e) => onUpdateDiagnosis(e.target.value)}
            className="w-full rounded-lg bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-550 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 focus:border-teal-500/40 dark:focus:border-teal-350/40 resize-none transition"
          />
        </section>

        {/* ── Medications list ───────────────────────── */}
        <section>
          <div className="flex items-center mb-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              <Pill size={14} className="text-teal-500 dark:text-teal-350" />
              Medications
              {hasMedicines && (
                <span className="ml-1 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-350 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {prescriptionLines.length}
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={onOpenSidebar}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-350 hover:bg-teal-100 dark:hover:bg-teal-500/20 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
            >
              <Sparkles size={13} />
              Browse suggestions
            </button>
          </div>

          {!hasMedicines ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-850/50 py-8 flex flex-col items-center text-slate-400 dark:text-zinc-550 text-sm">
              <Pill size={24} className="mb-2 opacity-40" />
              <p>No medicines added yet</p>
              <p className="text-xs mt-1 mb-3">
                Open the suggestions panel to browse the formulary
              </p>
              <button
                type="button"
                onClick={onOpenSidebar}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white dark:text-zinc-950 shadow-sm transition"
              >
                <Sparkles size={15} />
                Open Medicine Suggestions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptionLines.map((line, index) => (
                <div
                  key={line.id ?? index}
                  className="rounded-xl border border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-850 p-4 transition hover:border-slate-300 dark:hover:border-zinc-700"
                >
                  {/* Medicine header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-350 text-[11px] font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                        {line.name}
                      </span>
                      {line.dosage && (
                        <span className="text-xs text-slate-500 dark:text-zinc-450 bg-slate-100 dark:bg-zinc-805 rounded px-1.5 py-0.5">
                          {line.dosage}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="p-1.5 rounded-md text-slate-400 dark:text-zinc-550 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Remove medicine"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Editable fields grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Qty */}
                    <div>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase mb-1">
                        Qty
                      </span>
                      <input
                        type="text"
                        value={line.qty || ''}
                        onChange={(e) =>
                          updateLine(index, 'qty', e.target.value)
                        }
                        placeholder="e.g. 10"
                        className="w-full rounded-md bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 transition"
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase mb-1">
                        Frequency
                      </span>
                      <select
                        value={line.frequency || FREQUENCIES[0]}
                        onChange={(e) =>
                          updateLine(index, 'frequency', e.target.value)
                        }
                        className="w-full rounded-md bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 transition appearance-none"
                      >
                        {FREQUENCIES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase mb-1">
                        Duration
                      </span>
                      <select
                        value={line.duration || DURATIONS[2]}
                        onChange={(e) =>
                          updateLine(index, 'duration', e.target.value)
                        }
                        className="w-full rounded-md bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 transition appearance-none"
                      >
                        {DURATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Instructions */}
                    <div>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase mb-1">
                        Instructions
                      </span>
                      <input
                        type="text"
                        value={line.instructions || ''}
                        onChange={(e) =>
                          updateLine(index, 'instructions', e.target.value)
                        }
                        placeholder="After food…"
                        className="w-full rounded-md bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Follow-up & general notes ──────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Follow-up interval */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              <Calendar size={14} className="text-teal-500 dark:text-teal-350" />
              Follow-up
            </label>
            <select
              value={followUp}
              onChange={(e) => onUpdateFollowUp(e.target.value)}
              className="w-full rounded-lg bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-sm text-slate-800 dark:text-zinc-200 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 focus:border-teal-500/40 dark:focus:border-teal-350/40 transition appearance-none"
            >
              <option value="">No follow-up</option>
              <option value="3 Days">3 Days</option>
              <option value="5 Days">5 Days</option>
              <option value="1 Week">1 Week</option>
              <option value="2 Weeks">2 Weeks</option>
              <option value="1 Month">1 Month</option>
              <option value="3 Months">3 Months</option>
              <option value="As Needed">As Needed</option>
            </select>
          </div>

          {/* General notes / advice */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              <FileText size={14} className="text-teal-500 dark:text-teal-350" />
              General Advice
            </label>
            <input
              type="text"
              placeholder="Drink plenty of fluids, rest…"
              value={generalNotes}
              onChange={(e) => onUpdateGeneralNotes(e.target.value)}
              className="w-full rounded-lg bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-550 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 focus:border-teal-500/40 dark:focus:border-teal-350/40 transition"
            />
          </div>
        </section>
      </div>

      {/* ── Sticky generate button ───────────────────── */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 px-6 py-4">
        <button
          type="button"
          disabled={!hasMedicines}
          onClick={onGeneratePrescription}
          className={`
            w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition
            ${
              hasMedicines
                ? 'bg-teal-500 dark:bg-teal-350 text-white dark:text-zinc-900 hover:bg-teal-600 dark:hover:bg-teal-300 active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-550 cursor-not-allowed'
            }
          `}
        >
          <Sparkles size={16} />
          Create &amp; Generate Rx Slip
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
