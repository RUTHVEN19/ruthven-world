import { useState } from 'react';
import { toggleWishlist } from '../utils/api';

export default function WishlistButton({ collectionId, collectionSlug, tokenId, count = 0, walletAddress }) {
  const storageKey = `wishlist-${collectionSlug}-${walletAddress || 'anon'}`;
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return saved.includes(tokenId);
    } catch { return false; }
  });
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    const action = isWishlisted ? 'remove' : 'add';

    // Optimistic UI
    setIsWishlisted(!isWishlisted);
    setDisplayCount(prev => action === 'add' ? prev + 1 : Math.max(0, prev - 1));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Update localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (action === 'add') {
        localStorage.setItem(storageKey, JSON.stringify([...saved, tokenId]));
      } else {
        localStorage.setItem(storageKey, JSON.stringify(saved.filter(id => id !== tokenId)));
      }
    } catch { /* ignore */ }

    // Update backend count
    try {
      const result = await toggleWishlist(collectionId, tokenId, action);
      setDisplayCount(result.count);
    } catch { /* keep optimistic state */ }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center space-x-1 text-sm transition-all duration-200 ${
        isWishlisted
          ? 'text-white'
          : 'text-gray-500 hover:text-gray-300'
      } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <span className="text-base">{isWishlisted ? '♥' : '♡'}</span>
      {displayCount > 0 && (
        <span className="text-xs font-medium">{displayCount}</span>
      )}
    </button>
  );
}
