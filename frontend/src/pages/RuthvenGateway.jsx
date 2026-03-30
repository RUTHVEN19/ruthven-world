import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMintData } from '../utils/api';
import HighlandMap from '../components/HighlandMap';

export default function RuthvenGateway() {
  const navigate = useNavigate();
  const [countdownNow, setCountdownNow] = useState(new Date());
  const [mapLocation, setMapLocation] = useState(null);

  // Fetch First Light data for the map and stats
  const { data } = useQuery({
    queryKey: ['mint', 'ruthven', 'first-light'],
    queryFn: () => getMintData('ruthven', 'first-light'),
  });

  const nfts = data?.nfts || [];
  const collection = data?.collection;

  // Countdown to March 28th 5pm GMT
  const mintDate = new Date('2026-03-31T17:00:00Z');
  useEffect(() => {
    const timer = setInterval(() => setCountdownNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLeft = mintDate - countdownNow;
  const days = Math.max(0, Math.floor(timeLeft / 86400000));
  const hours = Math.max(0, Math.floor((timeLeft % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((timeLeft % 60000) / 1000));
  const isLive = timeLeft <= 0;

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#001A10' }}>

      {/* ── Hero Section — full screen video ── */}
      <section className="relative z-10 min-h-screen flex flex-col overflow-hidden">
        {/* Full screen video background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            src="/artist/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,26,16,0.4) 0%, transparent 30%, transparent 55%, rgba(0,26,16,0.97) 100%)',
          }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-end flex-1 px-6 pb-16 text-center max-w-3xl mx-auto w-full">
          {/* Brand mark */}
          <div className="mb-8">
            <img
              src="/RUTHVEN LOGO.png"
              alt="Ruthven"
              className="h-24 md:h-36 lg:h-44 mx-auto object-contain"
              style={{ opacity: 0.9 }}
            />
          </div>

          {/* World description */}
          <p className="text-base md:text-lg mb-4 leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Playfair Display, serif' }}>
            An immersive digital world built around the paintings, process,
            and transmissions of a cryptoartist working from the Scottish Highlands.
          </p>
          <p className="text-sm mb-12 leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Playfair Display, serif' }}>
            AI trained on his own oil paintings. Hand-drawn into existence.
            <br />Minted on Ethereum. Rooted in Scotland.
          </p>

          {/* World Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-16">
            {[
              { label: 'First Light', desc: 'Genesis Collection', path: '/ruthven/first-light', icon: '◈' },
              { label: 'The Map', desc: 'Explore Scotland', path: '#map', icon: '◎' },
              { label: 'The Artist', desc: 'Meet Ruthven', path: '/ruthven/artist', icon: '◆' },
              { label: 'Studio', desc: 'The Process', path: '/ruthven/studio', icon: '◉' },
              { label: 'Signal', desc: 'Transmissions', path: '/ruthven/signal', icon: '◇' },
            ].map(card => (
              <Link
                key={card.label}
                to={card.path}
                onClick={card.path === '#map' ? (e) => {
                  e.preventDefault();
                  document.getElementById('scotland-map')?.scrollIntoView({ behavior: 'smooth' });
                } : undefined}
                className="group rounded-lg p-4 text-center transition-all duration-500"
                style={{
                  backgroundColor: 'rgba(0,40,26,0.3)',
                  border: '1px solid rgba(0,232,150,0.08)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,232,150,0.25)';
                  e.currentTarget.style.backgroundColor = 'rgba(0,40,26,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,232,150,0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(0,40,26,0.3)';
                }}
              >
                <div className="text-2xl mb-2 opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ color: '#00E896' }}>
                  {card.icon}
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-white mb-0.5">
                  {card.label}
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {card.desc}
                </div>
              </Link>
            ))}
          </div>

          {/* Countdown / Live Status */}
          <div className="mb-8">
            {isLive ? (
              <Link
                to="/ruthven/first-light"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-500"
                style={{
                  backgroundColor: 'rgba(0,232,150,0.15)',
                  border: '1px solid rgba(0,232,150,0.4)',
                  color: '#00E896',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#00E896] animate-pulse" />
                First Light is Live — Mint Now
              </Link>
            ) : (
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.3em] mb-4"
                  style={{ color: 'rgba(0,232,150,0.35)' }}>
                  First Light drops in
                </div>
                <div className="flex items-center justify-center gap-4">
                  {[
                    { val: days, label: 'Days' },
                    { val: hours, label: 'Hrs' },
                    { val: minutes, label: 'Min' },
                    { val: seconds, label: 'Sec' },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <div className="text-3xl md:text-4xl font-mono font-light" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {String(val).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: 'rgba(0,232,150,0.3)' }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-8" style={{ backgroundColor: 'rgba(0,232,150,0.15)' }} />
          <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1" style={{ backgroundColor: 'rgba(0,232,150,0.2)' }} />
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="relative z-10 py-16 px-6 text-center">
        <blockquote
          className="text-2xl md:text-4xl leading-tight max-w-4xl mx-auto"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 300,
          }}
        >
          "You experience Scotland through her weather first.
          <br className="hidden md:block" />
          {' '}The mountains and lochs come after."
        </blockquote>
        <div className="mt-4 text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.25)' }}>
          — Ruthven
        </div>
      </section>

      {/* ── Scotland Map ── */}
      <section id="scotland-map" className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <HighlandMap
          nfts={nfts}
          onLocationSelect={(loc) => {
            setMapLocation(loc);
            if (loc) {
              navigate(`/ruthven/first-light?location=${encodeURIComponent(loc)}`);
            }
          }}
          activeLocation={mapLocation}
        />
      </section>

      {/* ── Collection Preview ── */}
      {nfts.length > 0 && (
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(0,232,150,0.35)' }}>
              Chapter One
            </div>
            <h2
              className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase mb-6"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '0.06em',
                textShadow: '0 0 60px rgba(0,232,150,0.12), 0 0 120px rgba(0,232,150,0.04)',
                lineHeight: 0.9,
              }}
            >
              First<br />Light
            </h2>
            <div className="w-16 h-px mx-auto mb-5" style={{ backgroundColor: 'rgba(0,232,150,0.2)' }} />
            <p className="mt-3 text-sm md:text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              25 paintings from the earliest hours in the Highlands.<br />A test signal from the north.
            </p>
          </div>

          {/* Scrolling preview */}
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll-gallery">
              {[...nfts, ...nfts].map((nft, i) => (
                <div key={`${nft.id}-${i}`} className="flex-shrink-0 w-80 rounded-lg overflow-hidden group"
                  style={{ border: '1px solid rgba(0,232,150,0.08)' }}>
                  {(nft.image_cid || nft.image_path) && (
                    <img
                      src={nft.image_cid ? `https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs/${nft.image_cid}` : `http://localhost:5001/uploads/${nft.image_path}`}
                      alt={nft.name}
                      className="w-full object-cover"
                      style={{ aspectRatio: '16/9' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/ruthven/first-light"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-300"
              style={{
                border: '1px solid rgba(0,232,150,0.2)',
                color: 'rgba(0,232,150,0.7)',
              }}
            >
              Enter First Light →
            </Link>
          </div>
        </section>
      )}

      {/* ── About ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px" style={{ backgroundColor: 'rgba(0,232,150,0.2)' }} />
              <span className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.4)' }}>
                About the Artist
              </span>
            </div>
            <h3 className="text-3xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.85)' }}>
              Ruthven
            </h3>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <p>
                Ruthven is a cryptoartist and painter who works from the Scottish Highlands.
                His practice begins not with the landscape, but with the weather — the mist
                that precedes the mountain, the light that arrives before the view.
              </p>
              <p>
                He trains AI on his own paintings, then draws into each generation by hand,
                layering human gesture over machine vision. The result is something between
                memory and forecast — landscapes that feel both ancient and yet to arrive.
              </p>
            </div>
            <a
              href="https://x.com/ruthven_nfts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-widest font-mono transition-colors hover:text-white"
              style={{ color: 'rgba(0,232,150,0.5)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow @ruthven_nfts
            </a>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(0,40,26,0.3)', border: '1px solid rgba(0,232,150,0.08)' }}>
              <div className="text-xs uppercase tracking-[0.2em] font-mono mb-4" style={{ color: 'rgba(0,232,150,0.3)' }}>
                The Process
              </div>
              {[
                ['01', 'AI trained on Ruthven\'s own Highland paintings'],
                ['02', 'New works generated from the trained model'],
                ['03', 'Hand-drawn over by Ruthven — human gesture on machine vision'],
                ['04', 'Animated in Kling AI to bring the weather to life'],
                ['05', 'Minted on Ethereum — owned by the collector forever'],
              ].map(([num, text]) => (
                <div key={num} className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-mono mt-0.5" style={{ color: 'rgba(0,232,150,0.4)' }}>{num}</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery scroll animation */}
      <style>{`
        @keyframes scroll-gallery {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-gallery {
          animation: scroll-gallery 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
