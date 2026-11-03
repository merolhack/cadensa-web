import urllib.request
import urllib.error

base_url = "https://cadensa-web.pages.dev/media/techniques"
techniques = [
    "syllable-timed-speech",
    "easy-onset",
    "light-contact",
    "prolonged-speech",
    "box-breathing",
    "pull-out",
    "cancellation"
]

print("=================================================================")
print("🌐 AUDITORÍA DE ENTREGA MULTIMEDIA EN PRODUCCIÓN (CLOUDFLARE PAGES)")
print("=================================================================\n")
all_ok = True
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for t in techniques:
    video_url = f"{base_url}/{t}_avatar_final.mp4"
    thumb_url = f"{base_url}/{t}_portada.webp"
    
    # Check video
    try:
        req = urllib.request.Request(video_url, headers=headers, method='HEAD')
        with urllib.request.urlopen(req) as resp:
            v_code = resp.getcode()
            v_len = resp.headers.get('Content-Length', 'chunked')
            v_etag = resp.headers.get('ETag', 'N/A')
            v_type = resp.headers.get('Content-Type', 'N/A')
    except Exception as e:
        v_code = str(e)
        v_len = "0"
        v_etag = ""
        v_type = ""
        all_ok = False

    # Check webp thumbnail
    try:
        req_th = urllib.request.Request(thumb_url, headers=headers, method='HEAD')
        with urllib.request.urlopen(req_th) as resp:
            t_code = resp.getcode()
            t_len = resp.headers.get('Content-Length', 'chunked')
            t_type = resp.headers.get('Content-Type', 'N/A')
    except Exception as e:
        t_code = str(e)
        t_len = "0"
        t_type = ""
        all_ok = False

    print(f"👉 Técnica: {t}")
    print(f"   🎬 Video MP4    : HTTP {v_code} | Tipo: {v_type} | Bytes: {v_len} | ETag: {v_etag}")
    print(f"   🖼️ Portada WebP : HTTP {t_code} | Tipo: {t_type} | Bytes: {t_len}")
    print("-" * 65)

# Check legacy video is removed from repo and static export
print("\n🔍 Verificación de eliminación de video legado (CapCut):")
legacy_url = f"{base_url}/cadensa_sts_montaje_limpio_final.mp4"
try:
    req_leg = urllib.request.Request(legacy_url, headers=headers, method='HEAD')
    with urllib.request.urlopen(req_leg) as resp:
        leg_code = resp.getcode()
except urllib.error.HTTPError as e:
    leg_code = e.code

print(f"   URL: {legacy_url}")
print(f"   Estado HTTP: {leg_code} (Nota: Cloudflare Pages puede mantener versiones previas si no se borró en el deploy o cache)")

# Check live client JS bundles
import re
print("\n🔍 Verificación de chunks JS en el bundle público:")
try:
    req_home = urllib.request.Request("https://cadensa-web.pages.dev/", headers=headers)
    with urllib.request.urlopen(req_home) as resp:
        home_html = resp.read().decode('utf-8')
    chunks = list(set(re.findall(r'/_next/static/chunks/[a-zA-Z0-9_\-\.]+\.js', home_html)))
    found_in_bundle = False
    for c in chunks:
        req_c = urllib.request.Request(f"https://cadensa-web.pages.dev{c}", headers=headers)
        with urllib.request.urlopen(req_c) as resp_c:
            c_text = resp_c.read().decode('utf-8', errors='ignore')
            if "syllable-timed-speech_avatar_final.mp4" in c_text:
                print(f"   ✅ Referencia a video avatar clínico encontrada en el chunk: {c}")
                found_in_bundle = True
                break
    if not found_in_bundle:
        print("   ℹ️ La referencia no está en los chunks iniciales (puede estar en un sub-chunk cargado dinámicamente).")
except Exception as e:
    print(f"   ⚠️ Error analizando chunks: {e}")

if all_ok:
    print("\n✅ LOS 7 VIDEOS CLÍNICOS Y PORTADAS WEBP ESTÁN 100% OPERATIVOS EN PRODUCCIÓN.")
else:
    print("\n⚠️ ALGUNAS COMPROBACIONES FALLARON.")
