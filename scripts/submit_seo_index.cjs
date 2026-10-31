/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Notificador de Indexación SEO Automatizado:
 * 1. Envía el sitemap.xml a Google Search Console API.
 * 2. Notifica a Bing Webmaster Tools API el nuevo feed de Sitemap.
 * 3. Dispara IndexNow hacia Bing con las URLs actualizadas.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

let gcpSaKeyRaw = process.env.GCP_SA_METRICS_KEY;
if (!gcpSaKeyRaw) {
  const possiblePaths = [
    '/mnt/c/Users/lenin/.gemini/antigravity-ide/sa-key.json',
    'C:/Users/lenin/.gemini/antigravity-ide/sa-key.json',
    path.join(__dirname, '../sa-key.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      gcpSaKeyRaw = fs.readFileSync(p, 'utf8');
      break;
    }
  }
}

const bingApiKey = process.env.BING_API_KEY;
const siteUrl = 'https://cadensa-web.pages.dev/';
const sitemapUrl = 'https://cadensa-web.pages.dev/sitemap.xml';
const indexNowKey = '856757614ffc2c5582fbcb81b1b4e4ca';

function createGoogleSignedJwt(saKey, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: saKey.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(saKey.private_key, 'base64url');
  return `${signatureInput}.${signature}`;
}

async function getGoogleAccessToken(saKey) {
  const jwt = createGoogleSignedJwt(saKey, ['https://www.googleapis.com/auth/webmasters']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

async function submitToGoogle(token) {
  console.log(`🌐 Enviando Sitemap a Google Search Console: ${sitemapUrl}`);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Resultado Google: HTTP ${res.status}`);
}

async function submitToBingSitemap() {
  console.log(`🌐 Registrando Sitemap en Bing Webmaster Tools API...`);
  const url = `https://ssl.bing.com/webmaster/api.svc/json/SubmitFeed?apikey=${bingApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ siteUrl, feedUrl: sitemapUrl }),
  });
  console.log(`   Resultado Bing Sitemap Feed: HTTP ${res.status}`);
}

async function submitToIndexNow() {
  console.log(`⚡ Notificando a IndexNow API para Bing/Yandex...`);
  const urlList = [
    'https://cadensa-web.pages.dev/',
    'https://cadensa-web.pages.dev/about',
    'https://cadensa-web.pages.dev/stats',
    'https://cadensa-web.pages.dev/privacy',
    'https://cadensa-web.pages.dev/terms',
    'https://cadensa-web.pages.dev/tecnicas/sts',
    'https://cadensa-web.pages.dev/tecnicas/easy_onset',
    'https://cadensa-web.pages.dev/tecnicas/light_contact',
    'https://cadensa-web.pages.dev/tecnicas/prolonged_speech',
    'https://cadensa-web.pages.dev/tecnicas/box_breathing',
    'https://cadensa-web.pages.dev/tecnicas/pull_out',
    'https://cadensa-web.pages.dev/tecnicas/cancellation',
  ];

  const body = {
    host: 'cadensa-web.pages.dev',
    key: indexNowKey,
    keyLocation: `https://cadensa-web.pages.dev/${indexNowKey}.txt`,
    urlList,
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`   Resultado IndexNow: HTTP ${res.status}`);
}

async function main() {
  if (gcpSaKeyRaw) {
    try {
      const saKey = typeof gcpSaKeyRaw === 'string' ? JSON.parse(gcpSaKeyRaw) : gcpSaKeyRaw;
      const googleToken = await getGoogleAccessToken(saKey);
      await submitToGoogle(googleToken);
    } catch (e) {
      console.warn('⚠️ Google Search Console submit falló:', e.message);
    }
  }

  await submitToBingSitemap();
  await submitToIndexNow();
}

main().catch(console.error);

