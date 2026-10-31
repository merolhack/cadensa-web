# Generador Dinámico de Textos Fonéticamente Balanceados (Client-Side NLP)

> **Tipo:** Concepto Clínico & Algoritmo  
> **Estado:** Implementado (Producción v2.1)  
> **Fecha:** Octubre 2026  
> **Archivo Principal:** [`phoneticTextGenerator.ts`](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/lib/phoneticTextGenerator.ts)

---

## 1. Propósito Clínico

Los pacientes con disfemia a menudo presentan bloqueos selectivos ante clases articulatorias particulares (por ejemplo, espasmos bilabiales con /p/ y /b/, o dificultad en el ataque glótico ante vocales iniciales).

El **Generador Fonético Balanceado** permite al fonoaudiólogo o al usuario generar automáticamente repertorios de ejercicio clasificados según la zona de conflicto fonoarticulatorio, graduando la longitud y complejidad del estímulo:
1. **Sílabas Aisladas (`isolated`):** Para entrenamiento metronómico isocrónico puro.
2. **Bisílabas (`bisyllables`):** Para práctica de ligadura consonante-vocal sin sobrecarga sintáctica.
3. **Oraciones Controladas (`sentences`):** Para automatización del ritmo en frases cotidianas.
4. **Prosa Fluida (`prose`):** Para transferencia hacia lectura continua y conversación espontánea.

---

## 2. Grupos de Fonemas Diana

- **Oclusivas Bilabiales (`bilabial_stops`):** /p/, /b/, /m/. Técnica recomendada: *Contacto Articulador Ligero* (BPM sugerido: 75).
- **Oclusivas Dentales (`dental_stops`):** /t/, /d/. Técnica recomendada: *Contacto Articulador Ligero* (BPM sugerido: 75).
- **Oclusivas Velares (`velar_stops`):** /k/, /g/, /c/, /q/. Técnica recomendada: *Inicio Suave (Easy Onset)* (BPM sugerido: 70).
- **Fricativas (`fricatives`):** /f/, /s/, /j/, /x/, /z/. Técnica recomendada: *Habla Prolongada* (BPM sugerido: 85).
- **Líquidas y Vibrantes (`liquids`):** /l/, /r/, /rr/. Técnica recomendada: *Habla Rítmica Silábica (STS)* (BPM sugerido: 80).
- **Inicios Vocálicos (`vowel_onsets`):** /a/, /e/, /i/, /o/, /u/. Técnica recomendada: *Inicio Suave (Easy Onset)* (BPM sugerido: 65).
- **Balanceado General (`balanced`):** Distribución métrica estándar de fluidez.

---

## 3. Mapeo Dialectal y Métricas Fonéticas

El motor se adapta a las 5 regiones hispanohablantes definidas en `phoneticPresets.ts`:
- `mx_central`: Variedad léxica y prosodia de México Central.
- `cono_sur`: Adaptaciones léxicas para Argentina, Uruguay y Chile.
- `andino`: Estructura fonética para Perú, Bolivia y Ecuador.
- `caribeno`: Ajustes de caudal y sonoridad para la cuenca del Caribe.
- `iberico`: Estructura fonemática con distinción s/z y entonación peninsular.

Métricas calculadas en tiempo real:
- **`targetDensity`:** Porcentaje de fonemas diana respecto al total de letras.
- **`difficultyScore` (0 a 100):** Ponderación de longitud silábica y densidad fonemática.
- **`recommendedBpm`:** Tempo sugerido para maximizar la fluidez motora.

