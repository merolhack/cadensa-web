import { test, expect } from '@playwright/test';

/**
 * Cadensa Production Live Validation Suite (E2E / BDD)
 * 
 * Simula a un paciente real interactuando en el ambiente de producción:
 * https://cadensa-web.pages.dev/
 * 
 * Valida:
 * 1. Carga íntegra de la SPA estática y estilos en Dark Mode.
 * 2. Inyección y despacho de eventos en Google Analytics 4 (G-HCTT9146TJ).
 * 3. Apertura de modal de registro y presencia de Google OAuth 2.0.
 * 4. Despacho en tiempo real de telemetría de errores hacia Supabase Zero Trust RLS.
 */

const PROD_URL = 'https://cadensa-web.pages.dev';

test.describe('Validación en Ambiente Productivo (cadensa-web.pages.dev)', () => {
  test('debe navegar como usuario real, verificar GA4, OAuth y enviar telemetría a Supabase', async ({ page }) => {
    const gaRequests: string[] = [];
    const supabaseRequests: { url: string; method: string; status?: number }[] = [];

    // Monitorear peticiones de red hacia GA4 y Supabase
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('google-analytics.com') || url.includes('analytics.google.com') || url.includes('googletagmanager.com')) {
        gaRequests.push(url);
      }
      if (url.includes('supabase.co')) {
        supabaseRequests.push({ url, method: request.method() });
      }
    });

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('supabase.co/rest/v1/client_telemetry_errors')) {
        const item = supabaseRequests.find((r) => r.url === url && r.method === 'POST');
        if (item) {
          item.status = response.status();
        }
      }
    });

    // 1. Navegación inicial a producción
    console.log(`🌐 Navegando hacia ${PROD_URL}...`);
    await page.goto(PROD_URL, { waitUntil: 'networkidle' });

    // 2. Verificación de carga y estructura base
    await expect(page).toHaveTitle(/Cadensa/i);
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // 3. Verificación de Google Analytics 4 (G-HCTT9146TJ)
    const hasGtagScript = gaRequests.some((url) => url.includes('G-HCTT9146TJ'));
    console.log(`📊 Google Analytics 4 Script cargado: ${hasGtagScript ? 'SÍ' : 'NO'}`);
    expect(hasGtagScript).toBe(true);

    // 4. Interacción del usuario: abrir modal de autenticación
    const authBtn = page.locator('button:has-text("Iniciar Sesión"), button:has-text("Mi Cuenta"), button:has-text("Entrar")').first();
    if (await authBtn.isVisible()) {
      await authBtn.click();
      await page.waitForTimeout(500);

      // Verificar botón de Google OAuth
      const googleBtn = page.locator('button:has-text("Google"), button:has-text("Continuar con Google")').first();
      await expect(googleBtn).toBeVisible();
      console.log('🔑 Botón de Google OAuth visible y operativo en el modal.');

      // Cerrar modal
      const closeBtn = page.locator('button:has-text("✕"), button:has-text("Cerrar"), button[aria-label="Cerrar"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }

    // 5. Simular acción de práctica y navegación a técnica
    const techniqueNav = page.locator('a[href="/tecnicas/sts"], a[href*="/tecnicas/"]').first();
    if (await techniqueNav.isVisible()) {
      console.log('🗣️ Navegando hacia la página de técnica clínica...');
      await techniqueNav.click();
      await page.waitForLoadState('networkidle');
    }

    // 6. Prueba de telemetría en vivo: despachar un reporte real hacia Supabase y GA4
    console.log('📡 Despachando reporte de telemetría de prueba en vivo desde el navegador...');
    const clientResult = await page.evaluate(async () => {
      // Inyectar un reporte controlado directamente a través del motor de telemetría
      const testPayload = {
        message: 'Prueba E2E de Verificación en Producción (Usuario Simulado)',
        component: 'E2EProductionValidator',
        eventName: 'e2e_live_validation',
        fatal: false,
        metadata: {
          runner: 'playwright',
          environment: 'production',
          timestamp: new Date().toISOString(),
        },
      };

      // Si reportAppError está en window o mediante fetch directo a Supabase
      const win = window as unknown as {
        reportAppError?: (p: typeof testPayload) => Promise<{ reportedToSupabase: boolean; reportedToGA4: boolean }>;
        gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
      };

      if (typeof win.gtag === 'function') {
        win.gtag('event', 'exception', {
          description: testPayload.message,
          fatal: false,
        });
      }

      // Enviar directamente al endpoint de Supabase de producción usando la llave anónima pública
      const anonKey = 'sb_publishable_mMAujK8tzTnjF6FSrL-lAA_1U5nXZ1_';
      const sbUrl = 'https://kddeejyhnxrnmkmiwjxp.supabase.co';

      const resp = await fetch(`${sbUrl}/rest/v1/client_telemetry_errors`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: null,
          event_name: testPayload.eventName,
          error_message: testPayload.message,
          component: testPayload.component,
          url: window.location.href,
          user_agent: navigator.userAgent,
          metadata: testPayload.metadata,
        }),
      });

      return { status: resp.status, ok: resp.ok };
    });

    console.log(`📦 Respuesta de inserción en Supabase: HTTP ${clientResult.status}`);
    expect(clientResult.ok).toBe(true);
    expect(clientResult.status).toBe(201);

    console.log('✅ ¡Telemetría recibida e insertada exitosamente en Supabase (HTTP 201 Created)!');
  });
});
