"""
Routes for Kling AI video generation — image-to-video for NFT animations.
Supports single NFT, batch, and task status polling.
"""
import json
from flask import Blueprint, request, jsonify
from models import db, Collection, NFT

video_gen_bp = Blueprint('video_generate', __name__)


@video_gen_bp.route('/generate/video', methods=['POST'])
def generate_single_video():
    """Generate a video animation for a single NFT.

    Body JSON:
        nft_id: int — the NFT to animate
        prompt: str — motion/animation prompt
        duration: "5" or "10" (default "5")
        mode: "std" or "pro" (default "std")
        model: str (default "kling-v3")
    """
    data = request.get_json()
    if not data or not data.get('nft_id'):
        return jsonify({'error': 'nft_id is required'}), 400

    nft = NFT.query.get_or_404(data['nft_id'])
    prompt = data.get('prompt', 'subtle cinematic motion, gentle ambient movement')

    from services.kling_service import generate_video_for_nft

    try:
        result = generate_video_for_nft(
            nft,
            prompt=prompt,
            duration=data.get('duration', '5'),
            mode=data.get('mode', 'std'),
            model=data.get('model', 'kling-v3'),
        )

        # Update NFT record
        nft.video_path = result['video_path']
        db.session.commit()

        return jsonify({
            'nft_id': nft.id,
            'token_id': nft.token_id,
            'video_path': result['video_path'],
            'video_url': result['video_url'],
            'task_id': result['task_id'],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@video_gen_bp.route('/generate/video/submit', methods=['POST'])
def submit_video_task():
    """Submit a video generation task without waiting (async).

    Returns task_id immediately for polling.
    """
    data = request.get_json()
    if not data or not data.get('nft_id'):
        return jsonify({'error': 'nft_id is required'}), 400

    nft = NFT.query.get_or_404(data['nft_id'])
    if not nft.image_path:
        return jsonify({'error': f'NFT #{nft.token_id} has no image'}), 400

    prompt = data.get('prompt', 'subtle cinematic motion, gentle ambient movement')

    from services.kling_service import submit_image_to_video

    try:
        result = submit_image_to_video(
            nft.image_path,
            prompt=prompt,
            duration=data.get('duration', '5'),
            mode=data.get('mode', 'std'),
            model=data.get('model', 'kling-v3'),
        )
        return jsonify({
            'nft_id': nft.id,
            'token_id': nft.token_id,
            'task_id': result['task_id'],
            'task_status': result['task_status'],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@video_gen_bp.route('/generate/video/status/<task_id>', methods=['GET'])
def check_video_status(task_id):
    """Check the status of a Kling video generation task."""
    from services.kling_service import poll_task

    try:
        # Single poll (no waiting)
        result = poll_task(task_id, timeout=1, interval=1)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@video_gen_bp.route('/generate/video/complete', methods=['POST'])
def complete_video_task():
    """Download a completed video and save it to the NFT.

    Body JSON:
        nft_id: int
        task_id: str
        video_url: str — the Kling CDN URL
    """
    data = request.get_json()
    nft = NFT.query.get_or_404(data['nft_id'])

    from services.kling_service import download_video

    try:
        video_path = download_video(
            data['video_url'], nft.collection_id, nft.token_id
        )
        nft.video_path = video_path
        db.session.commit()

        return jsonify({
            'nft_id': nft.id,
            'video_path': video_path,
            'video_url': f"/uploads/{video_path}",
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@video_gen_bp.route('/generate/video/batch', methods=['POST'])
def batch_generate_videos():
    """Submit batch video generation for multiple NFTs.

    Body JSON:
        collection_id: int
        prompt: str — motion prompt (applied to all)
        nft_ids: list[int] — optional, specific NFTs. If omitted, all NFTs without videos.
        duration: "5" or "10"
        mode: "std" or "pro"
        model: str

    Returns list of submitted task_ids for frontend polling.
    """
    data = request.get_json()
    if not data or not data.get('collection_id'):
        return jsonify({'error': 'collection_id is required'}), 400

    collection = Collection.query.get_or_404(data['collection_id'])
    prompt = data.get('prompt', 'subtle cinematic motion, gentle ambient movement')
    duration = data.get('duration', '5')
    mode = data.get('mode', 'std')
    model = data.get('model', 'kling-v3')

    # Get NFTs to process
    if data.get('nft_ids'):
        nfts = NFT.query.filter(
            NFT.id.in_(data['nft_ids']),
            NFT.collection_id == collection.id,
        ).all()
    else:
        # All NFTs without videos
        nfts = NFT.query.filter_by(collection_id=collection.id)\
            .filter(NFT.video_path.is_(None))\
            .filter(NFT.image_path.isnot(None))\
            .order_by(NFT.token_id).all()

    if not nfts:
        return jsonify({'error': 'No eligible NFTs found (need images, no existing videos)'}), 400

    from services.kling_service import submit_image_to_video

    submitted = []
    errors = []

    for nft in nfts:
        try:
            result = submit_image_to_video(
                nft.image_path,
                prompt=prompt,
                duration=duration,
                mode=mode,
                model=model,
            )
            submitted.append({
                'nft_id': nft.id,
                'token_id': nft.token_id,
                'task_id': result['task_id'],
                'task_status': result['task_status'],
            })
        except Exception as e:
            errors.append({
                'nft_id': nft.id,
                'token_id': nft.token_id,
                'error': str(e),
            })

    return jsonify({
        'submitted': submitted,
        'errors': errors,
        'total_submitted': len(submitted),
        'total_errors': len(errors),
    })
