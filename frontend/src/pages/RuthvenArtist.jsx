import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMintData } from '../utils/api';

// Drop files into frontend/public/artist/ with these exact filenames:
const ARTIST_IMAGES = {
  hero:      '/artist/hero.mp4',   // video — drop hero.mp4 when ready
  theMan:    '/artist/the-man.png',
  theShift:  '/artist/the-shift.jpg',
  walk1:     '/artist/walk-1.png',
  walk2:     '/artist/walk-3.jpg',
  walk3:     '/artist/walk-5.png',
  walk4:     '/artist/walk-6.png',
  hound1:    '/artist/hound-1.jpg',
  hound2:    '/artist/hound-2.jpg',
};

// ── Image slot — loads from /artist/ folder, falls back to placeholder ──
function ImageSlot({ label = 'AWAITING TRANSMISSION', aspect = '16/9', className = '', src = null }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const showImage = src && !error;

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg overflow-hidden ${className}`}
      style={{
        aspectRatio: aspect,
        border: showImage && loaded ? 'none' : '1px dashed rgba(0,232,150,0.15)',
        backgroundColor: 'rgba(0,40,26,0.25)',
      }}
    >
      {showImage && (
        <img
          src={src}
          alt={label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {(!showImage || !loaded) && (
        <div className="text-center z-10">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{ border: '1px solid rgba(0,232,150,0.15)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,232,150,0.25)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'rgba(0,232,150,0.2)' }}>
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hero video — autoplays muted, falls back to placeholder ──
function HeroVideo({ src }) {
  const [error, setError] = React.useState(false);
  const isVideo = src && src.match(/\.(mp4|webm|mov)$/i);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,40,26,0.4)' }}>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(0,232,150,0.15)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,232,150,0.25)" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'rgba(0,232,150,0.2)' }}>
            HERO VIDEO — AWAITING TRANSMISSION
          </div>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        onError={() => setError(true)}
      >
        <source src={src} type={src.endsWith('.webm') ? 'video/webm' : src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
      </video>
    );
  }

  // Fallback: treat as image
  return (
    <img src={src} alt="Ruthven" className="w-full h-full object-cover" onError={() => setError(true)} />
  );
}

// ── Details data ──
const DETAILS = [
  ['Location', 'Scottish Highlands'],
  ['Medium', 'AI-trained on own oil paintings + hand drawing'],
  ['Scottish Weather', 'Peter Doig, Joan Eardley, the weather'],
  ['Drink', 'Ruthven Single Malt'],
  ['Companions', 'Two Highland hounds'],
  ['Tools', 'AI Trained Models, Kling, iPad Pro, oil paints'],
  ['Wardrobe', 'Tweed, always tweed'],
];

export default function RuthvenArtist() {
  const { data } = useQuery({
    queryKey: ['mint', 'ruthven', 'first-light'],
    queryFn: () => getMintData('ruthven', 'first-light'),
  });
  const nfts = data?.nfts || [];
  const bgNft = nfts[3] || nfts[0];
  const bgSrc = bgNft?.image_cid
    ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${bgNft.image_cid}`
    : bgNft?.image_path
      ? `http://localhost:5001/uploads/${bgNft.image_path}`
      : null;

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#001A10' }}>
      {/* Background painting */}
      {bgSrc && (
        <div className="fixed inset-0 z-0">
          <img src={bgSrc} alt="" className="w-full h-full object-cover"
            style={{ opacity: 0.2, filter: 'saturate(0.5) brightness(0.85)' }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,26,16,0.6) 0%, rgba(0,26,16,0.8) 40%, rgba(0,26,16,0.95) 100%)',
          }} />
        </div>
      )}

      {/* Paint effects */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[20%] w-1 h-full opacity-[0.02]"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, #00E896 30%, transparent 60%)', animation: 'artist-drip 15s ease-in-out infinite' }} />
        <div className="absolute top-0 right-[25%] w-px h-full opacity-[0.015]"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, #ffffff 40%, transparent 70%)', animation: 'artist-drip 20s ease-in-out infinite 4s' }} />
        <div className="absolute top-[35%] -left-[10%] w-[120%] h-24 opacity-[0.01] rotate-[-2deg]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,232,150,0.4) 20%, rgba(0,232,150,0.2) 50%, transparent 80%)', animation: 'artist-sweep 22s ease-in-out infinite' }} />
      </div>

      <style>{`
        @keyframes artist-drip {
          0%, 100% { transform: translateY(-3%); opacity: 0.02; }
          50% { transform: translateY(3%); opacity: 0.04; }
        }
        @keyframes artist-sweep {
          0%, 100% { transform: translateX(-5%) rotate(-2deg); opacity: 0.01; }
          50% { transform: translateX(5%) rotate(0deg); opacity: 0.02; }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 min-h-screen flex flex-col text-center overflow-hidden">
        {/* Hero video — full viewport */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <HeroVideo src={ARTIST_IMAGES.hero} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,26,16,0.3) 0%, transparent 30%, transparent 60%, rgba(0,26,16,0.95) 100%)',
          }} />
        </div>

        {/* Title overlaid on video */}
        <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-16 px-6">
          <img src="/RUTHVEN LOGO.png" alt="Ruthven" className="h-24 md:h-32 lg:h-40 mx-auto mb-4 object-contain opacity-90" />
          <div className="text-xs font-mono uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(0,232,150,0.5)' }}>
            The Artist
          </div>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Painter. Cryptoartist. Highland walker.
          </p>
        </div>
      </section>

      {/* ═══ OPENING QUOTE ═══ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: 'rgba(0,232,150,0.2)' }} />
        <blockquote
          className="text-xl md:text-3xl lg:text-4xl leading-snug"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 300,
          }}
        >
          "I stopped painting what I could see.
          <br className="hidden md:block" />
          {' '}I started painting what the weather was doing to me."
        </blockquote>
        <div className="mt-6 text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.3)' }}>
          — Ruthven
        </div>
        <div className="w-8 h-px mx-auto mt-8" style={{ backgroundColor: 'rgba(0,232,150,0.2)' }} />
      </section>

      {/* ═══ THE MAN ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ backgroundColor: 'rgba(0,232,150,0.25)' }} />
              <span className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.4)' }}>
                The Man
              </span>
            </div>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <p>
                Ruthven lives and works from the Scottish Highlands. He paints the weather
                before it clears. The mist before the mountain. The light before the view.
              </p>
              <p>
                He began as a traditional oil painter — canvases stacked in a croft studio
                with no phone signal and a view of nothing but cloud. His work sold quietly
                in Edinburgh galleries. He was content. Then he discovered what happened when
                he trained an AI on twenty years of his own paintings.
              </p>
              <p>
                The machine didn't copy him. It learned to see like him. And then he drew
                back into every image, correcting the machine with his hand — adding the
                cold, the wind, the things algorithms can't feel.
              </p>
              <p style={{ color: 'rgba(0,232,150,0.5)', fontStyle: 'italic' }}>
                He drinks Ruthven Single Malt. The paintings speak for themselves.
              </p>
            </div>
          </div>
          <div>
            <ImageSlot label="THE MAN — PORTRAIT" aspect="3/4" src={ARTIST_IMAGES.theMan} />
          </div>
        </div>
      </section>

      {/* ═══ THE SHIFT ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ backgroundColor: 'rgba(0,232,150,0.25)' }} />
              <span className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.4)' }}>
                The Shift
              </span>
            </div>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <p>
                The shift wasn't sudden. It was a slow accumulation — of curiosity, of
                frustration with galleries, of a sense that the Highland landscape deserved
                something more than a canvas hung in a dining room.
              </p>
              <p>
                When Ruthven first fed his oil paintings into an AI model, it produced
                something he'd never seen — his own visual memory, refracted. Scotland as
                he knew it, but dreaming. He spent six months learning to draw back into
                the generations. Correcting. Adding weather. Adding weight.
              </p>
              <p>
                The blockchain gave him something the gallery system never could: direct
                connection to collectors, provenance that outlasts institutions, and
                ownership terms that protect both the artist and the collector.
              </p>
            </div>
          </div>
          <div className="md:order-1">
            <ImageSlot label="THE SHIFT — STUDIO" aspect="4/5" src={ARTIST_IMAGES.theShift} />
          </div>
        </div>
      </section>

      {/* ═══ THE WALK ═══ */}
      <section className="relative z-10 py-16">
        <div className="text-center mb-8 px-6">
          <div className="text-xs font-mono uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(0,232,150,0.3)' }}>
            The Walk
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Most mornings before dawn. Always with the hounds. Always into the weather.
          </p>
        </div>

        {/* Horizontal scroll strip */}
        <div className="overflow-x-auto pb-4 px-6">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {[
              { label: 'DAWN WALK',  src: ARTIST_IMAGES.walk1 },
              { label: 'THE VIEW',   src: ARTIST_IMAGES.walk2 },
              { label: 'GLEN TRACK', src: ARTIST_IMAGES.walk3 },
              { label: 'MIST RISING',src: ARTIST_IMAGES.walk4 },
            ].map(({ label, src }, i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <ImageSlot label={label} aspect="16/9" src={src} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE HOUNDS ═══ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="text-xs font-mono uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(0,232,150,0.3)' }}>
          The Hounds
        </div>
        <p className="text-sm leading-relaxed max-w-lg mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Two deerhounds. They don't care about the blockchain.
          They care about the walk, the scent of peat, and whether
          there's something moving in the heather. Ruthven says they're
          the only honest critics he has.
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <ImageSlot label="HOUND I" aspect="1/1" src={ARTIST_IMAGES.hound1} />
          <ImageSlot label="HOUND II" aspect="1/1" src={ARTIST_IMAGES.hound2} />
        </div>
      </section>

      {/* ═══ DETAILS CARD ═══ */}
      <section className="relative z-10 max-w-xl mx-auto px-6 py-12">
        <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(0,40,26,0.4)', border: '1px solid rgba(0,232,150,0.1)' }}>
          <div className="text-xs uppercase tracking-[0.2em] font-mono mb-5" style={{ color: 'rgba(0,232,150,0.4)' }}>
            Field Notes
          </div>
          <div className="space-y-3">
            {DETAILS.map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-4 text-sm">
                <span className="font-mono text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
                <span className="text-right" style={{ color: 'rgba(255,255,255,0.65)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECOND QUOTE ═══ */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center">
        <blockquote
          className="text-lg md:text-2xl leading-relaxed"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 300,
          }}
        >
          "The AI sees Scotland through my eyes.
          <br className="hidden md:block" />
          {' '}I draw the weather back into every frame."
        </blockquote>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 max-w-xl mx-auto px-6 py-16 text-center">
        <div className="space-y-4">
          <a
            href="/ruthven/first-light"
            className="inline-block px-8 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(0,232,150,0.1)',
              border: '1px solid rgba(0,232,150,0.3)',
              color: '#00E896',
            }}
          >
            Enter First Light →
          </a>
          <div>
            <a
              href="https://x.com/ruthven_nfts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow @ruthven_nfts
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
