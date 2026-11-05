import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './supabaseClient';
import {
  loadLocalCustomPhrases,
  saveLocalCustomPhrases,
  saveCustomPhraseToCloud,
  deleteCustomPhraseFromCloud,
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
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'cloud-2',
            phrase: 'Frase local nueva',
            bpm: 90,
            bpm_recommended: 90,
            category: 'personalizado',
            created_at: '2026-10-28T00:01:00Z',
          },
          error: null,
        }),
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

  it('debe guardar frase individual en la nube con saveCustomPhraseToCloud', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'cloud-item-1',
                phrase: 'Quiero agua fresca',
                bpm: 80,
                category: 'personalizado',
                created_at: '2026-11-05T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    const res = await saveCustomPhraseToCloud(
      { phrase: 'Quiero agua fresca', bpm: 80, category: 'personalizado' },
      'user-123',
      mockClient as unknown as typeof supabase
    );

    expect(res.success).toBe(true);
    expect(res.savedItem?.phrase).toBe('Quiero agua fresca');
    expect(mockClient.from).toHaveBeenCalledWith('custom_phrases');
  });

  it('debe eliminar frase en la nube con deleteCustomPhraseFromCloud', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      }),
    };

    const success = await deleteCustomPhraseFromCloud(
      'cloud-item-1',
      'user-123',
      mockClient as unknown as typeof supabase
    );

    expect(success).toBe(true);
    expect(mockClient.from).toHaveBeenCalledWith('custom_phrases');
  });
});

