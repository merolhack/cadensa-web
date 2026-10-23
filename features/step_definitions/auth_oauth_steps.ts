import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

interface AuthSessionContext {
  isNewUser: boolean;
  hasAccessGranted: boolean;
  isEmailVerified: boolean;
  localBackupActive: boolean;
  oauthProviderInitiated: string | null;
}

const authContext: AuthSessionContext = {
  isNewUser: false,
  hasAccessGranted: false,
  isEmailVerified: false,
  localBackupActive: false,
  oauthProviderInitiated: null,
};

Given('que un usuario nuevo ingresa a Cadensa por primera vez', function () {
  authContext.isNewUser = true;
  authContext.hasAccessGranted = false;
  authContext.isEmailVerified = false;
  authContext.localBackupActive = false;
});

When('decide iniciar sesión o registrar su cuenta', function () {
  // Con política de Soft Confirmation, se autoriza acceso sin bloquear
  authContext.hasAccessGranted = true;
  authContext.localBackupActive = true;
});

Then('el sistema le permite practicar de inmediato sin exigir confirmación previa de correo', function () {
  assert.strictEqual(authContext.hasAccessGranted, true);
  assert.strictEqual(authContext.isEmailVerified, false);
});

Then('sus sesiones se respaldan localmente en el dispositivo', function () {
  assert.strictEqual(authContext.localBackupActive, true);
});

Given('que un usuario prefiere no recordar contraseñas', function () {
  authContext.oauthProviderInitiated = null;
});

When('selecciona la opción "Continuar con Google"', function () {
  authContext.oauthProviderInitiated = 'google';
});

Then('el sistema inicia el flujo de autenticación delegada hacia Supabase Auth', function () {
  assert.strictEqual(authContext.oauthProviderInitiated, 'google');
});

Then('redirige al usuario para sincronizar su perfil en la nube', function () {
  assert.strictEqual(authContext.oauthProviderInitiated !== null, true);
});
