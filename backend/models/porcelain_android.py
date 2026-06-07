from datetime import datetime, timezone
from . import db


class PorcelainAndroid(db.Model):
    __tablename__ = 'porcelain_androids'

    id = db.Column(db.Integer, primary_key=True)
    android_id = db.Column(db.Integer, unique=True, nullable=False)  # 1–200
    name = db.Column(db.String(200), nullable=False)
    porcelain_image = db.Column(db.String(500), nullable=False)
    manga_image = db.Column(db.String(500), nullable=True)
    transformation_video = db.Column(db.String(500), nullable=True)
    lore = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'android_id': self.android_id,
            'name': self.name,
            'porcelain_image': self.porcelain_image,
            'manga_image': self.manga_image,
            'transformation_video': self.transformation_video,
            'lore': self.lore,
            'has_manga': self.manga_image is not None,
            'has_video': self.transformation_video is not None,
        }
