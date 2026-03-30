import json
from datetime import datetime, timezone
from . import db


class Brand(db.Model):
    __tablename__ = 'brands'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text, default='')
    logo_path = db.Column(db.String(500), default='')
    theme_config = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    collections = db.relationship('Collection', backref='brand', lazy='dynamic',
                                  cascade='all, delete-orphan')

    def get_theme(self):
        return json.loads(self.theme_config) if self.theme_config else {}

    def set_theme(self, theme_dict):
        self.theme_config = json.dumps(theme_dict)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'logo_url': f"/uploads/{self.logo_path}" if self.logo_path else None,
            'theme': self.get_theme(),
            'collection_count': self.collections.count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
