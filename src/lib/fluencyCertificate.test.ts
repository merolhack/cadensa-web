import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CLINICAL_CERTIFICATES,
  generateCertificateHtml,
  openPrintableCertificate,
} from './fluencyCertificate';

describe('fluencyCertificate', () => {
  it('contiene la lista predefinida de certificados clínicos con metadatos válidos', () => {
    expect(CLINICAL_CERTIFICATES.length).toBeGreaterThanOrEqual(3);
    const cert001 = CLINICAL_CERTIFICATES.find((c) => c.id === 'cert_001');
    expect(cert001).toBeDefined();
    expect(cert001?.title).toBe('Iniciador Valiente');
    expect(cert001?.level).toBe('Principiante');
    expect(cert001?.badgeEmoji).toBe('🚀');
  });

  it('genera HTML con el nombre del paciente y detalles del certificado', () => {
    const cert = CLINICAL_CERTIFICATES[0];
    const html = generateCertificateHtml(cert, 'Carlos Mendoza');

    expect(html).toContain('Carlos Mendoza');
    expect(html).toContain('Iniciador Valiente');
    expect(html).toContain('Nivel: Principiante');
    expect(html).toContain('🚀');
    expect(html).toContain('Cadensa Digital Clinic');
  });

  describe('openPrintableCertificate', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('abre una ventana del navegador e invoca print()', () => {
      const mockPrint = vi.fn();
      const mockWrite = vi.fn();
      const mockClose = vi.fn();
      const mockFocus = vi.fn();

      const mockWindow = {
        document: {
          write: mockWrite,
          close: mockClose,
        },
        focus: mockFocus,
        print: mockPrint,
      };

      vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);
      vi.useFakeTimers();

      openPrintableCertificate(CLINICAL_CERTIFICATES[1], 'Ana Gómez');

      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockWrite).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
      expect(mockFocus).toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(mockPrint).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});

