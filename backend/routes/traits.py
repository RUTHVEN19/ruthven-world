import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models import db, Collection, TraitCategory, TraitValue

traits_bp = Blueprint('traits', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@traits_bp.route('/collections/<int:collection_id>/traits', methods=['GET'])
def get_traits(collection_id):
    Collection.query.get_or_404(collection_id)
    categories = TraitCategory.query.filter_by(collection_id=collection_id)\
        .order_by(TraitCategory.display_order).all()
    return jsonify([c.to_dict() for c in categories])


@traits_bp.route('/collections/<int:collection_id>/traits/categories', methods=['POST'])
def create_trait_category(collection_id):
    Collection.query.get_or_404(collection_id)
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    max_order = db.session.query(db.func.max(TraitCategory.display_order))\
        .filter_by(collection_id=collection_id).scalar() or 0

    category = TraitCategory(
        collection_id=collection_id,
        name=data['name'],
        display_order=data.get('display_order', max_order + 1),
    )
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201


@traits_bp.route('/traits/categories/<int:category_id>', methods=['PUT'])
def update_trait_category(category_id):
    category = TraitCategory.query.get_or_404(category_id)
    data = request.get_json()

    if 'name' in data:
        category.name = data['name']
    if 'display_order' in data:
        category.display_order = data['display_order']

    db.session.commit()
    return jsonify(category.to_dict())


@traits_bp.route('/traits/categories/<int:category_id>', methods=['DELETE'])
def delete_trait_category(category_id):
    category = TraitCategory.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted'})


@traits_bp.route('/traits/categories/reorder', methods=['PUT'])
def reorder_categories():
    data = request.get_json()
    if not data or 'order' not in data:
        return jsonify({'error': 'Order array required'}), 400

    for i, category_id in enumerate(data['order']):
        category = TraitCategory.query.get(category_id)
        if category:
            category.display_order = i

    db.session.commit()
    return jsonify({'message': 'Reordered successfully'})


@traits_bp.route('/traits/categories/<int:category_id>/values', methods=['POST'])
def create_trait_value(category_id):
    category = TraitCategory.query.get_or_404(category_id)

    if 'image' not in request.files:
        return jsonify({'error': 'Image file is required'}), 400

    file = request.files['image']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Use PNG, JPG, or WebP'}), 400

    value_name = request.form.get('value', '')
    if not value_name:
        return jsonify({'error': 'Value name is required'}), 400

    # Save file
    collection_id = category.collection_id
    save_dir = os.path.join(
        current_app.config['UPLOAD_FOLDER'], 'traits',
        str(collection_id), category.name
    )
    os.makedirs(save_dir, exist_ok=True)

    filename = secure_filename(f"{value_name}_{file.filename}")
    filepath = os.path.join(save_dir, filename)
    file.save(filepath)

    # Relative path for DB storage
    rel_path = os.path.join('traits', str(collection_id), category.name, filename)

    trait_value = TraitValue(
        trait_category_id=category_id,
        value=value_name,
        image_path=rel_path,
        rarity_weight=float(request.form.get('rarity_weight', 1.0)),
    )
    db.session.add(trait_value)
    db.session.commit()
    return jsonify(trait_value.to_dict()), 201


@traits_bp.route('/traits/values/<int:value_id>', methods=['PUT'])
def update_trait_value(value_id):
    trait_value = TraitValue.query.get_or_404(value_id)
    data = request.form if request.form else request.get_json()

    if 'value' in data:
        trait_value.value = data['value']
    if 'rarity_weight' in data:
        trait_value.rarity_weight = float(data['rarity_weight'])

    # Handle image replacement
    if 'image' in request.files:
        file = request.files['image']
        if file.filename and allowed_file(file.filename):
            category = trait_value.category
            save_dir = os.path.join(
                current_app.config['UPLOAD_FOLDER'], 'traits',
                str(category.collection_id), category.name
            )
            filename = secure_filename(f"{trait_value.value}_{file.filename}")
            filepath = os.path.join(save_dir, filename)
            file.save(filepath)
            trait_value.image_path = os.path.join(
                'traits', str(category.collection_id), category.name, filename
            )

    db.session.commit()
    return jsonify(trait_value.to_dict())


@traits_bp.route('/traits/values/<int:value_id>', methods=['DELETE'])
def delete_trait_value(value_id):
    trait_value = TraitValue.query.get_or_404(value_id)
    # Remove file
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], trait_value.image_path)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(trait_value)
    db.session.commit()
    return jsonify({'message': 'Trait value deleted'})
