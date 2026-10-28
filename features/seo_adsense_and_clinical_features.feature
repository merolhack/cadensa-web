# language: es
Característica: Cumplimiento de SEO Técnico, AdSense YMYL y Nuevas Funcionalidades
  Como paciente, fonoaudiólogo o motor de búsqueda
  Quiero que Cadensa cuente con sitemap dinámico, aviso médico YMYL, simulador de situaciones reales y rutina guiada de 5 minutos
  Para tener una experiencia de práctica accesible, segura, indexable y libre de fricción

  Escenario: Acceso a las políticas de privacidad y aviso médico fonoaudiológico
    Dado que el usuario visita los términos clínicos y políticas de Cadensa
    Entonces debe visualizar el aviso de procesamiento Zero Trust de audio en el navegador
    Y debe contar con el descargo de responsabilidad médica fonoaudiológica
    Y debe declararse la identificación de AdSense "ca-pub-2700240339792942"

  Escenario: Uso del simulador de situaciones reales de habla
    Dado que el usuario abre el simulador de situaciones cotidianas
    Entonces se deben listar escenarios como llamadas telefónicas y pedidos en restaurante
    Y al seleccionar una respuesta guiada se debe configurar la técnica fonoaudiológica correspondiente

  Escenario: Ejecución de la rutina guiada de 5 minutos
    Dado que el usuario inicia la rutina guiada diaria
    Entonces debe comenzar con el bloque de respiración diafragmática 4-4-4-4
    Y debe permitir el avance hacia el Inicio Vocal Suave y el Habla Rítmica Silábica

