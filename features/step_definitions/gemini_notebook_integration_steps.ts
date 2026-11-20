import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildMasterWikiBundle,
  NOTEBOOK_UUID,
  MAX_NOTEBOOK_SOURCES,
  validateSourceQuota,
} from '../../scripts/sync-wiki-to-notebook.mjs';

const rootDir = process.cwd();
let compiledBundle: { content: string; sha256: string; fileCount: number } | null = null;
let syncScriptContent = '';

Given('que el proyecto Cadensa cuenta con su LLM Wiki modular en {string}', function (wikiRelPath: string) {
  const fullPath = path.join(rootDir, wikiRelPath);
  assert.ok(fs.existsSync(fullPath), `Debe existir el directorio ${wikiRelPath}`);
});

When('compilo el compendio maestro de sincronización para Gemini Notebook', function () {
  compiledBundle = buildMasterWikiBundle(rootDir);
});

Then('el compendio debe referenciar el cuaderno canónico {string}', function (expectedUuid: string) {
  assert.ok(compiledBundle, 'El compendio debe haberse compilado');
  assert.strictEqual(NOTEBOOK_UUID, expectedUuid);
  assert.ok(compiledBundle.content.includes(expectedUuid));
});

Then(
  'debe incluir las reglas de {string}, {string} y {string}',
  function (file1: string, file2: string, file3: string) {
    assert.ok(compiledBundle, 'El compendio debe haberse compilado');
    assert.ok(compiledBundle.content.includes(`# FILE: ${file1}`), `Falta ${file1}`);
    assert.ok(compiledBundle.content.includes(`# FILE: ${file2}`), `Falta ${file2}`);
    assert.ok(compiledBundle.content.includes(`# FILE: ${file3}`), `Falta ${file3}`);
  }
);

Then('debe generar una firma SHA-256 válida de 64 caracteres hexadecimales', function () {
  assert.ok(compiledBundle, 'El compendio debe haberse compilado');
  assert.match(compiledBundle.sha256, /^[a-f0-9]{64}$/);
});

Given('que se revisa el script {string}', function (scriptRelPath: string) {
  const fullPath = path.join(rootDir, scriptRelPath);
  assert.ok(fs.existsSync(fullPath), `Debe existir ${scriptRelPath}`);
  syncScriptContent = fs.readFileSync(fullPath, 'utf-8');
});

When('se valida su invocación a la herramienta MCP {string}', function (toolName: string) {
  assert.ok(syncScriptContent.includes(toolName), `El script debe invocar ${toolName}`);
});

Then('debe declarar explícitamente el parámetro de tipo texto estricto', function () {
  assert.ok(
    syncScriptContent.includes("type: 'text'"),
    "El script debe incluir explícitamente type: 'text' en add_source"
  );
});

Then('debe bloquear la publicación si se excede el límite máximo de {int} fuentes', function (limit: number) {
  assert.strictEqual(MAX_NOTEBOOK_SOURCES, limit);
  const blocked = validateSourceQuota(limit, 0, 1);
  assert.strictEqual(blocked.ok, false, `Debe bloquear al exceder ${limit} fuentes`);
  const allowed = validateSourceQuota(208, 1, 1);
  assert.strictEqual(allowed.ok, true, 'Debe permitir la sincronización dentro de cuota');
});

Then('{string} debe exponer el comando {string}', function (pkgFile: string, scriptName: string) {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, pkgFile), 'utf-8'));
  assert.ok(pkg.scripts?.[scriptName], `${pkgFile} debe definir el script ${scriptName}`);
});
