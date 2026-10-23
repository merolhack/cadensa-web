import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard Component - Unit Tests', () => {
  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <Dashboard
        isOpen={false}
        onClose={vi.fn()}
        streakDays={3}
        totalMinutes={15}
        xpPoints={250}
        accuracy={96}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar las métricas de racha, minutos y precisión cuando isOpen es true', () => {
    render(
      <Dashboard
        isOpen={true}
        onClose={vi.fn()}
        streakDays={5}
        totalMinutes={25}
        xpPoints={300}
        accuracy={94}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText(/panel de progreso y fluidez/i)).toBeInTheDocument();
  });
});
