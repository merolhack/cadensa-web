import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TechniquesCatalogHome } from './TechniquesCatalogHome';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';

describe('TechniquesCatalogHome Component - Unit Tests', () => {
  const defaultProps = {
    onSelectTechnique: vi.fn(),
    onOpenVideoModal: vi.fn(),
    streakDays: 3,
    totalMinutes: 15,
    xpPoints: 350,
    currentUserEmail: 'paciente@ejemplo.com',
    onOpenAuthModal: vi.fn(),
    onOpenDashboard: vi.fn(),
  };

  it('debe renderizar el título principal y la misión de Cadensa', () => {
    render(<TechniquesCatalogHome {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1, name: /encuentra el ritmo de tu voz/i })).toBeInTheDocument();
    expect(screen.getByText(/gimnasio digital de fluidez del habla/i)).toBeInTheDocument();
  });

  it('debe renderizar las 7 tarjetas de técnicas clínicas en el catálogo', () => {
    render(<TechniquesCatalogHome {...defaultProps} />);

    expect(screen.getAllByText('Habla Rítmica Silábica (STS)')[0]).toBeInTheDocument();
    expect(screen.getByText('Inicio Vocal Suave (Easy Onset)')).toBeInTheDocument();
    expect(screen.getByText('Contacto Articular Suave (Light Contact)')).toBeInTheDocument();
    expect(screen.getByText('Habla Prolongada y Fonación Continua')).toBeInTheDocument();
    expect(screen.getByText('Respiración Diafragmática (Box Breathing)')).toBeInTheDocument();
    expect(screen.getByText('Salida Suave del Bloqueo (Pull-Out)')).toBeInTheDocument();
    expect(screen.getByText('Cancelación y Pausa Consciente (Cancellation)')).toBeInTheDocument();
  });

  it('debe filtrar las tarjetas al hacer clic en un filtro de familia terapéutica', () => {
    render(<TechniquesCatalogHome {...defaultProps} />);

    // Filtrar por Regulación Fisiológica
    const physFilter = screen.getByRole('button', { name: /fisiológico/i });
    fireEvent.click(physFilter);

    // Solo debe verse Box Breathing
    expect(screen.getByText('Respiración Diafragmática (Box Breathing)')).toBeInTheDocument();
    expect(screen.queryByText('Inicio Vocal Suave (Easy Onset)')).not.toBeInTheDocument();
  });

  it('debe invocar onOpenVideoModal al hacer clic en "Ver Video"', () => {
    const onOpenVideoModal = vi.fn();
    render(<TechniquesCatalogHome {...defaultProps} onOpenVideoModal={onOpenVideoModal} />);

    const videoButtons = screen.getAllByRole('button', { name: /ver video/i });
    expect(videoButtons.length).toBeGreaterThan(0);
    fireEvent.click(videoButtons[0]!);

    expect(onOpenVideoModal).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onSelectTechnique al hacer clic en "Entrenar →"', () => {
    const onSelectTechnique = vi.fn();
    render(<TechniquesCatalogHome {...defaultProps} onSelectTechnique={onSelectTechnique} />);

    const trainButtons = screen.getAllByRole('button', { name: /entrenar/i });
    expect(trainButtons.length).toBeGreaterThan(0);
    fireEvent.click(trainButtons[0]!);

    expect(onSelectTechnique).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onSelectTechnique con STS al hacer clic en "Comenzar Práctica Guiada Directa"', () => {
    const onSelectTechnique = vi.fn();
    render(<TechniquesCatalogHome {...defaultProps} onSelectTechnique={onSelectTechnique} />);

    const directBtn = screen.getByRole('button', { name: /comenzar práctica guiada directa/i });
    fireEvent.click(directBtn);

    expect(onSelectTechnique).toHaveBeenCalledWith(CLINICAL_TECHNIQUES.sts);
  });

  it('debe invocar onOpenDAF y onOpenCertificates al hacer clic en sus respectivos botones', () => {
    const onOpenDAF = vi.fn();
    const onOpenCertificates = vi.fn();
    render(
      <TechniquesCatalogHome
        {...defaultProps}
        onOpenDAF={onOpenDAF}
        onOpenCertificates={onOpenCertificates}
      />
    );

    const dafBtn = screen.getByRole('button', { name: /feedback auditivo alterado daf y faf/i });
    expect(dafBtn).toBeInTheDocument();
    fireEvent.click(dafBtn);
    expect(onOpenDAF).toHaveBeenCalledTimes(1);

    const certBtn = screen.getByRole('button', { name: /diplomas de mérito y fluidez/i });
    expect(certBtn).toBeInTheDocument();
    fireEvent.click(certBtn);
    expect(onOpenCertificates).toHaveBeenCalledTimes(1);
  });
});
