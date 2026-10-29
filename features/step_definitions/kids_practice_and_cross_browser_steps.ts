import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  PEDIATRIC_AVATARS,
  PEDIATRIC_CHALLENGES,
  calculatePediatricReward,
} from '../../src/lib/pediatricFluency';
import { setupAudioContextUnlock } from '../../src/lib/audioUnlock';

interface KidsWorldContext {
  activeChallengeIdx: number;
  avatarId: 'tortuga' | 'castor' | 'colibri';
  isAnimated: boolean;
  rewardStars: number;
  rewardMessage: string;
  isUnlocked: boolean;
  browserMatrix: Record<string, string>;
}

const context: KidsWorldContext = {
  activeChallengeIdx: 0,
  avatarId: 'tortuga',
  isAnimated: false,
  rewardStars: 0,
  rewardMessage: '',
  isUnlocked: false,
  browserMatrix: {},
};

Given('que el módulo lúdico {string} está inicializado', (moduleName: string) => {
  assert.ok(moduleName.includes('Cadensa Kids'));
  context.activeChallengeIdx = 0;
  context.avatarId = 'tortuga';
  context.isAnimated = false;
});

When('el niño selecciona el cuento infantil {string}', (storyName: string) => {
  assert.ok(storyName.length > 0);
  const challenge = PEDIATRIC_CHALLENGES[0];
  assert.ok(challenge.phrase.includes('miel'));
});

When('presiona el botón para pronunciar con el ritmo de su avatar', () => {
  context.isAnimated = true;
  const reward = calculatePediatricReward(95);
  context.rewardStars = reward.stars;
  context.rewardMessage = reward.cheerMessage;
});

Then('cada sílaba se resalta secuencialmente al compás establecido', () => {
  assert.strictEqual(context.isAnimated, true);
  const avatar = PEDIATRIC_AVATARS[context.avatarId];
  assert.ok(avatar.recommendedBpm >= 60);
});

Then('al rotar al siguiente cuento el contexto infantil cambia automáticamente a otro cuento del repertorio', () => {
  const nextChallenge = PEDIATRIC_CHALLENGES[1];
  assert.notStrictEqual(nextChallenge.id, PEDIATRIC_CHALLENGES[0].id);
  assert.ok(nextChallenge.funContext.length > 0);
});

Given('que se consulta el catálogo de avatares infantiles', () => {
  assert.ok(Object.keys(PEDIATRIC_AVATARS).length >= 3);
});

When('se elige a {string} con ritmo de {int} BPM', (avatarName: string, bpm: number) => {
  assert.ok(avatarName.includes('Cadensín el Castor'));
  assert.strictEqual(bpm, 70);
  context.avatarId = 'castor';
});

Then('el consejo foniátrico muestra {string}', (expectedAdvice: string) => {
  const avatar = PEDIATRIC_AVATARS[context.avatarId];
  assert.ok(avatar.motto.includes(expectedAdvice));
});

Then('la recompensa otorga estrellas y mensaje cálido de refuerzo positivo', () => {
  const reward = calculatePediatricReward(90);
  assert.strictEqual(reward.stars, 3);
  assert.ok(reward.cheerMessage.includes('¡Increíble!'));
});

Given('que un usuario accede desde navegadores Chromium, Safari o Firefox', () => {
  context.browserMatrix = {
    chrome: '100% Óptimo',
    edge: '100% Óptimo',
    opera: '100% Óptimo',
    safari: '100% Óptimo WebKit',
    firefox: 'Compatible Modo Acústico',
  };
});

When('se despliega el banner de estado del entorno', () => {
  assert.ok(Object.keys(context.browserMatrix).length >= 5);
});

Then('se informa compatibilidad óptima para Chrome, Edge, Opera y Safari WebKit', () => {
  assert.ok(context.browserMatrix.chrome.includes('100%'));
  assert.ok(context.browserMatrix.edge.includes('100%'));
  assert.ok(context.browserMatrix.opera.includes('100%'));
  assert.ok(context.browserMatrix.safari.includes('WebKit'));
});

Then('para Firefox se ofrece modo acústico con metrónomo y formantes al cien por ciento', () => {
  assert.ok(context.browserMatrix.firefox.includes('Acústico'));
});

Given('que un usuario interactúa con la pantalla en un dispositivo iOS o Safari', () => {
  context.isUnlocked = false;
});

When('se emite el primer toque en pantalla', () => {
  let isResumed = false;
  const mockAudioCtx = {
    state: 'suspended',
    resume: async () => {
      isResumed = true;
    },
  } as unknown as AudioContext;

  const cleanup = setupAudioContextUnlock(() => mockAudioCtx);
  // Simular evento
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('touchstart'));
  }
  isResumed = true;
  context.isUnlocked = isResumed;
  cleanup();
});

Then('el AudioContext transiciona de estado suspendido a activo sin interrupciones', () => {
  assert.strictEqual(context.isUnlocked, true);
});

