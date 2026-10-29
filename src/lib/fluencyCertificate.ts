/**
 * Cadensa Clinical Fluency Certificate Engine
 * Generación de diplomas fonoaudiológicos y de mérito para refuerzo positivo y adherencia.
 */

export interface FluencyCertificate {
  id: string;
  title: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  requiredDays: number | null;
  badgeEmoji: string;
  congratulationsMessage: string;
}

export const CLINICAL_CERTIFICATES: FluencyCertificate[] = [
  {
    id: 'cert_001',
    title: 'Iniciador Valiente',
    description: 'Otorgado por dar los primeros pasos en el camino de la fluidez y completar sus primeras sesiones de práctica rítmica.',
    level: 'Principiante',
    requiredDays: 3,
    badgeEmoji: '🚀',
    congratulationsMessage: '¡Felicidades por tu valentía! Has comenzado a dominar el ritmo de tu voz.',
  },
  {
    id: 'cert_002',
    title: 'Guardián del Ritmo',
    description: 'Certificado por mantener la constancia diaria y alcanzar el dominio de la técnica STS a una velocidad de 70 BPM.',
    level: 'Intermedio',
    requiredDays: 7,
    badgeEmoji: '🛡️',
    congratulationsMessage: '¡Increíble disciplina! Ahora eres el guardián de tu propio ritmo y fluidez.',
  },
  {
    id: 'cert_003',
    title: 'Maestro de la Calma',
    description: 'Reconocimiento por la maestría en el control del inicio suave y la implementación efectiva de la respiración diafragmática.',
    level: 'Avanzado',
    requiredDays: null,
    badgeEmoji: '🧘',
    congratulationsMessage: '¡Has alcanzado la maestría! Tu voz ahora fluye con calma, control y armonía.',
  },
];

/**
 * Genera el documento HTML imprimible para el diploma foniátrico.
 */
export function generateCertificateHtml(cert: FluencyCertificate, patientName: string = 'Practicante de Cadensa'): string {
  const issueDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Diploma de Mérito Fonoaudiológico — ${cert.title}</title>
  <style>
    @page { size: landscape; margin: 1cm; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px;
      background: #09090b;
      color: #fafafa;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .diploma-card {
      width: 100%;
      max-width: 900px;
      border: 6px double #34d399;
      border-radius: 28px;
      padding: 50px 40px;
      text-align: center;
      background: radial-gradient(circle at center, #18181b 0%, #09090b 100%);
      box-shadow: 0 0 50px rgba(52, 211, 153, 0.15);
      position: relative;
    }
    .badge { font-size: 64px; margin-bottom: 10px; }
    h1 {
      font-size: 36px;
      color: #34d399;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 10px 0;
    }
    h2 { font-size: 24px; color: #facc15; margin: 5px 0 20px 0; }
    .presented-to { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #a1a1aa; }
    .patient-name {
      font-size: 32px;
      font-weight: 900;
      color: #ffffff;
      border-bottom: 2px solid #52525b;
      display: inline-block;
      padding: 5px 40px;
      margin: 15px 0;
    }
    .description { font-size: 16px; color: #d4d4d8; max-width: 700px; margin: 15px auto; line-height: 1.6; }
    .congrats { font-size: 15px; font-weight: bold; color: #38bdf8; margin: 20px 0; }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 50px;
      padding: 0 40px;
      font-size: 12px;
      color: #71717a;
    }
    .signature-line {
      border-top: 1px solid #71717a;
      width: 220px;
      padding-top: 8px;
      text-align: center;
    }
    @media print {
      body { background: #ffffff; color: #000000; }
      .diploma-card { border-color: #059669; box-shadow: none; background: #ffffff; }
      h1 { color: #059669; }
      h2 { color: #d97706; }
      .patient-name { color: #000000; border-bottom-color: #000000; }
      .description { color: #374151; }
      .congrats { color: #0284c7; }
    }
  </style>
</head>
<body>
  <div class="diploma-card">
    <div class="badge">${cert.badgeEmoji}</div>
    <div class="presented-to">Certificado de Mérito Fonoaudiológico</div>
    <h1>${cert.title}</h1>
    <h2>Nivel: ${cert.level}</h2>
    
    <div class="presented-to">Otorgado a:</div>
    <div class="patient-name">${patientName}</div>
    
    <p class="description">${cert.description}</p>
    <div class="congrats">${cert.congratulationsMessage}</div>

    <div class="footer">
      <div class="signature-line">
        <strong>Cadensa Digital Clinic</strong><br>
        Plataforma de Habla Rítmica
      </div>
      <div>
        <strong>Fecha de Emisión:</strong> ${issueDate}
      </div>
      <div class="signature-line">
        <strong>Fonoaudiología &amp; Salud Vocal</strong><br>
        Certificación de Práctica Diaria
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Abre el diploma en una nueva ventana para imprimir o guardar como PDF.
 */
export function openPrintableCertificate(cert: FluencyCertificate, patientName: string = 'Practicante de Cadensa'): void {
  if (typeof window === 'undefined') return;

  const html = generateCertificateHtml(cert, patientName);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
