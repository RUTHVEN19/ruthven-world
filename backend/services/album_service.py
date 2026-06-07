"""
Album service for THE DRONES OF SUBURBIA.

Handles IPFS pinning of audio tracks, metadata generation,
and ZIP creation for token-gated album downloads.
"""

import os
import json
import zipfile
import tempfile
from datetime import datetime, timezone


ALBUM_META = {
    'title': 'THE DRONES OF SUBURBIA',
    'artist': 'Miss AL Simpson',
    'label': 'Drones of Suburbia Music Studios',
    'year': '2026',
    'description': (
        'THE DRONES OF SUBURBIA by Miss AL Simpson. '
        'Eleven tracks from across the cinematic universe. '
        'Drones of Suburbia Music Studios. '
        'This token grants the holder a perpetual license to stream and download this album.'
    ),
    'tracks': [
        {'number': '01', 'title': 'The Drones of Suburbia'},
        {'number': '02', 'title': 'Les Drones de la Banlieue'},
        {'number': '03', 'title': 'The Drones of Suburbia (Roma)'},
        {'number': '04', 'title': 'The Drones of Suburbia (Roma) Summer 2025 Edit'},
        {'number': '05', 'title': 'Hollywood Drones (The Drones of Suburbia)'},
        {'number': '06', 'title': 'The Drones of Suburbia (Frequency Edit)'},
        {'number': '07', 'title': 'Drone Driver'},
        {'number': '08', 'title': 'Suburbia Was Never Out There'},
        {'number': '09', 'title': 'Surveillance Subway'},
        {'number': '10', 'title': 'Heist'},
        {'number': '11', 'title': "Diamond Drones Are a Girl's Best Friend"},
    ],
}


def pin_album_to_ipfs(tracks_dir):
    """Pin all audio files in tracks_dir to IPFS as a directory.

    Args:
        tracks_dir: Path to directory containing audio files (WAV/MP3/FLAC)

    Returns:
        dict with 'directory_cid' and 'tracks' (list of {filename, cid})
    """
    from services.pinata_service import pin_file, pin_directory

    # Pin the entire directory for bulk access
    dir_cid = pin_directory(tracks_dir, name='the-drones-of-suburbia-album')

    # Also pin individual tracks for per-track metadata
    tracks = []
    for filename in sorted(os.listdir(tracks_dir)):
        if filename.lower().endswith(('.mp3', '.wav', '.flac', '.m4a', '.aac')):
            filepath = os.path.join(tracks_dir, filename)
            cid = pin_file(filepath, name=f'drones-of-suburbia-{filename}')
            tracks.append({'filename': filename, 'cid': cid})

    return {
        'directory_cid': dir_cid,
        'tracks': tracks,
    }


def generate_album_metadata(token_id, artwork_cid, tracks_cids=None):
    """Generate ERC-721 metadata JSON for one album token.

    Args:
        token_id: Token ID number
        artwork_cid: IPFS CID of album artwork image
        tracks_cids: Optional list of {number, title, cid} for track-level metadata

    Returns:
        Dictionary conforming to ERC-721 metadata standard
    """
    metadata = {
        'name': f'THE DRONES OF SUBURBIA #{token_id}',
        'description': ALBUM_META['description'],
        'image': f'ipfs://{artwork_cid}',
        'attributes': [
            {'trait_type': 'Artist', 'value': ALBUM_META['artist']},
            {'trait_type': 'Album', 'value': ALBUM_META['title']},
            {'trait_type': 'Label', 'value': ALBUM_META['label']},
            {'trait_type': 'Year', 'value': ALBUM_META['year']},
            {'trait_type': 'Tracks', 'value': '11'},
            {'trait_type': 'Format', 'value': 'Digital Album'},
            {'trait_type': 'Edition', 'display_type': 'number', 'value': token_id},
        ],
        'properties': {
            'artist': ALBUM_META['artist'],
            'album': ALBUM_META['title'],
            'label': ALBUM_META['label'],
            'year': ALBUM_META['year'],
            'token_id': token_id,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'ip_notice': (
                'All intellectual property rights reserved. '
                'Miss AL Simpson retains all copyright, reproduction, '
                'synchronisation, and commercial exploitation rights. '
                'Drones of Suburbia Music Studios.'
            ),
        },
    }

    # Add track listing to properties
    if tracks_cids:
        metadata['properties']['tracks'] = [
            {
                'number': t.get('number', str(i + 1).zfill(2)),
                'title': t.get('title', ''),
                'audio': f"ipfs://{t['cid']}" if t.get('cid') else '',
            }
            for i, t in enumerate(tracks_cids)
        ]
    else:
        metadata['properties']['tracks'] = [
            {'number': t['number'], 'title': t['title']}
            for t in ALBUM_META['tracks']
        ]

    return metadata


def create_album_zip(tracks_dir, artwork_path=None):
    """Bundle all album tracks + artwork into a downloadable ZIP.

    Args:
        tracks_dir: Path to directory containing audio files
        artwork_path: Optional path to album artwork image

    Returns:
        Path to the created ZIP file (in temp directory)
    """
    zip_path = os.path.join(tempfile.gettempdir(), 'The_Drones_of_Suburbia.zip')

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        album_dir = 'The Drones of Suburbia - Miss AL Simpson'

        # Add artwork
        if artwork_path and os.path.exists(artwork_path):
            ext = os.path.splitext(artwork_path)[1]
            zf.write(artwork_path, f'{album_dir}/artwork{ext}')

        # Add all audio files
        for filename in sorted(os.listdir(tracks_dir)):
            if filename.lower().endswith(('.mp3', '.wav', '.flac', '.m4a', '.aac')):
                filepath = os.path.join(tracks_dir, filename)
                zf.write(filepath, f'{album_dir}/{filename}')

    return zip_path


def verify_album_holder(wallet_address, contract_address, network='sepolia'):
    """Check on-chain if a wallet holds an album token.

    Args:
        wallet_address: Ethereum address to check
        contract_address: Album contract address
        network: 'sepolia' or 'mainnet'

    Returns:
        bool — True if wallet holds at least one album token
    """
    from web3 import Web3

    rpc_urls = {
        'sepolia': f"https://sepolia.infura.io/v3/{os.environ.get('INFURA_API_KEY', '')}",
        'mainnet': f"https://mainnet.infura.io/v3/{os.environ.get('INFURA_API_KEY', '')}",
    }

    w3 = Web3(Web3.HTTPProvider(rpc_urls.get(network, rpc_urls['sepolia'])))

    abi = [{'inputs': [{'name': 'wallet', 'type': 'address'}],
            'name': 'isHolder', 'outputs': [{'name': '', 'type': 'bool'}],
            'stateMutability': 'view', 'type': 'function'}]

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(contract_address),
        abi=abi,
    )

    return contract.functions.isHolder(
        Web3.to_checksum_address(wallet_address)
    ).call()
