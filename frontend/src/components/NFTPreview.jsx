export default function NFTPreview({ nft }) {
  const imageUrl = nft.image_cid
    ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${nft.image_cid}`
    : nft.image_path
      ? `/uploads/${nft.image_path}`
      : null;

  return (
    <div className="card p-0 overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt={nft.name} className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-600">
          No image
        </div>
      )}
      <div className="p-3">
        <div className="font-medium text-sm truncate">{nft.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">Token #{nft.token_id}</div>
        {nft.traits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {nft.traits.map((t, i) => (
              <span key={i} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                {t.trait_type}: {t.value}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center mt-2 space-x-2">
          {nft.is_uploaded && (
            <span className="text-xs text-gray-300">IPFS</span>
          )}
        </div>
      </div>
    </div>
  );
}
