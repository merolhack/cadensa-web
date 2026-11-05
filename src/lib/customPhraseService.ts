import { supabase } from './supabaseClient';

export interface CustomPhraseItem {
  id: string;
  phrase: string;
  bpm: number;
  category?: string;
  created_at?: string;
}

interface GenericCloudPhraseRow {
  id: string;
  phrase: string;
  bpm?: number | null;
  bpm_recommended?: number | null;
  category?: string | null;
  created_at: string;
}

const STORAGE_KEY = 'cadensa_custom_phrases';

/**
 * Carga las frases almacenadas localmente en el navegador.
 */
export function loadLocalCustomPhrases(): CustomPhraseItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error al leer frases de localStorage:', err);
    return [];
  }
}

/**
 * Guarda las frases localmente en el navegador.
 */
export function saveLocalCustomPhrases(phrases: CustomPhraseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
  } catch (err) {
    console.error('Error al guardar frases en localStorage:', err);
  }
}

/**
 * Guarda directamente una frase individual en la base de datos de Supabase (Zero Trust RLS).
 */
export async function saveCustomPhraseToCloud(
  item: Omit<CustomPhraseItem, 'id' | 'created_at'>,
  userId: string,
  client = supabase
): Promise<{ savedItem: CustomPhraseItem | null; success: boolean }> {
  if (!userId || !client) {
    return { savedItem: null, success: false };
  }

  try {
    // 1. Intentar inserción en la tabla oficial 'custom_phrases'
    const query = client
      .from('custom_phrases')
      .insert({
        user_id: userId,
        phrase: item.phrase,
        bpm: item.bpm,
        category: item.category || 'personalizado',
      })
      .select('id, phrase, bpm, category, created_at');

    const res = typeof (query as unknown as { single?: () => Promise<unknown> }).single === 'function'
      ? await (query as unknown as { single: () => Promise<{ data: unknown; error: unknown }> }).single()
      : await (query as unknown as Promise<{ data: unknown; error: unknown }>);

    const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
    const error = res?.error;

    if (!error && data) {
      const row = data as unknown as GenericCloudPhraseRow;
      return {
        savedItem: {
          id: row.id,
          phrase: row.phrase,
          bpm: row.bpm || item.bpm,
          category: row.category || 'personalizado',
          created_at: row.created_at,
        },
        success: true,
      };
    }

    // 2. Fallback a 'user_custom_phrases' si 'custom_phrases' aún no ha sido migrada
    const fallbackQuery = client
      .from('user_custom_phrases')
      .insert({
        user_id: userId,
        phrase: item.phrase,
        bpm_recommended: item.bpm,
        category: item.category || 'personalizado',
      })
      .select('id, phrase, bpm_recommended, category, created_at');

    const fallbackRes = typeof (fallbackQuery as unknown as { single?: () => Promise<unknown> }).single === 'function'
      ? await (fallbackQuery as unknown as { single: () => Promise<{ data: unknown; error: unknown }> }).single()
      : await (fallbackQuery as unknown as Promise<{ data: unknown; error: unknown }>);

    const fallbackData = Array.isArray(fallbackRes?.data) ? fallbackRes.data[0] : fallbackRes?.data;
    const fallbackError = fallbackRes?.error;

    if (!fallbackError && fallbackData) {
      const row = fallbackData as unknown as GenericCloudPhraseRow;
      return {
        savedItem: {
          id: row.id,
          phrase: row.phrase,
          bpm: row.bpm_recommended || item.bpm,
          category: row.category || 'personalizado',
          created_at: row.created_at,
        },
        success: true,
      };
    }

    return { savedItem: null, success: false };
  } catch (err) {
    console.warn('Excepción al guardar frase en Supabase:', err);
    return { savedItem: null, success: false };
  }
}

/**
 * Elimina una frase de la base de datos en la nube (Zero Trust RLS).
 */
export async function deleteCustomPhraseFromCloud(
  phraseIdOrText: string,
  userId: string,
  client = supabase
): Promise<boolean> {
  if (!userId || !client) return false;

  try {
    // Intentar borrar por id o frase de custom_phrases
    await client
      .from('custom_phrases')
      .delete()
      .or(`id.eq.${phraseIdOrText},phrase.eq.${phraseIdOrText}`)
      .eq('user_id', userId);

    // Intentar también en user_custom_phrases
    await client
      .from('user_custom_phrases')
      .delete()
      .or(`id.eq.${phraseIdOrText},phrase.eq.${phraseIdOrText}`)
      .eq('user_id', userId);

    return true;
  } catch (err) {
    console.warn('Error al eliminar frase de la nube:', err);
    return false;
  }
}

/**
 * Sincroniza bidireccionalmente las frases locales con la nube en Supabase (Zero Trust RLS).
 * - Descarga las frases del usuario en la nube (tabla custom_phrases o user_custom_phrases).
 * - Sube las frases locales nuevas que no existan en la nube.
 * - Devuelve la lista unificada y actualiza localStorage.
 */
export async function syncCustomPhrasesWithCloud(
  localPhrases: CustomPhraseItem[],
  userId: string,
  client = supabase
): Promise<{ syncedPhrases: CustomPhraseItem[]; syncedWithCloud: boolean }> {
  if (!userId || !client) {
    return { syncedPhrases: localPhrases, syncedWithCloud: false };
  }

  try {
    let cloudPhrases: CustomPhraseItem[] = [];
    let querySuccess = false;

    // 1. Obtener frases existentes en la nube desde 'custom_phrases'
    const { data: primaryData, error: primaryError } = await client
      .from('custom_phrases')
      .select('id, phrase, bpm, category, created_at')
      .eq('user_id', userId);

    if (!primaryError && primaryData) {
      cloudPhrases = (primaryData as unknown as GenericCloudPhraseRow[]).map((row) => ({
        id: row.id,
        phrase: row.phrase,
        bpm: row.bpm || 80,
        category: row.category || 'personalizado',
        created_at: row.created_at,
      }));
      querySuccess = true;
    } else {
      // Fallback a 'user_custom_phrases'
      const { data: fallbackData, error: fallbackError } = await client
        .from('user_custom_phrases')
        .select('id, phrase, bpm_recommended, category, created_at')
        .eq('user_id', userId);

      if (!fallbackError && fallbackData) {
        cloudPhrases = (fallbackData as unknown as GenericCloudPhraseRow[]).map((row) => ({
          id: row.id,
          phrase: row.phrase,
          bpm: row.bpm_recommended || 80,
          category: row.category || 'personalizado',
          created_at: row.created_at,
        }));
        querySuccess = true;
      }
    }

    if (!querySuccess) {
      return { syncedPhrases: localPhrases, syncedWithCloud: false };
    }

    // 2. Identificar frases locales que no están en la nube (por texto normalizado)
    const cloudPhraseTexts = new Set(cloudPhrases.map((p) => p.phrase.trim().toLowerCase()));
    const phrasesToUpload = localPhrases.filter(
      (lp) => !cloudPhraseTexts.has(lp.phrase.trim().toLowerCase())
    );

    // 3. Subir frases locales nuevas a la nube
    if (phrasesToUpload.length > 0) {
      for (const phraseItem of phrasesToUpload) {
        const { savedItem } = await saveCustomPhraseToCloud(
          { phrase: phraseItem.phrase, bpm: phraseItem.bpm, category: phraseItem.category },
          userId,
          client
        );
        if (savedItem) {
          cloudPhrases.push(savedItem);
        }
      }
    }

    // 4. Fusionar y guardar en local
    const mergedMap = new Map<string, CustomPhraseItem>();
    [...localPhrases, ...cloudPhrases].forEach((item) => {
      mergedMap.set(item.phrase.trim().toLowerCase(), item);
    });

    const unified = Array.from(mergedMap.values());
    saveLocalCustomPhrases(unified);

    return { syncedPhrases: unified, syncedWithCloud: true };
  } catch (err) {
    console.error('Excepción durante sincronización de frases:', err);
    return { syncedPhrases: localPhrases, syncedWithCloud: false };
  }
}
