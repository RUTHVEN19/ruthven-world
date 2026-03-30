from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .brand import Brand
from .collection import Collection
from .trait import TraitCategory, TraitValue
from .nft import NFT
from .wishlist import WishlistCount

__all__ = ['db', 'Brand', 'Collection', 'TraitCategory', 'TraitValue', 'NFT', 'WishlistCount']
