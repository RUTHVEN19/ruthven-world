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
    swaps = {
        "still.jpg": data_uri(os.path.join(src, "still.jpg"), "image/jpeg"),
        "manga.jpg": data_uri(os.path.join(src, "manga.jpg"), "image/jpeg"),
        "transform.mp4": data_uri(small, "video/mp4"),
    }
    for name, uri in swaps.items():
        html = html.replace(f'src="{name}"', f'src="{uri}"')

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
