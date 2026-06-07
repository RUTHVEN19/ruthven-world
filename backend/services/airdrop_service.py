"""
Airdrop service for Diamond Drones Collectors Edition.

Handles transferring pre-minted NFTs from the deployer wallet to collectors
after they mint on the gateway contract.
"""

import os
import json
from flask import current_app
from web3 import Web3


def _get_web3(network='sepolia'):
    """Get a connected Web3 instance."""
    if network == 'mainnet':
        rpc_url = current_app.config['MAINNET_RPC_URL']
    else:
        rpc_url = current_app.config['SEPOLIA_RPC_URL']

    if not rpc_url or 'your-api-key' in rpc_url:
        raise ValueError(f"RPC URL for {network} not configured")

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        raise ConnectionError(f"Cannot connect to {network}")

    return w3


def _get_account(w3):
    """Get the deployer account."""
    private_key = current_app.config['DEPLOYER_PRIVATE_KEY']
    if not private_key:
        raise ValueError("DEPLOYER_PRIVATE_KEY not configured")
    account = w3.eth.account.from_key(private_key)
    return account, private_key


def _get_erc721_abi():
    """Minimal ERC721 ABI for transferFrom."""
    return [
        {
            "inputs": [
                {"name": "from", "type": "address"},
                {"name": "to", "type": "address"},
                {"name": "tokenId", "type": "uint256"}
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"name": "tokenId", "type": "uint256"}],
            "name": "ownerOf",
            "outputs": [{"name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
    ]


def _get_gateway_abi():
    """Load the Collectors Edition gateway ABI from compiled artifacts."""
    base_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        'contracts', 'artifacts', 'contracts',
    )
    artifact_path = os.path.join(
        base_dir,
        'DiamondDronesCollectorsEdition.sol',
        'DiamondDronesCollectorsEdition.json',
    )
    if not os.path.exists(artifact_path):
        raise FileNotFoundError(
            "Gateway contract not compiled. Run 'npx hardhat compile' first."
        )
    with open(artifact_path) as f:
        artifact = json.load(f)
    return artifact['abi'], artifact['bytecode']


def deploy_gateway_contract(max_editions, edition_price_wei, network='sepolia',
                             merkle_root='0x' + '00' * 32,
                             presale_start=0, presale_end=0, public_start=0):
    """Deploy the DiamondDronesCollectorsEdition gateway contract."""
    w3 = _get_web3(network)
    account, private_key = _get_account(w3)
    abi, bytecode = _get_gateway_abi()

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    merkle_root_bytes = bytes.fromhex(merkle_root.replace('0x', ''))

    tx = contract.constructor(
        max_editions, edition_price_wei,
        merkle_root_bytes,
        presale_start, presale_end, public_start,
    ).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 3000000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

    if receipt['status'] != 1:
        raise Exception("Gateway contract deployment failed")

    return {
        'contract_address': receipt['contractAddress'],
        'transaction_hash': tx_hash.hex(),
    }


def transfer_nft(contract_address, to_address, token_id, network='sepolia'):
    """Transfer a single NFT from deployer wallet to a collector.

    The deployer must own the NFT (pre-minted via ownerMint).
    """
    w3 = _get_web3(network)
    account, private_key = _get_account(w3)
    abi = _get_erc721_abi()
    contract = w3.eth.contract(address=contract_address, abi=abi)

    # Verify deployer owns the token
    owner = contract.functions.ownerOf(token_id).call()
    if owner.lower() != account.address.lower():
        raise ValueError(
            f"Token {token_id} not owned by deployer. Owner: {owner}"
        )

    tx = contract.functions.transferFrom(
        account.address, to_address, token_id
    ).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt['status'] != 1:
        raise Exception(f"Transfer of token {token_id} failed")

    return {'transaction_hash': tx_hash.hex(), 'token_id': token_id}


def airdrop_collectors_edition(
    collector_address,
    edition_id,
    drones_contract,
    film_contract,
    album_contract,
    network='sepolia',
    drones_per_collector=7,
):
    """Airdrop a full Collectors Edition to one collector.

    Transfers:
    - 7 Diamond Drone NFTs from drones_contract
    - 1 Film Edition NFT from film_contract
    - 1 Album Edition NFT from album_contract

    Token ID mapping:
    - Drones: edition_id * drones_per_collector ... edition_id * drones_per_collector + 6
    - Film: edition_id
    - Album: edition_id

    Returns dict with all transaction hashes.
    """
    results = {
        'collector': collector_address,
        'edition_id': edition_id,
        'drones': [],
        'film': None,
        'album': None,
        'errors': [],
    }

    # Transfer 7 drones
    drone_start = edition_id * drones_per_collector
    for i in range(drones_per_collector):
        token_id = drone_start + i
        try:
            tx = transfer_nft(drones_contract, collector_address, token_id, network)
            results['drones'].append(tx)
        except Exception as e:
            results['errors'].append({
                'contract': 'drones',
                'token_id': token_id,
                'error': str(e),
            })

    # Transfer film edition
    try:
        tx = transfer_nft(film_contract, collector_address, edition_id, network)
        results['film'] = tx
    except Exception as e:
        results['errors'].append({
            'contract': 'film',
            'token_id': edition_id,
            'error': str(e),
        })

    # Transfer album edition
    try:
        tx = transfer_nft(album_contract, collector_address, edition_id, network)
        results['album'] = tx
    except Exception as e:
        results['errors'].append({
            'contract': 'album',
            'token_id': edition_id,
            'error': str(e),
        })

    results['success'] = len(results['errors']) == 0
    return results


def get_pending_airdrops(gateway_address, network='sepolia'):
    """Check the gateway contract for editions that haven't been airdropped yet."""
    w3 = _get_web3(network)
    abi, _ = _get_gateway_abi()
    contract = w3.eth.contract(address=gateway_address, abi=abi)

    pending_ids = contract.functions.getPendingAirdrops().call()
    pending = []
    for edition_id in pending_ids:
        collector = contract.functions.editionCollector(edition_id).call()
        pending.append({
            'edition_id': edition_id,
            'collector': collector,
        })

    return pending


def mark_airdrop_complete(gateway_address, edition_id, network='sepolia'):
    """Mark an edition's airdrop as complete on the gateway contract."""
    w3 = _get_web3(network)
    account, private_key = _get_account(w3)
    abi, _ = _get_gateway_abi()
    contract = w3.eth.contract(address=gateway_address, abi=abi)

    tx = contract.functions.markAirdropComplete(edition_id).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt['status'] != 1:
        raise Exception("Failed to mark airdrop complete")

    return {'transaction_hash': tx_hash.hex()}
