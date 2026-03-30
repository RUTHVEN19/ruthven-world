from . import db


class TraitCategory(db.Model):
    __tablename__ = 'trait_categories'

    id = db.Column(db.Integer, primary_key=True)
    collection_id = db.Column(db.Integer, db.ForeignKey('collections.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, default=0)

    values = db.relationship('TraitValue', backref='category', lazy='dynamic',
                             cascade='all, delete-orphan')

    def to_dict(self, include_values=True):
        data = {
            'id': self.id,
            'collection_id': self.collection_id,
            'name': self.name,
            'display_order': self.display_order,
        }
        if include_values:
            data['values'] = [v.to_dict() for v in self.values.order_by(TraitValue.rarity_weight.desc()).all()]
        return data


class TraitValue(db.Model):
    __tablename__ = 'trait_values'

    id = db.Column(db.Integer, primary_key=True)
    trait_category_id = db.Column(db.Integer, db.ForeignKey('trait_categories.id'), nullable=False)
    value = db.Column(db.String(200), nullable=False)
    image_path = db.Column(db.String(500), nullable=False)
    rarity_weight = db.Column(db.Float, default=1.0)

    def to_dict(self):
        return {
            'id': self.id,
            'trait_category_id': self.trait_category_id,
            'value': self.value,
            'image_path': self.image_path,
            'rarity_weight': self.rarity_weight,
        }
