import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  NOTEBOOK_UUID,
  NOTEBOOK_ID,
  MASTER_SOURCE_TITLE,
  collectWikiFiles,
  buildMasterWikiBundle,
} from '../../scripts/sync-wiki-to-notebook.mjs';

const rootDir = process.cwd();

describe('Gemini Notebook Integration & LLM Wiki Sync (Vitest)', () => {
  it('debe apuntar al UUID y Library ID canónicos del Gemini Notebook de Cadensa', () => {
    expect(NOTEBOOK_UUID).toBe('015dcad0-c2a3-4512-97eb-59ac4293d8c0');
    expect(NOTEBOOK_ID).toBe('cadensa-fluidez-y-terapia-del');
    expect(MASTER_SOURCE_TITLE).toBe('CADENSA-LLM-WIKI-KARPATHY-MASTER.md');
  });

  it('debe recopilar los archivos esenciales de la LLM Wiki de 3 capas', () => {
    const files = collectWikiFiles(rootDir);
    const relPaths = files.map((f: { rel: string }) => f.rel);

    expect(relPaths).toContain('AGENTS.md');
    expect(relPaths).toContain('wiki/SCHEMA.md');
    expect(relPaths).toContain('wiki/index.md');
    expect(relPaths).toContain('wiki/operations/gemini_notebook_integration.md');
    expect(files.length).toBeGreaterThanOrEqual(40);
  });

  it('debe compilar el compendio maestro con SHA-256 determinista y encabezado canónico', () => {
    const bundle = buildMasterWikiBundle(rootDir);

    expect(bundle.fileCount).toBeGreaterThanOrEqual(41);
    expect(bundle.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(bundle.content).toContain(`# ${MASTER_SOURCE_TITLE}`);
    expect(bundle.content).toContain(NOTEBOOK_UUID);
    expect(bundle.content).toContain('# FILE: wiki/log.md (RECENT SESSIONS)');
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
