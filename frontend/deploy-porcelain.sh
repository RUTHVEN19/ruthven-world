#!/usr/bin/env bash
# Deploy porcelainandroid.com — SAFELY.
#
# Two hazards this guards against:
#  1. `netlify deploy --dir=...` REPLACES the whole site. The big art assets are
#     NOT in git (they live on the Backup Plus archive), so building with empty
#     asset folders silently DELETES them from the live site. This happened once
#     and took the Manga Machine down.
#  2. All three brand sites share one build, so a plain deploy also ships
#     Diamond Drones / portfolio assets (marilyns, vault, album...) that
#     porcelainandroid.com never uses.
#
# Usage:  cd frontend && ./deploy-porcelain.sh
set -euo pipefail

SITE_ID="78fdf3ec-c2e5-4769-b1f7-427fd89a326a"   # porcelain-android
ARCHIVE="/Volumes/Backup Plus/NFT-GENERATOR-archive/frontend-public"

# ── 1. Guard: the assets porcelainandroid.com actually serves must be present ──
REQUIRED=(
  "public/androids/stills"
  "public/androids/manga"
  "public/androids/transformations"
  "public/androids/film"
  "public/androids/manga-drop"
)
fail=0
for d in "${REQUIRED[@]}"; do
  n=$(find "$d" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "$n" -lt 1 ]; then
    echo "❌ EMPTY: $d — deploying now would DELETE these from the live site."
    fail=1
  else
    printf "✓ %-34s %s files\n" "$d" "$n"
  fi
done
if [ "$fail" = "1" ]; then
  echo
  echo "Restore from the Backup Plus archive first, e.g.:"
  echo "  rsync -a --exclude 'originals_backup/' \\"
  echo "    \"$ARCHIVE/androids/stills\" public/androids/"
  exit 1
fi

# ── 2. Build ──
echo "→ building..."
npm run build

# ── 3. Strip other brands' assets (verified unreferenced by the androids pages) ──
echo "→ pruning non-porcelain assets..."
rm -rf dist-porcelain
rsync -a \
  --exclude 'marilyns/' --exclude 'vault/'     --exclude 'album/' \
  --exclude 'portfolio/' --exclude 'originals/' --exclude 'prints/' \
  --exclude 'lore/'      --exclude 'films/'     --exclude 'artist/' \
  dist/ dist-porcelain/
echo "   full build: $(du -sh dist | awk '{print $1}')  →  porcelain: $(du -sh dist-porcelain | awk '{print $1}')"

# ── 4. Deploy ──
echo "→ deploying to porcelainandroid.com..."
netlify deploy --prod --dir=dist-porcelain --site="$SITE_ID"

# ── 5. Verify by CONTENT, not status code ──
# Every missing path still returns 200 (SPA catch-all serves index.html ~5.5KB),
# so assert content-type/size instead.
echo "→ verifying live..."
for p in \
  "androids/stills/blue-cherub-girls.png|image/png" \
  "androids/transformations/blue-cherub-girls.mp4|video/mp4" \
  "androids/manga-drop/manga-machine-music.mp3|audio/mpeg" ; do
  url="${p%%|*}"; want="${p##*|}"
  got=$(curl -s -o /dev/null -w '%{content_type}' "https://porcelainandroid.com/$url?cb=$RANDOM")
  if [ "$got" = "$want" ]; then echo "   ✓ $url"; else echo "   ❌ $url → got '$got', expected '$want'"; fi
done
echo "done."
