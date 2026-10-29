import { supabase } from './supabaseClient';

export interface CustomPhraseItem {
  id: string;
  phrase: string;
  bpm: number;
  category?: string;
  created_at?: string;
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
 * Sincroniza bidireccionalmente las frases locales con la nube en Supabase (Zero Trust RLS).
 * - Descarga las frases del usuario en la nube.
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
    // 1. Obtener frases existentes en la nube
    const { data: cloudData, error: fetchError } = await client
      .from('user_custom_phrases')
      .select('id, phrase, bpm_recommended, category, created_at')
      .eq('user_id', userId);

    if (fetchError) {
      console.warn('No fue posible sincronizar con Supabase (red o permisos):', fetchError.message);
      return { syncedPhrases: localPhrases, syncedWithCloud: false };
    }

    const cloudPhrases: CustomPhraseItem[] = (cloudData || []).map((row: any) => ({
      id: row.id,
      phrase: row.phrase,
      bpm: row.bpm_recommended || 80,
      category: row.category || 'personalizado',
      created_at: row.created_at,
    }));

    // 2. Identificar frases locales que no están en la nube (por texto)
    const cloudPhraseTexts = new Set(cloudPhrases.map((p) => p.phrase.trim().toLowerCase()));
    const phrasesToUpload = localPhrases.filter(
      (lp) => !cloudPhraseTexts.has(lp.phrase.trim().toLowerCase())
    );

    // 3. Subir frases locales nuevas
    if (phrasesToUpload.length > 0) {
      const recordsToInsert = phrasesToUpload.map((p) => ({
        user_id: userId,
        phrase: p.phrase,
        bpm_recommended: p.bpm,
        category: p.category || 'personalizado',
      }));

      const { data: inserted, error: insertError } = await client
        .from('user_custom_phrases')
        .insert(recordsToInsert)
        .select('id, phrase, bpm_recommended, category, created_at');

      if (!insertError && inserted) {
        inserted.forEach((row: any) => {
          cloudPhrases.push({
            id: row.id,
            phrase: row.phrase,
            bpm: row.bpm_recommended || 80,
            category: row.category || 'personalizado',
            created_at: row.created_at,
          });
        });
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
