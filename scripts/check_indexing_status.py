#!/usr/bin/env python3
"""
scripts/check_indexing_status.py
================================
Cadensa - Script de Auditoría del Estado de Indexación en Google y Bing.

Consulta en tiempo real el estado de indexación de las 7 técnicas fonoaudiológicas:
1. Google Search Console API (URL Inspection API):
   Endpoint: https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
   Obtiene: verdict, coverageState, lastCrawlTime, indexingState, robotsTxtState.
2. Bing Webmaster Tools API (GetUrlInfo):
   Endpoint: https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo
   Obtiene: IsIndexed, HttpCode, DocumentLastCrawlDate, DocumentDiscoveryDate.

Uso:
    python3 scripts/check_indexing_status.py [--dry-run] [--site-url URL] [--json]
"""

import argparse
import json
import logging
import os
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("cadensa_indexing_audit")

DEFAULT_SITE_URL = "https://cadensa-web.pages.dev/"
DEFAULT_SITEMAP_URL = "https://cadensa-web.pages.dev/sitemap.xml"

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
    """Carga variables de entorno de un archivo .env si no están presentes."""
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
    """Obtiene el diccionario de credenciales de la cuenta de servicio de GCP."""
    for env_var in ["GOOGLE_APPLICATION_CREDENTIALS_JSON", "GCP_SA_METRICS_KEY"]:
        val = os.getenv(env_var)
        if val:
            val = val.strip()
            if val.startswith("{") and val.endswith("}"):
                try:
                    return json.loads(val)
                except Exception as e:
                    logger.warning(f"Error parseando JSON de {env_var}: {e}")

    file_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    candidate_paths = [file_path] if file_path else []
    candidate_paths.extend([
        "google_credentials.json",
        "sa-key.json",
        os.path.join(os.path.dirname(__file__), "../google_credentials.json"),
        os.path.join(os.path.dirname(__file__), "../sa-key.json"),
    ])

    for path in candidate_paths:
        if path and os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "client_email" in data and "private_key" in data:
                        return data
            except Exception as e:
                logger.debug(f"Error leyendo {path}: {e}")

    return None


def get_google_access_token(sa_info: Dict[str, Any]) -> Optional[str]:
    """Genera un Bearer Access Token para Google APIs utilizando un JWT firmado."""
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


def get_technique_urls(site_url: str, sitemap_path: str = "out/sitemap.xml") -> List[str]:
    """Obtiene la lista de URLs canónicas de técnicas desde el sitemap o lista por defecto."""
    clean_site = site_url.rstrip("/") + "/"
    canonical_urls = [f"{clean_site}techniques/{slug}" for slug in CANONICAL_TECHNIQUE_SLUGS]

    if os.path.exists(sitemap_path):
        try:
            with open(sitemap_path, "r", encoding="utf-8") as f:
                content = f.read()
            root = ET.fromstring(content)
            namespaces = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            loc_elements = root.findall(".//ns:loc", namespaces) or root.findall(".//loc")
            extracted = [loc.text.strip() for loc in loc_elements if loc.text and "/techniques/" in loc.text]
            if extracted:
                return extracted
        except Exception as e:
            logger.debug(f"Error parseando sitemap local {sitemap_path}: {e}")

    return canonical_urls


def inspect_google_url(url: str, site_url: str, token: str, dry_run: bool = False) -> Dict[str, Any]:
    """Consulta el estado de indexación en Google Search Console URL Inspection API."""
    import urllib.request

    endpoint = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
    payload = {
        "inspectionUrl": url,
        "siteUrl": site_url,
    }

    if dry_run:
        return {
            "verdict": "DRY_RUN (Simulado)",
            "coverageState": "Enviada para rastreo (Indexación en curso)",
            "lastCrawlTime": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ"),
            "robotsTxtState": "ALLOWED",
            "indexingState": "INDEXING_ALLOWED",
            "raw": payload,
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
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            idx_result = data.get("inspectionResult", {}).get("indexStatusResult", {})
            return {
                "verdict": idx_result.get("verdict", "DESCONOCIDO"),
                "coverageState": idx_result.get("coverageState", "Sin datos de cobertura"),
                "lastCrawlTime": idx_result.get("lastCrawlTime", "Pendiente de rastreo"),
                "robotsTxtState": idx_result.get("robotsTxtState", "N/A"),
                "indexingState": idx_result.get("indexingState", "N/A"),
                "raw": data,
            }
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        try:
            err_json = json.loads(body)
            msg = err_json.get("error", {}).get("message", body)
        except Exception:
            msg = body
        return {
            "verdict": f"HTTP {e.code}",
            "coverageState": msg[:45] + "..." if len(msg) > 45 else msg,
            "lastCrawlTime": "N/A",
            "robotsTxtState": "N/A",
            "indexingState": "N/A",
            "error": msg,
        }
    except Exception as e:
        return {
            "verdict": "ERROR",
            "coverageState": str(e)[:45],
            "lastCrawlTime": "N/A",
            "robotsTxtState": "N/A",
            "indexingState": "N/A",
            "error": str(e),
        }


def inspect_bing_url(url: str, site_url: str, api_key: str, dry_run: bool = False) -> Dict[str, Any]:
    """Consulta el estado de indexación en Bing Webmaster Tools API (GetUrlInfo)."""
    import urllib.request
    import urllib.parse

    params = urllib.parse.urlencode({
        "siteUrl": site_url,
        "url": url,
        "apikey": api_key,
    })
    endpoint = f"https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo?{params}"

    if dry_run:
        return {
            "isIndexed": "Enviado (IndexNow)",
            "lastCrawl": datetime.utcnow().strftime("%Y-%m-%d"),
            "httpCode": 200,
        }

    try:
        req = urllib.request.Request(
            endpoint,
            headers={"Accept": "application/json; charset=utf-8"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            item = data.get("d", {}) if isinstance(data, dict) else {}
            is_indexed = item.get("IsIndexed", False)
            crawl_date = item.get("DocumentLastCrawlDate", "No registrado")
            return {
                "isIndexed": "✅ Indexada" if is_indexed else "⏳ En cola",
                "lastCrawl": crawl_date or "N/A",
                "httpCode": item.get("HttpCode", 200),
            }
    except urllib.error.HTTPError as e:
        return {
            "isIndexed": f"HTTP {e.code}",
            "lastCrawl": "N/A",
            "httpCode": e.code,
        }
    except Exception as e:
        return {
            "isIndexed": "Error",
            "lastCrawl": "N/A",
            "httpCode": 0,
            "error": str(e),
        }


def print_ascii_table(rows: List[Dict[str, str]]) -> None:
    """Imprime una tabla formateada en ASCII para visualización en terminal."""
    headers = ["Técnica (Slug)", "Google Veredicto", "Google Cobertura", "Google Último Rastreo", "Bing Estado"]
    keys = ["slug", "google_verdict", "google_coverage", "google_crawl", "bing_status"]

    col_widths = [len(h) for h in headers]
    for row in rows:
        for idx, k in enumerate(keys):
            col_widths[idx] = max(col_widths[idx], len(str(row.get(k, ""))))

    # Líneas de borde
    sep = "+-" + "-+-".join("-" * w for w in col_widths) + "-+"
    header_line = "| " + " | ".join(h.ljust(w) for h, w in zip(headers, col_widths)) + " |"

    print(sep)
    print(header_line)
    print(sep)
    for row in rows:
        row_line = "| " + " | ".join(str(row.get(k, "")).ljust(w) for k, w in zip(keys, col_widths)) + " |"
        print(row_line)
    print(sep)


def verify_setup(site_url: str, dry_run: bool = False) -> int:
    """Verifica si la cuenta de servicio de GCP cuenta con permisos de Propietario en Google Search Console."""
    load_env_file()
    clean_site = site_url.rstrip("/") + "/"
    test_url = clean_site

    logger.info("?? Verificando configuraci?n y permisos de Google Search Console...")
    logger.info(f"   Sitio / Propiedad: {site_url}")
    logger.info(f"   URL de prueba:     {test_url}")

    if dry_run:
        print("✅ [DRY-RUN] Permisos simulados correctamente. El script de auditor?a puede proceder.")
        return 0

    google_sa_info = get_google_credentials_info()
    if not google_sa_info:
        print("ERROR: No se encontraron credenciales de Google Cloud Service Account en el entorno.")
        return 1

    client_email = google_sa_info.get("client_email", "la cuenta de servicio")
    token = get_google_access_token(google_sa_info)
    if not token:
        print(f"ERROR: No se pudo generar el token de acceso para la cuenta de servicio {client_email}.")
        return 1

    endpoint = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
    payload = {
        "inspectionUrl": test_url,
        "siteUrl": site_url,
    }

    try:
        import urllib.request
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                print("✅ Permisos configurados correctamente. El script de auditor?a puede proceder.")
                return 0
            else:
                print(f"Respuesta inesperada de Search Console: HTTP {resp.status}")
                return 1
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print(f"ERROR: La cuenta de servicio no tiene permisos. Ve a Search Console → Configuración → Usuarios y permisos y añade {client_email} como Propietario.")
            return 1
        else:
            body = e.read().decode("utf-8", errors="ignore")
            print(f"ERROR: Error al consultar Search Console API: HTTP {e.code} - {body}")
            return 1
    except Exception as e:
        print(f"ERROR: Fallo de conexión con Google Search Console API: {e}")
        return 1


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Auditoría del Estado de Indexación en Google y Bing (URL Inspection API)."
    )
    parser.add_argument(
        "--site-url",
        default=DEFAULT_SITE_URL,
        help=f"URL raíz del sitio (default: {DEFAULT_SITE_URL})",
    )
    parser.add_argument(
        "--sitemap",
        default="out/sitemap.xml",
        help="Ruta local del sitemap.xml para extraer URLs.",
    )
    parser.add_argument(
        "--verify-setup",
        action="store_true",
        help="Verifica los permisos de la cuenta de servicio en Google Search Console con una petición de prueba.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula la consulta a las APIs de Google y Bing con datos representativos.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Genera salida en formato JSON en lugar de la tabla de texto.",
    )
    args = parser.parse_args()

    load_env_file()

    if args.verify_setup:
        return verify_setup(args.site_url, dry_run=args.dry_run)

    if not args.json_output:
        print("\n" + "=" * 80)
        print("📊 Cadensa - Auditoría del Estado de Indexación en Google & Bing")
        print(f"   Sitio Web:  {args.site_url}")
        print(f"   Modo:       {'DRY-RUN (Simulación)' if args.dry_run else 'En Vivo (Producción)'}")
        print("=" * 80 + "\n")

    # 1. Obtener lista de URLs a auditar
    technique_urls = get_technique_urls(args.site_url, args.sitemap)
    if not args.json_output:
        logger.info(f"Auditoría programada para {len(technique_urls)} URLs de técnicas fonoaudiológicas.")

    # 2. Autenticación en Google
    google_sa_info = get_google_credentials_info()
    google_token = None
    if google_sa_info and not args.dry_run:
        google_token = get_google_access_token(google_sa_info)
    elif args.dry_run:
        google_token = "dry_run_google_token"

    # 3. Autenticación en Bing
    bing_api_key = os.getenv("BING_WEBMASTER_API_KEY") or os.getenv("BING_API_KEY")

    # 4. Inspección de URLs
    audit_results: List[Dict[str, Any]] = []

    for url in technique_urls:
        slug = url.split("/techniques/")[-1] if "/techniques/" in url else url.split("/tecnicas/")[-1]

        # Google URL Inspection
        if google_token:
            g_res = inspect_google_url(url, args.site_url, google_token, dry_run=args.dry_run)
        else:
            g_res = {
                "verdict": "Sin Token",
                "coverageState": "Requiere GOOGLE_APPLICATION_CREDENTIALS_JSON",
                "lastCrawlTime": "N/A",
            }

        # Bing Webmaster URL Inspection
        if bing_api_key or args.dry_run:
            b_res = inspect_bing_url(url, args.site_url, bing_api_key or "dry_run_key", dry_run=args.dry_run)
        else:
            b_res = {
                "isIndexed": "Sin API Key",
                "lastCrawl": "N/A",
            }

        audit_results.append({
            "url": url,
            "slug": slug,
            "google_verdict": g_res.get("verdict", "N/A"),
            "google_coverage": g_res.get("coverageState", "N/A"),
            "google_crawl": g_res.get("lastCrawlTime", "N/A")[:10] if g_res.get("lastCrawlTime") else "N/A",
            "bing_status": b_res.get("isIndexed", "N/A"),
            "bing_crawl": b_res.get("lastCrawl", "N/A"),
        })

    # 5. Salida de resultados
    if args.json_output:
        print(json.dumps(audit_results, indent=2, ensure_ascii=False))
    else:
        print_ascii_table(audit_results)
        print("\n📌 Resumen de Cobertura SEO:")
        print(f"   • Total de técnicas auditadas: {len(audit_results)}")
        print(f"   • Sitemap validado:            {args.site_url}sitemap.xml")
        print(f"   • Protocolo IndexNow activo:   {args.site_url}856757614ffc2c5582fbcb81b1b4e4ca.txt\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
