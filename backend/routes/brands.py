import os
import re
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models import db, Brand

brands_bp = Blueprint('brands', __name__)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return re.sub(r'-+', '-', text)


@brands_bp.route('/brands', methods=['GET'])
def get_brands():
    brands = Brand.query.order_by(Brand.created_at.desc()).all()
    return jsonify([b.to_dict() for b in brands])


@brands_bp.route('/brands/<int:brand_id>', methods=['GET'])
def get_brand(brand_id):
    brand = Brand.query.get_or_404(brand_id)
    return jsonify(brand.to_dict())


@brands_bp.route('/brands', methods=['POST'])
def create_brand():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    slug = slugify(data['name'])
    if Brand.query.filter_by(slug=slug).first():
        return jsonify({'error': 'A brand with this name already exists'}), 409

    brand = Brand(
        name=data['name'],
        slug=slug,
        description=data.get('description', ''),
    )
    theme_data = data.get('theme') or data.get('theme_config')
    if theme_data:
        brand.set_theme(theme_data)

    db.session.add(brand)
    db.session.commit()
    return jsonify(brand.to_dict()), 201


@brands_bp.route('/brands/<int:brand_id>', methods=['PUT'])
def update_brand(brand_id):
    brand = Brand.query.get_or_404(brand_id)
    data = request.get_json()

    if 'name' in data:
        brand.name = data['name']
        brand.slug = slugify(data['name'])
    if 'description' in data:
        brand.description = data['description']
    theme_data = data.get('theme') or data.get('theme_config')
    if theme_data:
        brand.set_theme(theme_data)

    db.session.commit()
    return jsonify(brand.to_dict())


@brands_bp.route('/brands/<int:brand_id>/logo', methods=['POST'])
def upload_brand_logo(brand_id):
    brand = Brand.query.get_or_404(brand_id)

    if 'logo' not in request.files:
        return jsonify({'error': 'Logo file is required'}), 400

    file = request.files['logo']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    allowed = {'png', 'jpg', 'jpeg', 'webp', 'svg'}
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify({'error': 'Invalid file type'}), 400

    logo_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'logos')
    os.makedirs(logo_dir, exist_ok=True)

    # Remove old logo if exists
    if brand.logo_path:
        old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], brand.logo_path)
        if os.path.exists(old_path):
            os.remove(old_path)

    filename = f"{brand.slug}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(logo_dir, filename)
    file.save(filepath)

    brand.logo_path = os.path.join('logos', filename)
    db.session.commit()

    return jsonify(brand.to_dict())


@brands_bp.route('/brands/<int:brand_id>', methods=['DELETE'])
def delete_brand(brand_id):
    brand = Brand.query.get_or_404(brand_id)
    db.session.delete(brand)
    db.session.commit()
    return jsonify({'message': 'Brand deleted'}), 200
