import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos de Uso y Aviso Clínico Fonoaudiológico — Cadensa',
  description:
    'Términos y condiciones de uso de Cadensa, descargo de responsabilidad médica y fonoaudiológica (Medical Disclaimer YMYL) y lineamientos de práctica.',
};

export default function TermsPage() {
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
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-semibold">
              Aviso Clínico • YMYL
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/privacy"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
            >
              Política de Privacidad
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
            Términos de Uso y Descargo de Responsabilidad Médica
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Importante: Lee este aviso clínico antes de iniciar tu rutina diaria en Cadensa.
          </p>
        </section>

        {/* Medical Disclaimer Destacado */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs sm:text-sm text-amber-200">
          <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
            <span>⚕️</span>
            <span>Descargo de Responsabilidad Fonoaudiológica y Médica (Medical Disclaimer)</span>
          </h2>
          <p className="leading-relaxed">
            <strong>Cadensa es una herramienta tecnológica educativa y de entrenamiento de hábitos de fluidez del habla.</strong> La información, metrónomos rítmicos, ejercicios de Habla Rítmica Silábica (STS), Inicio Vocal Suave (Easy Onset), técnicas de Van Riper y guías de respiración diafragmática provistos en este sitio web <strong>NO constituyen consejo médico, diagnóstico clínico ni sustituyen el tratamiento personalizado de un fonoaudiólogo, logopeda o terapeuta del lenguaje certificado.</strong>
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-emerald-400">
              1. Uso Adecuado del Gimnasio Digital de Fluidez
            </h2>
            <p>
              Los ejercicios están diseñados para realizarse en sesiones breves de 3 a 5 minutos diarios sin esfuerzo laríngeo ni tensión muscular. Si experimentas fatiga vocal, mareo durante los ejercicios de respiración o ansiedad elevada, suspende la sesión de inmediato y consulta a tu especialista en patología del habla.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-cyan-400">
              2. Acceso Gratuito y Propiedad Intelectual
            </h2>
            <p>
              Cadensa se ofrece de forma abierta y gratuita para apoyar a la comunidad hispanohablante de personas que tartamudean, familias y terapeutas del lenguaje. Queda prohibida la reproducción comercial no autorizada del software o su presentación engañosa como sustituto de certificación médica oficial.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-emerald-400">
              3. Vinculación Comunitaria (AMTTM)
            </h2>
            <p>
              Los enlaces hacia la Asociación Mexicana de la Tartamudez (AMTTM) tienen fines informativos y de apoyo comunitario. Cadensa alienta activamente el acompañamiento grupal y clínico supervisado.
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
          <Link href="/privacy" className="hover:text-emerald-400">Política de Privacidad</Link>
        </footer>
      </div>
    </main>
  );
}

