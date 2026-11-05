#!/usr/bin/env python3
"""
scripts/audit_seo_performance.py
================================
Cadensa - Auditoría de Rendimiento SEO en Google Search Console
Consulta m?tricas de b?squeda org?nica (clics, impresiones, CTR, posici?n)
para las URLs de t?cnicas fonoaudiol?gicas mediante Search Analytics API.

Uso:
    python3 scripts/audit_seo_performance.py [--dry-run] [--days 28] [--export-csv [RUTA]]
"""

import argparse
import csv
import json
import logging
import os
import sys
import urllib.parse
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("cadensa_seo_performance")

DEFAULT_SITE_URL = "https://cadensa-web.pages.dev/"
DEFAULT_CSV_PATH = "reports/seo_performance_report.csv"

CANONICAL_TECHNIQUE_SLUGS = [
    "syllable-timed-speech",
    "easy-onset",
    "light-contact",
    "prolonged-speech",
    "box-breathing",
    "pull-out",
    "cancellation",
]

GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/webmasters",
]


def load_env_file(file_path: str = ".env") -> None:
    """Carga variables de entorno de un archivo .env local si no est?n presentes."""
    if not os.path.exists(file_path):
        return
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key not in os.environ:
                        os.environ[key] = val
    except Exception as e:
        logger.debug(f"No se pudo cargar {file_path}: {e}")


def get_google_credentials_info() -> Optional[Dict[str, Any]]:
    """Obtiene la configuraci?n de la cuenta de servicio de GCP."""
    creds_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON") or os.getenv("GCP_SA_METRICS_KEY")
    if creds_json:
        try:
            return json.loads(creds_json)
        except Exception as e:
            logger.debug(f"Error parseando JSON de credenciales en entorno: {e}")

    search_paths = [
        "google_credentials.json",
        "service_account.json",
        os.path.expanduser("~/.config/gcloud/application_default_credentials.json"),
    ]
    for path in search_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "client_email" in data and "private_key" in data:
                        return data
            except Exception as e:
                logger.debug(f"Error leyendo {path}: {e}")

    return None


def get_google_access_token(sa_info: Dict[str, Any]) -> Optional[str]:
    """Genera un Access Token OAuth2 para Google APIs con JWT firmado."""
    try:
        import time
        import base64
        import urllib.request
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.hazmat.primitives.serialization import load_pem_private_key

        now = int(time.time())
        header = {"alg": "RS256", "typ": "JWT"}
        payload = {
            "iss": sa_info["client_email"],
            "scope": " ".join(GOOGLE_SCOPES),
            "aud": "https://oauth2.googleapis.com/token",
            "exp": now + 3600,
            "iat": now,
        }

        def b64url(data_bytes: bytes) -> str:
            return base64.urlsafe_b64encode(data_bytes).decode("utf-8").rstrip("=")

        h_b64 = b64url(json.dumps(header).encode("utf-8"))
        p_b64 = b64url(json.dumps(payload).encode("utf-8"))
        signing_input = f"{h_b64}.{p_b64}".encode("utf-8")

        private_key = load_pem_private_key(sa_info["private_key"].encode("utf-8"), password=None)
        signature = private_key.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
        jwt_token = f"{h_b64}.{p_b64}.{b64url(signature)}"

        post_data = urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt_token,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=post_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("access_token")
    except Exception as e:
        logger.error(f"Error generando Google Access Token: {e}")

    return None


def get_mock_performance_data(site_url: str) -> List[Dict[str, Any]]:
    """Genera datos cl?nicos y anal?ticos de muestra para visualizaci?n previa y pruebas."""
    clean_site = site_url.rstrip("/") + "/"
    mock_metrics = {
        "syllable-timed-speech": {"clicks": 184, "impressions": 2450, "ctr": 0.0751, "position": 3.8},
        "easy-onset":            {"clicks": 142, "impressions": 1980, "ctr": 0.0717, "position": 4.2},
        "box-breathing":         {"clicks": 115, "impressions": 1650, "ctr": 0.0697, "position": 4.6},
        "light-contact":         {"clicks": 98,  "impressions": 1420, "ctr": 0.0690, "position": 5.1},
        "pull-out":              {"clicks": 87,  "impressions": 1290, "ctr": 0.0674, "position": 5.8},
        "prolonged-speech":      {"clicks": 76,  "impressions": 1140, "ctr": 0.0667, "position": 6.2},
        "cancellation":          {"clicks": 64,  "impressions": 980,  "ctr": 0.0653, "position": 6.9},
    }

    results = []
    for slug in CANONICAL_TECHNIQUE_SLUGS:
        m = mock_metrics.get(slug, {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": 0.0})
        url = f"{clean_site}techniques/{slug}"
        results.append({
            "slug": slug,
            "url": url,
            "clicks": m["clicks"],
            "impressions": m["impressions"],
            "ctr": m["ctr"],
            "position": m["position"],
        })
    return results


def query_search_analytics(site_url: str, days: int, token: str) -> Tuple[List[Dict[str, Any]], Optional[str]]:
    """Consulta Google Search Console Search Analytics API para URLs de t?cnicas."""
    import urllib.request

    encoded_site = urllib.parse.quote_plus(site_url)
    endpoint = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/searchAnalytics/query"

    end_date = datetime.utcnow().date() - timedelta(days=2) # GSC suele tener ~2 días de retraso
    start_date = end_date - timedelta(days=days)

    payload = {
        "startDate": start_date.strftime("%Y-%m-%d"),
        "endDate": end_date.strftime("%Y-%m-%d"),
        "dimensions": ["page"],
        "dimensionFilterGroups": [
            {
                "filters": [
                    {
                        "dimension": "page",
                        "operator": "contains",
                        "expression": "/techniques/",
                    }
                ]
            }
        ],
        "rowLimit": 50,
    }

    try:
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            rows = data.get("rows", [])
            results = []
            for r in rows:
                keys = r.get("keys", [""])
                page_url = keys[0] if keys else ""
                slug = page_url.split("/techniques/")[-1].strip("/") if "/techniques/" in page_url else page_url
                results.append({
                    "slug": slug,
                    "url": page_url,
                    "clicks": r.get("clicks", 0),
                    "impressions": r.get("impressions", 0),
                    "ctr": r.get("ctr", 0.0),
                    "position": r.get("position", 0.0),
                })
            return results, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        try:
            err_json = json.loads(body)
            msg = err_json.get("error", {}).get("message", body)
        except Exception:
            msg = body
        return [], f"HTTP {e.code}: {msg}"
    except Exception as e:
        return [], str(e)


def print_performance_table(rows: List[Dict[str, Any]], days: int) -> None:
    """Imprime las m?tricas de rendimiento en formato tabular ASCII."""
    headers = ["Técnica (Slug)", "Clics", "Impresiones", "CTR", "Posición Media"]

    formatted_rows = []
    total_clicks = 0
    total_impressions = 0

    for r in rows:
        slug = r.get("slug", "")
        clicks = int(r.get("clicks", 0))
        impressions = int(r.get("impressions", 0))
        ctr = float(r.get("ctr", 0.0)) * 100
        pos = float(r.get("position", 0.0))

        total_clicks += clicks
        total_impressions += impressions

        formatted_rows.append([
            slug,
            f"{clicks:,}",
            f"{impressions:,}",
            f"{ctr:.2f}%",
            f"{pos:.1f}",
        ])

    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0.0

    col_widths = [len(h) for h in headers]
    for row in formatted_rows:
        for idx, val in enumerate(row):
            col_widths[idx] = max(col_widths[idx], len(val))

    sep = "+-" + "-+-".join("-" * w for w in col_widths) + "-+"
    header_line = "| " + " | ".join(h.ljust(w) for h, w in zip(headers, col_widths)) + " |"

    print(sep)
    print(header_line)
    print(sep)
    for row in formatted_rows:
        print("| " + " | ".join(val.ljust(w) for val, w in zip(row, col_widths)) + " |")
    print(sep)

    total_row = [
        "TOTAL / PROMEDIO",
        f"{total_clicks:,}",
        f"{total_impressions:,}",
        f"{avg_ctr:.2f}%",
        "-",
    ]
    for idx, val in enumerate(total_row):
        col_widths[idx] = max(col_widths[idx], len(val))
    sep_total = "+=" + "=+=".join("=" * w for w in col_widths) + "=+"
    print("| " + " | ".join(val.ljust(w) for val, w in zip(total_row, col_widths)) + " |")
    print(sep_total)


def export_to_csv(rows: List[Dict[str, Any]], output_path: str) -> None:
    """Exporta las m?tricas a un archivo CSV con BOM UTF-8 para compatibilidad nativa con Excel."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Técnica (Slug)", "URL Canónica", "Clics", "Impresiones", "CTR (%)", "Posición Media"])
        for r in rows:
            ctr_pct = f"{float(r.get('ctr', 0.0)) * 100:.2f}%"
            pos_fmt = f"{float(r.get('position', 0.0)):.1f}"
            writer.writerow([
                r.get("slug", ""),
                r.get("url", ""),
                r.get("clicks", 0),
                r.get("impressions", 0),
                ctr_pct,
                pos_fmt,
            ])
    logger.info(f"💾 Reporte CSV exportado exitosamente en: {output_path}")


def main() -> int:
    load_env_file()

    parser = argparse.ArgumentParser(
        description="Auditoría de Rendimiento SEO (Google Search Console Search Analytics API)."
    )
    parser.add_argument(
        "--site-url",
        default=DEFAULT_SITE_URL,
        help=f"URL ra?z o identificador de propiedad en GSC (default: {DEFAULT_SITE_URL})",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=28,
        help="Ventana temporal de an?lisis en días (default: 28)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula la consulta a la API con m?tricas cl?nicas representativas.",
    )
    parser.add_argument(
        "--export-csv",
        nargs="?",
        const=DEFAULT_CSV_PATH,
        default=None,
        metavar="RUTA",
        help=f"Exporta las m?tricas a CSV (default: {DEFAULT_CSV_PATH})",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Genera salida en formato JSON estructurado.",
    )

    args = parser.parse_args()

    if not args.json_output:
        print("\n" + "=" * 80)
        print("📈 Cadensa - Auditoría de Rendimiento SEO (Google Search Analytics)")
        print(f"   Propiedad GSC: {args.site_url}")
        print(f"   Periodo:       Últimos {args.days} días")
        print(f"   Modo:          {'DRY-RUN (Simulación / Mock Data)' if args.dry_run else 'En Vivo (Search Analytics API)'}")
        print("=" * 80 + "\n")

    results: List[Dict[str, Any]] = []

    if args.dry_run:
        results = get_mock_performance_data(args.site_url)
    else:
        google_sa_info = get_google_credentials_info()
        if not google_sa_info:
            logger.error("? No se encontraron credenciales de Google Cloud Service Account en el entorno.")
            logger.error("   Configura GOOGLE_APPLICATION_CREDENTIALS_JSON o agrega el archivo google_credentials.json.")
            return 1

        client_email = google_sa_info.get("client_email", "la cuenta de servicio")
        token = get_google_access_token(google_sa_info)
        if not token:
            logger.error(f"? No se pudo generar el token de acceso OAuth2 para {client_email}.")
            return 1

        data, err = query_search_analytics(args.site_url, args.days, token)
        if err:
            if "403" in err:
                print(f"\n❌ ERROR: Permisos insuficientes en Google Search Console ({err}).")
                print(f"   La cuenta de servicio '{client_email}' aún no tiene permisos en la propiedad '{args.site_url}'.")
                print("   👉 Solución: Ve a Search Console → Configuración → Usuarios y permisos y añade la cuenta como Propietario.")
                print("   Consulta la sección 7.5 de wiki/operations/deployment_runbook.md para más detalles.\n")
            else:
                logger.error(f"? Error al consultar Search Analytics API: {err}")
            return 1

        if not data:
            logger.warning("?? No se registraron clics ni impresiones en Search Console para el periodo indicado.")
            logger.info("   Las p?ginas fueron indexadas recientemente o a?n no reciben b?squedas en el ?ndice.")
            # Presentar lista de t?cnicas con ceros para claridad
            clean_site = args.site_url.rstrip("/") + "/"
            for slug in CANONICAL_TECHNIQUE_SLUGS:
                results.append({
                    "slug": slug,
                    "url": f"{clean_site}techniques/{slug}",
                    "clicks": 0,
                    "impressions": 0,
                    "ctr": 0.0,
                    "position": 0.0,
                })
        else:
            results = data

    # Salida JSON o Tabla
    if args.json_output:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print_performance_table(results, args.days)

    # Exportaci?n opcional a CSV
    if args.export_csv:
        export_to_csv(results, args.export_csv)

    return 0


if __name__ == "__main__":
    sys.exit(main())
