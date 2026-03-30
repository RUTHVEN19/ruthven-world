import os
import json
from flask import current_app
from web3 import Web3


def _get_web3(network):
    if network == 'mainnet':
        rpc_url = current_app.config['MAINNET_RPC_URL']
    else:
        rpc_url = current_app.config['SEPOLIA_RPC_URL']

    if not rpc_url or 'your-api-key' in rpc_url:
        raise ValueError(f"RPC URL for {network} not configured. Add INFURA_API_KEY to .env")

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        raise ConnectionError(f"Cannot connect to {network} network")

    return w3


def _get_account(w3):
    private_key = current_app.config['DEPLOYER_PRIVATE_KEY']
    if not private_key:
        raise ValueError("DEPLOYER_PRIVATE_KEY not configured in .env")
    account = w3.eth.account.from_key(private_key)
    return account, private_key


def _get_contract_data(version='v1'):
    """Load compiled contract ABI and bytecode from Hardhat artifacts."""
    base_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        'contracts', 'artifacts', 'contracts',
    )
    if version == 'v2':
        artifact_path = os.path.join(base_dir, 'MissALSimpsonNFTV2.sol', 'MissALSimpsonNFTV2.json')
    else:
        artifact_path = os.path.join(base_dir, 'MissALSimpsonNFT.sol', 'MissALSimpsonNFT.json')

    if not os.path.exists(artifact_path):
        raise FileNotFoundError(
            "Contract not compiled. Run 'npx hardhat compile' in the contracts directory first."
        )

    with open(artifact_path) as f:
        artifact = json.load(f)

    return artifact['abi'], artifact['bytecode']


def deploy_nft_contract(name, symbol, max_supply, mint_price_wei, base_uri, network='sepolia'):
    """Deploy the MissALSimpsonNFT contract.

    Args:
        name: Token name
        symbol: Token symbol
        max_supply: Maximum supply
        mint_price_wei: Mint price in Wei (integer)
        base_uri: IPFS base URI for metadata
        network: 'sepolia' or 'mainnet'

    Returns:
        dict with 'contract_address' and 'transaction_hash'
    """
    w3 = _get_web3(network)
    account, private_key = _get_account(w3)
    abi, bytecode = _get_contract_data()

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Build constructor transaction
    tx = contract.constructor(
        name, symbol, max_supply, mint_price_wei, base_uri
    ).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 5000000,
        'gasPrice': w3.eth.gas_price,
    })

    # Sign and send
    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

    if receipt['status'] != 1:
        raise Exception("Contract deployment failed")

    return {
        'contract_address': receipt['contractAddress'],
        'transaction_hash': tx_hash.hex(),
    }


def _get_deployed_contract(contract_address, network):
    w3 = _get_web3(network)
    abi, _ = _get_contract_data()
    contract = w3.eth.contract(address=contract_address, abi=abi)
    return w3, contract


def recall_all_nfts(contract_address, network='sepolia'):
    """Call recallAll() on the deployed contract."""
    w3, contract = _get_deployed_contract(contract_address, network)
    account, private_key = _get_account(w3)

    # First pause if not already paused
    try:
        is_paused = contract.functions.paused().call()
        if not is_paused:
            pause_tx = contract.functions.pause().build_transaction({
                'from': account.address,
                'nonce': w3.eth.get_transaction_count(account.address),
                'gas': 100000,
                'gasPrice': w3.eth.gas_price,
            })
            signed = w3.eth.account.sign_transaction(pause_tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
            w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    except Exception:
        pass  # May already be paused

    # Call recallAll
    tx = contract.functions.recallAll().build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 3000000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

    if receipt['status'] != 1:
        raise Exception("Recall transaction failed - may need to use recallBatch for large collections")

    return {'transaction_hash': tx_hash.hex()}


def toggle_minting_pause(contract_address, network='sepolia', pause=True):
    """Pause or unpause minting."""
    w3, contract = _get_deployed_contract(contract_address, network)
    account, private_key = _get_account(w3)

    fn = contract.functions.pause() if pause else contract.functions.unpause()

    tx = fn.build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt['status'] != 1:
        raise Exception("Transaction failed")

    return {'transaction_hash': tx_hash.hex()}


def withdraw_contract_funds(contract_address, network='sepolia'):
    """Withdraw ETH from the contract."""
    w3, contract = _get_deployed_contract(contract_address, network)
    account, private_key = _get_account(w3)

    balance = w3.eth.get_balance(contract_address)

    tx = contract.functions.withdraw().build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt['status'] != 1:
        raise Exception("Withdrawal failed")

    return {
        'transaction_hash': tx_hash.hex(),
        'amount_wei': str(balance),
    }


def deploy_nft_contract_v2(name, symbol, max_supply, mint_price_wei, base_uri,
                            network='sepolia', choose_mode=False, tiered_pricing=False,
                            merkle_root='0x' + '00' * 32, presale_start=0,
                            presale_end=0, public_start=0):
    """Deploy the MissALSimpsonNFTV2 contract with advanced minting features."""
    w3 = _get_web3(network)
    account, private_key = _get_account(w3)
    abi, bytecode = _get_contract_data(version='v2')

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Convert merkle_root string to bytes32
    merkle_root_bytes = bytes.fromhex(merkle_root.replace('0x', ''))

    tx = contract.constructor(
        name, symbol, max_supply, mint_price_wei, base_uri,
        choose_mode, tiered_pricing, merkle_root_bytes,
        presale_start, presale_end, public_start
    ).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 6000000,  # V2 is larger
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

    if receipt['status'] != 1:
        raise Exception("V2 contract deployment failed")

    return {
        'contract_address': receipt['contractAddress'],
        'transaction_hash': tx_hash.hex(),
    }


def set_price_tiers(contract_address, network, tiers):
    """Set price tiers on a deployed V2 contract.

    tiers: list of {threshold: int, price_wei: str}
    """
    w3 = _get_web3(network)
    account, private_key = _get_account(w3)
    abi, _ = _get_contract_data(version='v2')
    contract = w3.eth.contract(address=contract_address, abi=abi)

    thresholds = [t['threshold'] for t in tiers]
    prices = [int(t['price_wei']) for t in tiers]

    tx = contract.functions.setPriceTiers(thresholds, prices).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 200000,
        'gasPrice': w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt['status'] != 1:
        raise Exception("Failed to set price tiers")

    return {'transaction_hash': tx_hash.hex()}
