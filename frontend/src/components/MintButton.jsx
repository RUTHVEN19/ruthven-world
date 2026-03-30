import { useState } from 'react';
import { useContract } from '../hooks/useContract';

export default function MintButton({
  contractAddress,
  mintPriceWei,
  maxSupply,
  totalSupply,
  mintPhase = 'public',
  merkleProof = null,
  onMinted,
}) {
  const [quantity, setQuantity] = useState(1);
  const [txState, setTxState] = useState('idle'); // idle, pending, success, error
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { mint, mintPresale } = useContract(contractAddress);

  const isSoldOut = totalSupply >= maxSupply;
  const totalCostWei = BigInt(mintPriceWei || '0') * BigInt(quantity);
  const totalCostEth = Number(totalCostWei) / 1e18;

  const handleMint = async () => {
    setTxState('pending');
    setErrorMsg('');
    try {
      let receipt;
      if (mintPhase === 'presale' && merkleProof) {
        receipt = await mintPresale(quantity, mintPriceWei, merkleProof);
      } else {
        receipt = await mint(quantity, mintPriceWei);
      }
      setTxHash(receipt.hash);
      setTxState('success');
      onMinted?.();
    } catch (err) {
      setErrorMsg(err.reason || err.message || 'Transaction failed');
      setTxState('error');
    }
  };

  if (isSoldOut) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-400 mb-2">Sold Out</div>
        <p className="text-sm text-gray-500">All {maxSupply} pieces have been minted</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700"
        >
          -
        </button>
        <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(q => Math.min(maxSupply - totalSupply, q + 1))}
          className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700"
        >
          +
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Total: {totalCostEth.toFixed(4)} ETH
      </div>

      {/* Mint button */}
      <button
        onClick={handleMint}
        disabled={txState === 'pending'}
        className="btn-mint w-full"
      >
        {txState === 'pending' ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Minting...</span>
          </span>
        ) : mintPhase === 'presale' ? (
          `Presale Mint ${quantity} NFT${quantity > 1 ? 's' : ''}`
        ) : (
          `Mint ${quantity} NFT${quantity > 1 ? 's' : ''}`
        )}
      </button>

      {/* Status messages */}
      {txState === 'success' && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
          <div className="text-white font-semibold mb-1">Minted Successfully!</div>
          {txHash && (
            <div className="text-xs text-gray-400 font-mono truncate">TX: {txHash}</div>
          )}
        </div>
      )}

      {txState === 'error' && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-center">
          <div className="text-red-400 font-semibold mb-1">Minting Failed</div>
          <div className="text-xs text-gray-400">{errorMsg}</div>
        </div>
      )}
    </div>
  );
}
