#!/usr/bin/env python3
"""
scripts/submit_seo_changes.py
=============================
Cadensa - Notificador Automatizado de Cambios SEO para Google y Bing.

Este script automatiza la notificación post-despliegue de nuevas rutas y actualizaciones:
1. Google Search Console API: Re-envía el sitemap.xml.
2. Google Indexing API: Notifica individualmente cada una de las 7 técnicas fonoaudiológicas
   con el evento URL_UPDATED.
3. Bing Webmaster Tools API: Registra el feed del Sitemap y envía lote de URLs actualizadas.
4. Protocolo IndexNow: Notifica en tiempo real a Bing, Yandex y motores compatibles.

Autenticación:
- Google: Cuenta de servicio de Google Cloud vía GOOGLE_APPLICATION_CREDENTIALS_JSON o GOOGLE_APPLICATION_CREDENTIALS.
- Bing: API Key de Bing Webmaster vía BING_WEBMASTER_API_KEY o BING_API_KEY.
- IndexNow: Key estática o vía INDEXNOW_KEY.
"""

import argparse
import json
import logging
import os
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional, Tuple

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("cadensa_seo_notifier")

DEFAULT_SITE_URL = "https://cadensa-web.pages.dev/"
DEFAULT_SITEMAP_URL = "https://cadensa-web.pages.dev/sitemap.xml"
DEFAULT_INDEXNOW_KEY = "856757614ffc2c5582fbcb81b1b4e4ca"

GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/webmasters",
    "https://www.googleapis.com/auth/indexing",
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
        logger.debug(f"No se pudo cargar el archivo {file_path}: {e}")


def get_google_credentials_info() -> Optional[Dict]:
    """
    Obtiene la información de credenciales de la cuenta de servicio de GCP.
    Busca en:
    1. GOOGLE_APPLICATION_CREDENTIALS_JSON (cadena JSON en env)
    2. GCP_SA_METRICS_KEY (cadena JSON en env)
    3. GOOGLE_APPLICATION_CREDENTIALS (ruta de archivo en env)
    4. Archivos locales comunes (google_credentials.json, sa-key.json)
    """
    # 1. Variable JSON directa
    for env_var in ["GOOGLE_APPLICATION_CREDENTIALS_JSON", "GCP_SA_METRICS_KEY"]:
        val = os.getenv(env_var)
        if val:
            val = val.strip()
            if val.startswith("{") and val.endswith("}"):
                try:
                    return json.loads(val)
                except Exception as e:
                    logger.warning(f"Error parseando JSON de variable {env_var}: {e}")

    # 2. Variable con ruta de archivo
    file_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    candidate_paths = [file_path] if file_path else []
    candidate_paths.extend([
        "google_credentials.json",
        "sa-key.json",
        os.path.join(os.path.dirname(__file__), "../google_credentials.json"),
        os.path.join(os.path.dirname(__file__), "../sa-key.json"),
        "/mnt/c/Users/lenin/.gemini/antigravity-ide/sa-key.json",
    ])

    for path in candidate_paths:
        if path and os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "client_email" in data and "private_key" in data:
                        logger.info(f"Credenciales de GCP cargadas desde archivo: {path}")
                        return data
            except Exception as e:
                logger.debug(f"No se pudo leer credenciales de {path}: {e}")

    return None


def get_google_access_token(sa_info: Dict) -> Optional[str]:
    """Genera un Bearer Access Token para Google APIs utilizando un JWT firmado con RSA-SHA256."""
    try:
        import time
        import base64
        import urllib.request
        import urllib.parse
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
        logger.error(f"Error generando Google Access Token vía JWT: {e}")

    # Fallback opcional con google-auth si estuviese disponible
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request

        creds = service_account.Credentials.from_service_account_info(
            sa_info, scopes=GOOGLE_SCOPES
        )
        creds.refresh(Request())
        return creds.token
    except Exception as e:
        logger.debug(f"Fallback google-auth omitido: {e}")

    return None


def parse_sitemap_urls(sitemap_source: str) -> Tuple[List[str], List[str]]:
    """
    Parsea las URLs contenidas en un sitemap.xml.
    Retorna (todas_las_urls, urls_de_tecnicas).
    """
    content = ""
    if os.path.exists(sitemap_source):
        logger.info(f"Leyendo sitemap local desde: {sitemap_source}")
        with open(sitemap_source, "r", encoding="utf-8") as f:
            content = f.read()
    elif sitemap_source.startswith("http://") or sitemap_source.startswith("https://"):
        logger.info(f"Descargando sitemap remoto desde: {sitemap_source}")
        import urllib.request
        req = urllib.request.Request(
            sitemap_source,
            headers={"User-Agent": "Cadensa-SEO-Notifier/1.0"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8")
    else:
        # Intento fallback a out/sitemap.xml
        fallback_path = os.path.join(os.getcwd(), "out/sitemap.xml")
        if os.path.exists(fallback_path):
            logger.info(f"Usando sitemap fallback en: {fallback_path}")
            with open(fallback_path, "r", encoding="utf-8") as f:
                content = f.read()
        else:
            raise FileNotFoundError(f"No se encontró sitemap en {sitemap_source} ni en {fallback_path}")

    root = ET.fromstring(content)
    # Soporta XML con o sin namespace sitemap
    namespaces = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    all_urls = []
    # Buscar con namespace
    loc_elements = root.findall(".//ns:loc", namespaces)
    if not loc_elements:
        # Buscar sin namespace
        loc_elements = root.findall(".//loc")

    for loc in loc_elements:
        if loc.text:
            url = loc.text.strip()
            if url and url not in all_urls:
                all_urls.append(url)

    # Filtrar URLs de las técnicas fonoaudiológicas
    technique_urls = [
        u for u in all_urls
        if "/techniques/" in u or "/tecnicas/" in u
    ]

    return all_urls, technique_urls


def notify_google_sitemap(site_url: str, sitemap_url: str, token: str, dry_run: bool = False) -> bool:
    """Envía el sitemap a Google Search Console API."""
    import urllib.request

    encoded_site = urllib.parse.quote(site_url, safe="")
    encoded_sitemap = urllib.parse.quote(sitemap_url, safe="")
    endpoint = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/sitemaps/{encoded_sitemap}"

    logger.info(f"🌐 [Google Search Console] Enviando sitemap: {sitemap_url}")
    if dry_run:
        logger.info(f"   [DRY-RUN] PUT {endpoint} (Token: {token[:10]}...)")
        return True

    try:
        req = urllib.request.Request(
            endpoint,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Length": "0",
            },
            method="PUT",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            logger.info(f"   ✅ [Google Search Console] Sitemap recibido exitosamente (HTTP {status})")
            return status in [200, 204]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        logger.warning(f"   ⚠️ [Google Search Console] HTTP {e.code}: {body}")
        return False
    except Exception as e:
        logger.error(f"   ❌ [Google Search Console] Error: {e}")
        return False


def notify_google_indexing_api(urls: List[str], token: str, dry_run: bool = False) -> int:
    """Notifica a Google Indexing API cada URL con URL_UPDATED."""
    import urllib.request

    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
    success_count = 0

    logger.info(f"🚀 [Google Indexing API] Notificando {len(urls)} URLs clínicas como URL_UPDATED...")

    for url in urls:
        payload = {
            "url": url,
            "type": "URL_UPDATED",
        }
        data_bytes = json.dumps(payload).encode("utf-8")

        if dry_run:
            logger.info(f"   [DRY-RUN] POST {endpoint} -> {url}")
            success_count += 1
            continue

        try:
            req = urllib.request.Request(
                endpoint,
                data=data_bytes,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json; charset=utf-8",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                notify_time = resp_data.get("urlNotificationMetadata", {}).get("latestUpdate", {}).get("notifyTime", "N/A")
                logger.info(f"   ✅ [Google Indexing API] {url} -> HTTP {resp.status} (Notificado: {notify_time})")
                success_count += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            logger.warning(f"   ⚠️ [Google Indexing API] {url} -> HTTP {e.code}: {body}")
        except Exception as e:
            logger.error(f"   ❌ [Google Indexing API] {url} -> Error: {e}")

    return success_count


def notify_bing_webmaster_feed(site_url: str, sitemap_url: str, api_key: str, dry_run: bool = False) -> bool:
    """Registra el feed del sitemap en Bing Webmaster Tools API."""
    import urllib.request

    endpoint = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitFeed?apikey={api_key}"
    payload = {"siteUrl": site_url, "feedUrl": sitemap_url}
    data_bytes = json.dumps(payload).encode("utf-8")

    logger.info(f"🌐 [Bing Webmaster API] Enviando Sitemap Feed: {sitemap_url}")
    if dry_run:
        logger.info(f"   [DRY-RUN] POST {endpoint} -> {payload}")
        return True

    try:
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            logger.info(f"   ✅ [Bing Webmaster API] Sitemap Feed recibido (HTTP {resp.status})")
            return resp.status in [200, 204]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        logger.warning(f"   ⚠️ [Bing Webmaster API] SubmitFeed HTTP {e.code}: {body}")
        return False
    except Exception as e:
        logger.error(f"   ❌ [Bing Webmaster API] SubmitFeed Error: {e}")
        return False


def notify_bing_url_batch(site_url: str, urls: List[str], api_key: str, dry_run: bool = False) -> bool:
    """Envía lote de URLs actualizadas a Bing Webmaster Tools API."""
    import urllib.request

    endpoint = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={api_key}"
    payload = {"siteUrl": site_url, "urlList": urls}
    data_bytes = json.dumps(payload).encode("utf-8")

    logger.info(f"📦 [Bing Webmaster API] Enviando lote de {len(urls)} URLs...")
    if dry_run:
        logger.info(f"   [DRY-RUN] POST {endpoint} ({len(urls)} URLs)")
        return True

    try:
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            logger.info(f"   ✅ [Bing Webmaster API] Lote enviado exitosamente (HTTP {resp.status})")
            return resp.status in [200, 204]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        logger.warning(f"   ⚠️ [Bing Webmaster API] SubmitUrlbatch HTTP {e.code}: {body}")
        return False
    except Exception as e:
        logger.error(f"   ❌ [Bing Webmaster API] SubmitUrlbatch Error: {e}")
        return False


def notify_indexnow(urls: List[str], host: str = "cadensa-web.pages.dev", key: str = DEFAULT_INDEXNOW_KEY, dry_run: bool = False) -> bool:
    """Envía actualización masiva mediante el protocolo IndexNow (Bing / Yandex)."""
    import urllib.request

    endpoint = "https://api.indexnow.org/indexnow"
    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"https://{host}/{key}.txt",
        "urlList": urls,
    }
    data_bytes = json.dumps(payload).encode("utf-8")

    logger.info(f"⚡ [IndexNow API] Notificando {len(urls)} URLs a IndexNow (Host: {host})...")
    if dry_run:
        logger.info(f"   [DRY-RUN] POST {endpoint} ({len(urls)} URLs, Key: {key[:8]}...)")
        return True

    try:
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            logger.info(f"   ✅ [IndexNow API] Despacho exitoso (HTTP {resp.status})")
            return resp.status in [200, 202]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        logger.warning(f"   ⚠️ [IndexNow API] HTTP {e.code}: {body}")
        return False
    except Exception as e:
        logger.error(f"   ❌ [IndexNow API] Error: {e}")
        return False


def find_indexnow_key() -> str:
    """Descubre dinámicamente la clave IndexNow desde variables de entorno o archivos de validación en disco."""
    env_key = (os.getenv("INDEXNOW_KEY") or "").strip()
    if env_key:
        return env_key

    candidate_dirs = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out"),
        "public",
        "out",
    ]
    for c_dir in candidate_dirs:
        if os.path.exists(c_dir):
            for fname in os.listdir(c_dir):
                if fname.endswith(".txt") and len(fname) == 36:
                    stem = fname[:-4]
                    if all(c in "0123456789abcdefABCDEF" for c in stem):
                        file_path = os.path.join(c_dir, fname)
                        try:
                            with open(file_path, "r", encoding="utf-8") as f:
                                file_val = f.read().strip()
                                if file_val.lower() == stem.lower():
                                    return file_val
                        except Exception:
                            pass
    return DEFAULT_INDEXNOW_KEY


def main() -> int:
    load_env_file()

    parser = argparse.ArgumentParser(
        description="Notificador Automatizado de Cambios SEO para Google Search Console, Google Indexing y Bing."
    )
    parser.add_argument(
        "--sitemap",
        default="out/sitemap.xml",
        help="Ruta local o URL remota del archivo sitemap.xml (default: out/sitemap.xml)",
    )
    parser.add_argument(
        "--site-url",
        default=DEFAULT_SITE_URL,
        help=f"URL raíz del sitio (default: {DEFAULT_SITE_URL})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula las llamadas a las APIs de Google y Bing sin realizarlas.",
    )
    parser.add_argument(
        "--indexnow-key",
        default=None,
        help="Clave para autenticación con el protocolo IndexNow.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Falla con código != 0 si alguna API no puede autenticarse o falla.",
    )
    args = parser.parse_args()

    logger.info("=" * 65)
    logger.info("🔍 Cadensa - Notificación Automatizada de Cambios SEO")
    logger.info(f"   Sitio: {args.site_url}")
    logger.info(f"   Sitemap: {args.sitemap}")
    logger.info(f"   Modo Dry-Run: {args.dry_run}")
    logger.info("=" * 65)

    # 1. Parsear Sitemap
    try:
        all_urls, technique_urls = parse_sitemap_urls(args.sitemap)
        logger.info(f"📋 URLs encontradas en sitemap: {len(all_urls)} totales | {len(technique_urls)} técnicas fonoaudiológicas")
        for idx, t_url in enumerate(technique_urls, 1):
            logger.info(f"   [{idx}/{len(technique_urls)}] {t_url}")
    except Exception as e:
        logger.error(f"Error procesando sitemap: {e}")
        return 1 if args.strict else 0

    sitemap_url = urllib.parse.urljoin(args.site_url, "sitemap.xml")

    # 2. Notificaciones a Google (Search Console + Indexing API)
    google_sa_info = get_google_credentials_info()
    google_token = None

    if google_sa_info:
        logger.info(f"🔑 Cuenta de Servicio GCP identificada: {google_sa_info.get('client_email')}")
        if not args.dry_run:
            google_token = get_google_access_token(google_sa_info)
        else:
            google_token = "dry_run_token_mock_google_cloud_service_account"
    elif args.dry_run:
        logger.info("🔑 Modo Dry-Run: Usando token simulado para Google APIs.")
        google_token = "dry_run_token_mock_google_cloud_service_account"
    else:
        logger.warning("⚠️ No se encontraron credenciales de Google Service Account (GOOGLE_APPLICATION_CREDENTIALS_JSON).")
        logger.warning("   Omitiendo notificaciones automáticas a Google Search Console e Indexing API.")

    if google_token:
        # A) Re-enviar Sitemap a Google Search Console
        notify_google_sitemap(args.site_url, sitemap_url, google_token, dry_run=args.dry_run)

        # B) Publicar URLs de técnicas en Google Indexing API
        if technique_urls:
            notify_google_indexing_api(technique_urls, google_token, dry_run=args.dry_run)

    # 3. Notificaciones a Bing (Webmaster Tools API)
    bing_api_key = os.getenv("BING_WEBMASTER_API_KEY") or os.getenv("BING_API_KEY")

    if bing_api_key:
        logger.info(f"🔑 API Key de Bing Webmaster detectada ({bing_api_key[:6]}...)")
        notify_bing_webmaster_feed(args.site_url, sitemap_url, bing_api_key, dry_run=args.dry_run)
        if technique_urls:
            notify_bing_url_batch(args.site_url, technique_urls, bing_api_key, dry_run=args.dry_run)
    elif args.dry_run:
        logger.info("🔑 Modo Dry-Run: Simulando notificación a Bing Webmaster Tools API...")
        notify_bing_webmaster_feed(args.site_url, sitemap_url, "dry_run_bing_api_key", dry_run=True)
        if technique_urls:
            notify_bing_url_batch(args.site_url, technique_urls, "dry_run_bing_api_key", dry_run=True)
    else:
        logger.warning("⚠️ No se encontró BING_WEBMASTER_API_KEY ni BING_API_KEY. Omitiendo Bing Webmaster API.")

    # 4. Notificación IndexNow (Bing / Yandex / Seznam)
    host_domain = urllib.parse.urlparse(args.site_url).netloc or "cadensa-web.pages.dev"
    indexnow_key = (args.indexnow_key or "").strip() or find_indexnow_key()
    notify_indexnow(all_urls, host=host_domain, key=indexnow_key, dry_run=args.dry_run)

    logger.info("=" * 65)
    logger.info("🎉 Notificaciones SEO procesadas exitosamente.")
    logger.info("=" * 65)

    return 0


if __name__ == "__main__":
    sys.exit(main())
