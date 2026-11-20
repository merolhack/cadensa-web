#!/usr/bin/env node
/**
 * Syncs the 3-layer Karpathy LLM Wiki (AGENTS.md, wiki/) of Cadensa to the
 * canonical Gemini Notebook (015dcad0-c2a3-4512-97eb-59ac4293d8c0) via
 * @arlinamid/notebooklm-mcp (JSON-RPC 2.0 over stdio).
 *
 * Usage:
 *   node scripts/sync-wiki-to-notebook.mjs
 *   node scripts/sync-wiki-to-notebook.mjs --if-changed
 *   node scripts/sync-wiki-to-notebook.mjs --dry-run
 *   node scripts/sync-wiki-to-notebook.mjs --ask="¿Cuáles son los siguientes pasos?"
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..');
export const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
export const STATE_FILE = path.join(ROOT_DIR, '.git', 'cadensa-wiki-sync-state.json');

export const NOTEBOOK_UUID = '015dcad0-c2a3-4512-97eb-59ac4293d8c0';
export const NOTEBOOK_URL = `https://notebook.google.com/notebook/${NOTEBOOK_UUID}`;
export const NOTEBOOK_ID = 'cadensa-fluidez-y-terapia-del';
export const MASTER_SOURCE_TITLE = 'CADENSA-LLM-WIKI-KARPATHY-MASTER.md';
export const LEGACY_SOURCE_TITLES = ['CADENSA_MASTER_SUMMARY.md'];
export const MAX_NOTEBOOK_SOURCES = 300;
export const WARN_NOTEBOOK_SOURCES = 270;

export function validateSourceQuota(currentCount, pendingRemovals = 0, additions = 1) {
  const projectedPeak = currentCount + additions;
  const projectedFinal = currentCount - pendingRemovals + additions;
  if (projectedFinal > MAX_NOTEBOOK_SOURCES || projectedPeak > MAX_NOTEBOOK_SOURCES) {
    return {
      ok: false,
      warning: true,
      projectedPeak,
      projectedFinal,
      reason: `Cuota máxima de Gemini Notebook excedida (${projectedPeak}/${MAX_NOTEBOOK_SOURCES}). Purga fuentes duplicadas o sin valor antes de sincronizar.`,
    };
  }
  return {
    ok: true,
    warning: projectedFinal >= WARN_NOTEBOOK_SOURCES,
    projectedPeak,
    projectedFinal,
    reason:
      projectedFinal >= WARN_NOTEBOOK_SOURCES
        ? `Advertencia preventiva: ${projectedFinal}/${MAX_NOTEBOOK_SOURCES} fuentes (umbral >= ${WARN_NOTEBOOK_SOURCES}).`
        : null,
  };
}

export function collectWikiFiles(rootDir = ROOT_DIR) {
  const wikiDir = path.join(rootDir, 'wiki');
  const ordered = [];

  const rootFiles = ['AGENTS.md', 'GEMINI.md'];
  for (const rf of rootFiles) {
    const full = path.join(rootDir, rf);
    if (fs.existsSync(full)) ordered.push({ rel: rf, full });
  }

  const topWiki = ['SCHEMA.md', 'index.md'];
  for (const tw of topWiki) {
    const full = path.join(wikiDir, tw);
    if (fs.existsSync(full)) ordered.push({ rel: `wiki/${tw}`, full });
  }

  const subdirs = ['architecture', 'concepts', 'entities', 'operations', 'roadmap'];
  for (const sub of subdirs) {
    const dirPath = path.join(wikiDir, sub);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.md'))
      .sort();
    for (const f of files) {
      ordered.push({ rel: `wiki/${sub}/${f}`, full: path.join(dirPath, f) });
    }
  }

  return ordered;
}

export function buildMasterWikiBundle(rootDir = ROOT_DIR) {
  const wikiDir = path.join(rootDir, 'wiki');
  const files = collectWikiFiles(rootDir);
  const chunks = [];

  for (const file of files) {
    const body = fs.readFileSync(file.full, 'utf8').trim();
    chunks.push(
      `\n\n================================================================================\n# FILE: ${file.rel}\n================================================================================\n\n${body}`
    );
  }

  // wiki/log.md en Cadensa es append-only (entradas más recientes al final)
  const logPath = path.join(wikiDir, 'log.md');
  let includedLog = 0;
  if (fs.existsSync(logPath)) {
    const allLines = fs.readFileSync(logPath, 'utf8').split(/\r?\n/);
    const recentLines = allLines.slice(-150).join('\n');
    chunks.push(
      `\n\n================================================================================\n# FILE: wiki/log.md (RECENT SESSIONS)\n================================================================================\n\n${recentLines}`
    );
    includedLog = 1;
  }

  const rawBody = chunks.join('\n');
  const sha256 = crypto.createHash('sha256').update(rawBody, 'utf8').digest('hex');

  const header = [
    `# ${MASTER_SOURCE_TITLE} — Compendio Maestro de la LLM Wiki (Cadensa)`,
    `- **Proyecto:** Cadensa — *"Encuentra el ritmo de tu voz."*`,
    `- **Notebook ID:** \`${NOTEBOOK_UUID}\``,
    `- **Arquitectura:** Karpathy 3-Layer LLM Wiki (\`wiki/raw/\`, \`wiki/\`, \`wiki/SCHEMA.md\`)`,
    `- **Archivos Compilados:** ${files.length + includedLog}`,
    `- **SHA-256:** \`${sha256}\``,
    `- **Fecha de Compilación:** ${new Date().toISOString()}`,
  ].join('\n');

  return {
    content: `${header}\n${rawBody}\n`,
    sha256,
    fileCount: files.length + includedLog,
  };
}

function hasGitWikiChanges(currentSha256) {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (saved.sha256 === currentSha256) {
        return false;
      }
    }
  } catch {
    // Ignore corrupt state file
  }
  return true;
}

class McpStdioClient {
  constructor() {
    this.proc = null;
    this.buffer = '';
    this.pending = new Map();
    this.nextId = 1;
  }

  async start() {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'npx.cmd' : 'npx';
    this.proc = spawn(cmd, ['-y', '-p', '@arlinamid/notebooklm-mcp@latest', 'notebooklm-mcp'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWin,
    });

    this.proc.stdout.on('data', (chunk) => {
      this.buffer += chunk.toString('utf8');
      let idx;
      while ((idx = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (!line.startsWith('{')) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            else resolve(msg.result);
          }
        } catch {
          // Ignore non-JSON lines
        }
      }
    });

    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'cadensa-wiki-sync', version: '1.0.0' },
    });
    this.notify('notifications/initialized', {});
  }

  request(method, params, timeoutMs = 180000) {
    const id = this.nextId++;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`MCP timeout (${timeoutMs}ms) on ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      this.proc.stdin.write(payload);
    });
  }

  notify(method, params) {
    this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  async callTool(name, argsObj, timeoutMs = 180000) {
    const res = await this.request('tools/call', { name, arguments: argsObj }, timeoutMs);
    if (res?.structuredContent) return res.structuredContent;
    const text = res?.content?.[0]?.text;
    if (text) {
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }
    return res;
  }

  close() {
    if (this.proc) {
      try {
        this.proc.stdin.end();
        this.proc.kill('SIGTERM');
      } catch {
        // Ignore
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const ifChangedOnly = args.includes('--if-changed');
  const dryRun = args.includes('--dry-run');
  const askArg = args.find((a) => a.startsWith('--ask='));
  const askQuestionText = askArg ? askArg.slice('--ask='.length) : null;

  const bundle = buildMasterWikiBundle();
  console.log(
    `📚 Compiled ${bundle.fileCount} Wiki files (${bundle.content.length} chars, SHA-256: ${bundle.sha256.slice(0, 12)}...)`
  );

  if (ifChangedOnly && !hasGitWikiChanges(bundle.sha256) && !askQuestionText) {
    console.log('✅ Wiki bundle SHA-256 matches last synced state. Skipping upload.');
    process.exit(0);
  }

  if (dryRun) {
    console.log('✅ Dry-run mode complete.');
    process.exit(0);
  }

  const client = new McpStdioClient();
  let sessionId;
  try {
    await client.start();
    const health = await client.callTool('get_health', {});
    if (!health?.data?.authenticated) {
      throw new Error('notebooklm-mcp is not authenticated. Run setup_auth first.');
    }

    if (!ifChangedOnly || hasGitWikiChanges(bundle.sha256)) {
      console.log('🔍 Checking existing Wiki sources in Gemini Notebook...');
      const sourcesRes = await client.callTool('list_sources', { notebook_id: NOTEBOOK_ID });
      sessionId = sourcesRes?.data?.session_id || sessionId;
      const sources = sourcesRes?.data?.sources || [];
      const oldWikiSources = sources.filter(
        (s) =>
          typeof s.title === 'string' &&
          (s.title.startsWith('CADENSA-LLM-WIKI-KARPATHY') ||
            s.title === MASTER_SOURCE_TITLE ||
            LEGACY_SOURCE_TITLES.includes(s.title))
      );

      // Si el cuaderno está al límite (300), eliminar snapshots previos primero para respetar la cuota
      let quota = validateSourceQuota(sources.length, oldWikiSources.length, 1);
      if (!quota.ok && oldWikiSources.length > 0 && sources.length - oldWikiSources.length + 1 <= MAX_NOTEBOOK_SOURCES) {
        for (const oldSrc of oldWikiSources) {
          console.log(`🧹 Pre-removing previous Wiki snapshot to preserve <= ${MAX_NOTEBOOK_SOURCES} quota: ${oldSrc.title} (${oldSrc.id})...`);
          await client.callTool('delete_source', {
            notebook_id: NOTEBOOK_ID,
            ...(sessionId ? { session_id: sessionId } : {}),
            source: oldSrc.id,
            confirm: true,
          });
        }
        oldWikiSources.length = 0;
        quota = validateSourceQuota(sources.length - 1, 0, 1);
      }

      if (!quota.ok) {
        throw new Error(quota.reason);
      }
      if (quota.warning && quota.reason) {
        console.warn(`⚠️ ${quota.reason}`);
      }

      console.log(`📤 Uploading ${MASTER_SOURCE_TITLE} to Gemini Notebook (${NOTEBOOK_UUID})...`);
      // REGLA ESTRICTA: SIEMPRE especificar type: 'text' para evitar tokenización accidental en URLs
      const addRes = await client.callTool('add_source', {
        notebook_id: NOTEBOOK_ID,
        ...(sessionId ? { session_id: sessionId } : {}),
        type: 'text',
        title: MASTER_SOURCE_TITLE,
        content: bundle.content,
      });
      sessionId = addRes?.data?.session_id || sessionId;

      if (!addRes?.success) {
        throw new Error(`Failed to upload Wiki source: ${JSON.stringify(addRes)}`);
      }
      console.log(
        `✅ Uploaded ${MASTER_SOURCE_TITLE} (sources: ${addRes.data?.sourceCountBefore ?? 'ok'} -> ${addRes.data?.sourceCountAfter ?? 'ok'})`
      );

      for (const oldSrc of oldWikiSources) {
        console.log(`🧹 Removing previous Wiki snapshot: ${oldSrc.title} (${oldSrc.id})...`);
        await client.callTool('delete_source', {
          notebook_id: NOTEBOOK_ID,
          ...(sessionId ? { session_id: sessionId } : {}),
          source: oldSrc.id,
          confirm: true,
        });
      }

      fs.writeFileSync(
        STATE_FILE,
        JSON.stringify(
          {
            sha256: bundle.sha256,
            syncedAt: new Date().toISOString(),
            fileCount: bundle.fileCount,
            charCount: bundle.content.length,
            notebookUuid: NOTEBOOK_UUID,
          },
          null,
          2
        ),
        'utf8'
      );
    }

    if (askQuestionText) {
      console.log(`💬 Asking Gemini Notebook: "${askQuestionText}"...`);
      const askRes = await client.callTool(
        'ask_question',
        {
          notebook_id: NOTEBOOK_ID,
          ...(sessionId ? { session_id: sessionId } : {}),
          question: askQuestionText,
        },
        240000
      );
      console.log('\n================ GEMINI NOTEBOOK RESPONSE ================\n');
      console.log(askRes?.data?.answer || JSON.stringify(askRes, null, 2));
      console.log('\n==========================================================\n');
    }
  } finally {
    client.close();
  }
  process.exit(0);
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  main().catch((err) => {
    console.error(`❌ Wiki sync failed: ${err.message}`);
    process.exit(1);
  });
}
