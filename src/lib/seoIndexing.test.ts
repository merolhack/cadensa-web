import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('SEO & IndexNow Validation Assets', () => {
  const indexNowKey = '856757614ffc2c5582fbcb81b1b4e4ca';
  const keyFilePath = path.resolve(process.cwd(), `public/${indexNowKey}.txt`);
  const robotsFilePath = path.resolve(process.cwd(), 'public/robots.txt');

  it('debe existir el archivo de verificación de IndexNow en public/ con el valor exacto de la clave', () => {
    expect(fs.existsSync(keyFilePath)).toBe(true);

    const content = fs.readFileSync(keyFilePath, 'utf-8').trim();
    expect(content).toBe(indexNowKey);
    expect(content).toHaveLength(32);
  });

  it('debe contar con robots.txt configurado con la directiva oficial de Sitemap y Host', () => {
    expect(fs.existsSync(robotsFilePath)).toBe(true);

    const content = fs.readFileSync(robotsFilePath, 'utf-8');
    expect(content.toLowerCase()).toContain('user-agent: *');
    expect(content).toContain('Allow: /');
    expect(content).toContain('Sitemap: https://cadensa-web.pages.dev/sitemap.xml');
    expect(content).toContain('Host: https://cadensa-web.pages.dev');
  });
});
