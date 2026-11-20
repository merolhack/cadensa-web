import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  NOTEBOOK_UUID,
  NOTEBOOK_ID,
  MASTER_SOURCE_TITLE,
  MAX_NOTEBOOK_SOURCES,
  WARN_NOTEBOOK_SOURCES,
  validateSourceQuota,
  collectWikiFiles,
  buildMasterWikiBundle,
} from '../../scripts/sync-wiki-to-notebook.mjs';

const rootDir = process.cwd();

describe('Gemini Notebook Integration & LLM Wiki Sync (Vitest)', () => {
  it('debe apuntar al UUID, Library ID y límite de 300 fuentes canónicos del Gemini Notebook de Cadensa', () => {
    expect(NOTEBOOK_UUID).toBe('015dcad0-c2a3-4512-97eb-59ac4293d8c0');
    expect(NOTEBOOK_ID).toBe('cadensa-fluidez-y-terapia-del');
    expect(MASTER_SOURCE_TITLE).toBe('CADENSA-LLM-WIKI-KARPATHY-MASTER.md');
    expect(MAX_NOTEBOOK_SOURCES).toBe(300);
    expect(WARN_NOTEBOOK_SOURCES).toBe(270);
  });

  it('debe hacer cumplir la cuota máxima de 300 fuentes y emitir alerta preventiva >= 270', () => {
    const okState = validateSourceQuota(208, 1, 1);
    expect(okState.ok).toBe(true);
    expect(okState.warning).toBe(false);

    const warnState = validateSourceQuota(275, 1, 1);
    expect(warnState.ok).toBe(true);
    expect(warnState.warning).toBe(true);
    expect(warnState.reason).toContain('275/300');

    const blockedState = validateSourceQuota(300, 0, 1);
    expect(blockedState.ok).toBe(false);
    expect(blockedState.reason).toContain('301/300');
  });

  it('debe recopilar los archivos esenciales de la LLM Wiki de 3 capas incluyendo el roadmap priorizado', () => {
    const files = collectWikiFiles(rootDir);
    const relPaths = files.map((f: { rel: string }) => f.rel);

    expect(relPaths).toContain('AGENTS.md');
    expect(relPaths).toContain('wiki/SCHEMA.md');
    expect(relPaths).toContain('wiki/index.md');
    expect(relPaths).toContain('wiki/operations/gemini_notebook_integration.md');
    expect(relPaths).toContain('wiki/roadmap/gemini_notebook_prioritized_roadmap.md');
    expect(files.length).toBeGreaterThanOrEqual(41);
  });

  it('debe compilar el compendio maestro con SHA-256 determinista, encabezado canónico y horizontes P0-P3', () => {
    const bundle = buildMasterWikiBundle(rootDir);

    expect(bundle.fileCount).toBeGreaterThanOrEqual(42);
    expect(bundle.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(bundle.content).toContain(`# ${MASTER_SOURCE_TITLE}`);
    expect(bundle.content).toContain(NOTEBOOK_UUID);
    expect(bundle.content).toContain('# FILE: wiki/log.md (RECENT SESSIONS)');
    expect(bundle.content).toContain('Prioridad P0');
    expect(bundle.content).toContain('Prioridad P3');
  });

  it('AGENTS.md y wiki/SCHEMA.md deben declarar la regla estricta de ingesta, publicación y límite de 300 fuentes', () => {
    const agents = fs.readFileSync(path.join(rootDir, 'AGENTS.md'), 'utf-8');
    const schema = fs.readFileSync(path.join(rootDir, 'wiki', 'SCHEMA.md'), 'utf-8');

    expect(agents).toContain('MAX_NOTEBOOK_SOURCES = 300');
    expect(agents).toContain('Regla Estricta de Ingesta Modular en LLM Wiki y Publicación en Gemini Notebook');
    expect(schema).toContain('máximo 300 fuentes');
    expect(schema).toContain('Operación 4: Publish / Sync');
  });

  it('el script de sincronización debe declarar explícitamente type: "text" en add_source', () => {
    const scriptPath = path.join(rootDir, 'scripts', 'sync-wiki-to-notebook.mjs');
    const source = fs.readFileSync(scriptPath, 'utf-8');

    expect(source).toContain("type: 'text'");
    expect(source).toContain('confirm: true');
  });

  it('package.json debe exponer los comandos de sincronización y purga de Gemini Notebook', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.scripts['wiki:sync-notebook']).toBe('node scripts/sync-wiki-to-notebook.mjs');
    expect(pkg.scripts['wiki:sync-notebook:if-changed']).toBe(
      'node scripts/sync-wiki-to-notebook.mjs --if-changed'
    );
    expect(pkg.scripts['notebook:purge']).toBe('node scripts/purge-failed-notebook-sources.mjs');
  });
});
