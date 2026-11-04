import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('PWA Manifest & Asset Verification', () => {
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
  const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestRaw);

  it('debe tener un manifest.json válido con display standalone y metadatos clínicos', () => {
    expect(manifest.name).toContain('Cadensa');
    expect(manifest.short_name).toBe('Cadensa');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#09090b');
    expect(manifest.theme_color).toBe('#09090b');
    expect(manifest.version).toBe('2.5.0');
    expect(manifest.start_url).toBe('/');
  });

  it('debe definir íconos de 192x192 y 512x512 requeridos para instalación PWA en móviles', () => {
    const icon192 = manifest.icons.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (icon: any) => icon.sizes === '192x192' && icon.src.includes('192x192')
    );
    const icon512 = manifest.icons.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (icon: any) => icon.sizes === '512x512' && icon.src.includes('512x512')
    );

    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();
    expect(icon192.type).toBe('image/png');
    expect(icon512.type).toBe('image/png');
  });

  it('debe contar con los archivos físicos de íconos en public/icons/', () => {
    const icon192Path = path.resolve(process.cwd(), 'public/icons/icon-192x192.png');
    const icon512Path = path.resolve(process.cwd(), 'public/icons/icon-512x512.png');

    expect(fs.existsSync(icon192Path)).toBe(true);
    expect(fs.existsSync(icon512Path)).toBe(true);

    const stat192 = fs.statSync(icon192Path);
    const stat512 = fs.statSync(icon512Path);

    expect(stat192.size).toBeGreaterThan(100);
    expect(stat512.size).toBeGreaterThan(100);
  });

  it('debe verificar la presencia del Service Worker en public/sw.js con la versión v2.5.0', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('cadensa-v2.5.0');
    expect(swContent).toContain('/media/techniques/syllable-timed-speech_avatar_final.mp4');
    expect(swContent).toContain('/media/techniques/box-breathing_avatar_final.mp4');
  });
});

