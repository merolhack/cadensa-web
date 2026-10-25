import type { Metadata } from 'next';
import Link from 'next/link';
import statsData from '@/data/platform_stats.json';

export const metadata: Metadata = {
  title: 'Estadísticas de Uso e Impacto Global — Cadensa',
  description:
    'Métricas transparentes y telemetría de uso global de Cadensa: Google Analytics 4, Search Console, Bing Webmaster Tools y Cloudflare Edge.',
};

// Mapeo amigable de banderas según nombre o código de país
const COUNTRY_FLAGS: Record<string, { flag: string; esName: string }> = {
  France: { flag: '🇫🇷', esName: 'Francia' },
  Argentina: { flag: '🇦🇷', esName: 'Argentina' },
  Mexico: { flag: '🇲🇽', esName: 'México' },
  Peru: { flag: '🇵🇪', esName: 'Perú' },
  Colombia: { flag: '🇨🇴', esName: 'Colombia' },
  Spain: { flag: '🇪🇸', esName: 'España' },
  Chile: { flag: '🇨🇱', esName: 'Chile' },
  'United States': { flag: '🇺🇸', esName: 'Estados Unidos' },
  Ecuador: { flag: '🇪🇨', esName: 'Ecuador' },
  Guatemala: { flag: '🇬🇹', esName: 'Guatemala' },
  Bolivia: { flag: '🇧🇴', esName: 'Bolivia' },
  Venezuela: { flag: '🇻🇪', esName: 'Venezuela' },
};

function getCountryMeta(countryName: string) {
  return COUNTRY_FLAGS[countryName] || { flag: '🌍', esName: countryName };
}

export default function StatsPage() {
  const updatedDate = statsData.updated_at
    ? new Date(statsData.updated_at).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Octubre 2026';

  const ga = statsData.sources.google_analytics;
  const gsc = statsData.sources.google_search_console;
  const bing = statsData.sources.bing_webmaster;
  const cf = statsData.sources.cloudflare;
  const countries = statsData.global_reach.top_countries || [];

  const maxUsers = Math.max(...countries.map((c) => c.users || 1), 1);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        {/* 1. Header con botón de regreso */}
        <header className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Cadensa
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              Telemetría Pública
            </span>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>←</span>
            <span>Volver al Inicio</span>
          </Link>
        </header>

        {/* 2. Hero de Estadísticas */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Métricas Semanales Automatizadas vía CI/CD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-50">
            Estadísticas de Uso e Impacto Global
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Datos reales de telemetría extraídos semanalmente desde Google Analytics 4, Google Search Console, Bing Webmaster Tools y Cloudflare Edge.
          </p>
          <div className="text-xs text-zinc-400 flex items-center justify-center gap-2">
            <span>📅 Periodo: <strong className="text-zinc-400">{statsData.period}</strong></span>
            <span>•</span>
            <span>Última actualización: <strong className="text-zinc-400">{updatedDate}</strong></span>
          </div>
        </section>

        {/* 3. Tarjetas KPI Principales */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Usuarios Activos</span>
              <span className="text-base">👥</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {statsData.summary.weekly_active_users}
            </div>
            <p className="text-xs text-zinc-400">
              {ga.sessions} sesiones iniciadas en la última semana
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Vistas de Página</span>
              <span className="text-base">👁️</span>
            </div>
            <div className="text-3xl font-extrabold text-cyan-400">
              {statsData.summary.total_page_views}
            </div>
            <p className="text-xs text-zinc-400">
              Interacciones con el catálogo y estudio clínico
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Búsquedas Orgánicas</span>
              <span className="text-base">🔍</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {statsData.summary.search_impressions}
            </div>
            <p className="text-xs text-zinc-400">
              Impresiones combinadas en Google y Bing
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Duración Media</span>
              <span className="text-base">⏱️</span>
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {Math.max(1, Math.round(ga.avg_session_duration_sec / 60))} min
            </div>
            <p className="text-xs text-zinc-400">
              Tiempo promedio de práctica por usuario
            </p>
          </div>
        </section>

        {/* 4. Sección de Alcance Internacional (Países) */}
        <section className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>🌍</span>
                <span>Alcance Internacional ({countries.length} países activos)</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Distribución geográfica de personas que practican su fluidez en Cadensa alrededor del mundo.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-mono">
              Mundial
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countries.map((item, idx) => {
              const meta = getCountryMeta(item.country);
              const percent = Math.round((item.users / maxUsers) * 100);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{meta.flag}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-200 truncate">
                        {meta.esName}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {item.views} vistas de página
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-20 sm:w-28 bg-zinc-800 h-2 rounded-full overflow-hidden hidden xs:block">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-400 w-12 text-right">
                      {item.users} {item.users === 1 ? 'visita' : 'visitas'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Desglose por Plataforma Técnica */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span>⚙️</span>
            <span>Detalle de Telemetría por Plataforma</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Analytics */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <span>📈</span> Google Analytics 4
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  G-HCTT9146TJ
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 divide-y divide-zinc-800/60">
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Usuarios activos:</span>
                  <span className="font-semibold text-zinc-200">{ga.active_users}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Sesiones iniciadas:</span>
                  <span className="font-semibold text-zinc-200">{ga.sessions}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Vistas de pantalla:</span>
                  <span className="font-semibold text-zinc-200">{ga.page_views}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Duración promedio:</span>
                  <span className="font-semibold text-zinc-200">{ga.avg_session_duration_sec} segundos</span>
                </li>
              </ul>
            </div>

            {/* Google Search Console */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <span>🔍</span> Google Search Console
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                  cadensa-web.pages.dev
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 divide-y divide-zinc-800/60">
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Clics orgánicos:</span>
                  <span className="font-semibold text-zinc-200">{gsc.clicks}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Impresiones en Google:</span>
                  <span className="font-semibold text-zinc-200">{gsc.impressions}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">CTR promedio:</span>
                  <span className="font-semibold text-zinc-200">{gsc.ctr}%</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Posición media:</span>
                  <span className="font-semibold text-zinc-200">{gsc.avg_position || 'N/A'}</span>
                </li>
              </ul>
            </div>

            {/* Bing Webmaster Tools */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-teal-400 flex items-center gap-2">
                  <span>🌐</span> Bing Webmaster Tools
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">
                  IndexNow & API
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 divide-y divide-zinc-800/60">
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Clics desde Bing:</span>
                  <span className="font-semibold text-zinc-200">{bing.clicks}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Impresiones en Bing:</span>
                  <span className="font-semibold text-zinc-200">{bing.impressions}</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Estado de titularidad:</span>
                  <span className="font-semibold text-emerald-400">Verificado</span>
                </li>
              </ul>
            </div>

            {/* Cloudflare Pages */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span>⚡</span> Cloudflare Pages Edge
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                  Anycast Global
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 divide-y divide-zinc-800/60">
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Infraestructura:</span>
                  <span className="font-semibold text-zinc-200">
                    {cf.status === 'active' ? 'Anycast Edge Operativo' : 'Red perimetral distribuida'}
                  </span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Certificado SSL / HTTP/2:</span>
                  <span className="font-semibold text-emerald-400">Activo y Encriptado</span>
                </li>
                <li className="pt-1.5 flex justify-between">
                  <span className="text-zinc-400">Seguridad HTTP:</span>
                  <span className="font-semibold text-zinc-200">CSP, HSTS & Permissions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Footer de la página de estadísticas */}
        <footer className="pt-6 border-t border-zinc-900 text-center text-xs text-zinc-400 space-y-2">
          <p>
            Métricas recopiladas de forma anónima y agregada en cumplimiento con la privacidad del usuario clínico.
          </p>
          <div className="flex items-center justify-center gap-3 text-zinc-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Inicio
            </Link>
            <span>•</span>
            <a
              href="https://amtartamudez.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Asociación Mexicana de Tartamudez
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
