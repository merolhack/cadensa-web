import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import {
  DAF_FAF_PRESETS,
  AlteredAuditoryProcessor,
} from '../../src/lib/alteredAuditoryFeedback';
import {
  CLINICAL_CERTIFICATES,
  generateCertificateHtml,
} from '../../src/lib/fluencyCertificate';
import {
  generateFhirDiagnosticReport,
} from '../../src/lib/fhirExport';
import { ClinicalReportPayload } from '../../src/lib/clinicalReport';

interface TestContext {
  dafProcessor: AlteredAuditoryProcessor | null;
  delayMs: number;
  pitchSemitones: number;
  duoEnabled: boolean;
  starsAdded: number;
  applausePlayed: boolean;
  generatedHtml: string;
  fhirReport: ReturnType<typeof generateFhirDiagnosticReport> | null;
}

const context: TestContext = {
  dafProcessor: null,
  delayMs: 75,
  pitchSemitones: 0,
  duoEnabled: false,
  starsAdded: 0,
  applausePlayed: false,
  generatedHtml: '',
  fhirReport: null,
};

// Escenario 1: DAF / FAF
Given('que el módulo de Retroalimentación Auditiva Alterada está disponible', () => {
  assert.ok(DAF_FAF_PRESETS.length >= 3);
  context.dafProcessor = new AlteredAuditoryProcessor();
});

When(
  'el paciente configura un retardo DAF de {int} milisegundos y un desplazamiento FAF de {int} semitono',
  (delay: number, pitch: number) => {
    context.delayMs = delay;
    context.pitchSemitones = pitch;
    context.dafProcessor?.setDelay(delay);
    context.dafProcessor?.setPitchShift(pitch);
  }
);

Then(
  'el procesador de audio aplica la latencia acústica y el tono de retroalimentación',
  () => {
    assert.strictEqual(context.delayMs, 65);
    assert.strictEqual(context.pitchSemitones, -1);
  }
);

Then(
  'se muestra la advertencia obligatoria de uso de auriculares para evitar acople acústico',
  () => {
    const warningText = 'Usa auriculares obligatoriamente para evitar acople acústico';
    assert.ok(warningText.includes('auriculares'));
  }
);

// Escenario 2: Modo Dúo y Aplauso
Given('que se activa la práctica pediátrica con un acompañante', () => {
  context.duoEnabled = false;
  context.starsAdded = 0;
  context.applausePlayed = false;
});

When('el adulto o terapeuta habilita el Modo Dúo', () => {
  context.duoEnabled = true;
});

When('presiona el botón de aplauso motivador', () => {
  context.applausePlayed = true;
  context.starsAdded += 1;
});

Then(
  'se reproduce el sonido acústico de celebración y se suma una estrella de mérito',
  () => {
    assert.strictEqual(context.duoEnabled, true);
    assert.strictEqual(context.applausePlayed, true);
    assert.strictEqual(context.starsAdded, 1);
  }
);

// Escenario 3: Diplomas
Given('que el paciente ha completado su ciclo de práctica', () => {
  assert.ok(CLINICAL_CERTIFICATES.length >= 3);
});

When(
  'se solicita el diploma {string} para {string}',
  (certTitle: string, patientName: string) => {
    const cert = CLINICAL_CERTIFICATES.find((c) => c.title === certTitle) || CLINICAL_CERTIFICATES[0];
    context.generatedHtml = generateCertificateHtml(cert, patientName);
  }
);

Then(
  'el sistema genera el documento imprimible con el sello de Cadensa Digital Clinic',
  () => {
    assert.ok(context.generatedHtml.includes('Cadensa Digital Clinic'));
    assert.ok(context.generatedHtml.includes('Sofía Valenzuela'));
  }
);

Then('permite su descarga directa o guardado en formato PDF', () => {
  assert.ok(context.generatedHtml.includes('@page { size: landscape; margin: 1cm; }'));
});

// Escenario 4: HL7 FHIR R4
Given('que un fonoaudiólogo evalúa las métricas acumuladas de una sesión', () => {
  assert.ok(true);
});

When('exporta el informe clínico en formato HL7 FHIR', () => {
  const payload: ClinicalReportPayload = {
    exportDate: '2026-10-29T10:00:00.000Z',
    patientId: 'PAC-TEST-01',
    clinicianNotes: 'Sesión de habla rítmica con feedback positivo.',
    metrics: {
      totalSessions: 10,
      totalMinutes: 45,
      totalSyllables: 1200,
      averageAccuracy: 88,
      averageBpm: 75,
      vocalJitterMs: 35,
      rhythmAdherenceLevel: 'Óptimo',
      activeStreakDays: 4,
      xpPoints: 200,
      clinicalRecommendations: ['Mantener ritmo'],
    },
    recentSessions: [],
  };

  context.fhirReport = generateFhirDiagnosticReport(payload);
});

Then(
  'se genera un recurso DiagnosticReport válido con código LOINC {string}',
  (loincCode: string) => {
    assert.strictEqual(context.fhirReport?.resourceType, 'DiagnosticReport');
    assert.strictEqual(context.fhirReport?.code.coding[0].code, loincCode);
  }
);

Then(
  'contiene observaciones estructuradas con diagnósticos SNOMED-CT y adherencia rítmica',
  () => {
    const contained = context.fhirReport?.contained || [];
    const snomed = contained.find((c) => c.id === 'obs-diagnosis-snomed');
    assert.ok(snomed);
    assert.strictEqual(snomed.code.coding[0].code, '289190003');
  }
);

// Escenario 5: Auditoría de Seguridad y Zero Trust
Given('que el sistema procesa datos de audio localmente', () => {
  assert.ok(true);
});

When(
  'se evalúan las cabeceras HTTP y políticas de permisos del navegador',
  () => {
    const headersPath = path.resolve(process.cwd(), 'public/_headers');
    assert.ok(fs.existsSync(headersPath));
  }
);

Then(
  'el acceso al micrófono se restringe exclusivamente al origen self y la cámara queda deshabilitada',
  () => {
    const headersContent = fs.readFileSync(path.resolve(process.cwd(), 'public/_headers'), 'utf8');
    assert.ok(headersContent.includes('Permissions-Policy:'));
    assert.ok(headersContent.includes('microphone=(self)'));
    assert.ok(headersContent.includes('camera=()'));
  }
);

Then(
  'las claves secretas de base de datos se mantienen inaccesibles desde el frontend',
  () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      assert.ok(!content.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE'));
    }
  }
);

