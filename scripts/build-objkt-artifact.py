#!/usr/bin/env python3
"""
Build an interactive Objkt artifact for ANY Manga Machine transformation.

Each artifact is a self-contained mini Manga Machine: the porcelain still,
pull the lever, the transformation plays (with sound if the source has it),
and it settles on the manga memory. The collector owns all three in one piece.

It reads the triplet already used by the site:
    frontend/public/androids/stills/<slug>.png
    frontend/public/androids/manga/<slug>.png
    frontend/public/androids/transformations/<slug>.mp4

Usage:
    python3 scripts/build-objkt-artifact.py <slug> ["Display Title"]
    python3 scripts/build-objkt-artifact.py neon-graffiti-girl

Then pin it:
    cd contracts && node scripts/pin-html-artifact.js ../artifacts/<slug>
"""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "frontend", "public", "androids")
TEMPLATE = os.path.join(ROOT, "artifacts", "_template.html")
MAX_W = 2048          # plenty for a web artifact; masters stay untouched
JPEG_Q = 88


def die(msg):
    print(f"ERROR: {msg}")
    sys.exit(1)


def main():
    if len(sys.argv) < 2:
        die("usage: build-objkt-artifact.py <slug> [\"Display Title\"]")
    slug = sys.argv[1].strip().lower()
    title = sys.argv[2] if len(sys.argv) > 2 else slug.replace("-", " ").upper()

    still_src = os.path.join(PUB, "stills", f"{slug}.png")
    manga_src = os.path.join(PUB, "manga", f"{slug}.png")
    vid_src = os.path.join(PUB, "transformations", f"{slug}.mp4")
    for p, what in [(still_src, "still"), (manga_src, "manga"), (vid_src, "transformation")]:
        if not os.path.exists(p):
            die(f"missing {what}: {p}")
    if not os.path.exists(TEMPLATE):
        die(f"missing template: {TEMPLATE}")

    out = os.path.join(ROOT, "artifacts", slug)
    os.makedirs(out, exist_ok=True)
    print(f"\n  Building artifact for {title}  ->  artifacts/{slug}/\n")

    # 1. downscale the two stills (masters are 20MB+, far too heavy to ship)
    from PIL import Image
    for src, name in [(still_src, "still.jpg"), (manga_src, "manga.jpg")]:
        im = Image.open(src).convert("RGB")
        w = min(MAX_W, im.size[0])
        h = int(im.size[1] * w / im.size[0])
        im.resize((w, h), Image.LANCZOS).save(
            os.path.join(out, name), quality=JPEG_Q, optimize=True, progressive=True)
        print(f"   {name:<14} {im.size} -> ({w},{h})  {os.path.getsize(os.path.join(out, name))//1024} KB")

    # 2. the transformation, audio preserved (the site copy is already web-weight)
    dst_vid = os.path.join(out, "transform.mp4")
    if os.path.getsize(vid_src) > 12 * 1024 * 1024:
        subprocess.run(["ffmpeg", "-y", "-i", vid_src, "-vf", "scale=1080:-2",
                        "-c:v", "libx264", "-crf", "23", "-preset", "slow",
                        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", dst_vid],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        shutil.copyfile(vid_src, dst_vid)
    has_audio = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a",
                                "-show_entries", "stream=codec_type", "-of", "csv=p=0", dst_vid],
                               capture_output=True, text=True).stdout.strip()
    print(f"   {'transform.mp4':<14} {os.path.getsize(dst_vid)//1024} KB   audio: {'yes' if has_audio else 'NO (silent source)'}")

    # 3. the page
    html = open(TEMPLATE).read().replace("{{TITLE}}", title)
    open(os.path.join(out, "index.html"), "w").write(html)
    print(f"   {'index.html':<14} {os.path.getsize(os.path.join(out,'index.html'))//1024} KB")

    total = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print(f"\n  Done — {total/1048576:.1f} MB total")
    print(f"\n  Preview:  python3 -m http.server 8123 --directory artifacts/{slug}")
    print(f"  Pin:      cd contracts && node scripts/pin-html-artifact.js ../artifacts/{slug}\n")


if __name__ == "__main__":
    main()
