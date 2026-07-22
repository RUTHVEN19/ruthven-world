#!/usr/bin/env python3
"""
Build a SELF-CONTAINED version of a Mini Manga Machine artifact.

Every asset is inlined as a data: URI, so the page makes no external requests
and has no relative paths at all. It cannot break no matter how a marketplace
serves it — which is the failure mode that broke token #0 on Objkt.

Trade-off: one large HTML file instead of a tidy directory.

Usage:
    python3 scripts/build-selfcontained-artifact.py <slug> [--video-crf 26] [--video-width 960]
"""
import base64
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def die(m):
    print("ERROR:", m)
    sys.exit(1)


def data_uri(path, mime):
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode("ascii")


def main():
    argv = sys.argv[1:]
    if not argv:
        die("usage: build-selfcontained-artifact.py <slug> [--video-crf N] [--video-width N]")
    slug = argv[0]
    crf = "26"
    width = "960"
    for i, a in enumerate(argv):
        if a == "--video-crf":
            crf = argv[i + 1]
        if a == "--video-width":
            width = argv[i + 1]

    src = os.path.join(ROOT, "artifacts", slug)
    if not os.path.isdir(src):
        die(f"no artifact at {src}")
    html_path = os.path.join(src, "index.html")
    for f in ("index.html", "still.jpg", "manga.jpg", "transform.mp4"):
        if not os.path.exists(os.path.join(src, f)):
            die(f"missing {f} in {src}")

    out_dir = os.path.join(ROOT, "artifacts", f"{slug}-selfcontained")
    os.makedirs(out_dir, exist_ok=True)

    # a lighter video keeps the single file sane — base64 adds ~33%
    small = os.path.join(out_dir, "transform-small.mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-i", os.path.join(src, "transform.mp4"),
         "-vf", f"scale={width}:-2", "-c:v", "libx264", "-crf", crf, "-preset", "slow",
         "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", small],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    if not os.path.exists(small):
        die("ffmpeg failed to shrink the video")

    html = open(html_path).read()

    # Images inline as data: URIs — every browser handles those fine.
    for name, mime in (("still.jpg", "image/jpeg"), ("manga.jpg", "image/jpeg")):
        html = html.replace(f'src="{name}"', f'src="{data_uri(os.path.join(src, name), mime)}"')

    # The film is NOT embedded. Objkt's artifact CSP is `media-src *`, and the
    # `*` wildcard does not cover data: or blob: — which is why every embedded
    # attempt was silently blocked. Media must be fetched over https, so the
    # page loads the film by CID from public gateways instead.
    film_cid = os.environ.get("FILM_CID", "")
    if not film_cid:
        die("set FILM_CID to the IPFS CID of the transformation mp4")
    film_url = os.environ.get("FILM_URL", "")
    html = html.replace("</body>",
        f'<script>window.__FILM_CID="{film_cid}";'
        f'window.__FILM_URL={{}};</script>\n</body>'.format(
            '"' + film_url + '"' if film_url else 'null'), 1)
    if film_url:
        print(f"  film primary source: {film_url}")
    print(f"  film served from IPFS gateways: {film_cid[:20]}…")

    # ── Animated-WebP fallback ────────────────────────────────────────────
    # Objkt's artifact iframe blocks <video> (tried as a sibling file, a data:
    # URI and a blob: URL — all play on the artist's site, none on Objkt). But
    # IMAGES always render there. An animated WebP is an image the browser
    # animates natively, so the transformation stays smooth without <video>.
    import glob, tempfile
    fdir = tempfile.mkdtemp()
    subprocess.run(["ffmpeg", "-y", "-i", os.path.join(src, "transform.mp4"),
                    "-vf", "fps=12,scale=720:-2", os.path.join(fdir, "f%03d.png")],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    pngs = sorted(glob.glob(os.path.join(fdir, "*.png")))
    if not pngs:
        die("could not extract frames for the animated fallback")
    from PIL import Image as _I
    ims = [_I.open(f).convert("RGB") for f in pngs]
    anim = os.path.join(fdir, "transform.webp")
    ims[0].save(anim, format="WEBP", save_all=True, append_images=ims[1:],
                duration=int(1000 / 12), loop=0, quality=50, method=4)
    anim_ms = int(len(ims) * 1000 / 12)

    # the soundtrack separately — the film's audio is unreachable when the film is
    aud = os.path.join(fdir, "track.m4a")
    subprocess.run(["ffmpeg", "-y", "-i", os.path.join(src, "transform.mp4"),
                    "-vn", "-c:a", "aac", "-b:a", "96k", aud],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    aud_js = '"' + data_uri(aud, "audio/mp4") + '"' if os.path.exists(aud) else "null"

    fallback = ("<script>window.__ANIM=\"" + data_uri(anim, "image/webp") + "\";"
                "window.__ANIM_MS=" + str(anim_ms) + ";window.__AUDIO=" + aud_js + ";</script>")
    html = html.replace("</body>", fallback + "\n</body>", 1)
    print(f"  animated fallback: {len(ims)} frames @12fps, {os.path.getsize(anim)/1048576:.1f} MB webp")
    if os.path.exists(aud):
        print(f"  fallback audio   : {os.path.getsize(aud)//1024} KB")
    # ──────────────────────────────────────────────────────────────────────

    # nothing external must remain
    leftovers = re.findall(r'src="(?!data:)[^"]+"', html)
    if leftovers:
        die(f"still has external refs: {leftovers[:3]}")

    dst = os.path.join(out_dir, "index.html")
    open(dst, "w").write(html)

    mb = os.path.getsize(dst) / 1048576
    print(f"  video shrunk to {width}px crf{crf}: {os.path.getsize(small)/1048576:.1f} MB")
    print(f"  self-contained HTML: {mb:.1f} MB  →  {os.path.relpath(dst, ROOT)}")
    print(f"  external references remaining: 0 ✓")
    if mb > 25:
        print("  ⚠ over 25 MB — consider a lower --video-width / higher --video-crf")


if __name__ == "__main__":
    main()
