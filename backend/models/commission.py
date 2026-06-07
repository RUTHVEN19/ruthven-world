from . import db
from datetime import datetime
import uuid


class CommissionRoom(db.Model):
    __tablename__ = 'commission_rooms'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    collector_name = db.Column(db.String(200), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    artworks = db.relationship('CommissionArtwork', backref='room', lazy=True,
                               order_by='CommissionArtwork.position',
                               cascade='all, delete-orphan')

    def to_dict(self, include_artworks=False):
        d = {
            'id': self.id,
            'title': self.title,
            'collector_name': self.collector_name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'artwork_count': len(self.artworks),
        }
        if include_artworks:
            d['artworks'] = [a.to_dict(include_comments=True) for a in self.artworks]
        return d


class CommissionArtwork(db.Model):
    __tablename__ = 'commission_artworks'

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(36), db.ForeignKey('commission_rooms.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    filename = db.Column(db.String(500), nullable=False)
    media_type = db.Column(db.String(20), default='image')  # image or video
    uploaded_by = db.Column(db.String(100), default='Artist')  # "Artist" or collector name
    position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    comments = db.relationship('CommissionComment', backref='artwork', lazy=True,
                               order_by='CommissionComment.created_at',
                               cascade='all, delete-orphan')

    def to_dict(self, include_comments=False):
        d = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'filename': self.filename,
            'media_type': self.media_type,
            'uploaded_by': self.uploaded_by,
            'position': self.position,
            'created_at': self.created_at.isoformat(),
            'comment_count': len(self.comments),
        }
        if include_comments:
            d['comments'] = [c.to_dict() for c in self.comments]
        return d


class CommissionComment(db.Model):
    __tablename__ = 'commission_comments'

    id = db.Column(db.Integer, primary_key=True)
    artwork_id = db.Column(db.Integer, db.ForeignKey('commission_artworks.id'), nullable=False)
    author = db.Column(db.String(100), nullable=False)  # collector name or "Artist"
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'artwork_id': self.artwork_id,
            'author': self.author,
            'text': self.text,
            'created_at': self.created_at.isoformat(),
        }
