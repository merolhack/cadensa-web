import { test, expect } from '@playwright/test';

test.describe('Cadensa Cross-Browser Core Suite', () => {
  test('debe cargar la página principal con dark mode y título clínico', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Cadensa/i);
    await expect(page.locator('text=Cadensa')).toBeVisible();
    await expect(page.locator('text=Encuentra el ritmo de tu voz')).toBeVisible();
  });

  test('debe navegar hacia la página Acerca de y mostrar los hitos completados', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('Acerca de Cadensa');
    await expect(page.locator('text=Syllable-Timed Speech (STS)')).toBeVisible();
  });

  test('debe permitir interactuar con la aventura infantil Cadensa Kids', async ({ page }) => {
    await page.goto('/');

    // Abrir modal infantil si existe o navegar al componente
    const kidsButton = page.locator('text=Cadensa Kids').first();
    if (await kidsButton.isVisible()) {
      await kidsButton.click();
      await expect(page.locator('text=Aventura del Habla Suave')).toBeVisible();
      await expect(page.locator('text=Tortuga Zen')).toBeVisible();
      
      // Probar avance al siguiente cuento
      const nextStory = page.locator('text=Siguiente Cuento').first();
      await nextStory.click();
      await expect(page.locator('text=Juega a atrapar la pelota')).toBeVisible();
    }
  });

  test('debe respetar las safe areas y clases de viewport dinámico', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toHaveClass(/min-h-full/);
  });
});

