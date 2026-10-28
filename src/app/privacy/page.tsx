import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos — Cadensa',
  description:
    'Política de privacidad, procesamiento de audio Zero Trust en navegador, cookies de telemetría (Google Analytics 4 y AdSense) y derechos ARCO en Cadensa.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Cadensa
            </Link>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-semibold">
              Privacidad y Datos
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/terms"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
            >
              Términos y Aviso Clínico
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
            >
              ← Volver al Inicio
            </Link>
          </nav>
        </header>

        <section className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50">
            Política de Privacidad y Procesamiento Zero Trust
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Última actualización: 28 de octubre de 2026 • Responsable: Lenin Meza (Cadensa Project)
          </p>
        </section>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-emerald-400">
              1. Procesamiento Local de Voz y Micrófono (100% En Navegador)
            </h2>
            <p>
              Cadensa utiliza la API nativa <strong>Web Audio API</strong> de tu navegador exclusivamente para calcular la sincronía rítmica y el nivel de energía vocal en tiempo real. <strong>Ningún fragmento de voz ni grabación de audio es almacenado ni enviado a servidores externos.</strong> El acceso al micrófono está restringido estrictamente al dominio propio mediante la directiva HTTP <code>Permissions-Policy: microphone=(self)</code>.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-cyan-400">
              2. Almacenamiento de Progreso y Autenticación (Supabase RLS)
            </h2>
            <p>
              Puedes utilizar Cadensa en <strong>Modo Invitado</strong> guardando tus rachas y minutos únicamente en el almacenamiento local de tu dispositivo (<code>localStorage</code>). Si decides crear una cuenta o iniciar sesión mediante Google OAuth 2.0 o Magic Link, únicamente almacenamos tu correo electrónico y métricas numéricas de práctica (BPM, duración de sesión, puntos XP y fecha de racha) en PostgreSQL protegido con políticas de seguridad a nivel de fila (<strong>Row Level Security - Zero Trust</strong>).
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-emerald-400">
              3. Cookies, Telemetría Analítica y Google AdSense
            </h2>
            <p>
              Utilizamos <strong>Google Analytics 4 (G-HCTT9146TJ)</strong> para recopilar estadísticas agregadas y anónimas de uso (páginas visitadas, duración de sesión, país y eventos de interacción con las técnicas) que se publican de forma transparente en nuestra sección <Link href="/stats" className="text-emerald-400 underline">/stats</Link>.
            </p>
            <p>
              Asimismo, este sitio integra verificación de <strong>Google AdSense (ca-pub-2700240339792942)</strong>. Los proveedores terceros, incluido Google, pueden utilizar cookies para mostrar anuncios relevantes o medir la eficacia de las visitas. Los usuarios pueden inhabilitar la publicidad personalizada visitando la Configuración de Anuncios de Google (<code>https://adssettings.google.com</code>).
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-cyan-400">
              4. Derechos del Usuario y Contacto Directo
            </h2>
            <p>
              En cualquier momento puedes borrar tus datos locales desde tu navegador o solicitar la eliminación definitiva de tu perfil de usuario escribiendo directamente al correo electrónico del autor: <a href="mailto:merolhack@gmail.com" className="text-emerald-400 underline">merolhack@gmail.com</a>.
            </p>
          </section>
        </div>

        <footer className="pt-6 border-t border-zinc-900 text-center text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="hover:text-emerald-400">Inicio</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-emerald-400">Acerca de</Link>
          <span>•</span>
          <Link href="/stats" className="hover:text-emerald-400">Estadísticas</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-emerald-400">Términos y Aviso Clínico</Link>
        </footer>
      </div>
    </main>
  );
}

