import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Acerca de Cadensa — Propósito, Futuros Pasos y Autor',
  description:
    'Conoce el propósito clínico de Cadensa, su hoja de ruta de desarrollo continuo (ROADMAP) y el perfil del autor e impulsor técnico Lenin Meza.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-12">
        {/* 1. Header con Navegación */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Cadensa
            </Link>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-semibold">
              Acerca de
            </span>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/stats"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Estadísticas</span>
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>←</span>
              <span>Volver al Inicio</span>
            </Link>
          </nav>
        </header>

        {/* 2. Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ciencia Fonoaudiológica • Código Abierto • Impacto Social</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-50 leading-tight">
            Propósito, Futuros Pasos y Liderazgo Técnico
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Cadensa es una plataforma de neurorrehabilitación del habla y entrenamiento de fluidez diaria basada en el método de <strong className="text-zinc-200">Habla Rítmica Silábica (STS)</strong>, desarrollada con tecnología edge y arquitectura moderna para democratizar la salud vocal.
          </p>
        </section>

        {/* 3. Propósito del Sitio y Fundamento Clínico */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <span>🎯</span>
              <span>El Propósito de Cadensa</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              ¿Por qué existe Cadensa y cómo apoya a las personas con bloqueos del habla?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                🧠
              </div>
              <h3 className="text-base font-bold text-zinc-100">Base Neurobiológica (STS)</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                En personas con tartamudez, los ganglios basales presentan una desincronización en la temporización interna del habla. El método <strong className="text-zinc-300">Syllable-Timed Speech (STS)</strong> provee un pulso isocrónico externo que activa vías neuronales auditivo-motoras alternas, reduciendo bloqueos y prolongaciones hasta en un 80% durante la emisión.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl">
                ⚡
              </div>
              <h3 className="text-base font-bold text-zinc-100">Micro-Hábitos y Gamificación</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                El éxito terapéutico depende de la constancia cotidiana. Cadensa adopta la dinámica de micro-entrenamientos de 5 minutos al día, integrando rachas (streaks), puntos de experiencia (XP), feedback visual y háptico, convirtiendo la rehabilitación en una experiencia gratificante y libre de ansiedad.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl">
                🔒
              </div>
              <h3 className="text-base font-bold text-zinc-100">Zero Trust y Privacidad</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                El procesamiento de voz y metrónomo ocurre íntegramente en el navegador mediante Web Audio API. Ningún audio es grabado ni transmitido a servidores remotos. Toda la plataforma opera sin costo, de forma abierta y respaldada en vinculación con comunidades de apoyo fonoaudiológico.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Estado Actual y Futuros Pasos (ROADMAP & TODO) */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <span>🗺️</span>
                <span>Estado del Proyecto y Futuros Pasos</span>
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Hoja de ruta viva sincronizada con el LLM Wiki y el plan maestro de desarrollo.
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">
              Sincronización Mandatoria • AGENTS & Wiki
            </span>
          </div>

          {/* Banner de Regla de Sincronización */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-zinc-900/50 border border-emerald-500/30 flex items-start gap-3">
            <span className="text-lg">📌</span>
            <div className="text-xs sm:text-sm text-zinc-300 space-y-1">
              <p className="font-semibold text-emerald-300">
                Compromiso de Transparencia Técnica:
              </p>
              <p className="text-zinc-400">
                Esta página se actualiza automáticamente con cada modificación del <strong>ROADMAP</strong> o <strong>TODO</strong> del repositorio. Los desarrolladores y agentes de IA tienen como regla operativa documentar aquí los nuevos hitos alcanzados y las siguientes fases de desarrollo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hitos Completados */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span>✅</span>
                  <span>Hitos Completados y Operativos</span>
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Producción v2.0
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Motor de Metrónomo Web Audio:</strong> Reloj de jitter cero basado en AudioContext, tempo de 60 a 160 BPM, compases 4/4, 3/4, 2/4 y 3 timbres acústicos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Segmentador Fonético en Español:</strong> Separación fonética interactiva con respeto a diptongos, hiatos y acentuación en tiempo real.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Catálogo de 7 Técnicas Clínicas:</strong> STS, Prolongación Suave, Contactos Articulatorios Suaves, Desensibilización, Habla Eco DAF, Pausas Rítmicas y Respiración.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Detección y Precisión Vocal:</strong> Cálculo de latencia en milisegundos respecto al beat y respuesta háptica en dispositivos móviles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Entrenador de Respiración Diafragmática:</strong> Guía visual Box Breathing 4-4-4-4 para relajación torácica previa a la fonoarticulación.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Telemetría Pública Semanal (/stats):</strong> Integración automatizada vía CI/CD con GA4, Google Search Console, Bing y Cloudflare Edge.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Optimización SEO Técnico, IndexNow y Cumplimiento YMYL:</strong> Sitemap nativo (`sitemap.xml`), robots.txt, protocolo IndexNow para Bing, marcado Schema.org JSON-LD (WebApplication + MedicalWebPage), páginas legales (/privacy, /terms) con descargo fonoaudiológico y ads.txt oficial.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Páginas Estáticas por Técnica Fonoaudiológica (/tecnicas/[id]):</strong> 7 guías dedicadas con protocolo clínico detallado, preguntas frecuentes y acceso directo a la estación de práctica.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Simulador de Situaciones Reales y Rutina Guiada de 5 Minutos:</strong> Módulos para práctica en llamadas telefónicas, pedidos y entrevistas, y asistente paso a paso para reducir la fricción de entrada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Canal de Feedback Comunitario y Calidad Clínica (Zero-Leak RLS):</strong> Reporte directo de fallas en videos o dudas en técnicas para visitantes y usuarios registrados, con protección anti-spam honeypot, rate limiting, soporte offline y almacenamiento confidencial en Supabase.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Dashboard Privado de Administración y Gobierno Clínico (/admin):</strong> Consola protegida con Zero Trust RLS para visualización unificada de métricas de GA4, Search Console, Bing Webmaster, directorio de usuarios y moderación de reportes de calidad terapéutica.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Mis Frases de Desafío (Personalización STS):</strong> Silabador fonoaudiológico interactivo para palabras temidas, almacenamiento local en el navegador (Zero Trust) y plantillas predefinidas de situaciones cotidianas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Auto-Escucha Fonoaudiológica (Self-Monitoring Local):</strong> Grabación de voz en memoria con MediaRecorder API para evaluación propioceptiva inmediata sin subir datos a la nube.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Editor de Ejercicios en Vivo (CMS Supabase):</strong> Gestión directa desde la administración (/admin) para crear y eliminar oraciones clínicas con BPM recomendado sin requerir despliegues de código.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Exportador CSV en Administración:</strong> Descarga con 1 clic de reportes de calidad terapéutica y del directorio de usuarios con historial de adherencia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>PWA Instalable Offline-First:</strong> Integración de manifest PWA, Service Worker y botón de instalación en pantalla de inicio para acceso móvil inmediato.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Exportación de Reportes Clínicos en PDF / Fonoaudiológicos:</strong> Descarga con un clic de informes foniátricos formales con jitter vocal en milisegundos, adherencia y tabla de sesiones recientes para terapeutas del lenguaje.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Procesador de Audio Worklet de Ultra-Baja Latencia:</strong> Análisis fonatorio y detección de energía VAD en hilos independientes de la interfaz de usuario (≤ 5 ms) con fallback a AnalyserNode.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Evaluación y Entrenamiento de Diadococinesia Oral (/pa-ta-ka/):</strong> Medición de tasa motora articulatoria (sílabas/segundo) y regularidad temporal inter-silábica en secuencias fonoaudiológicas estándar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Sincronización Multi-Dispositivo de Frases en la Nube:</strong> Respaldo y unificación bidireccional en Supabase PostgreSQL Zero Trust RLS para usuarios autenticados con persistencia local sin conexión.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Reconocimiento Fonético On-Device Zero Trust:</strong> Validación fonemática en el navegador comparando la emisión acústica del paciente contra la frase objetivo y detectando omisiones o variaciones silábicas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Biofeedback Visual de Formantes F1 y F2 en Tiempo Real:</strong> Gráfico 2D del cuadrilátero vocálico que mapea apertura mandibular (F1) y posición lingual (F2) para descompresión motora durante la fonación.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Telesalud Fonoaudiológica P2P (WebRTC E2EE):</strong> Salas clínicas cifradas de extremo a extremo con metrónomo sincronizado maestro-esclavo y monitoreo de precisión remota sin latencia de servidores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Cadensa Kids • Módulo de Fluidez Pediátrica Gamificada:</strong> Dinámicas fonoaudiológicas para niños (4 a 10 años) con avatares animales (Tortuga Zen, Cadensín el Castor, Colibrí Cantor), cuentos rítmicos y sistema de estrellas.</span>
                </li>
              </ul>
            </div>

            {/* Futuros Pasos / Roadmap Activo */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                  <span>⏳</span>
                  <span>Futuros Pasos en Desarrollo Activo</span>
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Próximos Lanzamientos
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">→</span>
                  <span><strong>Hito 1: Estimulación Auditiva Dicótica y Ruido Blanco Adaptativo (DAF/FAF):</strong> Frecuencias alteradas y retardo dinámico para eludir el bloqueo vocal con estimulación binaural.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">→</span>
                  <span><strong>Hito 2: Interoperabilidad Médica HL7 / FHIR:</strong> Exportación estructurada de expedientes fonoaudiológicos para integración con software clínico hospitalario.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">→</span>
                  <span><strong>Hito 3: Inferencia de Tensión Muscular con ONNX Runtime Web:</strong> Redes neuronales acústicas ejecutadas en WebGPU para alertar sobre hiperaducción laríngea previa al habla.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">→</span>
                  <span><strong>Hito 4: Desensibilización Fóbica en Realidad Virtual WebXR:</strong> Escenarios 3D interactivos en el navegador para exposición gradual ante auditorios virtuales.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Referencia del Autor y Liderazgo Técnico */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <span>👨‍💻</span>
              <span>Acerca del Autor</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Conoce al arquitecto e impulsor técnico detrás del diseño e ingeniería de Cadensa.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-zinc-800/90 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                  <span>Arquitecto de Software & Autor Técnico</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-50">
                  Lenin Meza
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-2">
                  <span>📍 El Marqués, Querétaro, México</span>
                  <span>•</span>
                  <span>Software Architect & Technical Lead</span>
                </p>
              </div>

              {/* Enlaces de Contacto y Perfiles */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://merolhack.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 text-zinc-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>🌐</span>
                  <span>GitHub Pages</span>
                </a>
                <a
                  href="http://www.linkedin.com/in/leninmezazarco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>💼</span>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/merolhack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 text-zinc-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🐙</span>
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-3 border-t border-zinc-800/70 pt-4">
              <p>
                Con más de 17 años de experiencia profesional en ingeniería de software, arquitectura empresarial (TOGAF, BIAN) y sistemas distribuidos de alta disponibilidad (Bank as a Service, verificación de identidad biométrica, multi-cloud GCP/AWS), Lenin Meza ha enfocado el diseño de Cadensa en fusionar la excelencia técnica con una necesidad social crítica.
              </p>
              <p>
                Es autor de <strong className="text-zinc-100">&ldquo;Playbook de Arquitectura MACH: Estrategias Prácticas para Sistemas Componibles, Microservicios y Headless en la Era Agente&rdquo;</strong> (Amazon KDP 2026, ASIN: B0HFYGC34D), obra técnica de 314 páginas que profundiza en arquitecturas desacopladas, resiliencia distribuida y flujos de automatización con agentes de inteligencia artificial mediante el Model Context Protocol (MCP).
              </p>
              <p className="text-zinc-400">
                Cadensa nace con el propósito de aportar una herramienta web gratuita, científicamente fundada y de grado profesional a la comunidad hispanohablante de personas que tartamudean, logopedas y familias.
              </p>
            </div>

            {/* Badges de Publicación y Credenciales */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800">
                <span>📖</span>
                <span>Playbook de Arquitectura MACH (2026)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800">
                <span>☁️</span>
                <span>GCP • AWS • Edge Jamstack</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800">
                <span>📧</span>
                <a href="mailto:merolhack@gmail.com" className="hover:text-emerald-400 transition-colors">
                  merolhack@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Vinculación Comunitaria y Código Abierto */}
        <section className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-200">
              ¿Quieres contribuir o sumarte a la comunidad?
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Cadensa es un proyecto abierto. Colaboramos e invitamos a fonoaudiólogos, terapeutas y desarrolladores a proponer mejoras, nuevos ejercicios fonéticos o integraciones de accesibilidad.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://www.facebook.com/AMTTM/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Asociación Mexicana de la Tartamudez (Facebook)
            </a>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              Comenzar Entrenamiento
            </Link>
          </div>
        </section>

        {/* 7. Footer */}
        <footer className="w-full text-center pt-6 pb-4 border-t border-zinc-900 text-xs text-zinc-500 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Inicio
            </Link>
            <span>•</span>
            <Link href="/stats" className="hover:text-emerald-400 transition-colors">
              Estadísticas Globales
            </Link>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Acerca de Cadensa</span>
            <span>•</span>
            <a
              href="https://merolhack.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Lenin Meza (Autor)
            </a>
          </div>
          <p className="text-[11px] text-zinc-600">
            Cadensa — Encuentra el ritmo de tu voz • Next.js 16 • Supabase • Cloudflare Pages
          </p>
        </footer>
      </div>
    </main>
  );
}
