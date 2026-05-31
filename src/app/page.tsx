'use client';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Cadensa
        </h1>
        <p className="text-xl text-zinc-400 font-light italic">
          Encuentra el ritmo de tu voz.
        </p>
        <p className="text-zinc-300 leading-relaxed">
          Una plataforma diaria que entrena tu ritmo al hablar para superar bloqueos y comunicarte con total seguridad. 
          Basada en el habla rítmica silábica.
        </p>
        <div className="pt-8">
          <div className="inline-block px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium tracking-wide">
            Prueba de Concepto - Infraestructura Base
          </div>
        </div>
      </div>
    </main>
  );
}
