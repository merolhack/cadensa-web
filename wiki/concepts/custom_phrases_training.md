# Mis Frases de Desafío: Entrenamiento Personalizado de Fluidez

## 1. Definición y Fundamentación Fonoaudiológica

En el tratamiento de la tartamudez y disfluencias del habla, los pacientes frecuentemente experimentan **palabras temidas** (*feared words*): términos específicos (su propio nombre, profesiones, peticiones cotidianas o palabras polisílabas complejas) que disparan anticipación ansiosa y bloqueos motores en los ganglios basales.

El módulo **"Mis Frases de Desafío"** (*Custom Challenge Phrases*) permite al paciente o fonoaudiólogo ingresar cualquier palabra u oración libre para someterla de inmediato al algoritmo de **Habla Rítmica Silábica (Syllable-Timed Speech - STS)**.

---

## 2. Mecánica y Segmentación Silábica Automática

Al escribir una frase en el componente `CustomPhraseTrainer`:
1. El motor fonético ortográfico (`src/lib/syllables.ts`) desglosa la oración en sílabas en tiempo real.
2. Reconoce diptongos, hiatos (ej. *ca-os*, *po-e-ta*, *dí-a*) y grupos consonánticos inseparables en español.
3. El paciente visualiza las sílabas aisladas antes de iniciar la práctica, permitiendo una preparación propioceptiva previa a la fonación.

---

## 3. Plantillas de Situaciones Cotidianas

Para reducir la fricción inicial, la plataforma provee plantillas basadas en escenarios frecuentes de alta carga comunicativa:

| Plantilla | Frase Sugerida | BPM Recomendado | Contexto Clínico |
| :--- | :--- | :--- | :--- |
| **Pedir café** | *"Un café con leche por favor"* | 75 BPM | Interacción comercial cotidiana |
| **Llamada telefónica** | *"Hola buenas tardes con quién hablo"* | 70 BPM | Apertura sin apoyo gestual |
| **Presentación laboral** | *"Buenos días mi nombre es Carlos"* | 65 BPM | Situación formal bajo evaluación |
| **Comprar en tienda** | *"Cuánto cuesta este producto gracias"* | 80 BPM | Fluidez ágil de mostrador |
| **Preguntar dirección** | *"Disculpe dónde queda la estación"* | 70 BPM | Interacción urbana con extraños |

---

## 4. Persistencia Local y Privacidad Zero Trust

- **Almacenamiento:** Las frases personales se almacenan en el navegador bajo la clave `localStorage['cadensa_custom_phrases']`.
- **Estructura del Registro:**
  ```json
  [
    {
      "id": "custom-1730154000000",
      "phrase": "Quiero pedir un café con leche por favor",
      "bpm": 75,
      "createdAt": "2026-10-28T17:45:00.000Z",
      "syllables": ["Quie", "ro", "pe", "dir", "un", "ca", "fé", "con", "le", "che", "por", "fa", "vor"]
    }
  ]
  ```
- **Confidencialidad:** Las oraciones íntimas o desafiantes del paciente nunca se transmiten a la red ni quedan registradas en bases de datos públicas, garantizando total privacidad terapéutica.

