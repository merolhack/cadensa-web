import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-lg w-full p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-3xl">
          🧭
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Error 404 • Ruta no encontrada
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-50">
            Esta página no existe en Cadensa
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            La dirección que intentaste visitar no se encuentra disponible. Respira con calma (4-4-4-4) y regresa al catálogo principal de técnicas fonoaudiológicas para continuar tu entrenamiento de fluidez.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
          >
            ← Ir al Catálogo de Técnicas
          </Link>
          <Link
            href="/about"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs transition-all"
          >
            Acerca de Cadensa
          </Link>
        </div>
      </div>
    </main>
  );
}

