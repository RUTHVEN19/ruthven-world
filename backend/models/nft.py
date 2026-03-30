import json
from datetime import datetime, timezone
from . import db


class NFT(db.Model):
    __tablename__ = 'nfts'

    id = db.Column(db.Integer, primary_key=True)
    collection_id = db.Column(db.Integer, db.ForeignKey('collections.id'), nullable=False)
    token_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    image_path = db.Column(db.String(500), nullable=True)
    video_path = db.Column(db.String(500), nullable=True)    # per-NFT animation
    video_cid = db.Column(db.String(100), nullable=True)     # IPFS hash for video
    image_cid = db.Column(db.String(100), nullable=True)
    metadata_cid = db.Column(db.String(100), nullable=True)
    traits_json = db.Column(db.Text, default='[]')
    is_uploaded = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def traits(self):
        return json.loads(self.traits_json) if self.traits_json else []

    @traits.setter
    def traits(self, value):
        self.traits_json = json.dumps(value)

    def to_dict(self):
        return {
            'id': self.id,
            'collection_id': self.collection_id,
            'token_id': self.token_id,
            'name': self.name,
            'image_path': self.image_path,
            'video_path': self.video_path,
            'video_url': f"/uploads/{self.video_path}" if self.video_path else None,
            'video_cid': self.video_cid,
            'image_cid': self.image_cid,
            'metadata_cid': self.metadata_cid,
            'traits': self.traits,
            'is_uploaded': self.is_uploaded,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
