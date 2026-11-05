import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CANONICAL_TECHNIQUE_SLUGS,
  getTechniqueBySlug,
  TECHNIQUE_FAMILIES,
} from '@/lib/clinicalTechniques';
import { TechniqueFeedbackButton } from '@/components/TechniqueFeedbackButton';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.values(CANONICAL_TECHNIQUE_SLUGS).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const technique = getTechniqueBySlug(slug);

  if (!technique) {
    return { title: 'Técnica no encontrada — Cadensa' };
  }

  const canonicalUrl = `https://cadensa-web.pages.dev/techniques/${slug}`;

  return {
    title: `${technique.name} — Guía Fonoaudiológica y Práctica | Cadensa`,
    description: `${technique.summary} Base neurobiológica, protocolo clínico paso a paso y video demostrativo en alta definición.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${technique.name} — Cadensa`,
      description: technique.clinicalObjective,
      url: canonicalUrl,
      images: technique.thumbnailUrl ? [{ url: technique.thumbnailUrl }] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${technique.name} — Cadensa`,
      description: technique.summary,
      images: technique.thumbnailUrl ? [technique.thumbnailUrl] : undefined,
    },
  };
}

export default async function TechniquePage({ params }: PageProps) {
  const { slug } = await params;
  const technique = getTechniqueBySlug(slug);

  if (!technique) {
    notFound();
    return null;
  }

  const family = TECHNIQUE_FAMILIES.find((f) => f.id === technique.familyId);
  const canonicalUrl = `https://cadensa-web.pages.dev/techniques/${slug}`;

  // Structured Data (JSON-LD) para SEO Clínico y Rich Snippets de Video
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: `${technique.name} — Guía Fonoaudiológica`,
        description: technique.summary,
        medicalAudience: {
          '@type': 'MedicalAudience',
          audienceType: 'Pacientes con disfemia y fonoaudiólogos',
        },
        aspect: ['Treatment', 'Overview', 'Training'],
      },
      ...(technique.videoUrl
        ? [
            {
              '@type': 'VideoObject',
              name: `Demostración Clínica: ${technique.name}`,
              description: technique.clinicalObjective,
              thumbnailUrl: [
                `https://cadensa-web.pages.dev${technique.thumbnailUrl || '/media/techniques/syllable-timed-speech_portada.webp'}`,
              ],
              uploadDate: '2026-11-03T12:00:00Z',
              contentUrl: `https://cadensa-web.pages.dev${technique.videoUrl}`,
              embedUrl: canonicalUrl,
            },
          ]
        : []),
    ],
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-4xl space-y-8">
        {/* Encabezado y Navegación Superior */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Cadensa
            </Link>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-semibold">
              Guía Fonoaudiológica Oficial
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
              href="/?view=practice"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
            >
              ⚡ Iniciar Práctica Guiada
            </Link>
          </nav>
        </header>

        {/* Hero de la Técnica */}
        <section className="space-y-4">
          <div className="flex items-start sm:items-center gap-4">
            <span className="text-4xl p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
              {technique.icon}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs text-zinc-400 font-medium">{family?.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase font-mono">
                  {technique.badge}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  Nivel: {technique.difficulty}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
                {technique.name}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            {technique.summary}
          </p>

          {/* Reproductor de Video HD Incrustado para Googlebot y Pacientes */}
          {technique.videoUrl && (
            <div className="space-y-2 pt-2">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_40px_rgba(16,185,129,0.15)] bg-zinc-900">
                <video
                  src={technique.videoUrl}
                  poster={technique.thumbnailUrl}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-cover"
                  title={`Demostración clínica de ${technique.name}`}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span>🎬</span>
                  <span>Avatar IA Fonoaudiológico 1080p con Biofeedback en Tiempo Real</span>
                </span>
                <span className="font-mono text-[11px] text-zinc-500">Audio Neuronal GCP TTS</span>
              </div>
            </div>
          )}
        </section>

        {/* Desglose Clínico: Objetivo y Neurobiología */}
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

        {/* Protocolo Paso a Paso */}
        <section className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span>📋</span>
            <span>Protocolo de Ejecución Paso a Paso</span>
          </h2>
          <ol className="space-y-3">
            {technique.practicalSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Preguntas Frecuentes Fonoaudiológicas */}
        {technique.faqItems && technique.faqItems.length > 0 && (
          <section className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>❓</span>
              <span>Preguntas Frecuentes sobre {technique.shortName}</span>
            </h2>
            <div className="space-y-3">
              {technique.faqItems.map((faq) => (
                <div key={faq.id} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">
                      {faq.question}
                    </h3>
                    {faq.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {faq.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Llamado a la Acción (CTA) */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
              ¿Listo para entrenar {technique.shortName}?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Prueba la técnica con el metrónomo interactivo y nuestro catálogo adaptado por dialecto.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/?view=practice"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              🚀 Comenzar Práctica Guiada
            </Link>
          </div>
        </section>

        {/* Feedback Comunitario */}
        <div className="flex justify-center pt-2">
          <TechniqueFeedbackButton techniqueId={technique.id} techniqueName={technique.name} />
        </div>

        {/* Footer Universal */}
        <Footer />
      </div>
    </main>
  );
}
