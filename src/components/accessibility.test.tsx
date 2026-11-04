import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import 'vitest-axe/extend-expect';
import React from 'react';
import { TechniqueVideoModal } from './TechniqueVideoModal';
import { TechniquesCatalogHome } from './TechniquesCatalogHome';
import Home from '@/app/page';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';

describe('Auditoría Automatizada de Accesibilidad (a11y - WCAG 2.1 AA)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TechniqueVideoModal no presenta violaciones de accesibilidad con portada activa', async () => {
    const { container } = render(
      <TechniqueVideoModal
        technique={CLINICAL_TECHNIQUES.sts}
        isOpen={true}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TechniqueVideoModal no presenta violaciones de accesibilidad con técnica Easy Onset', async () => {
    const { container } = render(
      <TechniqueVideoModal
        technique={CLINICAL_TECHNIQUES.easy_onset}
        isOpen={true}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TechniquesCatalogHome no presenta violaciones de accesibilidad en el catálogo inicial', async () => {
    const { container } = render(
      <TechniquesCatalogHome
        onSelectTechnique={vi.fn()}
        onOpenVideoModal={vi.fn()}
        streakDays={3}
        totalMinutes={15}
        xpPoints={120}
        currentUserEmail={null}
        onOpenAuthModal={vi.fn()}
        onOpenDashboard={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Página principal (Home) no presenta violaciones de accesibilidad estructurales', async () => {
    const { container } = render(<Home initialView="home" />);

    // axe audita roles ARIA, jerarquía de encabezados, nombres accesibles y contraste básico
    const results = await axe(container, {
      rules: {
        // En jsdom, color-contrast suele requerir cálculo visual complejo; si jsdom lo soporta lo audita
        'color-contrast': { enabled: false }, // jsdom no computa estilos de layout con Tailwind CSS v4
      },
    });
    expect(results).toHaveNoViolations();
  });
});
