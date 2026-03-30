import os
import json
import requests
from flask import current_app


def _get_headers():
    jwt = current_app.config['PINATA_JWT']
    if jwt:
        return {'Authorization': f'Bearer {jwt}'}

    api_key = current_app.config['PINATA_API_KEY']
    secret_key = current_app.config['PINATA_SECRET_KEY']
    if not api_key or not secret_key:
        raise ValueError("Pinata API credentials not configured. Add them to your .env file.")
    return {
        'pinata_api_key': api_key,
        'pinata_secret_api_key': secret_key,
    }


def pin_file(file_path, name=None):
    """Pin a single file to IPFS via Pinata.

    Args:
        file_path: Absolute path to the file
        name: Optional name for the pin

    Returns:
        IPFS CID (hash) string
    """
    url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    headers = _get_headers()

    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        metadata = {'name': name or os.path.basename(file_path)}
        data = {'pinataMetadata': json.dumps(metadata)}

        response = requests.post(url, files=files, data=data, headers=headers, timeout=120)
        response.raise_for_status()

    return response.json()['IpfsHash']


def pin_json(json_data, name=None):
    """Pin JSON data to IPFS via Pinata.

    Args:
        json_data: Dictionary to pin as JSON
        name: Optional name for the pin

    Returns:
        IPFS CID (hash) string
    """
    url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
    headers = {**_get_headers(), 'Content-Type': 'application/json'}

    payload = {
        'pinataContent': json_data,
        'pinataMetadata': {'name': name or 'metadata.json'},
    }

    response = requests.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()

    return response.json()['IpfsHash']


def pin_directory(dir_path, name=None):
    """Pin an entire directory to IPFS via Pinata.

    Args:
        dir_path: Path to the directory
        name: Optional name for the pin

    Returns:
        IPFS CID (hash) for the directory
    """
    url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    headers = _get_headers()

    files = []
    for root, dirs, filenames in os.walk(dir_path):
        for filename in sorted(filenames):
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, dir_path)
            files.append(
                ('file', (rel_path, open(filepath, 'rb')))
            )

    metadata = {'name': name or os.path.basename(dir_path)}
    data = {
        'pinataMetadata': json.dumps(metadata),
        'pinataOptions': json.dumps({'wrapWithDirectory': True}),
    }

    try:
        response = requests.post(url, files=files, data=data, headers=headers, timeout=300)
        response.raise_for_status()
    finally:
        # Close all opened file handles
        for _, (_, f) in files:
            f.close()

    return response.json()['IpfsHash']
