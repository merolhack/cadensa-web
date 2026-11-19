/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cargar variables de entorno locales desde .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Cargar credenciales GCP
let gcpSaKey = null;
const credPaths = [
  '/mnt/c/Users/lenin/.gemini/antigravity-ide/sa-key.json',
  'C:/Users/lenin/.gemini/antigravity-ide/sa-key.json',
  path.join(__dirname, '../sa-key.json'),
  path.join(__dirname, '../google_credentials.json'),
];

for (const p of credPaths) {
  if (fs.existsSync(p)) {
    try {
      gcpSaKey = JSON.parse(fs.readFileSync(p, 'utf8'));
      console.log(`📁 Credenciales GCP cargadas desde: ${p} (${gcpSaKey.client_email})`);
      break;
    } catch {
      // Ignorar fallo de lectura
    }
  }
}

const bingApiKey = process.env.BING_API_KEY;
const gaPropertyId = process.env.GA4_PROPERTY_ID || '560646502';
const gscSiteUrl = process.env.GSC_SITE_URL || 'https://cadensa-web.pages.dev/';
const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

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

async function getGoogleAccessToken(saKey, scopes) {
  const jwt = createGoogleSignedJwt(saKey, scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Fallo autenticación Google OAuth: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// 1. Google Analytics 4 Detallado
async function auditGA4(googleToken) {
  console.log('📊 [1/5] Auditando Google Analytics 4 (páginas, dispositivos, eventos)...');
  const results = {
    overview: null,
    top_pages: [],
    devices: [],
    events: [],
    errors: null,
  };

  if (!googleToken) {
    results.errors = 'Sin token Google OAuth';
    return results;
  }

  // A. Páginas más visitadas
  try {
    const urlPages = `https://analyticsdata.googleapis.com/v1beta/properties/${gaPropertyId}:runReport`;
    const resPages = await fetch(urlPages, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'averageSessionDuration' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 15,
      }),
    });
    if (resPages.ok) {
      const dataPages = await resPages.json();
      results.top_pages = (dataPages.rows || []).map(r => ({
        path: r.dimensionValues?.[0]?.value,
        title: r.dimensionValues?.[1]?.value,
        views: parseInt(r.metricValues?.[0]?.value || '0', 10),
        users: parseInt(r.metricValues?.[1]?.value || '0', 10),
        avg_duration_sec: Math.round(parseFloat(r.metricValues?.[2]?.value || '0')),
      }));
    } else {
      results.errors = `Error GA4 páginas: ${resPages.status} ${await resPages.text()}`;
    }
  } catch (err) {
    results.errors = `Excepción GA4 páginas: ${err.message}`;
  }

  // B. Dispositivos
  try {
    const urlDev = `https://analyticsdata.googleapis.com/v1beta/properties/${gaPropertyId}:runReport`;
    const resDev = await fetch(urlDev, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      }),
    });
    if (resDev.ok) {
      const dataDev = await resDev.json();
      results.devices = (dataDev.rows || []).map(r => ({
        device: r.dimensionValues?.[0]?.value,
        users: parseInt(r.metricValues?.[0]?.value || '0', 10),
        sessions: parseInt(r.metricValues?.[1]?.value || '0', 10),
      }));
    }
  } catch (err) {
    console.warn('Fallo dispositivos GA4:', err.message);
  }

  // C. Eventos principales
  try {
    const urlEv = `https://analyticsdata.googleapis.com/v1beta/properties/${gaPropertyId}:runReport`;
    const resEv = await fetch(urlEv, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 15,
      }),
    });
    if (resEv.ok) {
      const dataEv = await resEv.json();
      results.events = (dataEv.rows || []).map(r => ({
        event: r.dimensionValues?.[0]?.value,
        count: parseInt(r.metricValues?.[0]?.value || '0', 10),
        users: parseInt(r.metricValues?.[1]?.value || '0', 10),
      }));
    }
  } catch (err) {
    console.warn('Fallo eventos GA4:', err.message);
  }

  return results;
}

// 2. Google Search Console Detallado
async function auditGSC(googleToken) {
  console.log('🔍 [2/5] Auditando Google Search Console (sitios, permisos, consultas)...');
  const results = {
    accessible_sites: [],
    queries: [],
    pages: [],
    errors: null,
  };

  if (!googleToken) {
    results.errors = 'Sin token Google OAuth';
    return results;
  }

  // A. Listar sitios accesibles por la Service Account
  try {
    const resSites = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });
    if (resSites.ok) {
      const dataSites = await resSites.json();
      results.accessible_sites = dataSites.siteEntry || [];
    } else {
      results.errors = `Error listar sitios GSC: ${resSites.status} ${await resSites.text()}`;
    }
  } catch (err) {
    results.errors = `Excepción listar sitios GSC: ${err.message}`;
  }

  // B. Consultar Search Analytics
  const targetSite = results.accessible_sites.length > 0
    ? results.accessible_sites[0].siteUrl
    : gscSiteUrl;

  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const urlAnalytics = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(targetSite)}/searchAnalytics/query`;

    const resAna = await fetch(urlAnalytics, {
      method: 'POST',
      headers: { Authorization: `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 20,
      }),
    });

    if (resAna.ok) {
      const dataAna = await resAna.json();
      results.queries = dataAna.rows || [];
    } else {
      const errText = await resAna.text();
      results.errors = (results.errors ? results.errors + ' | ' : '') + `Query GSC (${resAna.status}): ${errText}`;
    }
  } catch (err) {
    results.errors = (results.errors ? results.errors + ' | ' : '') + `Excepción GSC: ${err.message}`;
  }

  return results;
}

// 3. Google AdSense Detallado
async function auditAdSense(googleToken) {
  console.log('💰 [3/5] Auditando Google AdSense Management API (v2)...');
  const results = {
    accounts: [],
    alerts: [],
    sites: [],
    errors: null,
  };

  if (!googleToken) {
    results.errors = 'Sin token Google OAuth';
    return results;
  }

  try {
    const resAcc = await fetch('https://adsense.googleapis.com/v2/accounts', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    if (resAcc.ok) {
      const dataAcc = await resAcc.json();
      results.accounts = dataAcc.accounts || [];

      // Si hay cuentas, consultar alertas y sitios
      for (const acc of results.accounts) {
        try {
          const resSites = await fetch(`https://adsense.googleapis.com/v2/${acc.name}/sites`, {
            headers: { Authorization: `Bearer ${googleToken}` },
          });
          if (resSites.ok) {
            const dataSites = await resSites.json();
            results.sites.push({ account: acc.name, sites: dataSites.sites || [] });
          }

          const resAlerts = await fetch(`https://adsense.googleapis.com/v2/${acc.name}/alerts`, {
            headers: { Authorization: `Bearer ${googleToken}` },
          });
          if (resAlerts.ok) {
            const dataAlerts = await resAlerts.json();
            results.alerts.push({ account: acc.name, alerts: dataAlerts.alerts || [] });
          }
        } catch (subErr) {
          console.warn(`Sub-consulta AdSense ${acc.name}:`, subErr.message);
        }
      }
    } else {
      results.errors = `AdSense API (${resAcc.status}): ${await resAcc.text()}`;
    }
  } catch (err) {
    results.errors = `Excepción AdSense: ${err.message}`;
  }

  return results;
}

// 4. Bing Webmaster Tools Detallado
async function auditBing() {
  console.log('🌐 [4/5] Auditando Bing Webmaster Tools API...');
  const results = {
    user_sites: [],
    crawl_stats: [],
    query_stats: [],
    rank_and_traffic: [],
    errors: null,
  };

  if (!bingApiKey) {
    results.errors = 'BING_API_KEY no configurada';
    return results;
  }

  // A. Sitios del usuario
  try {
    const urlSites = `https://ssl.bing.com/webmaster/api.svc/json/GetUserSites?apikey=${bingApiKey}`;
    const resSites = await fetch(urlSites);
    if (resSites.ok) {
      const dataSites = await resSites.json();
      results.user_sites = dataSites.d || [];
    } else {
      results.errors = `Bing GetUserSites (${resSites.status}): ${await resSites.text()}`;
    }
  } catch (err) {
    results.errors = `Excepción Bing GetUserSites: ${err.message}`;
  }

  // B. Estadísticas de rastreo (Crawl Stats)
  try {
    const urlCrawl = `https://ssl.bing.com/webmaster/api.svc/json/GetCrawlStats?siteUrl=${encodeURIComponent(gscSiteUrl)}&apikey=${bingApiKey}`;
    const resCrawl = await fetch(urlCrawl);
    if (resCrawl.ok) {
      const dataCrawl = await resCrawl.json();
      results.crawl_stats = dataCrawl.d || [];
    }
  } catch (err) {
    console.warn('Excepción Bing CrawlStats:', err.message);
  }

  // C. Consultas de búsqueda (Query Stats)
  try {
    const urlQuery = `https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=${encodeURIComponent(gscSiteUrl)}&apikey=${bingApiKey}`;
    const resQuery = await fetch(urlQuery);
    if (resQuery.ok) {
      const dataQuery = await resQuery.json();
      results.query_stats = dataQuery.d || [];
    }
  } catch (err) {
    console.warn('Excepción Bing QueryStats:', err.message);
  }

  // D. Tráfico y ranking
  try {
    const urlRank = `https://ssl.bing.com/webmaster/api.svc/json/GetRankAndTrafficStats?siteUrl=${encodeURIComponent(gscSiteUrl)}&apikey=${bingApiKey}`;
    const resRank = await fetch(urlRank);
    if (resRank.ok) {
      const dataRank = await resRank.json();
      results.rank_and_traffic = dataRank.d || [];
    }
  } catch (err) {
    console.warn('Excepción Bing RankAndTraffic:', err.message);
  }

  return results;
}

// 5. Cloudflare Pages (Servidor de alojamiento y logs)
async function auditCloudflare() {
  console.log('⚡ [5/5] Auditando Cloudflare Pages (proyecto, despliegues y logs)...');
  const results = {
    project: null,
    deployments: [],
    latest_deployment_logs: [],
    errors: null,
  };

  if (!cfApiToken || !cfAccountId) {
    results.errors = 'CLOUDFLARE_API_TOKEN o CLOUDFLARE_ACCOUNT_ID no configurados';
    return results;
  }

  const headers = {
    Authorization: `Bearer ${cfApiToken}`,
    'Content-Type': 'application/json',
  };

  // A. Información del proyecto
  try {
    const urlProj = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/cadensa-web`;
    const resProj = await fetch(urlProj, { headers });
    if (resProj.ok) {
      const dataProj = await resProj.json();
      results.project = dataProj.result || null;
    } else {
      results.errors = `Cloudflare Pages Project (${resProj.status}): ${await resProj.text()}`;
    }
  } catch (err) {
    results.errors = `Excepción Cloudflare Project: ${err.message}`;
  }

  // B. Lista de despliegues recientes
  try {
    const urlDep = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/cadensa-web/deployments?per_page=5`;
    const resDep = await fetch(urlDep, { headers });
    if (resDep.ok) {
      const dataDep = await resDep.json();
      results.deployments = (dataDep.result || []).map(d => ({
        id: d.id,
        short_id: d.short_id,
        environment: d.environment,
        created_on: d.created_on,
        latest_stage: d.latest_stage?.name,
        latest_stage_status: d.latest_stage?.status,
        url: d.url,
        deployment_trigger: {
          type: d.deployment_trigger?.type,
          branch: d.deployment_trigger?.metadata?.branch,
          commit_hash: d.deployment_trigger?.metadata?.commit_hash,
          commit_message: d.deployment_trigger?.metadata?.commit_message,
        },
      }));

      // C. Logs del último despliegue
      if (results.deployments.length > 0) {
        const latestId = results.deployments[0].id;
        try {
          const urlLogs = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/cadensa-web/deployments/${latestId}/history/logs`;
          const resLogs = await fetch(urlLogs, { headers });
          if (resLogs.ok) {
            const dataLogs = await resLogs.json();
            results.latest_deployment_logs = (dataLogs.result?.data || []).slice(-30);
          }
        } catch (logErr) {
          console.warn('Excepción Cloudflare Logs:', logErr.message);
        }
      }
    } else {
      const errText = await resDep.text();
      results.errors = (results.errors ? results.errors + ' | ' : '') + `Cloudflare Deployments (${resDep.status}): ${errText}`;
    }
  } catch (err) {
    results.errors = (results.errors ? results.errors + ' | ' : '') + `Excepción Cloudflare Deployments: ${err.message}`;
  }

  return results;
}

async function runDeepAudit() {
  console.log('================================================================');
  console.log('🚀 AUDITORÍA PROFUNDA MULTI-PLATAFORMA & LOGS DE SERVIDOR');
  console.log('   Cadensa (cadensa-web) — Noviembre 2026');
  console.log('================================================================\n');

  let googleToken = null;
  if (gcpSaKey) {
    try {
      googleToken = await getGoogleAccessToken(gcpSaKey, [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/adsense.readonly',
      ]);
      console.log('🔑 Token Google OAuth multi-alcance obtenido con éxito.\n');
    } catch (e) {
      console.warn('⚠️ Advertencia obteniendo token Google OAuth:', e.message);
    }
  } else {
    console.warn('⚠️ No se encontraron credenciales de Service Account GCP.');
  }

  const [ga4Data, gscData, adsenseData, bingData, cloudflareData] = await Promise.all([
    auditGA4(googleToken),
    auditGSC(googleToken),
    auditAdSense(googleToken),
    auditBing(),
    auditCloudflare(),
  ]);

  const fullReport = {
    timestamp: new Date().toISOString(),
    domain: gscSiteUrl,
    google_analytics_4: ga4Data,
    google_search_console: gscData,
    google_adsense: adsenseData,
    bing_webmaster_tools: bingData,
    cloudflare_pages_server: cloudflareData,
  };

  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const outputPath = path.join(reportsDir, 'deep_telemetry_and_server_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(fullReport, null, 2), 'utf8');

  console.log('\n================================================================');
  console.log(`✅ Auditoría completada y almacenada en: ${outputPath}`);
  console.log('================================================================');
}

runDeepAudit().catch(err => {
  console.error('❌ Error fatal en auditoría profunda:', err);
  process.exit(1);
});
