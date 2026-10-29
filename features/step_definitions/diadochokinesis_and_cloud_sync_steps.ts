import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { supabase } from '../../src/lib/supabaseClient';
import {
  evaluateDDKTrial,
  DDKSequenceType,
  DDKAssessmentResult,
} from '../../src/lib/diadochokinesis';
import {
  generateClinicalReport,
  generatePrintableClinicalHtml,
  ClinicalReportPayload,
} from '../../src/lib/clinicalReport';
import {
  syncCustomPhrasesWithCloud,
  CustomPhraseItem,
} from '../../src/lib/customPhraseService';

let ddkSequence: DDKSequenceType = 'pa-ta-ka';
let ddkTimestamps: number[] = [];
let ddkDuration = 10;
let ddkResult: DDKAssessmentResult;

let printableReportHtml = '';
let clinicalPayload: ClinicalReportPayload;

let localPhrasesList: CustomPhraseItem[] = [];
let syncResult: { syncedPhrases: CustomPhraseItem[]; syncedWithCloud: boolean };

// 1. Escenario DDK óptimo
Given('que el paciente realiza una prueba de {int} segundos en la secuencia {string}', function (seconds: number, seq: string) {
  ddkDuration = seconds;
  ddkSequence = seq as DDKSequenceType;
});

Given('articula {int} sílabas con intervalos isocrónicos regulares', function (syllableCount: number) {
  ddkTimestamps = [];
  const interval = (ddkDuration * 1000) / syllableCount;
  for (let i = 0; i < syllableCount; i++) {
    ddkTimestamps.push(i * interval);
  }
});

When('el motor clínico foniátrico calcula los resultados de la prueba DDK', function () {
  ddkResult = evaluateDDKTrial(ddkSequence, ddkTimestamps, ddkDuration);
});

Then('la tasa motora articulatoria es mayor o igual a {float} sílabas por segundo', function (expectedRate: number) {
  assert.ok(
    ddkResult.rateSyllablesPerSecond >= expectedRate,
    `Tasa actual ${ddkResult.rateSyllablesPerSecond} menor a ${expectedRate}`
  );
});

Then('la regularidad temporal se clasifica como {string} con jitter menor o igual a {int} ms', function (expectedClass: string, maxJitter: number) {
  assert.strictEqual(ddkResult.regularityClassification, expectedClass);
  assert.ok(
    ddkResult.jitterMs <= maxJitter,
    `Jitter ${ddkResult.jitterMs} supera el límite de ${maxJitter}ms`
  );
});

// 2. Escenario DDK irregular
Given('que el paciente articula sílabas con alta dispersión e intervalos irregulares', function () {
  ddkTimestamps = [0, 120, 480, 600, 1100, 1300, 1950, 2100];
});

When('se evalúa la secuencia {string} durante {int} segundos', function (seq: string, duration: number) {
  ddkSequence = seq as DDKSequenceType;
  ddkDuration = duration;
  ddkResult = evaluateDDKTrial(ddkSequence, ddkTimestamps, ddkDuration);
});

Then('la regularidad temporal se clasifica como {string}', function (expectedClass: string) {
  assert.strictEqual(ddkResult.regularityClassification, expectedClass);
});

Then('la recomendación foniátrica sugiere afianzar la isocronía con metrónomo a tempo moderado', function () {
  assert.ok(
    ddkResult.clinicalSummary.includes('metrónomo'),
    'La recomendación no menciona afianzar con metrónomo'
  );
});

// 3. Escenario Reporte Imprimible
Given('que un paciente ha completado sesiones con precisión rítmica del {int}%', function (acc: number) {
  const sessions = [
    {
      id: 'sess-pdf-1',
      bpm: 80,
      duration_seconds: 120,
      syllable_count: 160,
      accuracy_score: acc,
      completed_at: new Date().toISOString(),
    },
  ];
  const streak = {
    current_streak: 4,
    longest_streak: 6,
    last_activity_date: new Date().toISOString().split('T')[0],
    total_minutes: 20,
    xp_points: 250,
  };
  clinicalPayload = generateClinicalReport(sessions, streak, 'paciente-bdd-print');
});

When('se genera el documento imprimible del informe fonoaudiológico', function () {
  printableReportHtml = generatePrintableClinicalHtml(clinicalPayload);
});

Then('el documento incluye la métrica de jitter vocal inter-silábico en milisegundos', function () {
  assert.ok(
    printableReportHtml.includes('Jitter: ±') || printableReportHtml.includes('vocalJitterMs'),
    'El documento no contiene la métrica de jitter vocal'
  );
});

Then('contiene las pautas foniátricas y la tabla de sesiones recientes', function () {
  assert.ok(printableReportHtml.includes('Pautas y Recomendaciones Clínicas'));
  assert.ok(printableReportHtml.includes('Historial de Sesiones Recientes'));
});

// 4. Escenario Sincronización Cloud
Given('que el usuario autenticado tiene {int} frases locales guardadas en su dispositivo', function (count: number) {
  localPhrasesList = Array.from({ length: count }, (_, i) => ({
    id: `loc-phrase-${i}`,
    phrase: `Frase local única número ${i + 1}`,
    bpm: 80,
  }));
});

Given('existen {int} frases adicionales respaldadas en la nube en Supabase', function () {
  // Las frases en la nube se simulan en el mock de Supabase
});

When('se ejecuta la sincronización multi-dispositivo', async function () {
  const mockCloudRows = [
    {
      id: 'cloud-item-1',
      phrase: 'Frase en la nube uno',
      bpm_recommended: 75,
      category: 'personalizado',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cloud-item-2',
      phrase: 'Frase en la nube dos',
      bpm_recommended: 85,
      category: 'personalizado',
      created_at: new Date().toISOString(),
    },
  ];

  const mockSupabase = {
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: mockCloudRows,
          error: null,
        }),
      }),
      insert: () => ({
        select: async () => ({
          data: localPhrasesList.map((p, i) => ({
            id: `inserted-cloud-${i}`,
            phrase: p.phrase,
            bpm_recommended: p.bpm,
            category: 'personalizado',
            created_at: new Date().toISOString(),
          })),
          error: null,
        }),
      }),
    }),
  };

  syncResult = await syncCustomPhrasesWithCloud(
    localPhrasesList,
    'mock-user-bdd',
    mockSupabase as unknown as typeof supabase
  );
});

Then('el repertorio unificado contiene {int} frases sin duplicados', function (expectedTotal: number) {
  assert.strictEqual(syncResult.syncedPhrases.length, expectedTotal);
});

Then('el estado confirma la sincronización exitosa con la nube', function () {
  assert.strictEqual(syncResult.syncedWithCloud, true);
});
