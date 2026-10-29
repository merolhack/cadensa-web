import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateFhirDiagnosticReport, downloadFhirReportJson } from './fhirExport';
import { ClinicalReportPayload } from './clinicalReport';

describe('fhirExport', () => {
  const mockPayload: ClinicalReportPayload = {
    exportDate: '2026-10-29T12:00:00.000Z',
    patientId: 'PAC-9921',
    clinicianNotes: 'Notable mejoría en inicio suave.',
    metrics: {
      totalSessions: 12,
      totalMinutes: 60,
      totalSyllables: 1500,
      averageAccuracy: 92,
      averageBpm: 75,
      vocalJitterMs: 25,
      rhythmAdherenceLevel: 'Óptimo',
      activeStreakDays: 5,
      xpPoints: 350,
      clinicalRecommendations: ['Continuar con frases complejas.'],
    },
    recentSessions: [],
  };

  it('genera un recurso FHIR R4 DiagnosticReport válido y completo', () => {
    const report = generateFhirDiagnosticReport(mockPayload);

    expect(report.resourceType).toBe('DiagnosticReport');
    expect(report.status).toBe('final');
    expect(report.subject.reference).toBe('Patient/PAC-9921');
    expect(report.category[0].coding[0].code).toBe('SP');
    expect(report.code.coding[0].system).toBe('http://loinc.org');
    expect(report.code.coding[0].code).toBe('77150-1');

    // Validar observaciones contenidas
    expect(report.contained.length).toBe(5);
    const accuracyObs = report.contained.find((o) => o.id === 'obs-accuracy');
    expect(accuracyObs).toBeDefined();
    expect(accuracyObs?.valueQuantity?.value).toBe(92);
    expect(accuracyObs?.valueQuantity?.unit).toBe('%');

    const snomedObs = report.contained.find((o) => o.id === 'obs-diagnosis-snomed');
    expect(snomedObs).toBeDefined();
    expect(snomedObs?.code.coding[0].code).toBe('289190003');

    // Validar conclusión y extensiones
    expect(report.conclusion).toContain('Nivel de sincronización rítmica: Óptimo');
    expect(report.conclusion).toContain('Notable mejoría en inicio suave.');
    expect(report.extension?.[0].valueInteger).toBe(5);
  });

  describe('downloadFhirReportJson', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('crea el Blob y simula la descarga del archivo FHIR', () => {
      const clickMock = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        set href(val: string) {},
        set download(val: string) {},
        click: clickMock,
      } as unknown as HTMLAnchorElement);

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-fhir-url');
      const revokeObjectURLMock = vi.fn();

      vi.stubGlobal('URL', {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      });

      const success = downloadFhirReportJson(mockPayload);

      expect(success).toBe(true);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-fhir-url');
    });
  });
});
