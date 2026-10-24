import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommunityBanner } from './CommunityBanner';

describe('CommunityBanner Component - Unit Tests', () => {
  it('renderiza el enlace oficial hacia la AMTTM en Facebook con atributos seguros', () => {
    render(<CommunityBanner />);

    const link = screen.getByRole('link', { name: /facebook/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.facebook.com/AMTTM/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renderiza el enlace oficial hacia la AMTTM en YouTube con atributos seguros', () => {
    render(<CommunityBanner />);

    const link = screen.getByRole('link', { name: /youtube/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/@amtartamudez');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('permanece siempre visible de manera continua sin botón de cierre destructivo', () => {
    render(<CommunityBanner />);

    expect(screen.getByText(/asociación mexicana de la tartamudez/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cerrar/i })).toBeNull();
  });
});
