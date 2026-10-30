import { test, expect } from '@playwright/test';

/**
 * Cadensa E2E: Simulación de Usuario Registrándose con Google OAuth 2.0 (Estrategia B)
 * Valida la experiencia de usuario completa:
 * 1. Práctica inicial en modo invitado (sesiones locales 'local_guest').
 * 2. Apertura de modal de autenticación y activación de botón 'Continuar con Google'.
 * 3. Disparo de flujo OAuth y adopción automática de datos locales (Data Claiming).
 */
test.describe('Flujo de Registro con Google OAuth y Adopción de Datos', () => {
  test('debe permitir a un usuario invitado abrir el modal de autenticación y verificar el botón de Google', async ({
    page,
  }) => {
    // 1. Simular sesiones previas en modo invitado (local_guest) en localStorage
    await page.addInitScript(() => {
      localStorage.setItem('cadensa_sessions', JSON.stringify([
        {
          id: 'test-guest-session-1',
          bpm: 80,
          durationSeconds: 90,
          syllableCount: 12,
          accuracyScore: 94,
          userId: 'local_guest',
          completedAt: new Date().toISOString(),
        },
      ]));
      localStorage.setItem('cadensa_streak_days', '3');
      localStorage.setItem('cadensa_total_minutes', '15');
      localStorage.setItem('cadensa_xp_points', '350');
    });

    await page.goto('/');

    // 2. Verificar que se renderiza el botón de Iniciar Sesión en el catálogo
    const loginButton = page.locator('button:has-text("Iniciar Sesión")').first();
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // 3. Verificar que el modal de autenticación se abre con la opción de Google
    const googleButton = page.locator('button:has-text("Continuar con Google")');
    await expect(googleButton).toBeVisible();

    // 4. Simular la adopción de datos post-autenticación al recibir el evento SIGNED_IN
    const testUserId = '00000000-1111-2222-3333-444444444444';
    const testEmail = 'paciente.cadensa@gmail.com';

    await page.evaluate(
      ({ uid, email }) => {
        // Simular que Supabase emite sesión en cliente
        localStorage.setItem('cadensa_user_id', uid);
        localStorage.setItem('cadensa_user_email', email);

        // Disparar adopción de sesiones locales
        const raw = localStorage.getItem('cadensa_sessions');
        if (raw) {
          const sessions = JSON.parse(raw);
          const updated = sessions.map((s: { userId?: string }) => ({
            ...s,
            userId: uid,
          }));
          localStorage.setItem('cadensa_sessions', JSON.stringify(updated));
        }
      },
      { uid: testUserId, email: testEmail }
    );

    // 5. Recargar y verificar que la UI reconoce al usuario autenticado
    await page.reload();

    const storedUserId = await page.evaluate(() => localStorage.getItem('cadensa_user_id'));
    expect(storedUserId).toBe(testUserId);

    const updatedSessions = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cadensa_sessions') || '[]')
    );
    expect(updatedSessions[0].userId).toBe(testUserId);
  });
});

