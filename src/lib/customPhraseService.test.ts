import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './supabaseClient';
import {
  loadLocalCustomPhrases,
  saveLocalCustomPhrases,
  syncCustomPhrasesWithCloud,
  CustomPhraseItem,
} from './customPhraseService';

describe('customPhraseService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debe guardar y leer frases en localStorage', () => {
    const sample: CustomPhraseItem[] = [
      { id: '1', phrase: 'Hola mundo foniátrico', bpm: 80 },
    ];
    saveLocalCustomPhrases(sample);
    const loaded = loadLocalCustomPhrases();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].phrase).toBe('Hola mundo foniátrico');
  });

  it('debe retornar lista local sin fallar si el userId es nulo o indefinido', async () => {
    const local = [{ id: '1', phrase: 'Prueba local', bpm: 75 }];
    const res = await syncCustomPhrasesWithCloud(local, '');

    expect(res.syncedWithCloud).toBe(false);
    expect(res.syncedPhrases).toEqual(local);
  });

  it('debe sincronizar frases locales con la nube fusionando sin duplicados', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'cloud-1',
              phrase: 'Frase en nube',
              bpm_recommended: 85,
              category: 'trabajo',
              created_at: '2026-10-28T00:00:00Z',
            },
          ],
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
      }),
    };

    // La llamada a insert devuelve la frase local recién subida
    mockClient.from().insert.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'cloud-2',
            phrase: 'Frase local nueva',
            bpm_recommended: 90,
            category: 'personalizado',
            created_at: '2026-10-28T00:01:00Z',
          },
        ],
        error: null,
      }),
    });

    const localPhrases: CustomPhraseItem[] = [
      { id: 'loc-1', phrase: 'Frase local nueva', bpm: 90 },
    ];

    const result = await syncCustomPhrasesWithCloud(
      localPhrases,
      'user-uuid-123',
      mockClient as unknown as typeof supabase
    );

    expect(result.syncedWithCloud).toBe(true);
    expect(result.syncedPhrases).toHaveLength(2);

    const phrases = result.syncedPhrases.map((p) => p.phrase);
    expect(phrases).toContain('Frase local nueva');
    expect(phrases).toContain('Frase en nube');
  });
});

