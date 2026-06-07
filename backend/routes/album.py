"""
Album routes for THE DRONES OF SUBURBIA.

Handles track uploads, IPFS pinning, contract deployment,
token-gated downloads, and holder verification.
"""

import os
import json
import tempfile
from flask import Blueprint, request, jsonify, current_app, send_file
from eth_account.messages import encode_defunct
from web3 import Web3

album_bp = Blueprint('album', __name__)


# ─── Album Configuration ─────────────────────────────────────────────────────

ALBUM_CONFIG = {
    'contract_address': None,  # Set after deployment
    'network': 'sepolia',
    'tracks_dir': None,        # Set after upload
    'artwork_path': None,      # Set after upload
    'artwork_cid': None,
    'tracks_cids': None,
}


@album_bp.route('/album/config', methods=['GET'])
def get_album_config():
    """Get current album configuration."""
    return jsonify({
        'contract_address': ALBUM_CONFIG['contract_address'],
        'network': ALBUM_CONFIG['network'],
        'has_tracks': ALBUM_CONFIG['tracks_dir'] is not None,
        'has_artwork': ALBUM_CONFIG['artwork_path'] is not None,
        'artwork_cid': ALBUM_CONFIG['artwork_cid'],
    })


@album_bp.route('/album/config', methods=['POST'])
def set_album_config():
    """Update album configuration (contract address, network)."""
    data = request.get_json()
    if data.get('contract_address'):
        ALBUM_CONFIG['contract_address'] = data['contract_address']
    if data.get('network'):
        ALBUM_CONFIG['network'] = data['network']
    return jsonify({'ok': True, 'config': ALBUM_CONFIG})


# ─── Track Upload & IPFS ──────────────────────────────────────────────────────

@album_bp.route('/album/upload-tracks', methods=['POST'])
def upload_tracks():
    """Upload audio files and pin to IPFS.

    Expects multipart form with 'tracks' files and optional 'artwork' file.
    """
    if 'tracks' not in request.files:
        return jsonify({'error': 'No track files uploaded'}), 400

    upload_folder = current_app.config['UPLOAD_FOLDER']
    tracks_dir = os.path.join(upload_folder, 'album', 'tracks')
    os.makedirs(tracks_dir, exist_ok=True)

    # Save track files
    saved = []
    for f in request.files.getlist('tracks'):
        if f.filename:
            filepath = os.path.join(tracks_dir, f.filename)
            f.save(filepath)
            saved.append(f.filename)

    # Save artwork if provided
    artwork_path = None
    if 'artwork' in request.files:
        artwork = request.files['artwork']
        if artwork.filename:
            artwork_dir = os.path.join(upload_folder, 'album')
            artwork_path = os.path.join(artwork_dir, 'artwork' + os.path.splitext(artwork.filename)[1])
            artwork.save(artwork_path)
            ALBUM_CONFIG['artwork_path'] = artwork_path

    ALBUM_CONFIG['tracks_dir'] = tracks_dir

    return jsonify({
        'message': f'Uploaded {len(saved)} tracks',
        'tracks': saved,
        'tracks_dir': tracks_dir,
        'has_artwork': artwork_path is not None,
    })


@album_bp.route('/album/pin-ipfs', methods=['POST'])
def pin_album_ipfs():
    """Pin uploaded tracks and artwork to IPFS via Pinata."""
    if not ALBUM_CONFIG['tracks_dir']:
        return jsonify({'error': 'No tracks uploaded yet'}), 400

    from services.album_service import pin_album_to_ipfs
    from services.pinata_service import pin_file

    try:
        # Pin tracks
        result = pin_album_to_ipfs(ALBUM_CONFIG['tracks_dir'])
        ALBUM_CONFIG['tracks_cids'] = result['tracks']

        # Pin artwork
        artwork_cid = None
        if ALBUM_CONFIG.get('artwork_path') and os.path.exists(ALBUM_CONFIG['artwork_path']):
            artwork_cid = pin_file(
                ALBUM_CONFIG['artwork_path'],
                name='drones-of-suburbia-artwork'
            )
            ALBUM_CONFIG['artwork_cid'] = artwork_cid

        return jsonify({
            'directory_cid': result['directory_cid'],
            'tracks': result['tracks'],
            'artwork_cid': artwork_cid,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@album_bp.route('/album/generate-metadata', methods=['POST'])
def generate_metadata():
    """Generate and pin ERC-721 metadata for a range of token IDs.

    Input JSON: { "count": 1000, "start_from": 0 }
    """
    data = request.get_json() or {}
    count = int(data.get('count', 1000))
    start_from = int(data.get('start_from', 0))

    artwork_cid = ALBUM_CONFIG.get('artwork_cid')
    if not artwork_cid:
        return jsonify({'error': 'Artwork not pinned to IPFS yet'}), 400

    from services.album_service import generate_album_metadata, ALBUM_META
    from services.pinata_service import pin_directory

    try:
        # Build metadata JSON files in a temp directory
        with tempfile.TemporaryDirectory() as tmpdir:
            # Merge track CIDs with track info
            tracks_with_cids = None
            if ALBUM_CONFIG.get('tracks_cids'):
                tracks_with_cids = []
                for i, track in enumerate(ALBUM_META['tracks']):
                    cid = ALBUM_CONFIG['tracks_cids'][i]['cid'] if i < len(ALBUM_CONFIG['tracks_cids']) else None
                    tracks_with_cids.append({
                        'number': track['number'],
                        'title': track['title'],
                        'cid': cid,
                    })

            for token_id in range(start_from, start_from + count):
                metadata = generate_album_metadata(
                    token_id=token_id,
                    artwork_cid=artwork_cid,
                    tracks_cids=tracks_with_cids,
                )
                metadata_path = os.path.join(tmpdir, f'{token_id}.json')
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=2)

            # Pin metadata directory to IPFS
            dir_cid = pin_directory(tmpdir, name='drones-of-suburbia-metadata')

        return jsonify({
            'base_uri': f'ipfs://{dir_cid}/',
            'cid': dir_cid,
            'count': count,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Token-Gated Download ─────────────────────────────────────────────────────

@album_bp.route('/album/verify-holder', methods=['POST'])
def verify_holder():
    """Check if a wallet address holds an album token.

    Input JSON: { "wallet": "0x..." }
    """
    data = request.get_json()
    if not data or not data.get('wallet'):
        return jsonify({'error': 'wallet address required'}), 400

    contract_address = ALBUM_CONFIG.get('contract_address')
    if not contract_address:
        return jsonify({'error': 'Album contract not configured'}), 400

    from services.album_service import verify_album_holder

    try:
        is_holder = verify_album_holder(
            wallet_address=data['wallet'],
            contract_address=contract_address,
            network=ALBUM_CONFIG.get('network', 'sepolia'),
        )
        return jsonify({'is_holder': is_holder, 'wallet': data['wallet']})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@album_bp.route('/album/download', methods=['POST'])
def download_album():
    """Token-gated album download. Requires signed message proving wallet ownership.

    Input JSON: {
        "wallet": "0x...",
        "signature": "0x...",
        "message": "Download THE DRONES OF SUBURBIA album"
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    wallet = data.get('wallet')
    signature = data.get('signature')
    message = data.get('message', 'Download THE DRONES OF SUBURBIA album')

    if not wallet or not signature:
        return jsonify({'error': 'wallet and signature required'}), 400

    # Verify signature matches wallet
    try:
        w3 = Web3()
        msg = encode_defunct(text=message)
        recovered = w3.eth.account.recover_message(msg, signature=signature)
        if recovered.lower() != wallet.lower():
            return jsonify({'error': 'Signature does not match wallet'}), 403
    except Exception:
        return jsonify({'error': 'Invalid signature'}), 403

    # Verify holder
    contract_address = ALBUM_CONFIG.get('contract_address')
    if not contract_address:
        return jsonify({'error': 'Album contract not configured'}), 400

    from services.album_service import verify_album_holder

    try:
        is_holder = verify_album_holder(
            wallet_address=wallet,
            contract_address=contract_address,
            network=ALBUM_CONFIG.get('network', 'sepolia'),
        )
    except Exception as e:
        return jsonify({'error': f'On-chain verification failed: {e}'}), 500

    if not is_holder:
        return jsonify({'error': 'Wallet does not hold an album token'}), 403

    # Create and serve ZIP
    tracks_dir = ALBUM_CONFIG.get('tracks_dir')
    if not tracks_dir or not os.path.exists(tracks_dir):
        return jsonify({'error': 'Album tracks not available for download'}), 500

    from services.album_service import create_album_zip

    try:
        zip_path = create_album_zip(
            tracks_dir=tracks_dir,
            artwork_path=ALBUM_CONFIG.get('artwork_path'),
        )
        return send_file(
            zip_path,
            mimetype='application/zip',
            as_attachment=True,
            download_name='The_Drones_of_Suburbia_-_Miss_AL_Simpson.zip',
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Contract Deployment ───────────────────────────────────────────────────────

@album_bp.route('/album/deploy', methods=['POST'])
def deploy_album_contract():
    """Deploy the DiamondDronesAlbum contract.

    Input JSON: {
        "mint_price_wei": "10000000000000000",  // 0.01 ETH
        "base_uri": "ipfs://Qm.../",
        "royalty_bps": 750,                      // 7.5%
        "network": "sepolia"
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    mint_price_wei = int(data.get('mint_price_wei', 10000000000000000))  # 0.01 ETH default
    base_uri = data.get('base_uri', '')
    royalty_bps = int(data.get('royalty_bps', 750))  # 7.5% default
    network = data.get('network', 'sepolia')

    try:
        from services.contract_deployer import _get_web3, _get_account

        w3 = _get_web3(network)
        account = _get_account(w3)

        # Load compiled contract
        artifact_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'contracts', 'artifacts', 'contracts',
            'DiamondDronesAlbum.sol', 'DiamondDronesAlbum.json'
        )

        with open(artifact_path) as f:
            artifact = json.load(f)

        contract = w3.eth.contract(
            abi=artifact['abi'],
            bytecode=artifact['bytecode'],
        )

        # Build deploy transaction
        tx = contract.constructor(
            mint_price_wei,
            base_uri,
            royalty_bps,
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 3000000,
            'gasPrice': w3.eth.gas_price,
        })

        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

        contract_address = receipt.contractAddress
        ALBUM_CONFIG['contract_address'] = contract_address
        ALBUM_CONFIG['network'] = network

        return jsonify({
            'contract_address': contract_address,
            'transaction_hash': tx_hash.hex(),
            'network': network,
            'mint_price_wei': mint_price_wei,
            'royalty_bps': royalty_bps,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@album_bp.route('/album/airdrop-ce', methods=['POST'])
def airdrop_ce_holders():
    """Batch mint album tokens to Collectors Edition holders.

    Input JSON: { "recipients": ["0x...", "0x...", ...] }
    """
    data = request.get_json()
    if not data or not data.get('recipients'):
        return jsonify({'error': 'recipients array required'}), 400

    contract_address = ALBUM_CONFIG.get('contract_address')
    if not contract_address:
        return jsonify({'error': 'Album contract not deployed yet'}), 400

    network = ALBUM_CONFIG.get('network', 'sepolia')

    try:
        from services.contract_deployer import _get_web3, _get_account

        w3 = _get_web3(network)
        account = _get_account(w3)

        # Load ABI
        artifact_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'contracts', 'artifacts', 'contracts',
            'DiamondDronesAlbum.sol', 'DiamondDronesAlbum.json'
        )
        with open(artifact_path) as f:
            artifact = json.load(f)

        contract = w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=artifact['abi'],
        )

        recipients = [Web3.to_checksum_address(r) for r in data['recipients']]

        tx = contract.functions.ownerMintBatch(recipients).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 50000 + (80000 * len(recipients)),  # ~80k gas per mint
            'gasPrice': w3.eth.gas_price,
        })

        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

        return jsonify({
            'transaction_hash': tx_hash.hex(),
            'recipients': len(recipients),
            'status': 'success' if receipt.status == 1 else 'failed',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
