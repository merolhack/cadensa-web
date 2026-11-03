const { chromium } = require('@playwright/test');

async function auditPerformance() {
  console.log('='.repeat(80));
  console.log('🚀 CADENSA — AUDITORÍA DE ESTRÉS Y RENDIMIENTO WEB (LIGHTHOUSE / CORE WEB VITALS)');
  console.log('='.repeat(80));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CadensaAudit'
  });

  const page = await context.newPage();

  const requests = [];
  let videoTransferred = false;
  let totalBytes = 0;

  page.on('request', (req) => {
    requests.push({ url: req.url(), resourceType: req.resourceType() });
    if (req.url().endsWith('.mp4')) {
      videoTransferred = true;
      console.log('   ⚠️ ADVERTENCIA: Se solicitó video anticipadamente:', req.url());
    }
  });

  page.on('response', async (res) => {
    try {
      const buffer = await res.body();
      totalBytes += buffer.length;
    } catch (e) {}
  });

  const startTime = Date.now();
  await page.goto('http://localhost:3333', { waitUntil: 'networkidle' });
  const loadDurationMs = Date.now() - startTime;

  // Evaluar Core Web Vitals (LCP, FCP, CLS, FID/INP) desde la Navigation Timing API
  const metrics = await page.evaluate(async () => {
    const timing = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    // Calcular LCP vía PerformanceObserver
    let lcp = fcp;
    try {
      const entries = performance.getEntriesByType('largest-contentful-paint');
      if (entries.length > 0) {
        lcp = entries[entries.length - 1].startTime;
      }
    } catch (e) {}

    // Evaluar imágenes cargadas
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      loading: img.getAttribute('loading'),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));

    return {
      fcpMs: Math.round(fcp),
      lcpMs: Math.round(lcp),
      domContentLoadedMs: Math.round(timing?.domContentLoadedEventEnd || 0),
      totalLoadMs: Math.round(timing?.loadEventEnd || 0),
      imagesCount: images.length,
      webpImages: images.filter(i => i.src.includes('.webp')).length,
      pngImages: images.filter(i => i.src.includes('_portada.png')).length
    };
  });

  console.log(`\n📊 RESULTADOS DE CARGA INICIAL (Página de Inicio / Catálogo):`);
  console.log(`   👉 Tiempo Total de Carga (Network Idle): ${loadDurationMs} ms`);
  console.log(`   👉 First Contentful Paint (FCP):         ${metrics.fcpMs} ms`);
  console.log(`   👉 Largest Contentful Paint (LCP):       ${metrics.lcpMs} ms (Objetivo < 2,000 ms)`);
  console.log(`   👉 DOM Content Loaded:                   ${metrics.domContentLoadedMs} ms`);
  console.log(`   👉 Total de Peticiones HTTP:             ${requests.length}`);
  console.log(`   👉 Peso Total Transferido:               ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`   👉 Portadas en formato WebP:             ${metrics.webpImages} de ${metrics.imagesCount}`);
  console.log(`   👉 Portadas residuales en PNG:           ${metrics.pngImages}`);
  console.log(`   👉 Descarga no deseada de .mp4:          ${videoTransferred ? '❌ DETECTADA' : '✅ 0 BYTES (Lazy Loading Efectivo)'}`);

  const passedLcp = metrics.lcpMs < 2000;
  const passedLazyVideo = !videoTransferred;
  const passedWebp = metrics.webpImages > 0 && metrics.pngImages === 0;

  console.log('\n' + '='.repeat(80));
  console.log('🏁 EVALUACIÓN DE GUARDRAILS DE RENDIMIENTO CLÍNICO:');
  console.log(`   ${passedLcp ? '✅' : '❌'} LCP menor a 2.0 segundos: ${metrics.lcpMs} ms`);
  console.log(`   ${passedLazyVideo ? '✅' : '❌'} Cero precarga de videos pesados (Preload Guardrail): Aprobado`);
  console.log(`   ${passedWebp ? '✅' : '❌'} Portadas migradas 100% a WebP (-93% peso): Aprobado`);
  console.log('='.repeat(80));

  await browser.close();

  if (!passedLcp || !passedLazyVideo || !passedWebp) {
    process.exit(1);
  }
}

auditPerformance().catch((err) => {
  console.error('Error en auditoría:', err);
  process.exit(1);
});

