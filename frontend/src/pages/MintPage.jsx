import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMintData, getWishlistCounts, getMerkleProof } from '../utils/api';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import WalletConnect from '../components/WalletConnect';
import MintButton from '../components/MintButton';
import NFTGalleryCard from '../components/NFTGalleryCard';
import NFTExpandedView from '../components/NFTExpandedView';
import HighlandMap from '../components/HighlandMap';
import PriceTierDisplay from '../components/PriceTierDisplay';
import MintPhaseIndicator from '../components/MintPhaseIndicator';

export default function MintPage() {
  const params = useParams();
  const location = useLocation();
  // Support both /mint/:brandSlug/:collectionSlug and /ruthven/first-light (World mode)
  const isWorldMode = location.pathname.startsWith('/ruthven');
  const brandSlug = params.brandSlug || (isWorldMode ? 'ruthven' : '');
  const collectionSlug = params.collectionSlug || (isWorldMode ? 'first-light' : '');
  const { account, isConnected } = useWallet();
  const [totalSupply, setTotalSupply] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedNft, setSelectedNft] = useState(null);
  const [mintedTokenIds, setMintedTokenIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [merkleProof, setMerkleProof] = useState(null);
  const [isAllowlisted, setIsAllowlisted] = useState(false);
  const [expandedNft, setExpandedNft] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [txState, setTxState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [countdownNow, setCountdownNow] = useState(new Date());
  const [captureEmail, setCaptureEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['mint', brandSlug, collectionSlug],
    queryFn: () => getMintData(brandSlug, collectionSlug),
  });

  const collection = data?.collection;
  const brand = data?.brand;
  const nfts = data?.nfts || [];
  const mintPhase = data?.mint_phase || 'public';
  const isChooseMode = collection?.mint_mode === 'choose';
  const hasTiers = collection?.price_tiers?.length > 0;
  const hasAllowlist = !!collection?.merkle_root;

  // Brand-specific theming
  const isDrones = brandSlug === 'the-drones-of-suburbia';
  const isRuthven = brandSlug === 'ruthven';
  const primaryColor = brand?.theme?.primary_color || '#ffffff';
  const bgColor = brand?.theme?.bg_color || '#030712';

  const contract = useContract(collection?.contract_address);

  // Wishlist counts
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist', collection?.id],
    queryFn: () => getWishlistCounts(collection.id),
    enabled: !!collection?.id && isChooseMode,
  });
  const wishlistCounts = wishlistData?.counts || {};

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCountdownNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply brand theme
  useEffect(() => {
    if (!brand?.theme) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', brand.theme.primary_color || '#ffffff');
    root.style.setProperty('--brand-secondary', brand.theme.secondary_color || '#000000');
    if (brand.theme.font_family) {
      root.style.setProperty('--brand-font', brand.theme.font_family);
    }
    return () => {
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-font');
    };
  }, [brand]);

  // Fetch on-chain data
  useEffect(() => {
    if (!collection?.contract_address) return;

    const fetchOnChain = async () => {
      try {
        const supply = await contract.getTotalSupply();
        setTotalSupply(supply);
        const price = await contract.getCurrentPrice();
        setCurrentPrice(price.toString());
      } catch {}
    };

    fetchOnChain();
    const interval = setInterval(fetchOnChain, 15000);
    return () => clearInterval(interval);
  }, [collection?.contract_address, contract.getTotalSupply, contract.getCurrentPrice]);

  // Check minted status for choose mode tokens
  useEffect(() => {
    if (!isChooseMode || !collection?.contract_address || nfts.length === 0) return;

    const checkMinted = async () => {
      const minted = new Set();
      for (const nft of nfts) {
        try {
          const isMinted = await contract.isTokenMinted(nft.token_id);
          if (isMinted) minted.add(nft.token_id);
        } catch {}
      }
      setMintedTokenIds(minted);
    };

    checkMinted();
    const interval = setInterval(checkMinted, 30000);
    return () => clearInterval(interval);
  }, [isChooseMode, collection?.contract_address, nfts, contract.isTokenMinted]);

  // Fetch Merkle proof for connected wallet during presale
  useEffect(() => {
    if (!collection?.id || !account || !hasAllowlist) return;

    getMerkleProof(collection.id, account)
      .then(result => {
        setMerkleProof(result.proof);
        setIsAllowlisted(result.is_allowlisted);
      })
      .catch(() => {
        setMerkleProof(null);
        setIsAllowlisted(false);
      });
  }, [collection?.id, account, hasAllowlist]);

  // Filter NFTs for search and map location
  const galleryRef = useRef(null);

  const filteredNfts = useMemo(() => {
    let result = nfts;
    if (mapLocation) {
      const locLower = mapLocation.toLowerCase();
      const locNoS = locLower.endsWith('s') ? locLower.slice(0, -1) : locLower;
      result = result.filter(nft =>
        nft.traits?.some(t => {
          if (t.trait_type !== 'Location') return false;
          const v = t.value.toLowerCase();
          return v === locLower || v === locNoS || (v.endsWith('s') ? v.slice(0, -1) : v) === locNoS;
        })
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(nft =>
        nft.name.toLowerCase().includes(q) ||
        nft.traits?.some(t => t.value.toLowerCase().includes(q))
      );
    }
    return result;
  }, [nfts, searchQuery, mapLocation]);

  // Handle choose-mode mint (works from both bottom panel and expanded view)
  const handleMintSpecific = async (nftToMint) => {
    const target = nftToMint || selectedNft;
    if (!target) return;
    setTxState('pending');
    setErrorMsg('');
    try {
      const price = currentPrice || collection.mint_price_wei;
      let receipt;

      if (mintPhase === 'presale' && merkleProof) {
        receipt = await contract.mintPresaleSpecific(target.token_id, price, merkleProof);
      } else {
        receipt = await contract.mintSpecific(target.token_id, price);
      }

      setTxHash(receipt.hash);
      setTxState('success');
      setMintedTokenIds(prev => new Set([...prev, target.token_id]));
      setSelectedNft(null);
      setExpandedNft(null);
      contract.getTotalSupply().then(setTotalSupply).catch(() => {});
    } catch (err) {
      setErrorMsg(err.reason || err.message || 'Transaction failed');
      setTxState('error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="text-gray-500">Loading collection...</div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="text-center">
          <div className="text-4xl mb-4">&#128683;</div>
          <h2 className="text-xl font-bold text-gray-300">Collection not found</h2>
          <p className="text-gray-500 mt-2">This collection may not exist or hasn't been deployed yet.</p>
        </div>
      </div>
    );
  }

  const progress = collection.max_supply > 0 ? (totalSupply / collection.max_supply) * 100 : 0;
  const availableCount = isChooseMode ? nfts.length - mintedTokenIds.size : collection.max_supply - totalSupply;
  const canMint = mintPhase === 'public' || (mintPhase === 'presale' && isAllowlisted);

  // Build hero image URL
  const heroNft = nfts.length > 0 ? nfts[0] : null;
  const heroUrl = heroNft
    ? heroNft.image_cid
      ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${heroNft.image_cid}`
      : heroNft.image_path
        ? `http://localhost:5001/uploads/${heroNft.image_path}`
        : null
    : null;

  return (
    <div className={`min-h-screen ${isDrones ? 'drone-cursor-page' : ''}`} style={{ backgroundColor: bgColor }}>

      {/* ═══ BACKGROUND WASH ═══ */}
      {/* Ruthven background video */}
      {isRuthven && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <video
            src="/artist/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.35, filter: 'saturate(1.1) brightness(0.65)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${primaryColor}cc 0%, ${primaryColor}40 30%, transparent 50%, ${primaryColor}90 80%, ${primaryColor}ee 100%)`,
            }}
          />
        </div>
      )}
      {!isRuthven && collection.video_url ? (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <video
            src={collection.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.2, filter: 'grayscale(80%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/30 to-gray-950/90" />
        </div>
      ) : !isRuthven && heroUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={heroUrl}
            alt=""
            className={`w-full h-full object-cover ${isRuthven ? 'bg-light-breathe' : ''}`}
            style={{
              opacity: isRuthven ? 0.35 : 0.15,
              filter: isRuthven ? 'saturate(1.3) brightness(0.7)' : 'grayscale(100%) blur(1px)',
            }}
          />
          {/* Brand-tinted overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isRuthven
                ? `linear-gradient(to bottom, ${primaryColor}cc 0%, ${primaryColor}40 30%, transparent 50%, ${primaryColor}90 80%, ${primaryColor}ee 100%)`
                : 'linear-gradient(to bottom, rgba(3,7,18,0.4) 0%, transparent 50%, rgba(3,7,18,0.8) 100%)',
            }}
          />
          {/* Dawn light wash — shifts warm/cool across the background */}
          {isRuthven && (
            <div className="absolute inset-0 bg-light-wash" />
          )}
        </div>
      )}

      {/* ═══ STORM EFFECTS (Ruthven only) ═══ */}
      {isRuthven && (
        <>
          <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
            {/* Soft mist layers — large blurred radials */}
            <div className="absolute inset-0 storm-mist-1" />
            <div className="absolute inset-0 storm-mist-2" />
            {/* SVG rain — thin diagonal streaks */}
            <svg className="absolute inset-0 w-full h-full storm-rain-svg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="rain1" x="0" y="0" width="40" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
                  <line x1="20" y1="0" x2="19" y2="18" stroke="rgba(200,215,225,0.12)" strokeWidth="0.8" strokeLinecap="round"/>
                  <line x1="8" y1="50" x2="7" y2="64" stroke="rgba(200,215,225,0.08)" strokeWidth="0.6" strokeLinecap="round"/>
                  <line x1="32" y1="85" x2="31" y2="98" stroke="rgba(200,215,225,0.1)" strokeWidth="0.7" strokeLinecap="round"/>
                </pattern>
                <pattern id="rain2" x="0" y="0" width="55" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
                  <line x1="15" y1="0" x2="13.5" y2="22" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" strokeLinecap="round"/>
                  <line x1="40" y1="40" x2="38.5" y2="58" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" strokeLinecap="round"/>
                </pattern>
              </defs>
              <rect width="120%" height="120%" x="-10%" y="-10%" fill="url(#rain1)" className="storm-rain-layer-1"/>
              <rect width="120%" height="120%" x="-10%" y="-10%" fill="url(#rain2)" className="storm-rain-layer-2"/>
            </svg>
            {/* Lightning flash */}
            <div className="absolute inset-0 storm-lightning" />
            {/* Low rolling mist at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[35%] storm-low-cloud" />
          </div>

          {/* Eagles soaring */}
          {[1, 2, 3].map(n => (
            <svg key={n} className={`eagle-${n}`} width="60" height="24" viewBox="0 0 60 24" fill="none">
              <path d="M30 12 C25 8, 15 2, 0 6 C5 4, 12 3, 20 6 C24 8, 27 10, 30 12 Z" fill="white"/>
              <path d="M30 12 C35 8, 45 2, 60 6 C55 4, 48 3, 40 6 C36 8, 33 10, 30 12 Z" fill="white"/>
              <path d="M30 12 C29 14, 28 18, 30 22 C32 18, 31 14, 30 12 Z" fill="white"/>
            </svg>
          ))}
        </>
      )}

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${primaryColor}40, transparent 60%), radial-gradient(circle at 70% 50%, ${brand?.theme?.secondary_color || '#000000'}40, transparent 60%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Brand logo above title */}
          {brand?.logo_url && (
            <div className="mb-8">
              <img
                src={brand.logo_url}
                alt={brand.name}
                className={`mx-auto object-contain ${isRuthven ? 'h-10 md:h-14 rounded-sm' : 'h-24 md:h-36'}`}
              />
            </div>
          )}

          {/* Collection title */}
          <h1
            className={`text-7xl sm:text-8xl md:text-[10rem] font-bold mb-6 uppercase tracking-tight leading-[0.85] ${isRuthven ? 'first-light-glow' : ''}`}
            style={{
              fontFamily: isRuthven
                ? '"Playfair Display", "Georgia", serif'
                : 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
              color: isRuthven ? '#ffffff' : undefined,
              fontWeight: isRuthven ? 700 : undefined,
              fontStyle: isRuthven ? 'italic' : undefined,
              letterSpacing: isRuthven ? '0.02em' : undefined,
            }}
          >
            {collection.name}
          </h1>

          {/* Artist byline */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className="text-sm md:text-base uppercase tracking-[0.25em]"
              style={{
                fontFamily: isRuthven
                  ? '"Playfair Display", "Georgia", serif'
                  : 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                color: isRuthven ? 'rgba(255,255,255,0.7)' : 'rgba(156,163,175,1)',
              }}
            >
              by {brand?.name || 'the artist'}
            </span>
          </div>

          <p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{
              color: isRuthven ? 'rgba(255,255,255,0.6)' : 'rgba(156,163,175,1)',
              fontStyle: isRuthven ? 'italic' : undefined,
            }}
          >
            {collection.description || `A curated fine art NFT collection by ${brand?.name}. Each piece is a unique 1/1 token on Ethereum.`}
          </p>

          {/* Phase Indicator */}
          {hasAllowlist && (
            <div className="max-w-md mx-auto mb-6">
              <MintPhaseIndicator
                mintPhase={mintPhase}
                presaleStart={collection.presale_start}
                presaleEnd={collection.presale_end}
                publicStart={collection.public_start}
                isAllowlisted={isAllowlisted}
                walletConnected={isConnected}
              />
            </div>
          )}

          {/* Mint countdown */}
          {isRuthven && (() => {
            const MINT_DATE = new Date('2026-03-31T17:00:00Z');
            const diff = MINT_DATE - countdownNow;
            if (diff <= 0) return null;
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            return (
              <div className="mb-8">
                <div className="text-xs uppercase tracking-[0.3em] font-mono mb-3" style={{ color: 'rgba(0,232,150,0.5)' }}>
                  Mint Opens
                </div>
                <div className="flex justify-center gap-3">
                  {[
                    [days, 'Days'],
                    [hours, 'Hrs'],
                    [mins, 'Min'],
                    [secs, 'Sec'],
                  ].map(([val, label]) => (
                    <div key={label} className="text-center">
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg text-2xl font-mono font-bold"
                        style={{ backgroundColor: 'rgba(0,40,26,0.6)', border: '1px solid rgba(0,232,150,0.15)', color: '#ffffff' }}>
                        {String(val).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-mono mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  31 March 2026 &middot; 5:00 PM GMT
                </div>
              </div>
            );
          })()}

          {/* Mint stats */}
          <div className="flex justify-center space-x-8 mb-6">
            <div>
              <div className="text-3xl font-bold">{totalSupply}/{collection.max_supply}</div>
              <div className="text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>Minted</div>
            </div>
            <div>
              <PriceTierDisplay
                priceTiers={collection.price_tiers}
                currentPrice={currentPrice}
                totalSupply={totalSupply}
                mintPrice={collection.mint_price_wei}
              />
              <div className="text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>Price</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isRuthven ? 'rgba(255,255,255,0.1)' : 'rgba(31,41,55,1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isRuthven ? '#ffffff' : '#ffffff',
                }}
              />
            </div>
            {isChooseMode && (
              <div className="text-xs mt-1" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>{availableCount} available</div>
            )}
          </div>

          {/* Blind Mint Mode */}
          {!isChooseMode && (
            <div className="flex flex-col items-center space-y-4">
              {!isConnected ? (
                <WalletConnect />
              ) : canMint ? (
                <MintButton
                  contractAddress={collection.contract_address}
                  mintPriceWei={currentPrice || collection.mint_price_wei}
                  maxSupply={collection.max_supply}
                  totalSupply={totalSupply}
                  mintPhase={mintPhase}
                  merkleProof={merkleProof}
                  onMinted={() => {
                    contract.getTotalSupply().then(setTotalSupply).catch(() => {});
                    contract.getCurrentPrice().then(p => setCurrentPrice(p.toString())).catch(() => {});
                  }}
                />
              ) : (
                <div className="text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>
                  {mintPhase === 'presale' ? 'Your wallet is not on the allowlist' : 'Minting is not available right now'}
                </div>
              )}
            </div>
          )}

          {/* Exhibition notice */}
          <div className="mt-8 text-xs max-w-md mx-auto" style={{ color: isRuthven ? 'rgba(255,255,255,0.25)' : 'rgba(75,85,99,1)' }}>
            This is a limited exhibition collection. After the mint window closes,
            tokens will be recalled to the artist's vault as part of the IP archive.
          </div>
        </div>
      </div>

      {/* ═══ CINEMATIC VIDEO ═══ */}
      {collection.video_url && (
        <div className="relative z-10 max-w-6xl mx-auto px-4 mb-16">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-2xl" />
            <div className="relative bg-black rounded-2xl p-3 md:p-4 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex space-x-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 rounded-sm bg-gray-800" />
                  ))}
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-mono">35mm</div>
                <div className="flex space-x-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 rounded-sm bg-gray-800" />
                  ))}
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden bg-black">
                <div className="absolute top-0 left-0 right-0 h-6 bg-black z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-black z-10" />
                <div className="absolute top-7 left-3 w-6 h-6 border-l-2 border-t-2 border-gray-600/40 z-20" />
                <div className="absolute top-7 right-3 w-6 h-6 border-r-2 border-t-2 border-gray-600/40 z-20" />
                <div className="absolute bottom-7 left-3 w-6 h-6 border-l-2 border-b-2 border-gray-600/40 z-20" />
                <div className="absolute bottom-7 right-3 w-6 h-6 border-r-2 border-b-2 border-gray-600/40 z-20" />
                <video
                  src={collection.video_url}
                  controls
                  playsInline
                  className="w-full relative z-[5]"
                  style={{ maxHeight: '620px', objectFit: 'contain' }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex space-x-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 rounded-sm bg-gray-800" />
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-900/60" />
                  <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-mono">REC</span>
                </div>
                <div className="flex space-x-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 rounded-sm bg-gray-800" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]" style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }}>
              {collection.name} &middot; {brand?.name}
            </p>
            <div className="w-16 h-px bg-gray-800 mx-auto mt-2" />
          </div>
        </div>
      )}

      {/* ═══ MINT CTA ═══ */}
      {isRuthven && isChooseMode && nfts.length > 0 && (
        <div className="relative z-10 text-center pt-12 pb-4 px-6">
          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.05em',
            }}
          >
            Mint the Highlands
          </h2>
          <p className="mt-3 text-sm font-mono" style={{ color: 'rgba(0,232,150,0.5)' }}>
            Select a location on the map to explore, or scroll to browse all paintings
          </p>
        </div>
      )}

      {/* ═══ PAINTING PREVIEW REEL ═══ */}
      {isRuthven && isChooseMode && nfts.length > 0 && (
        <div className="relative z-10 overflow-hidden py-8">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to right, rgba(0,48,30,1), transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to left, rgba(0,48,30,1), transparent)' }} />
          <div className="flex gap-5 animate-marquee" style={{ width: 'max-content' }}>
            {[...nfts, ...nfts].map((nft, i) => (
              <div key={`reel-${i}`}
                className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group relative"
                style={{
                  width: '420px',
                  border: '1px solid rgba(0,232,150,0.12)',
                  transform: `translateY(${i % 3 === 0 ? 0 : i % 3 === 1 ? -8 : 8}px)`,
                }}
                onClick={() => {
                  setExpandedNft(nft);
                  if (galleryRef.current) galleryRef.current.scrollIntoView({ behavior: 'smooth' });
                }}>
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={nft.image_cid ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${nft.image_cid}` : `http://localhost:5001/uploads/${nft.image_path}`}
                    alt={nft.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <div className="text-sm font-bold text-white">{nft.name}</div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: '#00E896' }}>
                        {nft.traits?.find(t => t.trait_type === 'Location')?.value || ''} &middot; 0.04 ETH
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MANIFESTO QUOTE (after reel) ═══ */}
      {isRuthven && (
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
          <blockquote
            className="text-2xl md:text-4xl lg:text-5xl leading-tight"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 300,
            }}
          >
            "You experience Scotland through her weather first.
            <br className="hidden md:block" />
            {' '}The mountains and lochs come after."
          </blockquote>
          <div className="mt-6 text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.35)' }}>
            — Ruthven
          </div>
        </div>
      )}

      {/* ═══ HIGHLAND MAP (before gallery) ═══ */}
      {isChooseMode && isRuthven && nfts.length > 0 && (
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4 pb-12">
          <HighlandMap
            nfts={nfts}
            onLocationSelect={(loc) => {
              setMapLocation(loc);
              if (loc && galleryRef.current) {
                setTimeout(() => {
                  galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
            activeLocation={mapLocation}
          />
        </div>
      )}

      {/* ═══ CHOOSE YOUR MINT GALLERY ═══ */}
      {isChooseMode && nfts.length > 0 && (
        <div ref={galleryRef} className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {mapLocation ? `Paintings from ${mapLocation}` : (isRuthven ? 'Choose Your Highland NFT' : 'Choose Your NFT')}
              </h2>
              {mapLocation && (
                <button
                  onClick={() => setMapLocation(null)}
                  className="mt-2 text-xs font-mono uppercase tracking-wider transition-colors hover:text-white flex items-center gap-1.5"
                  style={{ color: 'rgba(0,232,150,0.6)' }}
                >
                  <span>←</span> Show all paintings
                </button>
              )}
            </div>
            <div className="text-sm" style={{ color: isRuthven ? 'rgba(255,255,255,0.4)' : 'rgba(107,114,128,1)' }}>
              {filteredNfts.filter(n => !mintedTokenIds.has(n.token_id)).length} available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNfts.map((nft, idx) => (
              <div key={nft.id} className="animate-cardFadeIn" style={{ animationDelay: `${idx * 80}ms` }}>
              <NFTGalleryCard
                nft={nft}
                isMinted={mintedTokenIds.has(nft.token_id)}
                isSelected={selectedNft?.id === nft.id}
                onSelect={(n) => setExpandedNft(n)}
                collectionId={collection.id}
                collectionSlug={collectionSlug}
                wishlistCount={parseInt(wishlistCounts[nft.token_id] || 0)}
                walletAddress={account}
                currentPrice={currentPrice || collection.mint_price_wei}
                brandSlug={brandSlug}
              />
              </div>
            ))}
          </div>

          {expandedNft && (
            <NFTExpandedView
              nft={expandedNft}
              isMinted={mintedTokenIds.has(expandedNft.token_id)}
              collectionId={collection.id}
              collectionSlug={collectionSlug}
              brandSlug={brandSlug}
              wishlistCount={parseInt(wishlistCounts[expandedNft.token_id] || 0)}
              walletAddress={account}
              currentPrice={currentPrice || collection.mint_price_wei}
              mintPriceEth={collection.mint_price_eth}
              isConnected={isConnected}
              canMint={canMint}
              mintPhase={mintPhase}
              txState={txState}
              onMint={() => handleMintSpecific(expandedNft)}
              onClose={() => setExpandedNft(null)}
            />
          )}

          {!isConnected && (
            <div className="text-center mt-8">
              <p className="mb-4" style={{ color: isRuthven ? 'rgba(255,255,255,0.5)' : 'rgba(156,163,175,1)' }}>Connect your wallet to mint</p>
              <WalletConnect />
            </div>
          )}

          {txState === 'success' && (
            <div className="mt-6 rounded-lg p-4 text-center max-w-md mx-auto" style={{ backgroundColor: isRuthven ? 'rgba(13,94,63,0.4)' : 'rgba(31,41,55,1)', border: `1px solid ${isRuthven ? 'rgba(13,94,63,0.6)' : 'rgba(75,85,99,1)'}` }}>
              <div className="text-white font-semibold mb-1">Minted Successfully!</div>
              {txHash && <div className="text-xs text-gray-400 font-mono truncate">TX: {txHash}</div>}
            </div>
          )}
          {txState === 'error' && (
            <div className="mt-6 bg-red-900/30 border border-red-800 rounded-lg p-4 text-center max-w-md mx-auto">
              <div className="text-red-400 font-semibold mb-1">Minting Failed</div>
              <div className="text-xs text-gray-400">{errorMsg}</div>
            </div>
          )}
        </div>
      )}

      {/* (Quote moved above map) */}

      {/* ═══ BLIND MODE PREVIEW GALLERY ═══ */}
      {!isChooseMode && nfts.length > 0 && (
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">Collection Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nfts.map(nft => (
              <div key={nft.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isRuthven ? 'rgba(255,255,255,0.1)' : 'rgba(31,41,55,1)'}`, backgroundColor: isRuthven ? 'rgba(0,0,0,0.3)' : 'rgba(17,24,39,1)' }}>
                {(nft.image_cid || nft.image_path) && (
                  <img
                    src={nft.image_cid ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${nft.image_cid}` : `http://localhost:5001/uploads/${nft.image_path}`}
                    alt={nft.name}
                    className="w-full object-cover"
                    style={{ aspectRatio: isRuthven ? '16/9' : '1/1' }}
                  />
                )}
                <div className="p-3">
                  <div className="font-medium text-sm">{nft.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nft.traits?.map((t, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: isRuthven ? 'rgba(13,94,63,0.3)' : 'rgba(31,41,55,1)', color: isRuthven ? 'rgba(255,255,255,0.6)' : 'rgba(156,163,175,1)' }}>
                        {t.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ EMAIL CAPTURE ═══ */}
      {isRuthven && (
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="rounded-xl p-8 md:p-10" style={{ backgroundColor: 'rgba(0,40,26,0.3)', border: '1px solid rgba(0,232,150,0.1)' }}>
            <div className="text-xs uppercase tracking-[0.3em] font-mono mb-3" style={{ color: 'rgba(0,232,150,0.5)' }}>
              Don't miss the drop
            </div>
            <h3 className="text-xl md:text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.85)' }}>
              Get notified when First Light goes live
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Be the first to know. No spam, just the signal.
            </p>
            {!emailSubmitted ? (
              <form onSubmit={(e) => { e.preventDefault(); if (captureEmail) setEmailSubmitted(true); }} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'rgba(0,30,20,0.6)',
                    border: '1px solid rgba(0,232,150,0.15)',
                    color: '#ffffff',
                    caretColor: '#00E896',
                  }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-all hover:brightness-110"
                  style={{
                    backgroundColor: 'rgba(0,232,150,0.15)',
                    border: '1px solid rgba(0,232,150,0.3)',
                    color: '#00E896',
                  }}
                >
                  Notify Me
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm font-mono" style={{ color: '#00E896' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                Signal received. We'll be in touch.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ABOUT THE ARTIST (Ruthven only) ═══ */}
      {isRuthven && (
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left column — statement */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-px" style={{ backgroundColor: 'rgba(0,232,150,0.3)' }} />
                <span className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.5)' }}>
                  About the Artist
                </span>
              </div>
              <h3 className="text-3xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.9)' }}>
                Ruthven
              </h3>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <p>
                  Ruthven is a cryptoartist and painter who works from the Scottish Highlands.
                  His practice begins not with the landscape, but with the weather — the mist
                  that precedes the mountain, the light that arrives before the view.
                </p>
                <p>
                  He has trained AI on his own paintings of the Highlands, then draws back
                  into each output by hand — layering human gesture over machine memory.
                  The result is something between recollection and forecast, landscapes
                  that feel both ancient and yet to arrive.
                </p>
                <p>
                  First Light is his genesis collection. Twenty-five paintings born from the
                  earliest hours in the Highlands, when colour and weather are still negotiating
                  with the land. A test signal from the north.
                </p>
              </div>
              <a
                href="https://x.com/ruthven_nfts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-widest font-mono transition-colors hover:text-white"
                style={{ color: 'rgba(0,232,150,0.6)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Follow @ruthven_nfts
              </a>
            </div>

            {/* Right column — stats & details */}
            <div className="space-y-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(0,40,26,0.4)', border: '1px solid rgba(0,232,150,0.1)' }}>
                <div className="text-xs uppercase tracking-[0.2em] font-mono mb-4" style={{ color: 'rgba(0,232,150,0.4)' }}>
                  Collection Details
                </div>
                <div className="space-y-3">
                  {[
                    ['Supply', '25 paintings'],
                    ['Price', '0.04 ETH'],
                    ['Network', 'Sepolia (Testnet)'],
                    ['Medium', 'AI trained on own paintings + hand drawing'],
                    ['Format', '16:9 landscape'],
                    ['Traits', 'Location, Weather, Time of Day'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(0,40,26,0.4)', border: '1px solid rgba(0,232,150,0.1)' }}>
                <div className="text-xs uppercase tracking-[0.2em] font-mono mb-4" style={{ color: 'rgba(0,232,150,0.4)' }}>
                  The Process
                </div>
                <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" style={{ backgroundColor: 'rgba(0,232,150,0.1)', color: 'rgba(0,232,150,0.6)' }}>1</span>
                    <span>AI trained on Ruthven's own Highland paintings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" style={{ backgroundColor: 'rgba(0,232,150,0.1)', color: 'rgba(0,232,150,0.6)' }}>2</span>
                    <span>Hand-drawn over by Ruthven</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" style={{ backgroundColor: 'rgba(0,232,150,0.1)', color: 'rgba(0,232,150,0.6)' }}>3</span>
                    <span>Animated into living landscapes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" style={{ backgroundColor: 'rgba(0,232,150,0.1)', color: 'rgba(0,232,150,0.6)' }}>4</span>
                    <span>Minted on Ethereum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER (skip in World mode — World layout provides its own) ═══ */}
      {!isWorldMode && <footer className="relative z-10 py-10 px-6 pb-20" style={{ borderTop: `1px solid ${isRuthven ? 'rgba(255,255,255,0.06)' : 'rgba(31,41,55,1)'}` }}>
        <div className="max-w-4xl mx-auto">
          {isRuthven ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo & copyright */}
              <div className="flex items-center gap-4">
                {brand?.logo_url && (
                  <img src={brand.logo_url} alt={brand.name} className="h-8 object-contain opacity-40" />
                )}
                <div>
                  <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    &copy; {new Date().getFullYear()} Ruthven &middot; All rights reserved
                  </p>
                  {collection.contract_address && (
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.15)' }}>
                      {collection.contract_address}
                    </p>
                  )}
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-5">
                <a
                  href="https://x.com/ruthven_nfts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X / Twitter
                </a>
                <a
                  href="https://opensea.io/collection/reflections-i-dont-recognise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 90 90" fill="currentColor"><path d="M90 45C90 69.8514 69.8514 90 45 90C20.1486 90 0 69.8514 0 45C0 20.1486 20.1486 0 45 0C69.8566 0 90 20.1486 90 45Z" opacity="0.3"/><path d="M22.2011 46.512L22.3953 46.2069L34.1016 27.8939C34.2726 27.6257 34.6749 27.6535 34.8043 27.9447C36.76 32.3277 38.4475 37.7786 37.6569 41.1721C37.3194 42.5849 36.3948 44.4393 35.348 46.2069C35.2004 46.4883 35.0396 46.7641 34.872 47.0295C34.7964 47.1455 34.6749 47.2123 34.5765 47.2123H22.0269C22.0067 47.2123 21.9894 47.204 21.9771 47.1895L22.2011 46.512Z" fill="white"/></svg>
                  OpenSea
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ color: 'rgba(75,85,99,1)' }}>
              {brand?.logo_url && (
                <img src={brand.logo_url} alt={brand.name} className="h-8 mx-auto mb-3 object-contain opacity-50" />
              )}
              <p className="text-sm">{brand?.name} &middot; All intellectual property rights reserved</p>
              {collection.contract_address && (
                <p className="mt-1 font-mono text-xs">Contract: {collection.contract_address}</p>
              )}
            </div>
          )}
        </div>
      </footer>}
      {/* end !isWorldMode footer */}

      {/* ═══ STICKY MINT BAR ═══ */}
      {isRuthven && isChooseMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(0,40,26,0.92)', borderTop: '1px solid rgba(0,232,150,0.15)' }}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="text-white font-semibold">{nfts.filter(n => !mintedTokenIds.has(n.token_id)).length}</span> / {collection?.max_supply} available
              </div>
              <div className="hidden sm:block text-xs font-mono" style={{ color: 'rgba(0,232,150,0.5)' }}>
                {currentPrice || collection?.mint_price_wei ? `${((currentPrice || collection?.mint_price_wei) / 1e18).toFixed(4)} ETH` : '0.04 ETH'} each
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <WalletConnect />
              ) : (
                <button
                  onClick={() => {
                    if (galleryRef.current) {
                      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all hover:brightness-110"
                  style={{
                    backgroundColor: '#00E896',
                    color: '#003D29',
                  }}
                >
                  Choose &amp; Mint
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BRAND-SPECIFIC STYLES ═══ */}
      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-cardFadeIn {
          animation: cardFadeIn 0.5s ease-out both;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        ${isDrones ? `
        .drone-cursor-page,
        .drone-cursor-page * {
          cursor: url('/drone-cursor.svg') 16 16, auto !important;
        }
        .drone-cursor-page a,
        .drone-cursor-page button,
        .drone-cursor-page [role="button"],
        .drone-cursor-page input,
        .drone-cursor-page .cursor-pointer {
          cursor: url('/drone-cursor.svg') 16 16, pointer !important;
        }
        ` : ''}

        ${isRuthven ? `
        /* ═══ HIGHLAND STORM ═══ */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700;1,900&display=swap');

        /* ═══ FIRST LIGHT GLOW — title pulses like dawn breaking ═══ */
        .first-light-glow {
          animation: first-light-pulse 8s ease-in-out infinite;
        }

        @keyframes first-light-pulse {
          0%, 100% {
            text-shadow:
              0 0 20px rgba(255,220,160,0.15),
              0 0 60px rgba(255,180,100,0.08),
              0 4px 20px rgba(0,0,0,0.6);
            color: rgba(255,255,255,0.85);
          }
          30% {
            text-shadow:
              0 0 40px rgba(255,230,180,0.5),
              0 0 100px rgba(255,200,120,0.25),
              0 0 160px rgba(255,170,80,0.12),
              0 4px 20px rgba(0,0,0,0.4);
            color: rgba(255,255,255,1);
          }
          50% {
            text-shadow:
              0 0 60px rgba(255,240,200,0.6),
              0 0 120px rgba(255,210,140,0.3),
              0 0 200px rgba(255,180,100,0.15),
              0 4px 20px rgba(0,0,0,0.3);
            color: rgba(255,252,245,1);
          }
          70% {
            text-shadow:
              0 0 35px rgba(255,225,170,0.4),
              0 0 90px rgba(255,190,110,0.2),
              0 4px 20px rgba(0,0,0,0.5);
            color: rgba(255,255,255,0.95);
          }
        }

        /* ═══ BACKGROUND BREATHING LIGHT — dawn shifts across the artwork ═══ */
        .bg-light-breathe {
          animation: bg-breathe 8s ease-in-out infinite;
        }

        @keyframes bg-breathe {
          0%, 100% {
            filter: saturate(1.2) brightness(0.6);
            opacity: 0.3;
          }
          50% {
            filter: saturate(1.6) brightness(0.9);
            opacity: 0.45;
          }
        }

        /* Dawn light wash — warm golden light sweeping across */
        .bg-light-wash {
          background: radial-gradient(ellipse 80% 60% at 40% 40%,
            rgba(255,200,100,0.08) 0%,
            transparent 70%
          );
          animation: light-wash-drift 12s ease-in-out infinite;
          mix-blend-mode: soft-light;
        }

        @keyframes light-wash-drift {
          0%, 100% {
            transform: translateX(-15%) translateY(-5%);
            opacity: 0.3;
          }
          40% {
            transform: translateX(10%) translateY(5%);
            opacity: 0.8;
          }
          70% {
            transform: translateX(20%) translateY(-3%);
            opacity: 0.5;
          }
        }

        /* Soft mist layer 1 — rolling fog bank */
        .storm-mist-1 {
          background: radial-gradient(ellipse 130% 70% at 20% 50%,
            rgba(255,255,255,0.08) 0%,
            transparent 70%
          );
          animation: mist-drift-1 25s ease-in-out infinite;
          filter: blur(80px);
        }

        /* Mist layer 2 — green-tinted Highland haze */
        .storm-mist-2 {
          background: radial-gradient(ellipse 110% 60% at 75% 55%,
            rgba(13,94,63,0.1) 0%,
            transparent 70%
          );
          animation: mist-drift-2 30s ease-in-out infinite;
          filter: blur(100px);
        }

        /* SVG rain animation — smooth falling streaks */
        .storm-rain-svg {
          opacity: 0.7;
        }

        .storm-rain-layer-1 {
          animation: svg-rain-1 0.9s linear infinite;
        }

        .storm-rain-layer-2 {
          animation: svg-rain-2 0.7s linear infinite;
        }

        /* Low rolling mist at ground level */
        .storm-low-cloud {
          background: linear-gradient(to top,
            rgba(13,94,63,0.2) 0%,
            rgba(13,94,63,0.1) 30%,
            rgba(255,255,255,0.04) 60%,
            transparent 100%
          );
          animation: cloud-roll 25s ease-in-out infinite;
          filter: blur(40px);
        }

        /* Lightning — subtle sheet flash */
        .storm-lightning {
          animation: lightning 10s ease-in-out infinite;
          background: radial-gradient(ellipse at 55% 25%, rgba(255,255,255,0.12), transparent 55%);
          opacity: 0;
        }

        @keyframes mist-drift-1 {
          0%, 100% { transform: translateX(-20%); opacity: 0.6; }
          50% { transform: translateX(20%); opacity: 0.9; }
        }

        @keyframes mist-drift-2 {
          0%, 100% { transform: translateX(25%); opacity: 0.5; }
          50% { transform: translateX(-20%); opacity: 0.8; }
        }

        @keyframes svg-rain-1 {
          0% { transform: translateY(-15px) translateX(5px); }
          100% { transform: translateY(120px) translateX(-10px); }
        }

        @keyframes svg-rain-2 {
          0% { transform: translateY(-10px) translateX(8px); }
          100% { transform: translateY(90px) translateX(-12px); }
        }

        @keyframes cloud-roll {
          0%, 100% { transform: translateX(-10%) scaleX(1.3); opacity: 0.6; }
          50% { transform: translateX(10%) scaleX(1.5); opacity: 0.9; }
        }

        @keyframes lightning {
          0%, 100% { opacity: 0; }
          52% { opacity: 0; }
          52.5% { opacity: 0.06; }
          53% { opacity: 0; }
          54% { opacity: 0.1; }
          54.5% { opacity: 0.02; }
          55% { opacity: 0; }
          82% { opacity: 0; }
          82.3% { opacity: 0.05; }
          82.6% { opacity: 0; }
        }

        /* ═══ WEATHER EFFECT OVERLAYS — live effects on each NFT card ═══ */

        /* Dawn Glow — warm golden light pulsing */
        .weather-fx-dawn-glow {
          background: radial-gradient(ellipse at 50% 30%, rgba(255,200,100,0.3), transparent 70%);
          animation: fx-dawn 6s ease-in-out infinite;
        }
        .weather-img-dawn-glow {
          animation: img-dawn 6s ease-in-out infinite;
        }
        @keyframes fx-dawn {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes img-dawn {
          0%, 100% { filter: brightness(1) saturate(1.1); }
          50% { filter: brightness(1.15) saturate(1.4) sepia(0.1); }
        }

        /* Highland Mist — white haze drifting across */
        .weather-fx-highland-mist {
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(255,255,255,0.1) 70%, transparent 100%);
          animation: fx-mist 10s ease-in-out infinite;
          backdrop-filter: blur(0.5px);
        }
        .weather-img-highland-mist {
          animation: img-mist 10s ease-in-out infinite;
        }
        @keyframes fx-mist {
          0%, 100% { transform: translateX(-10%); opacity: 0.4; }
          50% { transform: translateX(10%); opacity: 0.7; }
        }
        @keyframes img-mist {
          0%, 100% { filter: brightness(0.95) contrast(0.95); }
          50% { filter: brightness(1.05) contrast(0.85) blur(0.3px); }
        }

        /* Storm Front — dark moody shifts with lightning */
        .weather-fx-storm-front {
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.2) 100%);
          animation: fx-storm 8s ease-in-out infinite;
        }
        .weather-img-storm-front {
          animation: img-storm 8s ease-in-out infinite;
        }
        @keyframes fx-storm {
          0%, 100% { opacity: 0.5; }
          45% { opacity: 0.7; }
          47% { opacity: 0.1; background: rgba(255,255,255,0.15); }
          49% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
        @keyframes img-storm {
          0%, 100% { filter: brightness(0.85) contrast(1.2) saturate(0.8); }
          47% { filter: brightness(1.3) contrast(1.1) saturate(0.6); }
          50% { filter: brightness(0.8) contrast(1.3) saturate(0.7); }
        }

        /* Northern Light — shifting aurora greens and purples */
        .weather-fx-northern-light {
          background: linear-gradient(160deg, rgba(0,255,128,0.08), rgba(128,0,255,0.08), rgba(0,200,100,0.06));
          animation: fx-aurora 12s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .weather-img-northern-light {
          animation: img-aurora 12s ease-in-out infinite;
        }
        @keyframes fx-aurora {
          0%, 100% { opacity: 0.3; background-position: 0% 0%; }
          33% { opacity: 0.6; background: linear-gradient(200deg, rgba(0,255,128,0.12), rgba(128,0,255,0.1), transparent); }
          66% { opacity: 0.5; background: linear-gradient(120deg, rgba(128,0,255,0.1), rgba(0,200,100,0.12), transparent); }
        }
        @keyframes img-aurora {
          0%, 100% { filter: brightness(0.9) hue-rotate(0deg); }
          33% { filter: brightness(1.05) hue-rotate(10deg); }
          66% { filter: brightness(0.95) hue-rotate(-8deg); }
        }

        /* Haar — thick sea fog rolling in from coast */
        .weather-fx-haar {
          background: linear-gradient(to top, rgba(200,210,220,0.35) 0%, rgba(200,210,220,0.15) 40%, transparent 70%);
          animation: fx-haar 15s ease-in-out infinite;
        }
        .weather-img-haar {
          animation: img-haar 15s ease-in-out infinite;
        }
        @keyframes fx-haar {
          0%, 100% { transform: translateY(20%); opacity: 0.5; }
          50% { transform: translateY(-5%); opacity: 0.8; }
        }
        @keyframes img-haar {
          0%, 100% { filter: brightness(0.95) contrast(0.9) saturate(0.7); }
          50% { filter: brightness(1) contrast(0.8) saturate(0.5) blur(0.5px); }
        }

        /* Golden Hour — warm amber sunset wash */
        .weather-fx-golden-hour {
          background: radial-gradient(ellipse at 70% 80%, rgba(255,160,50,0.25), transparent 60%);
          animation: fx-golden 8s ease-in-out infinite;
        }
        .weather-img-golden-hour {
          animation: img-golden 8s ease-in-out infinite;
        }
        @keyframes fx-golden {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes img-golden {
          0%, 100% { filter: brightness(1) saturate(1.2) sepia(0.05); }
          50% { filter: brightness(1.1) saturate(1.5) sepia(0.15); }
        }

        /* Gloaming — deep twilight blues and purples */
        .weather-fx-gloaming {
          background: linear-gradient(180deg, rgba(40,20,80,0.2) 0%, rgba(20,30,80,0.15) 50%, rgba(60,20,60,0.1) 100%);
          animation: fx-gloaming 10s ease-in-out infinite;
        }
        .weather-img-gloaming {
          animation: img-gloaming 10s ease-in-out infinite;
        }
        @keyframes fx-gloaming {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes img-gloaming {
          0%, 100% { filter: brightness(0.85) saturate(0.8) hue-rotate(10deg); }
          50% { filter: brightness(0.75) saturate(0.6) hue-rotate(20deg); }
        }

        /* Snow Squall — white particles + cold blue wash */
        .weather-fx-snow-squall {
          background:
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1.5px 1.5px at 40% 60%, white, transparent),
            radial-gradient(1px 1px at 60% 20%, white, transparent),
            radial-gradient(1.5px 1.5px at 80% 70%, white, transparent),
            radial-gradient(1px 1px at 10% 80%, white, transparent),
            radial-gradient(1px 1px at 70% 45%, white, transparent),
            radial-gradient(1.5px 1.5px at 50% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 50%, white, transparent);
          background-size: 100% 100%;
          animation: fx-snow 3s linear infinite;
        }
        .weather-img-snow-squall {
          animation: img-snow 6s ease-in-out infinite;
        }
        @keyframes fx-snow {
          0% { transform: translateY(-10%) translateX(-2%); opacity: 0.5; }
          100% { transform: translateY(100%) translateX(5%); opacity: 0.3; }
        }
        @keyframes img-snow {
          0%, 100% { filter: brightness(1.05) saturate(0.7) contrast(0.95); }
          50% { filter: brightness(1.15) saturate(0.5) contrast(0.9); }
        }

        /* ═══ EAGLE SILHOUETTES ═══ */
        .eagle-1, .eagle-2, .eagle-3 {
          position: fixed;
          z-index: 2;
          pointer-events: none;
          opacity: 0.12;
        }

        .eagle-1 {
          top: 15%;
          animation: eagle-soar-1 50s linear infinite;
        }
        .eagle-2 {
          top: 25%;
          animation: eagle-soar-2 65s linear infinite;
          animation-delay: -25s;
          opacity: 0.07;
        }
        .eagle-3 {
          top: 10%;
          animation: eagle-soar-3 58s linear infinite;
          animation-delay: -40s;
          opacity: 0.09;
        }

        @keyframes eagle-soar-1 {
          0% { left: -80px; top: 15%; transform: scaleX(1) rotate(-2deg); }
          25% { top: 12%; transform: scaleX(1) rotate(1deg); }
          50% { top: 18%; transform: scaleX(1) rotate(-1deg); }
          75% { top: 14%; transform: scaleX(1) rotate(2deg); }
          100% { left: calc(100% + 80px); top: 16%; transform: scaleX(1) rotate(-2deg); }
        }

        @keyframes eagle-soar-2 {
          0% { left: calc(100% + 60px); top: 25%; transform: scaleX(-1) rotate(1deg); }
          30% { top: 22%; transform: scaleX(-1) rotate(-2deg); }
          60% { top: 28%; transform: scaleX(-1) rotate(1deg); }
          100% { left: -60px; top: 24%; transform: scaleX(-1) rotate(-1deg); }
        }

        @keyframes eagle-soar-3 {
          0% { left: -100px; top: 8%; transform: scaleX(1) rotate(-3deg) scale(0.7); }
          50% { top: 12%; transform: scaleX(1) rotate(2deg) scale(0.7); }
          100% { left: calc(100% + 100px); top: 6%; transform: scaleX(1) rotate(-1deg) scale(0.7); }
        }
        ` : ''}
      `}</style>
    </div>
  );
}
