from datetime import datetime, timezone


def generate_metadata(nft, collection, brand):
    """Generate ERC-721 standard JSON metadata for an NFT.

    Args:
        nft: NFT model instance
        collection: Collection model instance
        brand: Brand model instance

    Returns:
        Dictionary conforming to ERC-721 metadata standard
    """
    metadata = {
        "name": nft.name,
        "description": collection.description or f"A 1/1 fine art piece from the {collection.name} collection by {brand.name}.",
        "image": f"ipfs://{nft.image_cid}" if nft.image_cid else "",
        "attributes": nft.traits,
        "properties": {
            "brand": brand.name,
            "collection": collection.name,
            "token_id": nft.token_id,
            "created_at": nft.created_at.isoformat() if nft.created_at else datetime.now(timezone.utc).isoformat(),
            "artist": "Miss AL Simpson",
            "ip_notice": f"All intellectual property rights reserved. {brand.name} is a registered trademark.",
        }
    }

    return metadata
