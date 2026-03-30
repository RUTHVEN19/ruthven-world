import json
from datetime import datetime, timezone
from . import db


class Collection(db.Model):
    __tablename__ = 'collections'

    id = db.Column(db.Integer, primary_key=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('brands.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    max_supply = db.Column(db.Integer, nullable=False, default=100)
    mint_price_wei = db.Column(db.String(78), default='0')  # Wei as string
    contract_address = db.Column(db.String(42), nullable=True)
    base_uri = db.Column(db.String(500), nullable=True)
    image_cid = db.Column(db.String(100), nullable=True)
    network = db.Column(db.String(20), default='sepolia')
    is_minting_active = db.Column(db.Boolean, default=False)
    deployed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # ─── Advanced Minting Features ───────────────────
    mint_mode = db.Column(db.String(10), default='blind')  # 'blind' or 'choose'
    price_tiers_json = db.Column(db.Text, default='[]')    # [{threshold, price_wei}]
    allowlist_json = db.Column(db.Text, default='[]')      # ["0xaddr1", "0xaddr2"]
    merkle_root = db.Column(db.String(66), nullable=True)
    presale_start = db.Column(db.DateTime, nullable=True)
    presale_end = db.Column(db.DateTime, nullable=True)
    public_start = db.Column(db.DateTime, nullable=True)
    max_presale_per_wallet = db.Column(db.Integer, default=1)
    video_path = db.Column(db.String(500), nullable=True)

    nfts = db.relationship('NFT', backref='collection', lazy='dynamic',
                           cascade='all, delete-orphan')
    trait_categories = db.relationship('TraitCategory', backref='collection', lazy='dynamic',
                                       cascade='all, delete-orphan',
                                       order_by='TraitCategory.display_order')

    @property
    def price_tiers(self):
        return json.loads(self.price_tiers_json) if self.price_tiers_json else []

    @price_tiers.setter
    def price_tiers(self, value):
        self.price_tiers_json = json.dumps(value)

    @property
    def allowlist(self):
        return json.loads(self.allowlist_json) if self.allowlist_json else []

    @allowlist.setter
    def allowlist(self, value):
        self.allowlist_json = json.dumps(value)

    def to_dict(self, include_brand=False):
        data = {
            'id': self.id,
            'brand_id': self.brand_id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'max_supply': self.max_supply,
            'mint_price_wei': self.mint_price_wei,
            'mint_price_eth': str(int(self.mint_price_wei) / 1e18) if self.mint_price_wei else '0',
            'contract_address': self.contract_address,
            'base_uri': self.base_uri,
            'image_cid': self.image_cid,
            'network': self.network,
            'is_minting_active': self.is_minting_active,
            'nft_count': self.nfts.count(),
            'deployed_at': self.deployed_at.isoformat() if self.deployed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Advanced minting
            'mint_mode': self.mint_mode,
            'price_tiers': self.price_tiers,
            'allowlist_count': len(self.allowlist),
            'merkle_root': self.merkle_root,
            'presale_start': self.presale_start.isoformat() if self.presale_start else None,
            'presale_end': self.presale_end.isoformat() if self.presale_end else None,
            'public_start': self.public_start.isoformat() if self.public_start else None,
            'max_presale_per_wallet': self.max_presale_per_wallet,
            'video_url': f"/uploads/{self.video_path}" if self.video_path else None,
        }
        if include_brand and self.brand:
            data['brand'] = self.brand.to_dict()
        return data
