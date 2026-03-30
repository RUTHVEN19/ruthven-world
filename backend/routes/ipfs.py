import os
import json
from flask import Blueprint, request, jsonify, current_app
from models import db, Collection, NFT

ipfs_bp = Blueprint('ipfs', __name__)


@ipfs_bp.route('/collections/<int:collection_id>/upload-ipfs', methods=['POST'])
def upload_to_ipfs(collection_id):
    """Upload all NFT images and metadata to IPFS via Pinata."""
    collection = Collection.query.get_or_404(collection_id)
    nfts = NFT.query.filter_by(collection_id=collection_id)\
        .order_by(NFT.token_id).all()

    if not nfts:
        return jsonify({'error': 'No NFTs to upload'}), 400

    from services.pinata_service import pin_file, pin_json
    from services.metadata_generator import generate_metadata

    try:
        uploaded_count = 0
        total = len(nfts)

        # Upload images
        for nft in nfts:
            if nft.image_cid:
                continue  # Already uploaded

            image_path = os.path.join(
                current_app.config['UPLOAD_FOLDER'], nft.image_path
            )
            if not os.path.exists(image_path):
                continue

            image_cid = pin_file(
                image_path,
                name=f"{collection.name}-{nft.token_id}"
            )
            nft.image_cid = image_cid
            uploaded_count += 1

        db.session.commit()

        # Generate and upload metadata
        brand = collection.brand
        for nft in nfts:
            if nft.metadata_cid:
                continue

            if not nft.image_cid:
                continue

            metadata = generate_metadata(
                nft=nft,
                collection=collection,
                brand=brand,
            )
            metadata_cid = pin_json(
                metadata,
                name=f"{collection.name}-metadata-{nft.token_id}"
            )
            nft.metadata_cid = metadata_cid
            nft.is_uploaded = True

        db.session.commit()

        # Set base URI using the first metadata CID's directory
        # In a real setup, you'd upload metadata as a directory
        # For now, individual CIDs work with tokenURI returning per-token URIs
        collection.base_uri = f"ipfs://"
        db.session.commit()

        return jsonify({
            'message': f'Uploaded {uploaded_count} images to IPFS',
            'total': total,
            'uploaded': uploaded_count,
            'nfts': [n.to_dict() for n in nfts],
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ipfs_bp.route('/collections/<int:collection_id>/upload-ipfs-directory', methods=['POST'])
def upload_directory_to_ipfs(collection_id):
    """Upload all NFT metadata as a directory to IPFS (for baseURI)."""
    collection = Collection.query.get_or_404(collection_id)
    nfts = NFT.query.filter_by(collection_id=collection_id)\
        .order_by(NFT.token_id).all()

    if not nfts:
        return jsonify({'error': 'No NFTs to upload'}), 400

    from services.pinata_service import pin_directory
    from services.metadata_generator import generate_metadata

    try:
        # Create temp directory with metadata files
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            brand = collection.brand

            for nft in nfts:
                if not nft.image_cid:
                    return jsonify({
                        'error': f'NFT #{nft.token_id} image not uploaded yet'
                    }), 400

                metadata = generate_metadata(nft=nft, collection=collection, brand=brand)
                metadata_path = os.path.join(tmpdir, f"{nft.token_id}.json")
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=2)

            # Pin the directory
            dir_cid = pin_directory(tmpdir, name=f"{collection.name}-metadata")

        # Update collection with base URI
        collection.base_uri = f"ipfs://{dir_cid}/"
        db.session.commit()

        return jsonify({
            'base_uri': collection.base_uri,
            'cid': dir_cid,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
