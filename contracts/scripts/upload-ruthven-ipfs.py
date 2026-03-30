#!/usr/bin/env python3
"""
Upload Ruthven: First Light NFT images & metadata to IPFS via Pinata.

Run from the contracts/ directory:
    python3 scripts/upload-ruthven-ipfs.py

Outputs:
    - Image CIDs stored in the SQLite DB
    - A metadata folder pinned to IPFS
    - Prints the base URI to paste into deploy-ruthven.js
"""

import os
import sys
import json
import sqlite3
import tempfile
import shutil
import requests
from pathlib import Path
from datetime import datetime, timezone

# ── Config ──────────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).resolve().parent.parent.parent  # NFT GENERATOR/
BACKEND_DIR     = BASE_DIR / "backend"
DB_PATH         = BACKEND_DIR / "instance" / "nft_generator.db"
UPLOADS_DIR     = BACKEND_DIR / "uploads"
ENV_PATH        = BASE_DIR / ".env"
COLLECTION_ID   = 3   # Ruthven: First Light

# ── Load .env manually (no Flask needed) ────────────────────────────────────
def load_env(path):
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, _, v = line.partition('=')
            env[k.strip()] = v.strip()
    return env

env = load_env(ENV_PATH)
PINATA_JWT = env.get('PINATA_JWT', '')
PINATA_API_KEY = env.get('PINATA_API_KEY', '')
PINATA_SECRET  = env.get('PINATA_SECRET_KEY', '')

def pinata_headers():
    if PINATA_JWT:
        return {'Authorization': f'Bearer {PINATA_JWT}'}
    if PINATA_API_KEY and PINATA_SECRET:
        return {'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_SECRET}
    raise ValueError("No Pinata credentials found in .env")

# ── Pin a single file ────────────────────────────────────────────────────────
def pin_file(file_path, name=None):
    url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        data  = {'pinataMetadata': json.dumps({'name': name or os.path.basename(file_path)})}
        resp  = requests.post(url, files=files, data=data, headers=pinata_headers(), timeout=120)
        resp.raise_for_status()
    return resp.json()['IpfsHash']

# ── Pin a directory ──────────────────────────────────────────────────────────
def pin_directory(dir_path, name=None):
    url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    handles = []
    files   = []
    try:
        for fpath in sorted(Path(dir_path).iterdir()):
            if fpath.is_file():
                h = open(fpath, 'rb')
                handles.append(h)
                files.append(('file', (fpath.name, h)))
        data = {
            'pinataMetadata': json.dumps({'name': name or Path(dir_path).name}),
            'pinataOptions':  json.dumps({'wrapWithDirectory': True}),
        }
        resp = requests.post(url, files=files, data=data, headers=pinata_headers(), timeout=300)
        resp.raise_for_status()
        return resp.json()['IpfsHash']
    finally:
        for h in handles:
            h.close()

# ── Generate OpenSea-compatible metadata ─────────────────────────────────────
def generate_metadata(nft_row, image_cid):
    db_id, token_id, name, traits_json, image_path = nft_row
    traits = json.loads(traits_json) if traits_json else []

    return {
        "name": name.title(),
        "description": (
            "A 1/1 Highland painting from FIRST LIGHT — "
            "a collection of 25 works by Scottish cryptoartist Ruthven. "
            "Each piece captures the raw, luminous atmosphere of the Scottish Highlands "
            "at first light, painted en plein air and processed through a hand-trained AI."
        ),
        "image": f"ipfs://{image_cid}",
        "external_url": "https://ruthven.world",
        "attributes": traits,
        "properties": {
            "collection": "FIRST LIGHT",
            "artist": "Ruthven",
            "edition": "1/1",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    }

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("═" * 60)
    print("  RUTHVEN: FIRST LIGHT — IPFS Upload")
    print("═" * 60)

    conn = sqlite3.connect(DB_PATH)
    c    = conn.cursor()
    c.execute(
        'SELECT id, token_id, name, traits_json, image_path, image_cid FROM nfts '
        'WHERE collection_id = ? ORDER BY token_id',
        (COLLECTION_ID,)
    )
    nfts = c.fetchall()

    if not nfts:
        print("ERROR: No NFTs found for collection 3")
        sys.exit(1)

    print(f"\nFound {len(nfts)} NFTs to upload\n")

    # ── Step 1: Pin images ───────────────────────────────────────────────────
    print("STEP 1: Uploading images to IPFS...")
    image_cids = {}

    for row in nfts:
        db_id, token_id, name, traits_json, image_path, existing_cid = row

        if existing_cid:
            print(f"  [{token_id:2d}] {name[:40]:40s} ✓ already pinned: {existing_cid[:16]}…")
            image_cids[token_id] = existing_cid
            continue

        full_path = UPLOADS_DIR / image_path
        if not full_path.exists():
            print(f"  [{token_id:2d}] {name[:40]:40s} ✗ IMAGE NOT FOUND: {full_path}")
            continue

        print(f"  [{token_id:2d}] {name[:40]:40s} uploading…", end='', flush=True)
        try:
            cid = pin_file(full_path, name=f"ruthven-first-light-{token_id}")
            image_cids[token_id] = cid
            # Save to DB
            c.execute('UPDATE nfts SET image_cid = ? WHERE id = ?', (cid, db_id))
            conn.commit()
            print(f" ✓ {cid[:16]}…")
        except Exception as e:
            print(f" ✗ FAILED: {e}")

    # ── Step 2: Build metadata folder ────────────────────────────────────────
    print(f"\nSTEP 2: Generating metadata JSON files…")
    tmp_dir = tempfile.mkdtemp(prefix='ruthven-metadata-')

    try:
        skipped = []
        for row in nfts:
            db_id, token_id, name, traits_json, image_path, _ = row

            if token_id not in image_cids:
                skipped.append(token_id)
                continue

            meta = generate_metadata(
                (db_id, token_id, name, traits_json, image_path),
                image_cids[token_id]
            )
            out_path = Path(tmp_dir) / f"{token_id}.json"
            out_path.write_text(json.dumps(meta, indent=2))
            print(f"  [{token_id:2d}] {name[:40]:40s} → {token_id}.json ✓")

        if skipped:
            print(f"\n  ⚠ Skipped token IDs (no image CID): {skipped}")

        # ── Step 3: Pin each metadata JSON individually ───────────────────────
        print(f"\nSTEP 3: Pinning metadata JSONs to IPFS individually…")
        meta_cids = {}
        for row in nfts:
            db_id, token_id, name, traits_json, image_path, _ = row
            if token_id not in image_cids:
                continue
            json_path = Path(tmp_dir) / f"{token_id}.json"
            if not json_path.exists():
                continue
            print(f"  [{token_id:2d}] {name[:40]:40s} pinning…", end='', flush=True)
            try:
                cid = pin_file(json_path, name=f"ruthven-first-light-{token_id}.json")
                meta_cids[token_id] = cid
                print(f" ✓ {cid[:16]}…")
            except Exception as e:
                print(f" ✗ FAILED: {e}")

    finally:
        shutil.rmtree(tmp_dir)

    # ── Step 4: Save metadata CIDs to DB ────────────────────────────────────
    print(f"\nSTEP 4: Saving metadata CIDs to database…")
    for row in nfts:
        db_id, token_id, name, traits_json, image_path, _ = row
        if token_id in meta_cids:
            c.execute('UPDATE nfts SET metadata_cid = ? WHERE id = ?', (meta_cids[token_id], db_id))
    conn.commit()
    conn.close()

    # ── Done — use backend API as base URI ───────────────────────────────────
    print(f"\n{'═' * 60}")
    print(f"  ✅ IPFS UPLOAD COMPLETE")
    print(f"{'═' * 60}")
    print(f"\n  All {len(meta_cids)}/25 metadata JSONs pinned individually.")
    print(f"\n  ➜ Base URI for contract (Railway backend):")
    print(f"    https://ruthven-api.railway.app/api/nfts/metadata/")
    print(f"\n  ➜ Or use individual IPFS CIDs (stored in DB).")
    print(f"    Token 0: ipfs://{meta_cids.get(0, 'N/A')}")
    print(f"{'═' * 60}\n")

if __name__ == '__main__':
    main()
