import { useRef, useMemo } from 'react';
import WishlistButton from './WishlistButton';

// Get the weather effect class from NFT traits
function getWeatherEffect(traits) {
  if (!traits || traits.length === 0) return null;
  const effectTrait = traits.find(t => t.trait_type === 'Effect');
  return effectTrait?.value || null;
}

export default function NFTGalleryCard({
  nft,
  isMinted = false,
  isSelected = false,
  onSelect,
  collectionId,
  collectionSlug,
  wishlistCount = 0,
  walletAddress,
  currentPrice,
  brandSlug,
}) {
  const isRuthven = brandSlug === 'ruthven';
  const videoRef = useRef(null);
  const weatherEffect = useMemo(() => getWeatherEffect(nft.traits), [nft.traits]);

  const imageUrl = nft.image_cid
    ? `https://gateway.pinata.cloud/ipfs/${nft.image_cid}`
    : nft.image_path
      ? `http://localhost:5001/uploads/${nft.image_path}`
      : null;

  const videoUrl = nft.video_url
    ? (nft.video_url.startsWith('http') ? nft.video_url : `http://localhost:5001${nft.video_url}`)
    : null;

  const priceEth = currentPrice ? (Number(currentPrice) / 1e18).toFixed(4) : null;

  // Display traits (exclude the 'Effect' technical trait)
  const displayTraits = useMemo(() => {
    if (!nft.traits) return [];
    return nft.traits.filter(t => t.trait_type !== 'Effect');
  }, [nft.traits]);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onClick={() => !isMinted && onSelect?.(nft)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group rounded-xl overflow-hidden border transition-all duration-200 ${
        isMinted
          ? `${isRuthven ? 'border-[#005F3F]' : 'border-gray-800'} opacity-50 cursor-not-allowed`
          : isSelected
            ? `${isRuthven ? 'border-[#00A86B] ring-2 ring-[#00A86B]' : 'border-white ring-2 ring-white'} cursor-pointer`
            : `${isRuthven ? 'border-[#005F3F] hover:border-[#00A86B]' : 'border-gray-800 hover:border-gray-600'} cursor-pointer`
      }`}
    >
      {/* Image / Video */}
      <div className={`relative w-full overflow-hidden ${isRuthven ? 'aspect-video' : 'aspect-square'}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={nft.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
            No image
          </div>
        )}

        {/* Video overlay — plays on hover */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
        {/* Video badge */}
        {videoUrl && (
          <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-gray-300 uppercase tracking-wider">
            ▶ Video
          </div>
        )}

        {/* Weather badge */}
        {isRuthven && weatherEffect && (
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white/70 uppercase tracking-wider">
            {nft.traits?.find(t => t.trait_type === 'Weather')?.value}
          </div>
        )}
      </div>

      {/* Minted overlay */}
      {isMinted && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-gray-400 font-bold text-sm tracking-widest uppercase">Minted</span>
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && !isMinted && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className={`p-3 ${isRuthven ? 'bg-[#003D29]' : 'bg-gray-950'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{nft.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">Token #{nft.token_id}</div>
          </div>
          <WishlistButton
            collectionId={collectionId}
            collectionSlug={collectionSlug}
            tokenId={nft.token_id}
            count={wishlistCount}
            walletAddress={walletAddress}
          />
        </div>

        {/* Traits */}
        {displayTraits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {displayTraits.slice(0, 3).map((t, i) => (
              <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${isRuthven ? 'bg-[#005F3F] text-green-200' : 'bg-gray-800 text-gray-400'}`}>
                {t.value}
              </span>
            ))}
            {displayTraits.length > 3 && (
              <span className="text-xs text-gray-600">+{displayTraits.length - 3}</span>
            )}
          </div>
        )}

        {/* Price */}
        {priceEth && !isMinted && (
          <div className="mt-2 text-xs text-gray-400">
            {priceEth} ETH
          </div>
        )}
      </div>
    </div>
  );
}
