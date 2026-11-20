# language: es
Característica: Integración y sincronización de la LLM Wiki local con Gemini Notebook
  Como arquitecto y desarrollador de Cadensa
  Quiero mantener sincronizada la LLM Wiki local de 3 capas con el Gemini Notebook oficial respetando el límite de 300 fuentes
  Para consultar el conocimiento actualizado sin fuentes duplicadas ni contaminación de URLs

  Escenario: Compilación determinista del compendio maestro de la LLM Wiki
    Dado que el proyecto Cadensa cuenta con su LLM Wiki modular en "wiki/"
    Cuando compilo el compendio maestro de sincronización para Gemini Notebook
    Entonces el compendio debe referenciar el cuaderno canónico "015dcad0-c2a3-4512-97eb-59ac4293d8c0"
    Y debe incluir las reglas de "AGENTS.md", "wiki/index.md" y "wiki/roadmap/gemini_notebook_prioritized_roadmap.md"
    Y debe generar una firma SHA-256 válida de 64 caracteres hexadecimales

  Escenario: Salvaguarda estricta contra tokenización accidental y límite de 300 fuentes
    Dado que se revisa el script "scripts/sync-wiki-to-notebook.mjs"
    Cuando se valida su invocación a la herramienta MCP "add_source"
    Entonces debe declarar explícitamente el parámetro de tipo texto estricto
    Y debe bloquear la publicación si se excede el límite máximo de 300 fuentes
    Y "package.json" debe exponer el comando "wiki:sync-notebook"
