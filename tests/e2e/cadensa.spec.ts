import { test, expect } from '@playwright/test';

test.describe('Cadensa E2E Suite - Validación Clínica y Navegación Real', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mockear peticiones a archivos de video MP4 pesados para acelerar las pruebas E2E
    await page.route('**/*.mp4', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: Buffer.from([]),
      });
    });

    // 2. Desactivar el WelcomeTour automático mediante localStorage para interacción directa
    await page.addInitScript(() => {
      window.localStorage.setItem('cadensa_ftue_completed', 'true');
    });
  });

  test('debe cargar la página principal y verificar el registro del Service Worker (sw.js)', async ({
    page,
  }) => {
    await page.goto('/');

    // Verificar encabezado y título de la plataforma
    await expect(page).toHaveTitle(/Cadensa/i);
    await expect(page.locator('text=Cadensa').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText('Encuentra el ritmo de tu voz');

    // Esperar a que la página se estabilice y registre el Service Worker
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Evaluar registro activo del Service Worker en el navegador real
    const isServiceWorkerRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      } catch {
        return false;
      }
    });

    expect(isServiceWorkerRegistered).toBe(true);
  });

  test('debe abrir el modal de una técnica clínica (STS) y cargar el reproductor de video', async ({
    page,
  }) => {
    await page.goto('/');

    // Abrir el video de demostración fonoaudiológica (botón Avatar IA o thumbnail STS)
    const stsTrigger = page
      .locator('[aria-label*="Reproducir video demostrativo de Habla Rítmica Silábica"]')
      .first();

    if (await stsTrigger.isVisible()) {
      await stsTrigger.click();
    } else {
      const avatarBtn = page.locator('button:has-text("Avatar IA")').first();
      await avatarBtn.click();
    }

    // Verificar que el modal accesible se abre
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Habla Rítmica Silábica/i);

    // Iniciar la reproducción interactiva del video (Façade Pattern) si está en portada
    const playDemoBtn = dialog
      .locator('button[aria-label*="Reproducir video"]')
      .or(dialog.locator('button:has-text("Reproducir Demo")'))
      .first();

    if (await playDemoBtn.isVisible()) {
      await playDemoBtn.click();
    }

    // Verificar que el elemento de video multimedia está presente y adjunto al DOM
    const videoElement = dialog.locator('video');
    await expect(videoElement).toBeAttached();

    // Cerrar el modal mediante botón de cierre accesible
    const closeBtn = dialog.locator('button[aria-label="Cerrar modal de video"]').first();
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('debe abrir CustomPhraseTrainer, silabizar y renderizar las cajas visuales de sílabas', async ({
    page,
  }) => {
    await page.goto('/');

    // Abrir sección de laboratorio clínico si está colapsada
    const labToggle = page.locator('button:has-text("Laboratorio y Herramientas Clínicas")').first();
    if (await labToggle.isVisible()) {
      await labToggle.click();
    }

    // Abrir modal de Frases de Desafío desde el catálogo
    const openTrainerBtn = page.locator('button:has-text("Frases Desafío")').first();
    await openTrainerBtn.click();

    // Verificar que el modal de frases está visible
    const trainerDialog = page.locator('[role="dialog"]').first();
    await expect(trainerDialog).toBeVisible();
    await expect(trainerDialog).toContainText('Mis Frases de Desafío');

    // Escribir una frase personalizada en el input
    const phraseInput = trainerDialog.locator('#custom-phrase-input');
    await expect(phraseInput).toBeVisible();
    await phraseInput.fill('Quiero un café con leche por favor');

    // Hacer clic en el botón de Silabizar
    const silabizeBtn = trainerDialog.locator('button:has-text("Silabizar")');
    await silabizeBtn.click();

    // Verificar que el contenedor de cajas visuales se renderiza
    await expect(trainerDialog.locator('text=Cajas Visuales de Sílabas')).toBeVisible();

    // Verificar que las sílabas individuales métricas se renderizan en sus cajas visuales
    await expect(trainerDialog.locator('text=Quie').first()).toBeVisible();
    await expect(trainerDialog.locator('text=ro').first()).toBeVisible();
    await expect(trainerDialog.locator('text=un').first()).toBeVisible();
    await expect(trainerDialog.locator('text=ca').first()).toBeVisible();
    await expect(trainerDialog.locator('text=fé').first()).toBeVisible();

    // Verificar la presencia del botón de reproducción TTS con metrónomo
    await expect(
      trainerDialog.locator('button:has-text("Reproducir con Metrónomo TTS")')
    ).toBeVisible();

    // Cerrar modal
    const closeTrainerBtn = trainerDialog.locator('button[aria-label="Cerrar modal"]').first();
    await closeTrainerBtn.click();
    await expect(trainerDialog).not.toBeVisible();
  });

  test('debe navegar hacia las páginas de Login y Registro de pacientes', async ({ page }) => {
    // 1. Navegar a /login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Iniciar Sesión');
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar a Cadensa")')).toBeVisible();

    // 2. Navegar a /register
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Crear Cuenta');
    await expect(page.locator('#register-email')).toBeVisible();
    await expect(page.locator('#register-password')).toBeVisible();
    await expect(page.locator('#register-confirm-password')).toBeVisible();
    await expect(page.locator('button:has-text("Crear mi Cuenta")')).toBeVisible();
  });
});
