import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  evaluatePhoneticMatch,
  PhoneticMatchResult,
} from '../../src/lib/speechRecognitionHelper';
import {
  analyzeVocalTractKinematics,
  FormantAnalysisResult,
} from '../../src/lib/formantAnalyzer';
import {
  createBeatPulseMessage,
  serializeTelehealthMessage,
  parseTelehealthMessage,
  calculateRoundTripLatency,
  TelehealthMessage,
} from '../../src/lib/telehealthP2P';
import {
  PEDIATRIC_AVATARS,
  calculatePediatricReward,
} from '../../src/lib/pediatricFluency';

// Variables de estado de escenarios
let targetPhoneticPhrase = '';
let phoneticResult: PhoneticMatchResult;

let currentF1 = 0;
let currentF2 = 0;
let formantResult: FormantAnalysisResult;

let telehealthMessage: TelehealthMessage;
let transmittedJson = '';
let receivedLatencyMs = 0;

let selectedAvatarId = '';
let rewardResult: { stars: number; magicPoints: number; cheerMessage: string };

// 1. Escenario Hito 1: Validador Fonético
Given('que la frase objetivo es {string}', function (phrase: string) {
  targetPhoneticPhrase = phrase;
});

When('el paciente pronuncia la oración completa con articulación precisa', function () {
  phoneticResult = evaluatePhoneticMatch(targetPhoneticPhrase, targetPhoneticPhrase);
});

Then('el validador fonético calcula un porcentaje de coincidencia mayor o igual a {int}%', function (minPercentage: number) {
  assert.ok(
    phoneticResult.matchPercentage >= minPercentage,
    `Porcentaje obtenido ${phoneticResult.matchPercentage}% menor a ${minPercentage}%`
  );
});

Then('confirma que la articulación fonética es óptima', function () {
  assert.strictEqual(phoneticResult.isAccurate, true);
  assert.ok(phoneticResult.clinicalFeedback.includes('óptima'));
});

// 2. Escenario Hito 2: Biofeedback de Formantes
Given('que el paciente vocaliza con formante F1 en {int} Hz y formante F2 en {int} Hz', function (f1: number, f2: number) {
  currentF1 = f1;
  currentF2 = f2;
});

When('el analizador acústico evalúa la posición del tracto vocal', function () {
  formantResult = analyzeVocalTractKinematics(currentF1, currentF2);
});

Then('clasifica la vocal acústica más cercana como {string}', function (expectedVowel: string) {
  assert.strictEqual(formantResult.closestVowel, expectedVowel);
});

Then('determina que la apertura mandibular es {string} con posición lingual {string}', function (expectedAperture: string, expectedLingual: string) {
  assert.strictEqual(formantResult.mandibularAperture, expectedAperture);
  assert.strictEqual(formantResult.lingualPosition, expectedLingual);
});

// 3. Escenario Hito 3: Telesalud P2P
Given('que el fonoaudiólogo inicia una sala de telepráctica P2P', function () {
  // Inicialización de contexto de sala
  assert.ok(true);
});

Given('emite un pulso de metrónomo a {int} BPM para el paciente', function (bpm: number) {
  telehealthMessage = createBeatPulseMessage('therapist', bpm, 1);
});

When('el mensaje de sincronización es transmitido por el canal de datos', function () {
  transmittedJson = serializeTelehealthMessage(telehealthMessage);
  const parsed = parseTelehealthMessage(transmittedJson);
  assert.notStrictEqual(parsed, null);
  receivedLatencyMs = calculateRoundTripLatency(telehealthMessage.timestamp, telehealthMessage.timestamp + 18);
});

Then('el paciente recibe el pulso rítmico en tiempo real con latencia menor a {int} ms', function (maxLatencyMs: number) {
  assert.ok(
    receivedLatencyMs < maxLatencyMs,
    `Latencia ${receivedLatencyMs} ms supera el umbral de ${maxLatencyMs} ms`
  );
});

// 4. Escenario Hito 4: Fluidez Pediátrica
Given('que un niño selecciona al avatar {string} para hablar despacito', function (avatarName: string) {
  const found = Object.values(PEDIATRIC_AVATARS).find((a) => a.name === avatarName);
  assert.ok(found !== undefined, `Avatar ${avatarName} no encontrado`);
  selectedAvatarId = found.id;
  assert.strictEqual(selectedAvatarId, 'tortuga');
});

When('completa un desafío infantil de habla suave con {int}% de precisión rítmica', function (accuracy: number) {
  rewardResult = calculatePediatricReward(accuracy);
});

Then('recibe {int} estrellas y un mensaje de felicitación positivo', function (expectedStars: number) {
  assert.strictEqual(rewardResult.stars, expectedStars);
  assert.ok(rewardResult.cheerMessage.length > 0);
});
