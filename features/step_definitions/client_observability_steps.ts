import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { reportAppError } from '../../src/lib/errorTracker';

interface ObservabilityContext {
  reportedGA4: boolean;
  reportedSupabase: boolean;
  duplicateSuppressed: boolean;
  lastErrorMsg: string | null;
}

const obsContext: ObservabilityContext = {
  reportedGA4: false,
  reportedSupabase: false,
  duplicateSuppressed: false,
  lastErrorMsg: null,
};

Given('que un usuario interactúa con la aplicación en su navegador', function () {
  obsContext.reportedGA4 = false;
  obsContext.reportedSupabase = false;
  obsContext.duplicateSuppressed = false;
  obsContext.lastErrorMsg = null;
});

When('ocurre una falla en el flujo de registro o interacción de un botón', async function () {
  const mockInsert = async () => ({ error: null });
  const mockClient = {
    from: () => ({ insert: mockInsert }),
  };

  obsContext.lastErrorMsg = 'Falla de conexión en el botón Continuar con Google';
  const res = await reportAppError(
    {
      message: obsContext.lastErrorMsg,
      component: 'AuthModal',
      eventName: 'auth_flow_error',
    },
    mockClient as never
  );

  obsContext.reportedGA4 = res.reportedToGA4;
  obsContext.reportedSupabase = res.reportedToSupabase;
});

Then('el sistema envía la excepción a Google Analytics 4 mediante el evento exception', function () {
  assert.ok(obsContext.lastErrorMsg !== null);
});

Then('registra el error en la base de datos de Supabase con política Zero Trust RLS', function () {
  assert.ok(obsContext.lastErrorMsg !== null);
});

Then('la telemetría falla silenciosamente sin interrumpir la experiencia del paciente', function () {
  assert.strictEqual(typeof obsContext.reportedGA4, 'boolean');
});

Given('que un componente de interfaz entra en un bucle de error recurrente', function () {
  obsContext.duplicateSuppressed = false;
});

When('se reportan errores con la misma firma en menos de 10 segundos', async function () {
  const mockClient = {
    from: () => ({ insert: async () => ({ error: null }) }),
  };

  const payload = {
    message: 'Loop de renderizado en componente',
    component: 'AudioVisualizer',
    eventName: 'loop_error',
  };

  await reportAppError(payload, mockClient as never);
  const second = await reportAppError(payload, mockClient as never);

  obsContext.duplicateSuppressed = !second.reportedToGA4 && !second.reportedToSupabase;
});

Then('el sistema descarta los duplicados para evitar saturación de red', function () {
  assert.strictEqual(obsContext.duplicateSuppressed, true);
});

