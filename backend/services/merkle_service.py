"""Merkle tree utilities for allowlist verification."""

import hashlib


def _keccak256(data: bytes) -> bytes:
    """Compute keccak256 hash."""
    from Crypto.Hash import keccak
    k = keccak.new(digest_bits=256)
    k.update(data)
    return k.digest()


def _try_keccak256(data: bytes) -> bytes:
    """Try keccak256 with available libraries."""
    try:
        return _keccak256(data)
    except ImportError:
        pass

    # Fallback: use eth_hash if available
    try:
        from eth_hash.auto import keccak
        return keccak(data)
    except ImportError:
        pass

    # Fallback: use web3
    try:
        from web3 import Web3
        return Web3.solidity_keccak(['bytes'], [data])
    except ImportError:
        pass

    raise ImportError(
        "No keccak256 library found. Install pycryptodome: pip install pycryptodome"
    )


def _hash_leaf(address: str) -> bytes:
    """Hash a single address the same way Solidity does:
    keccak256(abi.encodePacked(address))
    """
    # abi.encodePacked(address) = 20 bytes of the address
    addr_bytes = bytes.fromhex(address.lower().replace('0x', ''))
    return _try_keccak256(addr_bytes)


def _hash_pair(a: bytes, b: bytes) -> bytes:
    """Hash a pair of nodes, sorted for consistency (like OpenZeppelin)."""
    if a < b:
        return _try_keccak256(a + b)
    else:
        return _try_keccak256(b + a)


def _build_tree(leaves: list) -> list:
    """Build a Merkle tree from sorted leaves. Returns list of layers."""
    if not leaves:
        return [[]]

    # Sort leaves for deterministic tree
    current_layer = sorted(leaves)
    layers = [current_layer[:]]

    while len(current_layer) > 1:
        next_layer = []
        for i in range(0, len(current_layer), 2):
            if i + 1 < len(current_layer):
                next_layer.append(_hash_pair(current_layer[i], current_layer[i + 1]))
            else:
                next_layer.append(current_layer[i])  # odd node promotes
        current_layer = next_layer
        layers.append(current_layer[:])

    return layers


def compute_merkle_root(addresses: list) -> str:
    """Compute Merkle root from a list of Ethereum addresses.

    Returns hex string with 0x prefix.
    """
    if not addresses:
        return '0x' + '00' * 32

    leaves = [_hash_leaf(addr) for addr in addresses]
    layers = _build_tree(leaves)
    root = layers[-1][0]
    return '0x' + root.hex()


def get_proof(addresses: list, target_address: str) -> tuple:
    """Get the Merkle proof for a target address.

    Returns (proof_list, is_allowlisted) where proof_list is
    a list of hex strings with 0x prefix.
    """
    if not addresses:
        return [], False

    leaves = [_hash_leaf(addr) for addr in addresses]
    target_leaf = _hash_leaf(target_address)

    # Check if address is in the list
    sorted_leaves = sorted(leaves)
    if target_leaf not in sorted_leaves:
        return [], False

    # Build tree and collect proof
    layers = _build_tree(leaves)
    proof = []

    current = target_leaf
    for layer in layers[:-1]:  # skip root layer
        idx = layer.index(current)
        if idx % 2 == 0:
            # Sibling is to the right
            if idx + 1 < len(layer):
                proof.append('0x' + layer[idx + 1].hex())
        else:
            # Sibling is to the left
            proof.append('0x' + layer[idx - 1].hex())

        # Move up: compute parent
        if idx % 2 == 0 and idx + 1 < len(layer):
            current = _hash_pair(layer[idx], layer[idx + 1])
        elif idx % 2 == 1:
            current = _hash_pair(layer[idx - 1], layer[idx])
        else:
            current = layer[idx]  # odd node, no sibling

    return proof, True
