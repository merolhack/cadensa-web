import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  getUserLevelTitle,
  evaluateUserBadges,
  Badge,
} from '../../src/lib/streaks.js';

interface BadgeWorld {
  xp?: number;
  levelTitle?: string;
  streakDays?: number;
  totalMinutes?: number;
  badges?: Badge[];
}

const state: BadgeWorld = {};

Given('que el usuario tiene acumulados {int} puntos de experiencia', function (xp: number) {
  state.xp = xp;
});

When('el sistema consulta el título de nivel', function () {
  if (state.xp === undefined) throw new Error('XP no definido');
  state.levelTitle = getUserLevelTitle(state.xp);
});

Then('el título debe ser {string}', function (expectedTitle: string) {
  assert.strictEqual(state.levelTitle, expectedTitle);
});

Given('que el usuario alcanza una racha de {int} días y {int} minutos acumulados', function (days: number, minutes: number) {
  state.streakDays = days;
  state.totalMinutes = minutes;
});

When('se evalúan las insignias desbloqueadas', function () {
  if (state.streakDays === undefined || state.totalMinutes === undefined) {
    throw new Error('Datos de progreso no definidos');
  }
  state.badges = evaluateUserBadges(state.streakDays, state.totalMinutes);
});

Then('la insignia {string} debe estar desbloqueada', function (badgeTitle: string) {
  const badge = state.badges?.find((b) => b.title === badgeTitle);
  assert.ok(badge, `Insignia no encontrada: ${badgeTitle}`);
  assert.strictEqual(badge.unlocked, true);
});
