import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import db
from models.commission import CommissionRoom, CommissionArtwork, CommissionComment

commission_bp = Blueprint('commission', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'webm'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_media_type(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    return 'video' if ext in ('mp4', 'mov', 'webm') else 'image'


# ── Admin: Create a commission room ──
@commission_bp.route('/commissions', methods=['POST'])
def create_room():
    data = request.form
    title = data.get('title', '').strip()
    collector_name = data.get('collector_name', '').strip()
    password = data.get('password', '').strip()
    description = data.get('description', '').strip()

    if not title or not collector_name or not password:
        return jsonify({'error': 'Title, collector name, and password are required'}), 400

    room = CommissionRoom(
        title=title,
        collector_name=collector_name,
        password_hash=generate_password_hash(password),
        description=description,
    )
    db.session.add(room)
    db.session.commit()
    return jsonify(room.to_dict()), 201


# ── Admin: List all rooms ──
@commission_bp.route('/commissions', methods=['GET'])
def list_rooms():
    rooms = CommissionRoom.query.order_by(CommissionRoom.created_at.desc()).all()
    return jsonify([r.to_dict() for r in rooms])


# ── Admin: Get room detail (no password needed) ──
@commission_bp.route('/commissions/<room_id>', methods=['GET'])
def get_room_admin(room_id):
    room = CommissionRoom.query.get_or_404(room_id)
    return jsonify(room.to_dict(include_artworks=True))


# ── Admin: Delete a room ──
@commission_bp.route('/commissions/<room_id>', methods=['DELETE'])
def delete_room(room_id):
    room = CommissionRoom.query.get_or_404(room_id)
    db.session.delete(room)
    db.session.commit()
    return jsonify({'ok': True})


# ── Admin: Upload artwork to a room ──
@commission_bp.route('/commissions/<room_id>/artworks', methods=['POST'])
def upload_artwork(room_id):
    room = CommissionRoom.query.get_or_404(room_id)

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    # Save file
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'commissions', room_id)
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    file.save(os.path.join(upload_dir, filename))

    # Get next position
    max_pos = db.session.query(db.func.max(CommissionArtwork.position)).filter_by(room_id=room_id).scalar()
    next_pos = (max_pos or 0) + 1

    artwork = CommissionArtwork(
        room_id=room_id,
        title=request.form.get('title', filename),
        description=request.form.get('description', ''),
        filename=f'commissions/{room_id}/{filename}',
        media_type=get_media_type(filename),
        uploaded_by=request.form.get('uploaded_by', 'Artist'),
        position=next_pos,
    )
    db.session.add(artwork)
    db.session.commit()
    return jsonify(artwork.to_dict()), 201


# ── Admin: Delete artwork ──
@commission_bp.route('/commissions/<room_id>/artworks/<int:artwork_id>', methods=['DELETE'])
def delete_artwork(room_id, artwork_id):
    artwork = CommissionArtwork.query.filter_by(id=artwork_id, room_id=room_id).first_or_404()
    db.session.delete(artwork)
    db.session.commit()
    return jsonify({'ok': True})


# ── Collector: Upload artwork (requires password) ──
@commission_bp.route('/commissions/<room_id>/artworks/collector', methods=['POST'])
def collector_upload_artwork(room_id):
    room = CommissionRoom.query.get_or_404(room_id)

    password = request.form.get('password', '')
    if not check_password_hash(room.password_hash, password):
        return jsonify({'error': 'Incorrect password'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'commissions', room_id)
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    file.save(os.path.join(upload_dir, filename))

    max_pos = db.session.query(db.func.max(CommissionArtwork.position)).filter_by(room_id=room_id).scalar()
    next_pos = (max_pos or 0) + 1

    artwork = CommissionArtwork(
        room_id=room_id,
        title=request.form.get('title', filename),
        description=request.form.get('description', ''),
        filename=f'commissions/{room_id}/{filename}',
        media_type=get_media_type(filename),
        uploaded_by='Artist',
        position=next_pos,
    )
    db.session.add(artwork)
    db.session.commit()
    return jsonify(artwork.to_dict()), 201


# ── Collector: Authenticate to a room ──
@commission_bp.route('/commissions/<room_id>/auth', methods=['POST'])
def auth_room(room_id):
    room = CommissionRoom.query.get_or_404(room_id)
    data = request.get_json(silent=True) or {}
    password = data.get('password', '')

    if not check_password_hash(room.password_hash, password):
        return jsonify({'error': 'Incorrect password'}), 401

    return jsonify({
        'authenticated': True,
        'room': room.to_dict(include_artworks=True),
    })


# ── Collector: Post a comment ──
@commission_bp.route('/commissions/<room_id>/artworks/<int:artwork_id>/comments', methods=['POST'])
def add_comment(room_id, artwork_id):
    room = CommissionRoom.query.get_or_404(room_id)
    artwork = CommissionArtwork.query.filter_by(id=artwork_id, room_id=room_id).first_or_404()

    data = request.get_json(silent=True) or {}
    password = data.get('password', '')
    text = data.get('text', '').strip()
    author = data.get('author', '').strip()

    if not text:
        return jsonify({'error': 'Comment text is required'}), 400

    # Verify password for collector comments, or allow "Artist" without password
    if author != 'Artist' and not check_password_hash(room.password_hash, password):
        return jsonify({'error': 'Incorrect password'}), 401

    if not author:
        author = room.collector_name

    comment = CommissionComment(
        artwork_id=artwork_id,
        author=author,
        text=text,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201
