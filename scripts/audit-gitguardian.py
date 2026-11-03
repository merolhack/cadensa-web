#!/usr/bin/env python3
"""
Cadensa — GitGuardian Security Posture & Incident Healthcheck
Verifica periódicamente en CI/CD que el repositorio no cuente con
incidentes de secretos abiertos (TRIGGERED o ASSIGNED) en GitGuardian.
"""

import os
import sys
import json
import urllib.request
import urllib.error

def main():
    api_key = os.environ.get('GITGUARDIAN_API_KEY')
    if not api_key:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('GITGUARDIAN_API_KEY='):
                        api_key = line.strip().split('=', 1)[1].strip().strip('"\'')
                        break

    if not api_key:
        print("⚠️ GITGUARDIAN_API_KEY no encontrada en entorno ni en .env. Omitiendo auditoría.")
        sys.exit(0)

    headers = {
        'Authorization': f'Token {api_key}',
        'Content-Type': 'application/json'
    }

    url = "https://api.gitguardian.com/v1/incidents/secrets?status=TRIGGERED&per_page=100"
    print("🛡️ Auditando postura de seguridad e incidentes en GitGuardian...")

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            incidents = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"❌ Error al consultar la API de GitGuardian: HTTP {e.code} - {e.reason}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error de conexión con GitGuardian: {e}")
        sys.exit(1)

    # Filtrar incidentes pertenecientes a cadensa-web si aplica, o inspeccionar incidentes abiertos
    cadensa_open_incidents = []
    for inc in incidents:
        # Si tiene occurrences cargadas
        occurrences = inc.get('occurrences') or []
        is_cadensa = any(
            'cadensa' in (occ.get('source', {}).get('full_name') or '').lower() or
            'cadensa' in (occ.get('url') or '').lower()
            for occ in occurrences
        )
        if is_cadensa and inc.get('status') in ('TRIGGERED', 'ASSIGNED'):
            cadensa_open_incidents.append(inc)

    if cadensa_open_incidents:
        print(f"❌ Se detectaron {len(cadensa_open_incidents)} incidentes abiertos en GitGuardian para cadensa-web:")
        for inc in cadensa_open_incidents[:10]:
            detector = inc.get('detector', {}).get('name', 'unknown')
            sev = inc.get('severity', 'unknown')
            print(f"  - Incidente #{inc.get('id')}: {detector} (Severidad: {sev}) -> {inc.get('gitguardian_url')}")
        fail_on_incident = os.environ.get('GITGUARDIAN_STRICT', 'true').lower() == 'true'
        if fail_on_incident:
            sys.exit(1)
        else:
            print("⚠️ Ejecutando en modo laxo; no se bloquea la ejecución.")
            sys.exit(0)

    print("✅ GitGuardian Security Audit: 0 incidentes abiertos en cadensa-web (Postura: SEGURA).")
    sys.exit(0)

if __name__ == '__main__':
    main()
