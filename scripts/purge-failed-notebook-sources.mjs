#!/usr/bin/env node
/**
 * Purges failed or tokenized orphaned sources from Cadensa's Gemini Notebook
 * (015dcad0-c2a3-4512-97eb-59ac4293d8c0) using batch RPC tGMBJ via notebooklm-mcp.
 */

import { spawn } from 'child_process';

const NOTEBOOK_ID = 'cadensa-fluidez-y-terapia-del';

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
      clientInfo: { name: 'cadensa-purge-client', version: '1.0.0' },
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

async function run() {
  console.log('🚀 Conectando a NotebookLM MCP...');
  const client = new McpStdioClient();
  try {
    await client.start();
    const health = await client.callTool('get_health', {});
    console.log('🩺 Health check:', health?.data?.status, 'Auth:', health?.data?.authenticated);
    if (!health?.data?.authenticated) {
      throw new Error('NotebookLM no está autenticado.');
    }

    console.log('📋 Listando fuentes de Cadensa...');
    const listRes = await client.callTool('list_sources', { notebook_id: NOTEBOOK_ID });
    const allSources = listRes?.data?.sources || [];
    console.log(`📊 Total fuentes actuales en notebook: ${allSources.length}`);

    const toDelete = allSources.filter((s) => {
      if (!s.id) return false;
      if (s.status === 'failed') return true;
      if (s.title === '-' || s.title === 'y' || s.title === '##' || s.title === '#') return true;
      return false;
    });

    console.log(`🎯 Fuentes fallidas/corruptas identificadas: ${toDelete.length}`);
    if (toDelete.length === 0) {
      console.log('✅ No hay fuentes fallidas por eliminar. El cuaderno está limpio.');
      return;
    }

    const deleteIds = toDelete.map((s) => s.id).filter(Boolean);
    const BATCH_SIZE = 40;
    for (let i = 0; i < deleteIds.length; i += BATCH_SIZE) {
      const chunk = deleteIds.slice(i, i + BATCH_SIZE);
      console.log(
        `🗑️ Eliminando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(deleteIds.length / BATCH_SIZE)} (${chunk.length} fuentes)...`
      );
      const delRes = await client.callTool('delete_source', {
        notebook_id: NOTEBOOK_ID,
        source: chunk.join(','),
        confirm: true,
      });
      console.log('   Resultado:', JSON.stringify(delRes?.data?.result || delRes?.result || delRes));
    }

    const finalList = await client.callTool('list_sources', { notebook_id: NOTEBOOK_ID });
    const remaining = finalList?.data?.sources || [];
    const remainingFailed = remaining.filter((s) => s.status === 'failed');
    console.log(
      `🎉 Limpieza concluida. Total fuentes restantes: ${remaining.length} (Fallidas: ${remainingFailed.length})`
    );
  } catch (err) {
    console.error('❌ Error durante la purga:', err.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

run();
