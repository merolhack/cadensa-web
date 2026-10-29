'use client';

import React, { useState } from 'react';
import {
  CompletedSession,
  StreakSummary,
  generateClinicalReport,
  downloadClinicalReport,
  computeClinicalMetrics,
} from '../lib/clinicalReport';
import { downloadFhirReportJson } from '../lib/fhirExport';

interface ClinicalReportExporterProps {
  sessions?: CompletedSession[];
  streak?: StreakSummary;
  patientId?: string;
}

export function ClinicalReportExporter({
  sessions = [],
  streak = {
    current_streak: 1,
    longest_streak: 1,
    last_activity_date: new Date().toISOString().split('T')[0],
    total_minutes: 5,
    xp_points: 50,
  },
  patientId = 'paciente-local',
}: ClinicalReportExporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [patientIdent, setPatientIdent] = useState(patientId);
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'txt' | 'json' | 'fhir'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const metrics = computeClinicalMetrics(sessions, streak);

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const report = generateClinicalReport(
        sessions,
        streak,
        patientIdent.trim() || 'paciente-local',
        clinicianNotes.trim() || undefined
      );

      let success = false;
      if (selectedFormat === 'fhir') {
        success = downloadFhirReportJson(report);
      } else {
        success = downloadClinicalReport(report, selectedFormat);
      }

      if (success) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error al exportar reporte clínico:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:from-emerald-600/50 hover:to-cyan-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer"
        title="Generar y descargar informe fonoaudiológico con métricas clínicas"
        aria-label="Exportar Informe Clínico"
      >
        <span>📄</span>
        <span>Exportar Informe Clínico (PDF)</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-zinc-100 space-y-5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 id="report-modal-title" className="text-lg font-bold text-zinc-50 flex items-center gap-2">
                  <span>📋</span>
                  <span>Informe Clínico Fonoaudiológico</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Reporte terapéutico para seguimiento foniátrico y de fluidez (STS).
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-lg p-1 rounded-lg hover:bg-zinc-800 transition"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Resumen de Métricas */}
            <div className="grid grid-cols-3 gap-2.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 text-center">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Precisión</span>
                <span className="text-base font-extrabold text-emerald-400">{metrics.averageAccuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Jitter Vocal</span>
                <span className="text-base font-extrabold text-cyan-400">±{metrics.vocalJitterMs} ms</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Adherencia</span>
                <span className="text-xs font-bold text-indigo-300 block mt-1">{metrics.rhythmAdherenceLevel}</span>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="patient-id" className="block text-zinc-300 font-semibold mb-1">
                  Identificador del Paciente / Expediente
                </label>
                <input
                  id="patient-id"
                  type="text"
                  value={patientIdent}
                  onChange={(e) => setPatientIdent(e.target.value)}
                  placeholder="Ej: PAC-2026-089 o Iniciales"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="clinician-notes" className="block text-zinc-300 font-semibold mb-1">
                  Observaciones Terapéuticas (Opcional)
                </label>
                <textarea
                  id="clinician-notes"
                  rows={2}
                  value={clinicianNotes}
                  onChange={(e) => setClinicianNotes(e.target.value)}
                  placeholder="Ej: Buena respuesta rítmica a 80 BPM, menor tensión laríngea..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="block text-zinc-300 font-semibold mb-1.5">Formato de Exportación</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('pdf')}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      selectedFormat === 'pdf'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>🖨️</span>
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('txt')}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      selectedFormat === 'txt'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>📝</span>
                    <span>Texto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('json')}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      selectedFormat === 'json'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>⚙️</span>
                    <span>JSON Raw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('fhir')}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      selectedFormat === 'fhir'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>🏥</span>
                    <span>HL7 FHIR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback de Exportación */}
            {exportSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <span>✅</span>
                <span>¡Informe generado y descargado exitosamente!</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 pt-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? 'Generando...' : 'Descargar Informe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

