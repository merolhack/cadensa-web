# Agente Avatar de IA Fonoaudiológico (Virtual SLP Agent 3D)

> **Tipo:** Concepto Clínico & Arquitectura  
> **Estado:** Implementado (Producción v2.1)  
> **Fecha:** Octubre 2026  
> **Componente Principal:** [`VirtualSLPAvatar.tsx`](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/components/VirtualSLPAvatar.tsx)  
> **Modal Integrador:** [`VirtualSLPAvatarModal.tsx`](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/components/VirtualSLPAvatarModal.tsx)

---

## 1. Justificación Clínica y Terapéutica

El entrenamiento de técnicas fonoaudiológicas como los Inicios Suaves (*Easy Onset*), la Respiración Diafragmática (4-4-4-4) y las técnicas de modificación de Van Riper (*Pull-Out* y *Cancelación*) tradicionalmente requería la presencia física del terapeuta o la visualización de videos estáticos pre-grabados.

Sin embargo, los videos estáticos presentan limitaciones severas:
- No se adaptan al tempo (BPM) seleccionado por el usuario en el metrónomo.
- No modelan la variación de fonemas de acuerdo con las consonantes temidas específicas de cada paciente.
- Resultan imposibles de escalar a cientos de combinaciones léxicas sin sobrecargar el ancho de banda y almacenamiento.

El **Virtual SLP Agent** resuelve esta barrera mediante un **modelo facio-articular y respiratorio fisiológico renderizado a 60 FPS directamente en el navegador del usuario** bajo el paradigma **Zero Trust** (sin enviar señales fónicas ni de imagen a servidores externos).

---

## 2. Subsistemas Fisiológicos Modelados

```
[ Virtual SLP Agent (Canvas 2D / WebGL) ]
  ├── 1. Aparato Respiratorio: Expansión torácica diafragmática (Inspiración 4s → Retención 4s → Espiración 4s → Pausa 4s)
  ├── 2. Complejo Laríngeo: Aproximación progresiva de cuerdas vocales (Ataque vocal suave sin golpe glótico)
  ├── 3. Zona Estomatognática: Apertura mandibular, protrusión labial y elevación lingual
  ├── 4. Mapa de Calor de Tensión: Gradiente cromático en labios/lengua (Verde: <40% presión, Ámbar: medio, Rojo: espasmo)
  └── 5. Aureola Biofeedback Espejo: Proyección luminosa acoplada a AcousticAiDetector (Verde, Ámbar, Rojo)
```

---

## 3. Modos Clínicos del Avatar

1. **Respiración Cuadrada (4-4-4-4):**
   - El avatar demuestra visualmente la inhalación nasal con expansión torácica visible, la retención serena, la exhalación suave por boca y la pausa de reposo.
2. **Inicios Suaves (Easy Onset):**
   - Muestra las cuerdas vocales en el cuello aproximándose suavemente antes de la emisión, coordinadas con un flujo expiratorio previo para evitar la hiperaducción glótica.
3. **Modificación en Bloqueo (Pull-Out / Van Riper):**
   - Simula la detención del empuje sobre el bloqueo articulatorio, la desaceleración consciente del músculo en espasmo y el deslizamiento suave hacia la vocal siguiente.
4. **Cancelación Post-Bloqueo:**
   - Guía la pausa voluntaria de 3 segundos tras un evento de disfluencia, la respiración de descompresión y el nuevo intento fónico con ataque suave.
5. **Contactos Articuladores Ligeros:**
   - Ilustra contactos bilabiales y dentolinguales apenas perceptibles, previniendo el cierre hermético excesivo en oclusivas (/p/, /b/, /m/, /t/, /d/).
6. **Espejo Vocal Biofeedback (Mirroring):**
   - Refleja la apertura fónica en tiempo real y colorea una aureola perimetral según el nivel de micro-tensión laríngea detectada.

---

## 4. Enlaces Relacionados
- [`VirtualSLPAvatar.tsx`](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/components/VirtualSLPAvatar.tsx)
- [`phoneticTextGenerator.ts`](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/lib/phoneticTextGenerator.ts)
- [`acousticAiDetector.ts`](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/lib/acousticAiDetector.ts)

