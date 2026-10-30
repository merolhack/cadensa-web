import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Zero Trust Compliance Audit', () => {
  it('public/_headers debe implementar headers de seguridad HTTP esenciales', () => {
    const headersPath = path.resolve(process.cwd(), 'public/_headers');
    expect(fs.existsSync(headersPath)).toBe(true);

    const headersContent = fs.readFileSync(headersPath, 'utf8');

    // 1. Anti-Clickjacking
    expect(headersContent).toContain('X-Frame-Options: DENY');

    // 2. MIME sniffing protection
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');

    // 3. Permissions Policy restrictiva (cámara bloqueada, micro solo self)
    expect(headersContent).toContain('Permissions-Policy:');
    expect(headersContent).toContain('microphone=(self)');
    expect(headersContent).toContain('camera=()');
    expect(headersContent).toContain('geolocation=()');

    // 4. Strict Transport Security (HSTS)
    expect(headersContent).toContain('Strict-Transport-Security:');
    expect(headersContent).toContain('max-age=31536000');

    // 5. Content Security Policy (CSP)
    expect(headersContent).toContain('Content-Security-Policy:');
    expect(headersContent).toContain("object-src 'none'");
    expect(headersContent).toContain("base-uri 'self'");
  });

  it('no debe exponer service_role secret ni tokens privados en variables con prefijo NEXT_PUBLIC_', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [key] = trimmed.split('=');

        if (key.includes('SERVICE_ROLE') || key.includes('SECRET_KEY') || key.includes('ACCESS_TOKEN')) {
          expect(key.startsWith('NEXT_PUBLIC_')).toBe(false);
        }
      }
    }
  });

  it('.gitignore debe proteger estrictamente archivos de entorno y secretos', () => {
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf8');
    expect(content).toMatch(/\.env(\.local)?/);
  });
});

