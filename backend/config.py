import os
from dotenv import load_dotenv

# Load .env from project root (parent of backend/)
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))


class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-me')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///nft_generator.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024  # 200MB max upload (bulk compose can be large)

    # External API keys
    FAL_KEY = os.getenv('FAL_KEY', '')
    KLING_ACCESS_KEY = os.getenv('KLING_ACCESS_KEY', '')
    KLING_SECRET_KEY = os.getenv('KLING_SECRET_KEY', '')
    PINATA_API_KEY = os.getenv('PINATA_API_KEY', '')
    PINATA_SECRET_KEY = os.getenv('PINATA_SECRET_KEY', '')
    PINATA_JWT = os.getenv('PINATA_JWT', '')

    # Ethereum
    DEPLOYER_PRIVATE_KEY = os.getenv('DEPLOYER_PRIVATE_KEY', '')
    INFURA_API_KEY = os.getenv('INFURA_API_KEY', '')
    OWNER_ADDRESS = os.getenv('OWNER_ADDRESS', '')

    # Network RPC URLs
    SEPOLIA_RPC_URL = os.getenv('SEPOLIA_RPC_URL', f'https://sepolia.infura.io/v3/{os.getenv("INFURA_API_KEY", "")}')
    MAINNET_RPC_URL = os.getenv('MAINNET_RPC_URL', f'https://mainnet.infura.io/v3/{os.getenv("INFURA_API_KEY", "")}')
