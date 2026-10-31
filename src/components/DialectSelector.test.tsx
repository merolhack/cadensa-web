import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DialectSelector } from './DialectSelector';

describe('DialectSelector Component', () => {
  it('debe renderizar el título y los 5 presets regionales', () => {
    render(<DialectSelector onSelectDialect={() => {}} />);

    expect(screen.getByText(/Calibración Fonética Dialectal/i)).toBeInTheDocument();
    expect(screen.getByText(/Español Mexicano Central/i)).toBeInTheDocument();
    expect(screen.getByText(/Español Rioplatense/i)).toBeInTheDocument();
    expect(screen.getByText(/Español Andino/i)).toBeInTheDocument();
    expect(screen.getByText(/Español Caribeño/i)).toBeInTheDocument();
    expect(screen.getByText(/Castellano Peninsular/i)).toBeInTheDocument();
  });

  it('debe invocar onSelectDialect al cambiar a Español Andino', () => {
    const handleSelect = vi.fn();
    render(<DialectSelector onSelectDialect={handleSelect} />);

    const andinoBtn = screen.getByRole('button', { name: /Español Andino/i });
    fireEvent.click(andinoBtn);

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'andino',
        recommendedTempoBpm: 74,
      })
    );
  });
});
