import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models import db, Collection, NFT, TraitCategory, TraitValue

generate_bp = Blueprint('generate', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@generate_bp.route('/generate/fal', methods=['POST'])
def generate_fal():
    """Generate an image using FAL AI."""
    data = request.get_json()
    if not data or not data.get('prompt'):
        return jsonify({'error': 'Prompt is required'}), 400

    collection_id = data.get('collection_id')
    model_id = data.get('model_id', '')

    from services.fal_service import generate_image
    try:
        result = generate_image(
            model_id=model_id,
            prompt=data['prompt'],
            negative_prompt=data.get('negative_prompt', ''),
            width=data.get('width', 1024),
            height=data.get('height', 1024),
            loras=data.get('loras'),
            guidance_scale=data.get('guidance_scale', 3.5),
            num_inference_steps=data.get('num_inference_steps', 28),
            num_images=data.get('num_images', 1),
            seed=data.get('seed'),
        )
        return jsonify({
            'images': result['images'],
            # Backwards compatibility
            'image_path': result['image_path'],
            'image_url': f"/uploads/{result['image_path']}" if result['image_path'] else None,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@generate_bp.route('/generate/upload', methods=['POST'])
def upload_image():
    """Upload an image (from Midjourney, drawings, etc)."""
    if 'image' not in request.files:
        return jsonify({'error': 'Image file is required'}), 400

    file = request.files['image']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    collection_id = request.form.get('collection_id')
    save_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'sources')
    if collection_id:
        save_dir = os.path.join(save_dir, str(collection_id))
    os.makedirs(save_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(save_dir, filename)
    file.save(filepath)

    rel_path = os.path.relpath(filepath, current_app.config['UPLOAD_FOLDER'])
    return jsonify({
        'image_path': rel_path,
        'image_url': f"/uploads/{rel_path}",
    }), 201


@generate_bp.route('/generate/compose', methods=['POST'])
def compose_nft():
    """Compose a single NFT from selected trait layers."""
    data = request.get_json()
    if not data or not data.get('collection_id') or not data.get('trait_selections'):
        return jsonify({'error': 'collection_id and trait_selections required'}), 400

    collection = Collection.query.get_or_404(data['collection_id'])

    # trait_selections is a list of {category_id, value_id}
    selections = data['trait_selections']

    from services.image_composer import compose_layers
    try:
        layer_paths = []
        traits = []
        for sel in selections:
            tv = TraitValue.query.get_or_404(sel['value_id'])
            full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], tv.image_path)
            layer_paths.append(full_path)
            traits.append({
                'trait_type': tv.category.name,
                'value': tv.value,
            })

        # Compose the image
        output_dir = os.path.join(
            current_app.config['UPLOAD_FOLDER'], 'generated', str(collection.id)
        )
        os.makedirs(output_dir, exist_ok=True)

        token_id = collection.nfts.count()
        output_filename = f"{token_id}.png"
        output_path = os.path.join(output_dir, output_filename)

        compose_layers(layer_paths, output_path)

        rel_path = os.path.join('generated', str(collection.id), output_filename)

        # Save NFT record
        nft = NFT(
            collection_id=collection.id,
            token_id=token_id,
            name=f"{collection.name} #{token_id}",
            image_path=rel_path,
            traits_json='[]',
        )
        nft.traits = traits
        db.session.add(nft)
        db.session.commit()

        return jsonify({
            'nft': nft.to_dict(),
            'image_url': f"/uploads/{rel_path}",
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@generate_bp.route('/generate/bulk', methods=['POST'])
def bulk_generate():
    """Bulk generate unique NFTs from trait combinations."""
    data = request.get_json()
    if not data or not data.get('collection_id') or not data.get('count'):
        return jsonify({'error': 'collection_id and count required'}), 400

    collection = Collection.query.get_or_404(data['collection_id'])
    count = min(int(data['count']), collection.max_supply)

    from services.image_composer import compose_layers, generate_unique_combinations

    categories = TraitCategory.query.filter_by(collection_id=collection.id)\
        .order_by(TraitCategory.display_order).all()

    if not categories:
        return jsonify({'error': 'No trait categories defined'}), 400

    # Build category data for combination generator
    category_data = []
    for cat in categories:
        values = TraitValue.query.filter_by(trait_category_id=cat.id).all()
        if not values:
            return jsonify({'error': f'Category "{cat.name}" has no values'}), 400
        category_data.append({
            'category': cat,
            'values': values,
        })

    try:
        combinations = generate_unique_combinations(category_data, count)

        output_dir = os.path.join(
            current_app.config['UPLOAD_FOLDER'], 'generated', str(collection.id)
        )
        os.makedirs(output_dir, exist_ok=True)

        generated_nfts = []
        start_token_id = collection.nfts.count()

        for i, combo in enumerate(combinations):
            token_id = start_token_id + i
            layer_paths = []
            traits = []

            for trait_value in combo:
                full_path = os.path.join(
                    current_app.config['UPLOAD_FOLDER'], trait_value.image_path
                )
                layer_paths.append(full_path)
                traits.append({
                    'trait_type': trait_value.category.name,
                    'value': trait_value.value,
                })

            output_filename = f"{token_id}.png"
            output_path = os.path.join(output_dir, output_filename)
            compose_layers(layer_paths, output_path)

            rel_path = os.path.join('generated', str(collection.id), output_filename)

            nft = NFT(
                collection_id=collection.id,
                token_id=token_id,
                name=f"{collection.name} #{token_id}",
                image_path=rel_path,
                traits_json='[]',
            )
            nft.traits = traits
            db.session.add(nft)
            generated_nfts.append(nft)

        db.session.commit()
        return jsonify({
            'count': len(generated_nfts),
            'nfts': [n.to_dict() for n in generated_nfts],
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@generate_bp.route('/generate/upload-direct', methods=['POST'])
def upload_direct_nft():
    """Upload a complete NFT image directly (no layer composition)."""
    if 'image' not in request.files:
        return jsonify({'error': 'Image file is required'}), 400

    collection_id = request.form.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'collection_id is required'}), 400

    collection = Collection.query.get_or_404(int(collection_id))

    file = request.files['image']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    output_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], 'generated', str(collection.id)
    )
    os.makedirs(output_dir, exist_ok=True)

    token_id = collection.nfts.count()
    ext = file.filename.rsplit('.', 1)[1].lower()
    output_filename = f"{token_id}.{ext}"
    output_path = os.path.join(output_dir, output_filename)
    file.save(output_path)

    rel_path = os.path.join('generated', str(collection.id), output_filename)

    # Parse traits from form data if provided
    import json
    traits = json.loads(request.form.get('traits', '[]'))

    nft = NFT(
        collection_id=collection.id,
        token_id=token_id,
        name=request.form.get('name', f"{collection.name} #{token_id}"),
        image_path=rel_path,
        traits_json='[]',
    )
    nft.traits = traits
    db.session.add(nft)
    db.session.commit()

    return jsonify({
        'nft': nft.to_dict(),
        'image_url': f"/uploads/{rel_path}",
    }), 201


@generate_bp.route('/generate/composite', methods=['POST'])
def composite_layers():
    """Composite uploaded drawing layers onto a base image (FAL-generated or uploaded)."""
    if 'base_image' not in request.form and 'base_image' not in request.files:
        return jsonify({'error': 'base_image path or file is required'}), 400

    collection_id = request.form.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'collection_id is required'}), 400

    collection = Collection.query.get_or_404(int(collection_id))

    from services.image_composer import compose_layers

    upload_folder = current_app.config['UPLOAD_FOLDER']
    layer_paths = []

    # Get the base image path
    base_image_path = request.form.get('base_image')
    if base_image_path:
        full_base = os.path.join(upload_folder, base_image_path)
        if not os.path.exists(full_base):
            return jsonify({'error': f'Base image not found: {base_image_path}'}), 404
        layer_paths.append(full_base)
    elif 'base_file' in request.files:
        file = request.files['base_file']
        save_dir = os.path.join(upload_folder, 'sources')
        os.makedirs(save_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
        filepath = os.path.join(save_dir, filename)
        file.save(filepath)
        layer_paths.append(filepath)

    # Get overlay layer files (uploaded drawings/textures)
    overlay_files = request.files.getlist('layers')
    for file in overlay_files:
        if file.filename and allowed_file(file.filename):
            save_dir = os.path.join(upload_folder, 'sources', 'layers')
            os.makedirs(save_dir, exist_ok=True)
            filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            filepath = os.path.join(save_dir, filename)
            file.save(filepath)
            layer_paths.append(filepath)

    # Also accept layer paths for already-uploaded layers
    import json
    layer_path_list = json.loads(request.form.get('layer_paths', '[]'))
    for lp in layer_path_list:
        full_path = os.path.join(upload_folder, lp)
        if os.path.exists(full_path):
            layer_paths.append(full_path)

    if len(layer_paths) < 2:
        return jsonify({'error': 'Need at least a base image and one overlay layer'}), 400

    try:
        output_dir = os.path.join(upload_folder, 'generated', str(collection.id))
        os.makedirs(output_dir, exist_ok=True)

        token_id = collection.nfts.count()
        output_filename = f"{token_id}.png"
        output_path = os.path.join(output_dir, output_filename)

        compose_layers(layer_paths, output_path)

        rel_path = os.path.join('generated', str(collection.id), output_filename)

        traits = json.loads(request.form.get('traits', '[]'))

        nft = NFT(
            collection_id=collection.id,
            token_id=token_id,
            name=request.form.get('name', f"{collection.name} #{token_id}"),
            image_path=rel_path,
            traits_json='[]',
        )
        nft.traits = traits
        db.session.add(nft)
        db.session.commit()

        return jsonify({
            'nft': nft.to_dict(),
            'image_url': f"/uploads/{rel_path}",
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@generate_bp.route('/generate/bulk-composite', methods=['POST'])
def bulk_composite():
    """Bulk composite: apply layer files across base images to create many NFTs.

    Modes:
      - 'each': Apply every layer to every base (bases × layers NFTs)
      - 'random': Randomly combine layers with bases for N outputs
    """
    collection_id = request.form.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'collection_id is required'}), 400

    collection = Collection.query.get_or_404(int(collection_id))

    import json
    from services.image_composer import compose_layers
    import random as rand

    upload_folder = current_app.config['UPLOAD_FOLDER']

    # Get base image paths (JSON array of relative paths)
    base_paths = json.loads(request.form.get('base_paths', '[]'))
    if not base_paths:
        return jsonify({'error': 'At least one base image is required'}), 400

    # Get layer files from upload
    layer_files = request.files.getlist('layers')
    # Also accept already-uploaded layer paths
    layer_paths_existing = json.loads(request.form.get('layer_paths', '[]'))

    # Save uploaded layer files
    saved_layer_paths = []
    save_dir = os.path.join(upload_folder, 'sources', 'layers')
    os.makedirs(save_dir, exist_ok=True)

    for file in layer_files:
        if file.filename and allowed_file(file.filename):
            filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            filepath = os.path.join(save_dir, filename)
            file.save(filepath)
            saved_layer_paths.append(filepath)

    for lp in layer_paths_existing:
        full_path = os.path.join(upload_folder, lp)
        if os.path.exists(full_path):
            saved_layer_paths.append(full_path)

    if not saved_layer_paths:
        return jsonify({'error': 'At least one layer is required'}), 400

    mode = request.form.get('mode', 'each')  # 'each' or 'random'
    count = int(request.form.get('count', 0))  # for 'random' mode

    try:
        output_dir = os.path.join(upload_folder, 'generated', str(collection.id))
        os.makedirs(output_dir, exist_ok=True)

        generated_nfts = []
        start_token_id = collection.nfts.count()

        if mode == 'each':
            # Every base × every layer
            pairs = []
            for bp in base_paths:
                for lp in saved_layer_paths:
                    pairs.append((bp, lp))
        else:
            # Random combinations
            if count <= 0:
                count = len(base_paths) * len(saved_layer_paths)
            pairs = []
            for _ in range(count):
                bp = rand.choice(base_paths)
                lp = rand.choice(saved_layer_paths)
                pairs.append((bp, lp))

        for i, (base_rel, layer_abs) in enumerate(pairs):
            token_id = start_token_id + i
            base_full = os.path.join(upload_folder, base_rel)
            if not os.path.exists(base_full):
                continue

            output_filename = f"{token_id}.png"
            output_path = os.path.join(output_dir, output_filename)
            compose_layers([base_full, layer_abs], output_path)

            rel_path = os.path.join('generated', str(collection.id), output_filename)

            nft = NFT(
                collection_id=collection.id,
                token_id=token_id,
                name=f"{collection.name} #{token_id}",
                image_path=rel_path,
                traits_json='[]',
            )
            db.session.add(nft)
            generated_nfts.append(nft)

        db.session.commit()
        return jsonify({
            'count': len(generated_nfts),
            'nfts': [n.to_dict() for n in generated_nfts],
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Highland weather effect traits for Ruthven collections
WEATHER_EFFECTS = [
    {'trait_type': 'Weather', 'value': 'Dawn Glow', 'effect': 'dawn-glow'},
    {'trait_type': 'Weather', 'value': 'Highland Mist', 'effect': 'highland-mist'},
    {'trait_type': 'Weather', 'value': 'Storm Front', 'effect': 'storm-front'},
    {'trait_type': 'Weather', 'value': 'Northern Light', 'effect': 'northern-light'},
    {'trait_type': 'Weather', 'value': 'Haar', 'effect': 'haar'},
    {'trait_type': 'Weather', 'value': 'Golden Hour', 'effect': 'golden-hour'},
    {'trait_type': 'Weather', 'value': 'Gloaming', 'effect': 'gloaming'},
    {'trait_type': 'Weather', 'value': 'Snow Squall', 'effect': 'snow-squall'},
]

HIGHLAND_LOCATIONS = [
    'Glencoe', 'Isle of Skye', 'Ben Nevis', 'Cairngorms', 'Torridon',
    'Rannoch Moor', 'Loch Lomond', 'Glen Affric', 'Kintail', 'Applecross',
    'Assynt', 'Caithness', 'Sutherland', 'Wester Ross', 'Glen Coe',
    'Loch Ness', 'Fort William', 'Inverness', 'Pitlochry', 'Oban',
    'Mull', 'Harris', 'Lewis', 'Orkney', 'Shetland',
]

TIMES_OF_DAY = [
    'Before Dawn', 'First Light', 'Morning', 'Midday',
    'Afternoon', 'Golden Hour', 'Gloaming', 'Night',
]


def _assign_weather_traits(token_id):
    """Assign deterministic weather traits based on token ID."""
    import random
    rng = random.Random(token_id * 7919)  # deterministic seed per token
    weather = rng.choice(WEATHER_EFFECTS)
    location = HIGHLAND_LOCATIONS[token_id % len(HIGHLAND_LOCATIONS)]
    time = rng.choice(TIMES_OF_DAY)
    return [
        {'trait_type': 'Weather', 'value': weather['value']},
        {'trait_type': 'Effect', 'value': weather['effect']},
        {'trait_type': 'Location', 'value': location},
        {'trait_type': 'Time', 'value': time},
    ]


@generate_bp.route('/generate/bulk-upload', methods=['POST'])
def bulk_upload_nfts():
    """Bulk upload multiple NFT files (images and/or videos) at once."""
    collection_id = request.form.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'collection_id is required'}), 400

    collection = Collection.query.get_or_404(int(collection_id))
    brand = collection.brand

    files = request.files.getlist('files')
    if not files:
        return jsonify({'error': 'No files provided'}), 400

    import json
    names_json = request.form.get('names', '[]')
    names = json.loads(names_json)

    locations_json = request.form.get('locations', '[]')
    custom_locations = json.loads(locations_json)

    weather_json = request.form.get('weather_effects', '[]')
    custom_weather = json.loads(weather_json)

    # Check if auto-traits should be assigned (Ruthven brand)
    auto_traits = request.form.get('auto_traits', 'true').lower() == 'true'
    is_ruthven = brand and brand.slug == 'ruthven'

    output_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], 'generated', str(collection.id)
    )
    os.makedirs(output_dir, exist_ok=True)

    video_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], 'videos', str(collection.id)
    )
    os.makedirs(video_dir, exist_ok=True)

    generated_nfts = []
    start_token_id = collection.nfts.count()

    for i, file in enumerate(files):
        if not file.filename:
            continue

        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        is_video = ext in ALLOWED_VIDEO_EXTENSIONS
        is_image = ext in ALLOWED_EXTENSIONS

        if not is_video and not is_image:
            continue

        token_id = start_token_id + len(generated_nfts)
        custom_name = names[i] if i < len(names) and names[i] else f"{collection.name} #{token_id}"

        # Build traits — use custom values if provided, else auto-assign for Ruthven
        traits = []
        if is_ruthven:
            auto = _assign_weather_traits(token_id)

            # Override location if user provided one
            custom_loc = custom_locations[i] if i < len(custom_locations) and custom_locations[i] else None
            if custom_loc:
                for t in auto:
                    if t['trait_type'] == 'Location':
                        t['value'] = custom_loc

            # Override weather if user provided one
            custom_w = custom_weather[i] if i < len(custom_weather) and custom_weather[i] else None
            if custom_w:
                effect_map = {
                    'Dawn Glow': 'dawn-glow', 'Highland Mist': 'highland-mist',
                    'Storm Front': 'storm-front', 'Northern Light': 'northern-light',
                    'Haar': 'haar', 'Golden Hour': 'golden-hour',
                    'Gloaming': 'gloaming', 'Snow Squall': 'snow-squall',
                }
                for t in auto:
                    if t['trait_type'] == 'Weather':
                        t['value'] = custom_w
                    if t['trait_type'] == 'Effect':
                        t['value'] = effect_map.get(custom_w, 'dawn-glow')

            traits = auto

        if is_image:
            output_filename = f"{token_id}.{ext}"
            output_path = os.path.join(output_dir, output_filename)
            file.save(output_path)
            rel_path = os.path.join('generated', str(collection.id), output_filename)

            nft = NFT(
                collection_id=collection.id,
                token_id=token_id,
                name=custom_name,
                image_path=rel_path,
                traits_json=json.dumps(traits),
            )
        elif is_video:
            video_filename = f"{token_id}.{ext}"
            video_path = os.path.join(video_dir, video_filename)
            file.save(video_path)
            video_rel_path = os.path.join('videos', str(collection.id), video_filename)

            nft = NFT(
                collection_id=collection.id,
                token_id=token_id,
                name=custom_name,
                video_path=video_rel_path,
                traits_json=json.dumps(traits),
            )

        db.session.add(nft)
        generated_nfts.append(nft)

    db.session.commit()
    return jsonify({
        'count': len(generated_nfts),
        'nfts': [n.to_dict() for n in generated_nfts],
    }), 201


@generate_bp.route('/collections/<int:collection_id>/assign-weather-traits', methods=['POST'])
def assign_weather_traits(collection_id):
    """Assign weather traits to all NFTs in a collection that don't have them."""
    import json
    collection = Collection.query.get_or_404(collection_id)
    nfts = NFT.query.filter_by(collection_id=collection_id).order_by(NFT.token_id).all()

    updated = 0
    for nft in nfts:
        existing = nft.traits or []
        has_weather = any(t.get('trait_type') == 'Weather' for t in existing)
        if not has_weather:
            weather_traits = _assign_weather_traits(nft.token_id)
            nft.traits = existing + weather_traits
            updated += 1

    db.session.commit()
    return jsonify({
        'updated': updated,
        'total': len(nfts),
        'message': f'Assigned weather traits to {updated} NFTs',
    })


@generate_bp.route('/collections/<int:collection_id>/nfts', methods=['GET'])
def get_collection_nfts(collection_id):
    Collection.query.get_or_404(collection_id)
    nfts = NFT.query.filter_by(collection_id=collection_id)\
        .order_by(NFT.token_id).all()
    return jsonify([n.to_dict() for n in nfts])


@generate_bp.route('/nfts/<int:nft_id>', methods=['DELETE'])
def delete_nft(nft_id):
    nft = NFT.query.get_or_404(nft_id)
    if nft.image_path:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], nft.image_path)
        if os.path.exists(filepath):
            os.remove(filepath)
    db.session.delete(nft)
    db.session.commit()
    return jsonify({'message': 'NFT deleted'})
