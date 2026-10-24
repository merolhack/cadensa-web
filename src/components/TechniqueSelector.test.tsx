import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TechniqueSelector } from './TechniqueSelector';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';

describe('TechniqueSelector Component - Unit Tests', () => {
  it('debe renderizar el botón disparador con la técnica activa', () => {
    render(
      <TechniqueSelector
        currentTechniqueId="sts"
        onSelectTechnique={vi.fn()}
      />
    );

    expect(screen.getByText('Ritmo STS')).toBeInTheDocument();
  });

  it('debe abrir el menú modal al hacer clic en el disparador y mostrar las 3 familias', () => {
    render(
      <TechniqueSelector
        currentTechniqueId="sts"
        onSelectTechnique={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: /técnica actual/i });
    fireEvent.click(trigger);

    expect(screen.getByText(/menú modular de técnicas clínicas/i)).toBeInTheDocument();
    expect(screen.getByText(/modelado de fluidez \(fluency shaping\)/i)).toBeInTheDocument();
    expect(screen.getByText(/control motor y fisiológico/i)).toBeInTheDocument();
    expect(screen.getByText(/modificación del bloqueo \(enfoque van riper\)/i)).toBeInTheDocument();
  });

  it('debe permitir seleccionar otra técnica (ej. Inicio Vocal Suave) y disparar onSelectTechnique', () => {
    const handleSelect = vi.fn();
    render(
      <TechniqueSelector
        currentTechniqueId="sts"
        onSelectTechnique={handleSelect}
      />
    );

    // Abrir menú
    fireEvent.click(screen.getByRole('button', { name: /técnica actual/i }));

    // Clic en Inicio Vocal Suave
    const easyOnsetOption = screen.getByText('Inicio Vocal Suave (Easy Onset)');
    fireEvent.click(easyOnsetOption);

    expect(handleSelect).toHaveBeenCalledWith(CLINICAL_TECHNIQUES.easy_onset);
  });
});
