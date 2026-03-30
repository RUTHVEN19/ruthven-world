export default function PriceTierDisplay({ priceTiers, currentPrice, totalSupply, mintPrice }) {
  if (!priceTiers || priceTiers.length === 0) {
    const priceEth = currentPrice
      ? (Number(currentPrice) / 1e18).toFixed(4)
      : (Number(mintPrice || 0) / 1e18).toFixed(4);
    return (
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{priceEth} ETH</div>
      </div>
    );
  }

  const currentPriceEth = currentPrice
    ? (Number(currentPrice) / 1e18).toFixed(4)
    : (Number(mintPrice || 0) / 1e18).toFixed(4);

  // Find next tier
  const nextTier = priceTiers.find(t => totalSupply < t.threshold);
  const mintsUntilIncrease = nextTier ? nextTier.threshold - totalSupply : null;
  const nextPriceEth = nextTier ? (Number(nextTier.price_wei) / 1e18).toFixed(4) : null;

  return (
    <div className="text-center space-y-2">
      <div className="text-3xl font-bold text-white">{currentPriceEth} ETH</div>

      {mintsUntilIncrease !== null && (
        <div className="text-sm text-gray-400">
          Price increases to <span className="text-white font-semibold">{nextPriceEth} ETH</span>
          {' '}after <span className="text-white font-semibold">{mintsUntilIncrease}</span> more mint{mintsUntilIncrease !== 1 ? 's' : ''}
        </div>
      )}

      {/* Tier visualization */}
      <div className="flex items-center space-x-1 justify-center mt-2">
        {/* Base tier */}
        <div className={`h-1.5 rounded-full ${totalSupply < (priceTiers[0]?.threshold || 0) ? 'bg-white' : 'bg-gray-600'}`}
          style={{ width: `${Math.max(20, (priceTiers[0]?.threshold || 0) / (priceTiers[priceTiers.length - 1]?.threshold || 100) * 100)}px` }}
        />
        {priceTiers.map((tier, i) => {
          const nextThreshold = i + 1 < priceTiers.length ? priceTiers[i + 1].threshold : tier.threshold * 1.5;
          const isActive = totalSupply >= tier.threshold && (i + 1 >= priceTiers.length || totalSupply < priceTiers[i + 1].threshold);
          return (
            <div
              key={i}
              className={`h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-gray-700'}`}
              style={{ width: `${Math.max(20, (nextThreshold - tier.threshold) / (priceTiers[priceTiers.length - 1]?.threshold || 100) * 100)}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}
