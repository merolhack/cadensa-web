'use client';

import React, { useState } from 'react';
import {
  CLINICAL_CERTIFICATES,
  FluencyCertificate,
  openPrintableCertificate,
} from '@/lib/fluencyCertificate';

interface FluencyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientName?: string;
}

export const FluencyCertificateModal: React.FC<FluencyCertificateModalProps> = ({
  isOpen,
  onClose,
  defaultPatientName = 'Practicante de Cadensa',
}) => {
  const [patientName, setPatientName] = useState(defaultPatientName);
  const [selectedCert, setSelectedCert] = useState<FluencyCertificate>(CLINICAL_CERTIFICATES[0]);
  const [printedSuccess, setPrintedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = (cert: FluencyCertificate) => {
    openPrintableCertificate(cert, patientName.trim() || 'Practicante de Cadensa');
    setPrintedSuccess(true);
    setTimeout(() => setPrintedSuccess(false), 4000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modal de Diplomas y Certificados Clínicos"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              🏆
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                Diplomas de Mérito y Fluidez
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Refuerzo positivo clínico y reconocimiento a la constancia motriz.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de certificados"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Input de Nombre */}
        <div className="mb-6">
          <label htmlFor="patient-name-input" className="block text-sm font-medium text-zinc-300 mb-2">
            Nombre del paciente o practicante:
          </label>
          <input
            id="patient-name-input"
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Ej. Sofía Valenzuela"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm sm:text-base min-h-[44px]"
          />
        </div>

        {/* Selector de Certificados */}
        <div className="space-y-4 mb-6">
          <span className="block text-sm font-medium text-zinc-300">
            Selecciona el diploma a expedir:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CLINICAL_CERTIFICATES.map((cert) => {
              const isSelected = selectedCert.id === cert.id;
              return (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() => setSelectedCert(cert)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition min-h-[110px] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl" aria-hidden="true">
                      {cert.badgeEmoji}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        cert.level === 'Principiante'
                          ? 'bg-blue-500/20 text-blue-400'
                          : cert.level === 'Intermedio'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {cert.level}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-sm">{cert.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{cert.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Previsualización del Diploma Seleccionado */}
        <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/80 mb-6 text-center">
          <span className="text-4xl block mb-2" aria-hidden="true">
            {selectedCert.badgeEmoji}
          </span>
          <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-wide">
            {selectedCert.title}
          </h3>
          <p className="text-zinc-200 font-medium text-base my-2">
            Otorgado con distinción a:{' '}
            <span className="text-white font-extrabold underline decoration-emerald-500">
              {patientName.trim() || 'Practicante de Cadensa'}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            {selectedCert.description}
          </p>
          <p className="text-xs text-cyan-400 font-semibold mt-2">
            {selectedCert.congratulationsMessage}
          </p>
        </div>

        {printedSuccess && (
          <div
            role="status"
            className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-sm text-center font-medium animate-pulse"
          >
            ✓ Ventana de impresión preparada. Puedes guardarlo directamente como archivo PDF.
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm font-medium transition min-h-[44px] flex items-center justify-center"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => handlePrint(selectedCert)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-emerald-500/20 transition min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>🖨️</span>
            <span>Imprimir / Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

