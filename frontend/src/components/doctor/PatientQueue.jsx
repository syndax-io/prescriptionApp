import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Users,
  Search,
  ClipboardList,
} from 'lucide-react';

export default function PatientQueue({
  patients,
  selectedPatientId,
  onSelectPatient,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  /* ── helpers ─────────────────────────────────────────── */

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  /* colour maps */
  const tempColour = {
    high: 'text-rose-400',
    warm: 'text-amber-400',
    normal: 'text-zinc-400',
  };
  const bpColour = {
    high: 'text-rose-400',
    borderline: 'text-amber-400',
    normal: 'text-zinc-400',
  };
  const spo2Colour = {
    low: 'text-rose-400',
    normal: 'text-teal-350',
  };

  /* ── render ──────────────────────────────────────────── */

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-teal-500 dark:text-teal-350" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200 tracking-wide uppercase">
              Patient Queue
            </h2>
          </div>
          <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-350 text-xs font-bold">
            {patients.length}
          </span>
        </div>

        {/* ── Search ────────────────────────────────── */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search name or condition…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-sm text-slate-700 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-teal-500/40 dark:focus:ring-teal-350/40 focus:border-teal-500/40 dark:focus:border-teal-350/40 transition"
          />
        </div>
      </div>

      {/* ── Patient list ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-750">
        {filteredPatients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-zinc-550 text-sm">
            <ClipboardList size={28} className="mb-2 opacity-50" />
            <span>No patients found</span>
          </div>
        )}

        {filteredPatients.map((patient) => {
          const isSelected =
            String(patient.id) === String(selectedPatientId);

          return (
            <button
              key={patient.id}
              type="button"
              onClick={() => onSelectPatient(patient)}
              className={`
                w-full text-left rounded-xl p-3 transition-all duration-150 group
                ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-350/30 border-l-[3px] border-l-teal-500 dark:border-l-teal-350'
                    : 'bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-805'
                }
              `}
            >
              {/* Top row: avatar + demographics */}
              <div className="flex items-center gap-2.5 mb-2">
                {patient.avatar_url ? (
                  <img
                    src={patient.avatar_url}
                    alt={patient.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-750 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-zinc-400 ring-1 ring-slate-200 dark:ring-zinc-700">
                    {patient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isSelected ? 'text-teal-600 dark:text-teal-350' : 'text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    {patient.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-tight">
                    {patient.age}y &middot; {patient.gender}
                    {patient.weight ? ` · ${patient.weight} kg` : ''}
                  </p>
                </div>
              </div>

              {/* Chief complaint */}
              <div className="mb-2 pl-[42px]">
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                  Chief complaint
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-350 leading-snug line-clamp-2">
                  {patient.condition}
                  {patient.visit_reason
                    ? ` — ${patient.visit_reason}`
                    : ''}
                </p>
              </div>

              {/* Vitals strip */}
              <div className="flex items-center gap-3 pl-[42px] text-[11px]">
                {/* Temperature */}
                {patient.temperature && (
                  <span
                    className={`flex items-center gap-1 ${
                      tempColour[getTempSeverity(patient.temperature)]
                    }`}
                  >
                    <Thermometer size={12} />
                    {patient.temperature}°F
                  </span>
                )}
                {/* BP */}
                {patient.bp && (
                  <span
                    className={`flex items-center gap-1 ${
                      bpColour[getBPSeverity(patient.bp)]
                    }`}
                  >
                    <Heart size={12} />
                    {patient.bp}
                  </span>
                )}
                {/* SpO2 */}
                {patient.spo2 && (
                  <span
                    className={`flex items-center gap-1 ${
                      spo2Colour[getSpO2Severity(patient.spo2)]
                    }`}
                  >
                    <Droplets size={12} />
                    {patient.spo2}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
