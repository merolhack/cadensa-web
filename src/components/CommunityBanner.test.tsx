import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunityBanner } from './CommunityBanner';

describe('CommunityBanner Component - Unit Tests', () => {
  it('renderiza el enlace oficial hacia la AMTTM en Facebook', () => {
    render(<CommunityBanner />);

    const link = screen.getByRole('link', { name: /visitar amttm/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.facebook.com/AMTTM/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('permite cerrar el banner y persistir el estado', () => {
    render(<CommunityBanner />);

    const closeButton = screen.getByRole('button', { name: /cerrar aviso de amttm/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/asociación mexicana de la tartamudez/i)).toBeNull();
  });
});
