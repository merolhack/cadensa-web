import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('SEO & IndexNow Validation Assets', () => {
  const indexNowKey = '856757614ffc2c5582fbcb81b1b4e4ca';
  const keyFilePath = path.resolve(process.cwd(), `public/${indexNowKey}.txt`);
  const robotsFilePath = path.resolve(process.cwd(), 'public/robots.txt');
  const auditPerfScriptPath = path.resolve(process.cwd(), 'scripts/audit_seo_performance.py');
  const uatProtocolPath = path.resolve(process.cwd(), 'wiki/operations/uat_protocol.md');
  const csvReportPath = path.resolve(process.cwd(), 'reports/seo_performance_report.csv');

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

  it('debe existir el script de auditoría de rendimiento SEO con permisos y opciones CLI', () => {
    expect(fs.existsSync(auditPerfScriptPath)).toBe(true);
    const content = fs.readFileSync(auditPerfScriptPath, 'utf-8');
    expect(content).toContain('cadensa_seo_performance');
    expect(content).toContain('--export-csv');
    expect(content).toContain('--dry-run');
    expect(content).toContain('syllable-timed-speech');
  });

  it('debe generar el reporte CSV con BOM UTF-8 y encabezados canónicos para Excel', () => {
    expect(fs.existsSync(csvReportPath)).toBe(true);
    const buffer = fs.readFileSync(csvReportPath);
    // Verificar BOM UTF-8: 0xEF, 0xBB, 0xBF
    expect(buffer[0]).toBe(0xef);
    expect(buffer[1]).toBe(0xbb);
    expect(buffer[2]).toBe(0xbf);

    const content = buffer.toString('utf-8');
    expect(content).toContain('Técnica (Slug)');
    expect(content).toContain('URL Canónica');
    expect(content).toContain('Clics');
    expect(content).toContain('Impresiones');
    expect(content).toContain('CTR (%)');
    expect(content).toContain('Posición Media');
  });

  it('debe existir el Protocolo UAT fonoaudiológico con todos los escenarios clínicos requeridos', () => {
    expect(fs.existsSync(uatProtocolPath)).toBe(true);
    const content = fs.readFileSync(uatProtocolPath, 'utf-8');
    expect(content).toContain('Protocolo de Pruebas de Aceptación de Usuario (UAT)');
    expect(content).toContain('Instalación y Experiencia PWA');
    expect(content).toContain('Reproducción Audiovisual y Biofeedback en Vivo');
    expect(content).toContain('Práctica de Auto-Escucha y Sincronización con Metrónomo');
    expect(content).toContain('Exportación de Progreso Clínico en Formato CSV');
    expect(content).toContain('Navegación Accesible (a11y - WCAG 2.1 AA)');
    expect(content).toContain('Resiliencia Offline (PWA Offline-First)');
  });
});
