from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from models import db, Collection

deploy_bp = Blueprint('deploy', __name__)


@deploy_bp.route('/collections/<int:collection_id>/deploy', methods=['POST'])
def deploy_contract(collection_id):
    """Deploy the NFT smart contract for a collection."""
    collection = Collection.query.get_or_404(collection_id)

    if collection.contract_address:
        return jsonify({'error': 'Contract already deployed', 'address': collection.contract_address}), 409

    if not collection.base_uri:
        return jsonify({'error': 'Upload to IPFS first (base_uri not set)'}), 400

    data = request.get_json() or {}
    network = data.get('network', collection.network)

    # Determine if this needs V2 features
    use_v2 = (
        collection.mint_mode == 'choose' or
        len(collection.price_tiers) > 0 or
        len(collection.allowlist) > 0
    )

    try:
        if use_v2:
            from services.contract_deployer import deploy_nft_contract_v2, set_price_tiers

            # Convert timestamps to unix epoch
            presale_start = int(collection.presale_start.timestamp()) if collection.presale_start else 0
            presale_end = int(collection.presale_end.timestamp()) if collection.presale_end else 0
            public_start = int(collection.public_start.timestamp()) if collection.public_start else 0

            result = deploy_nft_contract_v2(
                name=collection.name,
                symbol=data.get('symbol', collection.slug.upper()[:5]),
                max_supply=collection.max_supply,
                mint_price_wei=int(collection.mint_price_wei),
                base_uri=collection.base_uri,
                network=network,
                choose_mode=(collection.mint_mode == 'choose'),
                tiered_pricing=len(collection.price_tiers) > 0,
                merkle_root=collection.merkle_root or ('0x' + '00' * 32),
                presale_start=presale_start,
                presale_end=presale_end,
                public_start=public_start,
            )

            # Set price tiers if configured
            if collection.price_tiers:
                set_price_tiers(
                    contract_address=result['contract_address'],
                    network=network,
                    tiers=collection.price_tiers,
                )
        else:
            from services.contract_deployer import deploy_nft_contract
            result = deploy_nft_contract(
                name=collection.name,
                symbol=data.get('symbol', collection.slug.upper()[:5]),
                max_supply=collection.max_supply,
                mint_price_wei=int(collection.mint_price_wei),
                base_uri=collection.base_uri,
                network=network,
            )

        collection.contract_address = result['contract_address']
        collection.network = network
        collection.deployed_at = datetime.now(timezone.utc)
        collection.is_minting_active = True
        db.session.commit()

        return jsonify({
            'contract_address': result['contract_address'],
            'transaction_hash': result['transaction_hash'],
            'network': network,
            'version': 'v2' if use_v2 else 'v1',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@deploy_bp.route('/collections/<int:collection_id>/recall', methods=['POST'])
def recall_nfts(collection_id):
    """Trigger admin recall - transfer all NFTs back to owner wallet."""
    collection = Collection.query.get_or_404(collection_id)

    if not collection.contract_address:
        return jsonify({'error': 'Contract not deployed'}), 400

    from services.contract_deployer import recall_all_nfts
    try:
        result = recall_all_nfts(
            contract_address=collection.contract_address,
            network=collection.network,
        )

        collection.is_minting_active = False
        db.session.commit()

        return jsonify({
            'message': 'All NFTs recalled to owner wallet',
            'transaction_hash': result['transaction_hash'],
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@deploy_bp.route('/collections/<int:collection_id>/pause', methods=['POST'])
def toggle_pause(collection_id):
    """Pause or unpause minting."""
    collection = Collection.query.get_or_404(collection_id)

    if not collection.contract_address:
        return jsonify({'error': 'Contract not deployed'}), 400

    from services.contract_deployer import toggle_minting_pause
    try:
        data = request.get_json() or {}
        should_pause = data.get('pause', True)

        result = toggle_minting_pause(
            contract_address=collection.contract_address,
            network=collection.network,
            pause=should_pause,
        )

        collection.is_minting_active = not should_pause
        db.session.commit()

        return jsonify({
            'is_minting_active': collection.is_minting_active,
            'transaction_hash': result['transaction_hash'],
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@deploy_bp.route('/collections/<int:collection_id>/withdraw', methods=['POST'])
def withdraw_funds(collection_id):
    """Withdraw minting revenue from the contract."""
    collection = Collection.query.get_or_404(collection_id)

    if not collection.contract_address:
        return jsonify({'error': 'Contract not deployed'}), 400

    from services.contract_deployer import withdraw_contract_funds
    try:
        result = withdraw_contract_funds(
            contract_address=collection.contract_address,
            network=collection.network,
        )

        return jsonify({
            'message': 'Funds withdrawn',
            'transaction_hash': result['transaction_hash'],
            'amount_wei': result.get('amount_wei', '0'),
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Allowlist / Merkle Routes ──────────────────────

@deploy_bp.route('/collections/<int:collection_id>/allowlist/merkle', methods=['POST'])
def generate_merkle_root(collection_id):
    """Compute and store Merkle root from the collection's allowlist."""
    collection = Collection.query.get_or_404(collection_id)
    addresses = collection.allowlist

    if not addresses:
        return jsonify({'error': 'No addresses in allowlist'}), 400

    from services.merkle_service import compute_merkle_root
    root = compute_merkle_root(addresses)

    collection.merkle_root = root
    db.session.commit()

    return jsonify({
        'merkle_root': root,
        'address_count': len(addresses),
    })


@deploy_bp.route('/collections/<int:collection_id>/allowlist/proof/<wallet_address>', methods=['GET'])
def get_merkle_proof(collection_id, wallet_address):
    """Return the Merkle proof for a specific wallet address."""
    collection = Collection.query.get_or_404(collection_id)
    addresses = collection.allowlist

    if not addresses:
        return jsonify({'proof': [], 'is_allowlisted': False})

    from services.merkle_service import get_proof
    proof, is_allowlisted = get_proof(addresses, wallet_address)

    return jsonify({
        'proof': proof,
        'is_allowlisted': is_allowlisted,
    })
