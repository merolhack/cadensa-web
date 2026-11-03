#!/usr/bin/env node
/**
 * Genera los clips del Avatar IA con Gemini Omni Flash (offline, una sola vez).
 * Uso:  GEMINI_API_KEY=... node scripts/avatar/generate-avatar-clips.mjs [id ...] [--force]
 * Salida: public/avatar/<id>.mp4  (los existentes se omiten salvo --force)
 * La API key NUNCA se expone al frontend: este script corre solo en local.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '..', 'public', 'avatar');
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Falta GEMINI_API_KEY (definela en .env y exportala).');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));
const { style, clips } = JSON.parse(readFileSync(join(here, 'avatar_clips.json'), 'utf8'));
mkdirSync(outDir, { recursive: true });

for (const clip of clips.filter((c) => only.length === 0 || only.includes(c.id))) {
  const file = join(outDir, `${clip.id}.mp4`);
  if (existsSync(file) && !force) {
    console.log(`= ${clip.id}: ya existe, se omite`);
    continue;
  }
  const prompt = `${style} ${clip.action_en} 8 seconds. She says in Mexican Spanish: "${clip.script_es}"`;
  console.log(`> ${clip.id}: generando...`);
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      model: 'gemini-omni-1.1-flash',
      input: prompt,
      response_format: { type: 'video', resolution: '720p' },
    }),
  });
  if (!res.ok) {
    console.error(`x ${clip.id}: HTTP ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    continue;
  }
  const json = await res.json();
  const data = json.output_video?.data ?? json.outputVideo?.data;
  if (!data) {
    console.error(`x ${clip.id}: respuesta sin video`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`+ ${clip.id}: guardado en public/avatar/${clip.id}.mp4`);
}
