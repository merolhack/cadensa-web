import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PwaInstallButton } from './PwaInstallButton';

describe('PwaInstallButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('no muestra el botón si no se ha recibido el evento beforeinstallprompt', () => {
    const { container } = render(<PwaInstallButton />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra el botón de instalar cuando se dispara beforeinstallprompt', () => {
    render(<PwaInstallButton />);

    const mockPromptEvent = new Event('beforeinstallprompt');
    // @ts-expect-error Mock prompt
    mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
    // @ts-expect-error Mock userChoice
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    expect(screen.getByRole('button', { name: /Instalar App/i })).toBeInTheDocument();
  });

  it('ejecuta prompt al hacer clic y cambia de estado al aceptar la instalación', async () => {
    render(<PwaInstallButton />);

    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockPromptEvent = new Event('beforeinstallprompt');
    // @ts-expect-error Mock prompt
    mockPromptEvent.prompt = mockPrompt;
    // @ts-expect-error Mock userChoice
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    const installBtn = screen.getByRole('button', { name: /Instalar App/i });

    await act(async () => {
      fireEvent.click(installBtn);
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(screen.getByText(/App Instalada/i)).toBeInTheDocument();
  });

  it('muestra el indicador de App Instalada si se abre en standalone', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<PwaInstallButton />);
    expect(screen.getByText(/App Instalada/i)).toBeInTheDocument();
  });
});

