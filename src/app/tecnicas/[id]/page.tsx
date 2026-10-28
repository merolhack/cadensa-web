import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLINICAL_TECHNIQUES, TECHNIQUE_FAMILIES, TechniqueId } from '@/lib/clinicalTechniques';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.keys(CLINICAL_TECHNIQUES).map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const technique = CLINICAL_TECHNIQUES[id as TechniqueId];
  if (!technique) {
    return { title: 'Técnica no encontrada — Cadensa' };
  }

  return {
    title: `${technique.name} — Guía Fonoaudiológica y Práctica | Cadensa`,
    description: `${technique.summary} Base neurobiológica, protocolo clínico paso a paso y entrenamiento guiado en línea.`,
    alternates: {
      canonical: `https://cadensa-web.pages.dev/tecnicas/${technique.id}`,
    },
    openGraph: {
      title: `${technique.name} — Cadensa`,
      description: technique.clinicalObjective,
      url: `https://cadensa-web.pages.dev/tecnicas/${technique.id}`,
    },
  };
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const technique = CLINICAL_TECHNIQUES[id as TechniqueId];

  if (!technique) {
    notFound();
  }

  const family = TECHNIQUE_FAMILIES.find((f) => f.id === technique.familyId);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Encabezado */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Cadensa
            </Link>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-semibold">
              Guía Fonoaudiológica
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/#catalogo"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
            >
              📚 Ver las 7 Técnicas
            </Link>
            <Link
              href={`/?view=practice`}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
            >
              ⚡ Entrenar Ahora
            </Link>
          </nav>
        </header>

        {/* Hero de la Técnica */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner">
              {technique.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{family?.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase">
                  {technique.badge}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  Nivel: {technique.difficulty}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-50">
                {technique.name}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            {technique.summary}
          </p>

          {/* Media / Video Poster si está disponible */}
          {technique.thumbnailUrl && (
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-800 shadow-xl my-4">
              <Image
                src={technique.thumbnailUrl}
                alt={`Guía de ${technique.name}`}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent flex items-end p-6">
                <div className="space-y-1">
                  <span className="text-xs text-emerald-400 font-mono font-bold">Demostración en Video HD</span>
                  <h3 className="text-lg font-bold text-zinc-100">{technique.shortName} en Acción</h3>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Desglose Clínico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Objetivo Clínico Fonoaudiológico</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {technique.clinicalObjective}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
              <span>🧠</span>
              <span>Fundamento Neurobiológico</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {technique.neurobiologicalBasis}
            </p>
          </div>
        </div>

        {/* Pasos Prácticos */}
        <section className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span>📋</span>
            <span>Protocolo de Ejecución Paso a Paso</span>
          </h2>
          <ol className="space-y-3">
            {technique.practicalSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Preguntas Frecuentes Clínicas */}
        {technique.faqItems && technique.faqItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>❓</span>
              <span>Preguntas Frecuentes sobre {technique.shortName}</span>
            </h2>
            <div className="space-y-3">
              {technique.faqItems.map((faq) => (
                <div key={faq.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-200">{faq.question}</h3>
                    {faq.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {faq.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action para Entrenar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-zinc-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100">
              ¿Listo para entrenar {technique.name}?
            </h3>
            <p className="text-xs text-zinc-400 max-w-lg">
              Inicia una sesión de 3 a 5 minutos en el gimnasio digital con visualizador en tiempo real y lectura silábica adaptada.
            </p>
          </div>
          <Link
            href={`/?view=practice`}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <span>{technique.actionButton.icon}</span>
            <span>Iniciar Práctica</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-zinc-900 text-center text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="hover:text-emerald-400">Inicio</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-emerald-400">Acerca de</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-emerald-400">Privacidad</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-emerald-400">Términos y Aviso Clínico</Link>
        </footer>
      </div>
    </main>
  );
}
