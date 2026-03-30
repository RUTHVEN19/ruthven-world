from flask import Blueprint, request, jsonify
from models import db, Collection, WishlistCount

wishlist_bp = Blueprint('wishlist', __name__)


@wishlist_bp.route('/collections/<int:collection_id>/wishlist/<int:token_id>', methods=['POST'])
def toggle_wishlist(collection_id, token_id):
    """Increment or decrement wishlist count for a token."""
    Collection.query.get_or_404(collection_id)
    data = request.get_json()
    action = data.get('action', 'add')  # 'add' or 'remove'

    entry = WishlistCount.query.filter_by(
        collection_id=collection_id, token_id=token_id
    ).first()

    if action == 'add':
        if not entry:
            entry = WishlistCount(collection_id=collection_id, token_id=token_id, count=1)
            db.session.add(entry)
        else:
            entry.count += 1
    elif action == 'remove':
        if entry and entry.count > 0:
            entry.count -= 1

    db.session.commit()
    return jsonify({
        'token_id': token_id,
        'count': entry.count if entry else 0,
    })


@wishlist_bp.route('/collections/<int:collection_id>/wishlist', methods=['GET'])
def get_wishlist_counts(collection_id):
    """Get all wishlist counts for a collection."""
    Collection.query.get_or_404(collection_id)
    entries = WishlistCount.query.filter_by(collection_id=collection_id).all()
    counts = {str(e.token_id): e.count for e in entries if e.count > 0}
    return jsonify({'counts': counts})


@wishlist_bp.route('/collections/<int:collection_id>/wishlist/top', methods=['GET'])
def get_top_wishlisted(collection_id):
    """Get top 10 most wishlisted tokens for admin analytics."""
    Collection.query.get_or_404(collection_id)
    entries = WishlistCount.query.filter_by(collection_id=collection_id)\
        .filter(WishlistCount.count > 0)\
        .order_by(WishlistCount.count.desc())\
        .limit(10).all()
    return jsonify({
        'top': [e.to_dict() for e in entries],
        'total_wishlists': sum(e.count for e in entries),
    })
