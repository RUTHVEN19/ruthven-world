import os
import re
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, Collection, Brand, NFT

collections_bp = Blueprint('collections', __name__)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return re.sub(r'-+', '-', text)


@collections_bp.route('/brands/<int:brand_id>/collections', methods=['GET'])
def get_collections(brand_id):
    Brand.query.get_or_404(brand_id)
    collections = Collection.query.filter_by(brand_id=brand_id)\
        .order_by(Collection.created_at.desc()).all()
    return jsonify([c.to_dict() for c in collections])


@collections_bp.route('/collections/<int:collection_id>', methods=['GET'])
def get_collection(collection_id):
    collection = Collection.query.get_or_404(collection_id)
    return jsonify(collection.to_dict(include_brand=True))


@collections_bp.route('/collections', methods=['POST'])
def create_collection():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('brand_id'):
        return jsonify({'error': 'Name and brand_id are required'}), 400

    Brand.query.get_or_404(data['brand_id'])
    slug = slugify(data['name'])

    # Convert ETH to Wei if provided as ETH
    mint_price_wei = data.get('mint_price_wei', '0')
    if 'mint_price_eth' in data:
        mint_price_wei = str(int(float(data['mint_price_eth']) * 1e18))

    # Validate mint_mode
    mint_mode = data.get('mint_mode', 'blind')
    if mint_mode not in ('blind', 'choose'):
        return jsonify({'error': 'mint_mode must be "blind" or "choose"'}), 400
    max_supply = data.get('max_supply', 100)
    if mint_mode == 'choose' and max_supply > 500:
        return jsonify({'error': 'Choose mode limited to max 500 supply'}), 400

    collection = Collection(
        brand_id=data['brand_id'],
        name=data['name'],
        slug=slug,
        description=data.get('description', ''),
        max_supply=max_supply,
        mint_price_wei=mint_price_wei,
        network=data.get('network', 'sepolia'),
        mint_mode=mint_mode,
    )
    db.session.add(collection)
    db.session.commit()
    return jsonify(collection.to_dict()), 201


@collections_bp.route('/collections/<int:collection_id>', methods=['PUT'])
def update_collection(collection_id):
    collection = Collection.query.get_or_404(collection_id)
    data = request.get_json()

    if 'name' in data:
        collection.name = data['name']
        collection.slug = slugify(data['name'])
    if 'description' in data:
        collection.description = data['description']
    if 'max_supply' in data:
        collection.max_supply = data['max_supply']
    if 'mint_price_wei' in data:
        collection.mint_price_wei = data['mint_price_wei']
    if 'mint_price_eth' in data:
        collection.mint_price_wei = str(int(float(data['mint_price_eth']) * 1e18))
    if 'network' in data:
        collection.network = data['network']

    # Advanced minting features
    if 'mint_mode' in data:
        if data['mint_mode'] not in ('blind', 'choose'):
            return jsonify({'error': 'mint_mode must be "blind" or "choose"'}), 400
        if data['mint_mode'] == 'choose' and collection.max_supply > 500:
            return jsonify({'error': 'Choose mode limited to max 500 supply'}), 400
        collection.mint_mode = data['mint_mode']
    if 'price_tiers' in data:
        collection.price_tiers = data['price_tiers']
    if 'allowlist' in data:
        collection.allowlist = data['allowlist']
    if 'presale_start' in data:
        collection.presale_start = datetime.fromisoformat(data['presale_start']) if data['presale_start'] else None
    if 'presale_end' in data:
        collection.presale_end = datetime.fromisoformat(data['presale_end']) if data['presale_end'] else None
    if 'public_start' in data:
        collection.public_start = datetime.fromisoformat(data['public_start']) if data['public_start'] else None
    if 'max_presale_per_wallet' in data:
        collection.max_presale_per_wallet = data['max_presale_per_wallet']

    db.session.commit()
    return jsonify(collection.to_dict())


@collections_bp.route('/collections/<int:collection_id>', methods=['DELETE'])
def delete_collection(collection_id):
    collection = Collection.query.get_or_404(collection_id)
    db.session.delete(collection)
    db.session.commit()
    return jsonify({'message': 'Collection deleted'}), 200


@collections_bp.route('/collections/<int:collection_id>/stats', methods=['GET'])
def get_collection_stats(collection_id):
    collection = Collection.query.get_or_404(collection_id)
    return jsonify({
        'id': collection.id,
        'name': collection.name,
        'max_supply': collection.max_supply,
        'nft_count': collection.nfts.count(),
        'uploaded_count': collection.nfts.filter_by(is_uploaded=True).count(),
        'is_minting_active': collection.is_minting_active,
        'contract_address': collection.contract_address,
        'mint_price_wei': collection.mint_price_wei,
        'mint_price_eth': str(int(collection.mint_price_wei) / 1e18) if collection.mint_price_wei else '0',
    })


# Public endpoint for mint page
@collections_bp.route('/mint/<brand_slug>/<collection_slug>', methods=['GET'])
def get_mint_data(brand_slug, collection_slug):
    brand = Brand.query.filter_by(slug=brand_slug).first_or_404()
    collection = Collection.query.filter_by(
        brand_id=brand.id, slug=collection_slug
    ).first_or_404()

    # For choose mode, return ALL NFTs so collectors can browse
    # For blind mode, return a sample for preview
    # Show NFTs that have either an IPFS CID or a local image path
    has_image = db.or_(NFT.image_cid.isnot(None), NFT.image_path.isnot(None))
    if collection.mint_mode == 'choose':
        nfts = collection.nfts.filter(has_image).all()
    else:
        nfts = collection.nfts.filter(has_image).limit(12).all()

    # Compute current mint phase
    now = datetime.utcnow()
    if collection.presale_start and now < collection.presale_start:
        mint_phase = 'not_started'
    elif collection.presale_start and collection.presale_end and \
         now >= collection.presale_start and now < collection.presale_end:
        mint_phase = 'presale'
    elif collection.public_start and now >= collection.public_start:
        mint_phase = 'public'
    elif not collection.presale_start and not collection.public_start:
        mint_phase = 'public'  # no windows set = open
    else:
        mint_phase = 'between'  # between presale end and public start

    return jsonify({
        'collection': collection.to_dict(),
        'brand': brand.to_dict(),
        'nfts': [n.to_dict() for n in nfts],
        'mint_phase': mint_phase,
    })


# ── ERC-721 tokenURI endpoint ─────────────────────────────────────────────────
# The contract's BASE_URI points here: /api/nfts/metadata/<token_id>
# Returns OpenSea-compatible JSON so wallets + marketplaces can read the NFT.
@collections_bp.route('/nfts/metadata/<int:token_id>', methods=['GET'])
def get_token_metadata(token_id):
    """ERC-721 tokenURI endpoint for FIRST LIGHT (collection id=3)."""
    nft = NFT.query.filter_by(collection_id=3, token_id=token_id).first_or_404()

    image_url = (
        f"ipfs://{nft.image_cid}"
        if nft.image_cid
        else f"https://ruthven-api.railway.app/uploads/{nft.image_path}"
        if nft.image_path
        else ""
    )

    # Build OpenSea-compatible attributes from traits JSON
    raw_traits = nft.traits  # list of dicts with 'trait_type' and 'value'
    attributes = [
        {"trait_type": t.get("trait_type", t.get("name", "")), "value": t.get("value", "")}
        for t in raw_traits
        if t.get("value")
    ]

    metadata = {
        "name": nft.name,
        "description": (
            "RUTHVEN: FIRST LIGHT — 25 original oil paintings by Ruthven, "
            "trained into AI and minted as 1/1 NFTs on Ethereum."
        ),
        "image": image_url,
        "external_url": "https://ruthven.world",
        "attributes": attributes,
    }

    response = jsonify(metadata)
    # Allow any origin so OpenSea / wallets can fetch without CORS issues
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@collections_bp.route('/api/collections/<int:collection_id>/video', methods=['POST'])
def upload_video(collection_id):
    collection = Collection.query.get_or_404(collection_id)

    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video = request.files['video']
    if not video.filename:
        return jsonify({'error': 'No file selected'}), 400

    ext = os.path.splitext(video.filename)[1].lower()
    if ext not in ('.mp4', '.webm', '.mov'):
        return jsonify({'error': 'Unsupported format. Use MP4, WebM, or MOV'}), 400

    filename = f"{collection.slug}_{uuid.uuid4().hex[:8]}{ext}"
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'videos')
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, filename)
    video.save(filepath)

    collection.video_path = f"videos/{filename}"
    db.session.commit()

    return jsonify({
        'video_url': f"/uploads/videos/{filename}",
        'message': 'Video uploaded successfully'
    })
