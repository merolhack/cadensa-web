# Interoperabilidad Clínica HL7 FHIR R4 en Cadensa

## 1. Propósito y Estándares de Salud Digital
Para permitir que los terapeutas, fonoaudiólogos y clínicas de rehabilitación vocal incorporen el progreso de Cadensa en sus Expedientes Clínicos Electrónicos (EHR / EMR / HIS), Cadensa implementa la serialización nativa de informes terapéuticos bajo el estándar internacional **HL7 FHIR Release 4 (R4)**.

## 2. Mapeo de Vocabularios Controlados
Cadensa mapea métricas neuromotoras a códigos clínicos universales:

| Parámetro Clínico | Sistema Terminológico | Código | Display |
|---|---|---|---|
| Evaluación de Habla y Lenguaje | LOINC | `77150-1` | Speech and language evaluation |
| Pacing / Tasa Rítmica (BPM) | LOINC | `89066-5` | Pacing rate |
| Jitter Vocal Estimado (ms) | LOINC | `77151-9` | Voice jitter estimate |
| Duración del Ejercicio | LOINC | `55411-3` | Exercise duration |
| Diagnóstico de Tartamudez | SNOMED-CT | `289190003` | Stuttering (finding) |
| Especialidad Fonoaudiológica | HL7 v2-0074 | `SP` | Speech Pathology |

## 3. Estructura del Recurso `DiagnosticReport`
El recurso exportado cumple con el perfil FHIR:
- `resourceType`: `DiagnosticReport`
- `status`: `final`
- `category`: Speech Pathology (`SP`)
- `subject`: `Patient/{patientId}`
- `contained`: Array de recursos `Observation` independientes para precisión porcentual, tempo en BPM, jitter vocal en ms y hallazgo SNOMED-CT.
- `conclusion`: Resumen clínico legible por humanos y sistemas automatizados.
- `extension`: Métricas de gamificación médica (días de racha activa y XP acumulado) bajo el namespace `https://cadensa.org/fhir/StructureDefinition/`.

## 4. Exportación Segura en el Cliente
La generación del archivo JSON (`application/fhir+json`) se ejecuta mediante un `Blob` instanciado en el navegador, preservando la confidencialidad del paciente bajo el modelo Zero Trust.
