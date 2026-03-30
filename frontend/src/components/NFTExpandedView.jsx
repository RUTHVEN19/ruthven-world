import { useEffect } from 'react';
import WishlistButton from './WishlistButton';

export default function NFTExpandedView({
  nft,
  isMinted = false,
  collectionId,
  collectionSlug,
  brandSlug,
  wishlistCount = 0,
  walletAddress,
  currentPrice,
  mintPriceEth,
  isConnected,
  canMint,
  mintPhase,
  txState,
  isBeforeLaunch = false,
  launchCountdown = '',
  onMint,
  onClose,
}) {
  const imageUrl = nft.image_cid
    ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${nft.image_cid}`
    : nft.image_path
      ? `http://localhost:5001/uploads/${nft.image_path}`
      : null;

  const videoUrl = nft.video_url
    ? (nft.video_url.startsWith('http') ? nft.video_url : `http://localhost:5001${nft.video_url}`)
    : null;

  const priceEth = currentPrice ? (Number(currentPrice) / 1e18).toFixed(4) : mintPriceEth;
  const isRuthven = brandSlug === 'ruthven';

  // Lock body scroll & handle Escape key
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md animate-fadeIn"
        style={{
          backgroundColor: isRuthven ? 'rgba(10,78,52,0.92)' : 'rgba(0,0,0,0.9)',
        }}
        onClick={onClose}
      />

      {/* Content — full-width landscape layout */}
      <div className="relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isRuthven ? 'rgba(13,94,63,0.8)' : 'rgba(31,41,55,0.8)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{
            backgroundColor: isRuthven ? '#0a4e34' : 'rgba(3,7,18,1)',
            border: `1px solid ${isRuthven ? 'rgba(255,255,255,0.15)' : 'rgba(31,41,55,1)'}`,
          }}
        >
          {/* Top: Image or Video — full width landscape */}
          <div className="relative w-full">
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                poster={imageUrl || undefined}
                className="w-full object-cover rounded-t-2xl"
                style={{ aspectRatio: '16/9', maxHeight: '65vh' }}
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={nft.name}
                className="w-full object-cover rounded-t-2xl"
                style={{ aspectRatio: '16/9', maxHeight: '65vh' }}
              />
            ) : (
              <div className="w-full bg-gray-800 flex items-center justify-center text-gray-600 text-lg" style={{ aspectRatio: '16/9' }}>
                No image
              </div>
            )}

            {/* Video badge */}
            {videoUrl && !isMinted && (
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-gray-300 uppercase tracking-wider font-mono">Animated NFT</span>
              </div>
            )}

            {isMinted && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-gray-300 font-bold text-xl tracking-widest uppercase">Minted</span>
              </div>
            )}
          </div>

          {/* Bottom: Details — horizontal layout */}
          <div className="p-6 md:px-8 md:py-6">
            {/* Top row: Title + Price + Mint button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left: Name & token */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>
                    Token #{nft.token_id}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold truncate" style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }}>
                    {nft.name}
                  </h2>
                </div>
                <div className="scale-125 flex-shrink-0">
                  <WishlistButton
                    collectionId={collectionId}
                    collectionSlug={collectionSlug}
                    tokenId={nft.token_id}
                    count={wishlistCount}
                    walletAddress={walletAddress}
                  />
                </div>
              </div>

              {/* Centre: Price */}
              <div className="flex items-center gap-6 flex-shrink-0">
                <div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>
                    {isMinted ? 'Sold For' : 'Price'}
                  </div>
                  <div className="text-2xl font-bold">
                    {priceEth} <span style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }} className="text-base">ETH</span>
                  </div>
                </div>
                {!isMinted && wishlistCount > 0 && (
                  <div className="text-right">
                    <div className="text-xs" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>Wishlisted</div>
                    <div className="text-lg font-semibold">{wishlistCount}</div>
                  </div>
                )}
              </div>

              {/* Right: Mint button */}
              <div className="flex-shrink-0 md:w-56">
                {isMinted ? (
                  <div className="text-center py-3 rounded-lg text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)', border: `1px solid ${isRuthven ? 'rgba(255,255,255,0.1)' : 'rgba(31,41,55,1)'}` }}>
                    Minted
                  </div>
                ) : isBeforeLaunch ? (
                  <div className="text-center py-3 rounded-lg text-sm font-mono" style={{ color: '#00E896', border: '1px solid rgba(0,232,150,0.25)' }}>
                    Opens in {launchCountdown}
                  </div>
                ) : !isConnected ? (
                  <div className="text-center py-3 rounded-lg text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)', border: `1px solid ${isRuthven ? 'rgba(255,255,255,0.1)' : 'rgba(31,41,55,1)'}` }}>
                    Connect wallet to mint
                  </div>
                ) : !canMint ? (
                  <div className="text-center py-3 rounded-lg text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)', border: `1px solid ${isRuthven ? 'rgba(255,255,255,0.1)' : 'rgba(31,41,55,1)'}` }}>
                    {mintPhase === 'presale' ? 'Not on allowlist' : 'Not available'}
                  </div>
                ) : (
                  <button
                    onClick={onMint}
                    disabled={txState === 'pending'}
                    className="w-full py-3 px-6 font-bold rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#ffffff',
                      color: isRuthven ? '#0a4e34' : '#000000',
                    }}
                  >
                    {txState === 'pending' ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Minting...</span>
                      </span>
                    ) : (
                      `Mint for ${priceEth} ETH`
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {nft.description && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: isRuthven ? 'rgba(255,255,255,0.6)' : 'rgba(156,163,175,1)' }}>
                {nft.description}
              </p>
            )}

            {/* Traits — inline row */}
            {nft.traits && nft.traits.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {nft.traits.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 text-center"
                    style={{
                      backgroundColor: isRuthven ? 'rgba(0,0,0,0.2)' : 'rgba(17,24,39,1)',
                      border: `1px solid ${isRuthven ? 'rgba(255,255,255,0.1)' : 'rgba(31,41,55,1)'}`,
                    }}
                  >
                    <span className="text-xs uppercase" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>{t.trait_type}</span>
                    <span className="text-sm font-medium ml-2">{t.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
