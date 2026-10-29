/**
 * Helper universal para desbloquear el AudioContext en Safari, iOS y navegadores móviles.
 * En iOS WebKit, el AudioContext permanece en estado 'suspended' hasta que se interactúe
 * con el DOM mediante un evento táctil o de puntero explícito.
 */

let isAudioUnlocked = false;

export function setupAudioContextUnlock(getAudioContext: () => AudioContext | null): () => void {
  if (typeof window === 'undefined') return () => {};

  const unlockHandler = () => {
    if (isAudioUnlocked) return;

    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isAudioUnlocked = true;
          removeListeners();
        }).catch(() => {});
      } else if (ctx && ctx.state === 'running') {
        isAudioUnlocked = true;
        removeListeners();
      }
    } catch {
      // Ignorar errores en navegadores restrictivos
    }
  };

  const events = ['touchstart', 'touchend', 'pointerdown', 'keydown'];

  const removeListeners = () => {
    events.forEach((evt) => {
      window.removeEventListener(evt, unlockHandler);
    });
  };

  events.forEach((evt) => {
    window.addEventListener(evt, unlockHandler, { passive: true, once: false });
  });

  return removeListeners;
}

