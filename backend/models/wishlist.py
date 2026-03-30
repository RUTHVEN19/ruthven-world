from . import db


class WishlistCount(db.Model):
    __tablename__ = 'wishlist_counts'

    id = db.Column(db.Integer, primary_key=True)
    collection_id = db.Column(db.Integer, db.ForeignKey('collections.id'), nullable=False)
    token_id = db.Column(db.Integer, nullable=False)
    count = db.Column(db.Integer, default=0)

    __table_args__ = (
        db.UniqueConstraint('collection_id', 'token_id', name='uq_wishlist_collection_token'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'collection_id': self.collection_id,
            'token_id': self.token_id,
            'count': self.count,
        }
