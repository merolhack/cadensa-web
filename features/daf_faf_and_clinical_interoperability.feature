# language: es
Característica: Feedback Auditivo DAF-FAF, Interoperabilidad HL7 FHIR y Diplomas Clínicos
  Como paciente con tartamudez, fonoaudiólogo o profesional de la salud vocal
  Quiero disponer de feedback auditivo alterado en tiempo real, exportación de reportes FHIR R4 y diplomas de adherencia
  Para maximizar la fluidez neuromotora y facilitar el seguimiento en expedientes clínicos electrónicos

  Escenario: Modulación de retardo DAF y desplazamiento de tono FAF en tiempo real
    Dado que el módulo de Retroalimentación Auditiva Alterada está disponible
    Cuando el paciente configura un retardo DAF de 65 milisegundos y un desplazamiento FAF de -1 semitono
    Entonces el procesador de audio aplica la latencia acústica y el tono de retroalimentación
    Y se muestra la advertencia obligatoria de uso de auriculares para evitar acople acústico

  Escenario: Modo Dúo en Cadensa Kids y activación de aplauso motivador
    Dado que se activa la práctica pediátrica con un acompañante
    Cuando el adulto o terapeuta habilita el Modo Dúo
    Y presiona el botón de aplauso motivador
    Entonces se reproduce el sonido acústico de celebración y se suma una estrella de mérito

  Escenario: Generación de diplomas fonoaudiológicos y refuerzo positivo
    Dado que el paciente ha completado su ciclo de práctica
    Cuando se solicita el diploma "Iniciador Valiente" para "Sofía Valenzuela"
    Entonces el sistema genera el documento imprimible con el sello de Cadensa Digital Clinic
    Y permite su descarga directa o guardado en formato PDF

  Escenario: Exportación clínica interoperable según estándar HL7 FHIR R4
    Dado que un fonoaudiólogo evalúa las métricas acumuladas de una sesión
    Cuando exporta el informe clínico en formato HL7 FHIR
    Entonces se genera un recurso DiagnosticReport válido con código LOINC "77150-1"
    Y contiene observaciones estructuradas con diagnósticos SNOMED-CT y adherencia rítmica

  Escenario: Auditoría de seguridad y políticas de privacidad Zero Trust
    Dado que el sistema procesa datos de audio localmente
    Cuando se evalúan las cabeceras HTTP y políticas de permisos del navegador
    Entonces el acceso al micrófono se restringe exclusivamente al origen self y la cámara queda deshabilitada
    Y las claves secretas de base de datos se mantienen inaccesibles desde el frontend
