/**
 * Cadensa HL7 FHIR R4 Interoperability Module
 * Mapeo y serialización de reportes fonoaudiológicos y métricas STS
 * al estándar internacional HL7 FHIR R4 (DiagnosticReport & Observations)
 * para integración con Expedientes Clínicos Electrónicos (EHR / EMR).
 */

import { ClinicalReportPayload } from './clinicalReport';

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
}

export interface FhirDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  meta: {
    profile: string[];
    lastUpdated: string;
  };
  status: 'final';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  effectiveDateTime: string;
  issued: string;
  performer: Array<{
    display: string;
  }>;
  contained: FhirObservation[];
  conclusion: string;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueInteger?: number;
  }>;
}

/**
 * Convierte un payload de reporte fonoaudiológico de Cadensa en un recurso FHIR R4 DiagnosticReport.
 */
export function generateFhirDiagnosticReport(
  payload: ClinicalReportPayload
): FhirDiagnosticReport {
  const { patientId, exportDate, metrics, clinicianNotes } = payload;
  const reportId = `cadensa-report-${Date.now()}`;

  const containedObservations: FhirObservation[] = [
    {
      resourceType: 'Observation',
      id: 'obs-accuracy',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '77150-1',
            display: 'Speech and language evaluation',
          },
        ],
        text: 'Precisión y Adherencia Rítmica STS',
      },
      valueQuantity: {
        value: metrics.averageAccuracy,
        unit: '%',
        system: 'http://unitsofmeasure.org',
        code: '%',
      },
    },
    {
      resourceType: 'Observation',
      id: 'obs-tempo-bpm',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '89066-5',
            display: 'Pacing rate',
          },
        ],
        text: 'Tempo Promedio de Práctica (BPM)',
      },
      valueQuantity: {
        value: metrics.averageBpm,
        unit: 'BPM',
        system: 'http://unitsofmeasure.org',
        code: '/min',
      },
    },
    {
      resourceType: 'Observation',
      id: 'obs-vocal-jitter',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '77151-9',
            display: 'Voice jitter estimate',
          },
        ],
        text: 'Jitter Vocal Estimado (ms)',
      },
      valueQuantity: {
        value: metrics.vocalJitterMs,
        unit: 'ms',
        system: 'http://unitsofmeasure.org',
        code: 'ms',
      },
    },
    {
      resourceType: 'Observation',
      id: 'obs-practice-duration',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '55411-3',
            display: 'Exercise duration',
          },
        ],
        text: 'Tiempo Total Acumulado de Práctica',
      },
      valueQuantity: {
        value: metrics.totalMinutes,
        unit: 'min',
        system: 'http://unitsofmeasure.org',
        code: 'min',
      },
    },
    {
      resourceType: 'Observation',
      id: 'obs-diagnosis-snomed',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '289190003',
            display: 'Stuttering (finding)',
          },
        ],
        text: 'Clasificación Clínica SNOMED-CT de Fluidez',
      },
      valueString: `Nivel de adherencia: ${metrics.rhythmAdherenceLevel}`,
    },
  ];

  const conclusionParts: string[] = [
    `Nivel de sincronización rítmica: ${metrics.rhythmAdherenceLevel}.`,
    `Precisión promedio de ejecución: ${metrics.averageAccuracy}%.`,
    `Sesiones completadas: ${metrics.totalSessions} (${metrics.totalMinutes} min totales).`,
  ];

  if (metrics.clinicalRecommendations.length > 0) {
    conclusionParts.push(`Recomendaciones: ${metrics.clinicalRecommendations.join(' ')}`);
  }

  if (clinicianNotes) {
    conclusionParts.push(`Notas fonoaudiológicas: ${clinicianNotes}`);
  }

  return {
    resourceType: 'DiagnosticReport',
    id: reportId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport'],
      lastUpdated: exportDate || new Date().toISOString(),
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'SP',
            display: 'Speech Pathology',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '77150-1',
          display: 'Speech and language evaluation',
        },
      ],
      text: 'Informe Fonoaudiológico de Fluidez del Habla (Cadensa STS)',
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: patientId,
    },
    effectiveDateTime: exportDate || new Date().toISOString(),
    issued: exportDate || new Date().toISOString(),
    performer: [
      {
        display: 'Cadensa Clinical Platform — Habla Rítmica Silábica',
      },
    ],
    contained: containedObservations,
    conclusion: conclusionParts.join(' '),
    extension: [
      {
        url: 'https://cadensa.org/fhir/StructureDefinition/streak-days',
        valueInteger: metrics.activeStreakDays,
      },
      {
        url: 'https://cadensa.org/fhir/StructureDefinition/xp-points',
        valueInteger: metrics.xpPoints,
      },
    ],
  };
}

/**
 * Descarga el informe HL7 FHIR R4 como archivo JSON en el navegador.
 */
export function downloadFhirReportJson(payload: ClinicalReportPayload): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const fhirDoc = generateFhirDiagnosticReport(payload);
    const blob = new Blob([JSON.stringify(fhirDoc, null, 2)], {
      type: 'application/fhir+json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cadensa_fhir_report_${payload.patientId}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error al descargar FHIR JSON:', err);
    return false;
  }
}

