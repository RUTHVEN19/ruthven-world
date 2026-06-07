"""
Flask routes for the Diamond Drone 3D pipeline.

To register, add to backend/app.py:

    from routes.three_d import three_d_bp
    app.register_blueprint(three_d_bp, url_prefix='/api')

Endpoints:
    POST /api/3d/generate
        Run full 2D→3D pipeline on a single uploaded drone PNG.
        Body: { "image_path": "...", "traits": {...} }

    POST /api/3d/batch
        Run pipeline over a master_metadata.json from genesis full batch.
        Body: { "metadata_path": "...", "limit": int (optional) }

    GET /api/3d/status/<drone_id>
        Check if a specific drone has been processed.

    GET /api/3d/list
        List all completed 3D drones with their output URLs.
"""

import json
import os
from flask import Blueprint, jsonify, request, current_app

from services import three_d_pipeline


three_d_bp = Blueprint('three_d', __name__)


@three_d_bp.route('/3d/generate', methods=['POST'])
def generate_3d():
    """Run the full 2D→3D pipeline on a single drone image."""
    data = request.get_json(force=True)
    image_path = data.get('image_path')
    traits = data.get('traits', {})

    if not image_path:
        return jsonify({'error': 'image_path required'}), 400

    abs_path = (
        image_path if os.path.isabs(image_path)
        else os.path.join(current_app.config['UPLOAD_FOLDER'], image_path)
    )

    if not os.path.exists(abs_path):
        return jsonify({'error': f'image not found: {abs_path}'}), 404

    try:
        result = three_d_pipeline.process_drone(
            input_image_path=abs_path,
            traits=traits,
            render_mp4=data.get('render_mp4', True),
            render_hero=data.get('render_hero', True),
        )
        return jsonify({
            'status': 'completed',
            'polished_glb': _rel(result['polished_glb']),
            'turntable_mp4': _rel(result.get('turntable_mp4')),
            'hero_png': _rel(result.get('hero_png')),
            'timings': result['timings'],
        })
    except Exception as e:
        return jsonify({'status': 'failed', 'error': str(e)}), 500


@three_d_bp.route('/3d/batch', methods=['POST'])
def batch_3d():
    """Run pipeline over a genesis collection's master metadata."""
    data = request.get_json(force=True)
    metadata_path = data.get('metadata_path')
    limit = data.get('limit')

    if not metadata_path:
        return jsonify({'error': 'metadata_path required'}), 400

    if not os.path.isabs(metadata_path):
        metadata_path = os.path.join(
            current_app.config['UPLOAD_FOLDER'], metadata_path
        )

    if not os.path.exists(metadata_path):
        return jsonify({'error': f'metadata not found: {metadata_path}'}), 404

    try:
        results = three_d_pipeline.process_collection(
            metadata_path=metadata_path,
            limit=limit,
        )
        return jsonify({
            'status': 'completed',
            'processed': len(results),
            'results': [
                {
                    'id': r.get('id'),
                    'error': r.get('error'),
                    'polished_glb': _rel(r.get('polished_glb')),
                }
                for r in results
            ],
        })
    except Exception as e:
        return jsonify({'status': 'failed', 'error': str(e)}), 500


@three_d_bp.route('/3d/status/<int:drone_id>', methods=['GET'])
def status_3d(drone_id):
    """Check if a specific drone has been processed."""
    marker = os.path.join(
        current_app.config['UPLOAD_FOLDER'],
        '3d_outputs', 'completed',
        f"{drone_id:04d}.json"
    )
    if not os.path.exists(marker):
        return jsonify({'id': drone_id, 'status': 'not_processed'})

    with open(marker) as f:
        return jsonify(json.load(f))


@three_d_bp.route('/3d/list', methods=['GET'])
def list_3d():
    """List all completed 3D drones."""
    completed_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], '3d_outputs', 'completed'
    )
    if not os.path.exists(completed_dir):
        return jsonify({'completed': [], 'count': 0})

    entries = []
    for fn in sorted(os.listdir(completed_dir)):
        if fn.endswith('.json'):
            with open(os.path.join(completed_dir, fn)) as f:
                entries.append(json.load(f))
    return jsonify({'completed': entries, 'count': len(entries)})


def _rel(abs_path):
    """Convert absolute path to served URL."""
    if not abs_path:
        return None
    upload_root = current_app.config['UPLOAD_FOLDER']
    if abs_path.startswith(upload_root):
        rel = os.path.relpath(abs_path, upload_root)
        return f"/uploads/{rel}"
    return abs_path
