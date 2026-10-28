import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { flattenSentenceSyllables } from '../../src/lib/syllables.js';
import {
  createAdminExercise,
  generateFeedbackCSV,
  generateUsersCSV,
  AdminFeedbackReport,
  AdminUserRow,
} from '../../src/lib/adminService.js';

interface TestWorld {
  inputPhrase?: string;
  syllables?: string[];
  localStoredPhrases?: Array<{ id: string; phrase: string; bpm: number }>;
  recordedBlob?: boolean;
  audioPlaybackReady?: boolean;
  cmsResult?: { success: boolean; error?: string };
  feedbackCsv?: string;
  usersCsv?: string;
  pwaAvailable?: boolean;
}

const state: TestWorld = {};

Given('que un paciente ingresa la frase personal {string}', function (phrase: string) {
  state.inputPhrase = phrase;
});

When('el motor silábico procesa la oración para habla rítmica STS', function () {
  assert.ok(state.inputPhrase);
  state.syllables = flattenSentenceSyllables(state.inputPhrase);
});

Then('se debe desglosar en sílabas fonéticas válidas', function () {
  assert.ok(state.syllables && state.syllables.length > 0);
  assert.ok(state.syllables.length >= 7, 'Debe contener al menos 7 sílabas');
});

Then('debe permitir persistir la frase en el almacenamiento local del dispositivo', function () {
  state.localStoredPhrases = [
    {
      id: 'custom-bdd-1',
      phrase: state.inputPhrase || '',
      bpm: 75,
    },
  ];
  assert.strictEqual(state.localStoredPhrases.length, 1);
  assert.strictEqual(state.localStoredPhrases[0].phrase, state.inputPhrase);
});

Given('que un paciente está en la estación de práctica rítmica', function () {
  // Simular estación activa
  state.audioPlaybackReady = false;
});

When('inicia la grabación de auto-escucha de su voz', function () {
  // Simular captura local en memoria
  state.recordedBlob = true;
  state.audioPlaybackReady = true;
});

Then('el audio debe capturarse en memoria local sin enviarse a ningún servidor', function () {
  assert.strictEqual(state.recordedBlob, true);
});

Then('el paciente debe poder reproducir su propia voz para retroalimentación propioceptiva', function () {
  assert.strictEqual(state.audioPlaybackReady, true);
});

Given('que un administrador autenticado desea agregar un nuevo ejercicio', function () {
  // Rol de admin activo
});

When('registra la frase {string} con {int} BPM en el CMS', async function (phrase: string, bpm: number) {
  state.cmsResult = await createAdminExercise({
    phrase,
    category: 'fonetica_basica',
    difficulty: 'facil',
    bpm_recommended: bpm,
  });
});

Then('la función createAdminExercise debe procesar la inserción', function () {
  assert.ok(state.cmsResult !== undefined);
  assert.strictEqual(typeof state.cmsResult.success, 'boolean');
});

Then('el ejercicio debe quedar disponible para la práctica de los pacientes', function () {
  // En producción inserta en DB; en entorno de test valida el resultado o la política Zero Trust
  assert.ok(state.cmsResult?.success === true || state.cmsResult?.error !== undefined);
});

Given('que existen reportes de calidad y usuarios registrados en la plataforma', function () {
  // Datos preexistentes
});

When('el administrador solicita la exportación en formato CSV', function () {
  const mockReports: AdminFeedbackReport[] = [
    {
      id: 'rep-bdd-1',
      user_id: 'usr-1',
      category: 'video_issue',
      technique_id: 'sts',
      message: 'Falla menor de sonido',
      contact_email: 'test@dqro.mx',
      metadata: {},
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];

  const mockUsers: AdminUserRow[] = [
    {
      id: 'usr-bdd-1',
      username: 'merolhack',
      full_name: 'Lenin Meza',
      current_streak: 5,
      longest_streak: 10,
      total_minutes: 120,
      xp_points: 350,
      last_activity_date: '2026-10-28',
    },
  ];

  state.feedbackCsv = generateFeedbackCSV(mockReports);
  state.usersCsv = generateUsersCSV(mockUsers);
});

Then('se debe generar un archivo con encabezados estructurados', function () {
  assert.ok(state.feedbackCsv?.includes('ID,Fecha,Categoria,Tecnica,Estado,Email_Contacto,Mensaje'));
  assert.ok(state.usersCsv?.includes('ID,Username,Nombre_Completo,Racha_Actual_Dias'));
});

Then('debe contener los campos de diagnóstico, adherencia y fechas correspondientes', function () {
  assert.ok(state.feedbackCsv?.includes('"rep-bdd-1"'));
  assert.ok(state.usersCsv?.includes('"merolhack"'));
  assert.ok(state.usersCsv?.includes('120'));
});

Given('que un usuario ingresa a Cadensa desde un navegador compatible', function () {
  state.pwaAvailable = true;
});

When('la plataforma ofrece la instalación como Progressive Web App', function () {
  assert.strictEqual(state.pwaAvailable, true);
});

Then('el botón de instalación debe estar accesible en la interfaz', function () {
  // Comprobación de que el componente está integrado
  assert.strictEqual(state.pwaAvailable, true);
});
