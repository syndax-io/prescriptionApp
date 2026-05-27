import { useRef } from 'react'
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'

const RxPrescriptionSlip = ({
  isOpen,
  onClose,
  patient,
  lines,
  diagnosis,
  generalNotes,
  followUp,
  prescriptionId,
  date,
  doctor,
}) => {
  const printRef = useRef(null)

  if (!isOpen) return null

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=800,height=1000')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescriptionId || 'RX'}</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #18181b;
            background: #fff;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 12mm; size: A4; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 350)
  }

  const consultDate = date || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-750 overflow-hidden">
        {/* ── Top controls bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-850 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4.5 h-4.5 text-teal-500 dark:text-teal-350" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Rx Slip Preview
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-350 text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-500/25 border border-teal-200 dark:border-teal-500/25 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable printable body ── */}
        <div className="flex-1 overflow-y-auto p-5">
          <div
            ref={printRef}
            className="bg-white rounded-xl overflow-hidden shadow-lg"
            style={{ color: '#18181b' }}
          >
            <div style={{ padding: '32px 36px 28px' }}>
              {/* ─── Hospital letterhead ─── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #0d9488',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                {/* Left: clinic info */}
                <div>
                  <h1
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#0d9488',
                      marginBottom: '4px',
                    }}
                  >
                    {doctor?.clinic_name || 'Medical Clinic'}
                  </h1>
                  {doctor?.clinic_address && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#52525b',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {doctor.clinic_address}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginTop: '4px',
                    }}
                  >
                    {doctor?.phone && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#71717a',
                        }}
                      >
                        Tel: {doctor.phone}
                      </span>
                    )}
                    {doctor?.email && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#71717a',
                        }}
                      >
                        {doctor.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: doctor + Rx ID */}
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    {doctor?.name || 'Doctor'}
                  </p>
                  {doctor?.license_number && (
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#71717a',
                        marginTop: '2px',
                      }}
                    >
                      Lic. #{doctor.license_number}
                    </p>
                  )}
                  {prescriptionId && (
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#0d9488',
                        marginTop: '6px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {prescriptionId}
                    </p>
                  )}
                </div>
              </div>

              {/* ─── Patient demographics ─── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#f4f4f5',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717a',
                      marginBottom: '2px',
                    }}
                  >
                    Patient Name
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    {patient?.name || '—'}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717a',
                      marginBottom: '2px',
                    }}
                  >
                    Age / Gender
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    {patient?.age ? `${patient.age} yrs` : '—'}
                    {patient?.gender ? ` / ${patient.gender}` : ''}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717a',
                      marginBottom: '2px',
                    }}
                  >
                    Date
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    {consultDate}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717a',
                      marginBottom: '2px',
                    }}
                  >
                    Weight / BP
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    {patient?.weight ? `${patient.weight} kg` : '—'}
                    {patient?.bp ? ` / ${patient.bp}` : ''}
                  </p>
                </div>
              </div>

              {/* ─── Rx Emblem ─── */}
              <div
                style={{
                  fontSize: '48px',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: '#d4d4d8',
                  marginBottom: '8px',
                  fontFamily: 'Georgia, serif',
                  userSelect: 'none',
                }}
              >
                &#8478;
              </div>

              {/* ─── Medications table ─── */}
              {lines && lines.length > 0 && (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '24px',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f4f4f5',
                        textAlign: 'left',
                      }}
                    >
                      <th
                        style={{
                          padding: '8px 10px',
                          fontWeight: 600,
                          color: '#52525b',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          width: '36px',
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          fontWeight: 600,
                          color: '#52525b',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Medicine Name &amp; Strength
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          fontWeight: 600,
                          color: '#52525b',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          width: '48px',
                          textAlign: 'center',
                        }}
                      >
                        Qty
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          fontWeight: 600,
                          color: '#52525b',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Frequency
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          fontWeight: 600,
                          color: '#52525b',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr
                        key={line.id || idx}
                        style={{
                          borderBottom: '1px solid #e4e4e7',
                        }}
                      >
                        <td
                          style={{
                            padding: '10px',
                            color: '#71717a',
                            textAlign: 'center',
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#18181b',
                            }}
                          >
                            {line.name}
                          </span>
                          {line.strength && (
                            <span
                              style={{
                                color: '#71717a',
                                marginLeft: '6px',
                              }}
                            >
                              {line.strength}
                            </span>
                          )}
                          {line.instructions && (
                            <p
                              style={{
                                fontSize: '11px',
                                color: '#a1a1aa',
                                marginTop: '2px',
                                fontStyle: 'italic',
                              }}
                            >
                              {line.instructions}
                            </p>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          {line.quantity || '—'}
                        </td>
                        <td style={{ padding: '10px', color: '#3f3f46' }}>
                          {line.frequency || '—'}
                        </td>
                        <td style={{ padding: '10px', color: '#3f3f46' }}>
                          {line.duration || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ─── Diagnosis / Notes / Follow-up ─── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '14px',
                  marginBottom: '28px',
                }}
              >
                {diagnosis && (
                  <div
                    style={{
                      backgroundColor: '#fefce8',
                      border: '1px solid #fef08a',
                      borderRadius: '8px',
                      padding: '10px 14px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#a16207',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      Diagnosis
                    </p>
                    <p style={{ fontSize: '13px', color: '#422006' }}>
                      {diagnosis}
                    </p>
                  </div>
                )}

                {generalNotes && (
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#15803d',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      Dietary Advice / Notes
                    </p>
                    <p style={{ fontSize: '13px', color: '#14532d' }}>
                      {generalNotes}
                    </p>
                  </div>
                )}

                {followUp && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '10px 14px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#1d4ed8',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      Follow-Up Schedule
                    </p>
                    <p style={{ fontSize: '13px', color: '#1e3a5f' }}>
                      {followUp}
                    </p>
                  </div>
                )}
              </div>

              {/* ─── Signature area ─── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px dashed #d4d4d8',
                }}
              >
                <div style={{ textAlign: 'center', minWidth: '200px' }}>
                  <div
                    style={{
                      height: '48px',
                      borderBottom: '1px solid #a1a1aa',
                      marginBottom: '6px',
                    }}
                  />
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    {doctor?.name || 'Doctor'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#71717a' }}>
                    Signature &amp; Stamp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-850 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Checked for safe dosage range
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  )
}

export default RxPrescriptionSlip
