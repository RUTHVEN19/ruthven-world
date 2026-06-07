"""
download.py — Token-gated download routes.

Diamond Drones holders  → 4K archival PNG of their token
Drone Blondes holders   → high-res film file of their token
Album holders           → MP3 320kbps album (all tracks)

Uses HMAC-signed, time-limited download tokens so files can't be
hot-linked or shared.
"""
import os
import hmac
import time
import hashlib
import zipfile
import io
from flask import Blueprint, request, jsonify, send_file, abort

from services.print_service import verify_token_owner, get_owned_tokens

download_bp = Blueprint('download', __name__)

# Secret for signing download tokens — falls back to Flask SECRET_KEY
DOWNLOAD_SECRET = os.getenv('DOWNLOAD_SECRET', os.getenv('FLASK_SECRET_KEY', 'dev-download-secret'))
TOKEN_EXPIRY = 300  # 5 minutes

# Base directories for gated assets (set via env or default)
DOWNLOADS_BASE = os.getenv('DOWNLOADS_BASE', os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'downloads'
))

# Sub-directories:
#   downloads/diamond_drones/1.png ... 1000.png   (4K archival PNGs)
#   downloads/drone_blondes/1.mp4  ... 120.mp4    (high-res film files)
#   downloads/album/*.mp3                          (full album tracks)


def _sign_token(wallet, collection, token_id, ts):
    """Create HMAC signature for a download token."""
    msg = f'{wallet}:{collection}:{token_id}:{ts}'.encode()
    return hmac.new(DOWNLOAD_SECRET.encode(), msg, hashlib.sha256).hexdigest()


def _verify_download_token(wallet, collection, token_id, ts, sig):
    """Verify a download token is valid and not expired."""
    expected = _sign_token(wallet, collection, token_id, ts)
    if not hmac.compare_digest(sig, expected):
        return False, 'Invalid token'
    if time.time() - float(ts) > TOKEN_EXPIRY:
        return False, 'Download link expired'
    return True, None


@download_bp.route('/download/request', methods=['POST'])
def request_download():
    """
    Verify token ownership and return a signed download URL.
    Body: { wallet, collection, token_id }
    For album: { wallet, collection: 'album' } — token_id is the Manifold token ID.
    """
    data = request.get_json()
    wallet = data.get('wallet', '').strip()
    collection = data.get('collection', '').strip()
    token_id = data.get('token_id')

    if not wallet or not collection:
        return jsonify({'error': 'wallet and collection required'}), 400

    valid_collections = ('diamond_drones', 'drone_blondes', 'album')
    if collection not in valid_collections:
        return jsonify({'error': 'Invalid collection'}), 400

    if token_id is None:
        return jsonify({'error': 'token_id required'}), 400

    token_id = int(token_id)

    # Verify on-chain ownership
    is_owner, error = verify_token_owner(wallet, collection, token_id)
    if error:
        return jsonify({'error': error}), 400
    if not is_owner:
        return jsonify({'error': 'You do not own this token'}), 403

    # Generate signed download token
    ts = str(int(time.time()))
    sig = _sign_token(wallet.lower(), collection, token_id, ts)

    return jsonify({
        'download_url': f'/api/download/file?wallet={wallet.lower()}&collection={collection}&token_id={token_id}&ts={ts}&sig={sig}',
    }), 200


@download_bp.route('/download/file', methods=['GET'])
def download_file():
    """Serve a gated file using a signed download token."""
    wallet = request.args.get('wallet', '').strip()
    collection = request.args.get('collection', '').strip()
    token_id = request.args.get('token_id', '')
    ts = request.args.get('ts', '')
    sig = request.args.get('sig', '')

    if not all([wallet, collection, token_id, ts, sig]):
        abort(400)

    valid, error = _verify_download_token(wallet, collection, int(token_id), ts, sig)
    if not valid:
        return jsonify({'error': error}), 403

    # Resolve file path
    if collection == 'diamond_drones':
        file_path = os.path.join(DOWNLOADS_BASE, 'diamond_drones', f'{token_id}.png')
        download_name = f'Diamond-Drone-{token_id}-4K.png'
    elif collection == 'drone_blondes':
        file_path = os.path.join(DOWNLOADS_BASE, 'drone_blondes', f'{token_id}.mp4')
        download_name = f'Drone-Blonde-{token_id}.mp4'
    elif collection == 'album':
        # Serve a zip of all album tracks
        album_dir = os.path.join(DOWNLOADS_BASE, 'album')
        if not os.path.isdir(album_dir):
            return jsonify({'error': 'Album files not found'}), 404

        mp3s = sorted([f for f in os.listdir(album_dir) if f.endswith('.mp3')])
        if not mp3s:
            return jsonify({'error': 'No album tracks found'}), 404

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
            for mp3 in mp3s:
                zf.write(os.path.join(album_dir, mp3), mp3)
        buf.seek(0)

        return send_file(
            buf,
            mimetype='application/zip',
            as_attachment=True,
            download_name='Diamond-Drones-Album-320kbps.zip',
        )
    else:
        abort(400)

    # Serve individual file
    if not os.path.isfile(file_path):
        return jsonify({'error': 'File not found. Check back after mint.'}), 404

    return send_file(
        file_path,
        as_attachment=True,
        download_name=download_name,
    )


@download_bp.route('/download/tokens', methods=['POST'])
def download_tokens():
    """Get tokens owned by wallet for download purposes (same as print/tokens)."""
    data = request.get_json()
    wallet = data.get('wallet', '').strip()
    collection = data.get('collection', '').strip()

    if not wallet or not collection:
        return jsonify({'error': 'wallet and collection required'}), 400

    if collection not in ('diamond_drones', 'drone_blondes', 'album'):
        return jsonify({'error': 'Invalid collection'}), 400

    token_ids, error = get_owned_tokens(wallet, collection)
    if error:
        return jsonify({'error': error, 'tokens': []}), 200

    return jsonify({'tokens': token_ids}), 200
