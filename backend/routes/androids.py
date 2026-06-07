from flask import Blueprint, jsonify, request
from models import db
from models.porcelain_android import PorcelainAndroid

androids_bp = Blueprint('androids', __name__)


@androids_bp.route('/androids', methods=['GET'])
def list_androids():
    """Return all Porcelain Androids with their linked manga + video."""
    androids = PorcelainAndroid.query.order_by(PorcelainAndroid.android_id).all()
    return jsonify([a.to_dict() for a in androids])


@androids_bp.route('/androids/<int:android_id>', methods=['GET'])
def get_android(android_id):
    """Return a single android by ID."""
    android = PorcelainAndroid.query.filter_by(android_id=android_id).first()
    if not android:
        return jsonify({'error': 'Android not found'}), 404
    return jsonify(android.to_dict())


@androids_bp.route('/androids/stats', methods=['GET'])
def android_stats():
    """Summary stats for the collection."""
    total = PorcelainAndroid.query.count()
    with_manga = PorcelainAndroid.query.filter(PorcelainAndroid.manga_image.isnot(None)).count()
    with_video = PorcelainAndroid.query.filter(PorcelainAndroid.transformation_video.isnot(None)).count()
    complete = PorcelainAndroid.query.filter(
        PorcelainAndroid.manga_image.isnot(None),
        PorcelainAndroid.transformation_video.isnot(None),
    ).count()
    return jsonify({
        'total': total,
        'with_manga': with_manga,
        'with_video': with_video,
        'complete_triplets': complete,
        'missing_manga': total - with_manga,
        'missing_video': total - with_video,
    })
