import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// 20 Drone Blondes selected for the Print Shop — spread across the collection
const PRINT_EDITION_NUMS = [3, 7, 14, 22, 29, 35, 41, 48, 56, 63, 69, 74, 81, 88, 94, 99, 103, 109, 115, 120];
const ALL_BLONDES = PRINT_EDITION_NUMS.map(n => ({
  id: `db-${n}`,
  num: n,
  title: `Drone Blonde #${n}`,
}));

const OPENSEA_BASE = 'https://opensea.io/assets/ethereum/0x505348E10069D5083842532f5F5FA432631d109e';

const PRICE_DISPLAY = '\u00A3600';

const SPECS = [
  ['Paper', 'Hahnem\u00FChle Photo Rag Metallic 300gsm'],
  ['Size', 'A2 (420 \u00D7 594 mm)'],
  ['Finish', 'Metallic lustre with deep blacks'],
  ['Signed', 'Hand-signed by Miss AL Simpson'],
  ['Edition', 'Limited Edition of 50'],
  ['AR', 'Drone Blonde AR video activation included'],
  ['Shipping', 'Worldwide \u00B7 Insured \u00B7 21 days'],
];

const MONO = "'Space Mono', monospace";
const SERIF = 'Georgia, serif';
const DISPLAY = '"Anton", "Arial Black", sans-serif';


/* ═══════════════════════════════════════════════════════════════
   CAROUSEL PRINT CARD
   ═══════════════════════════════════════════════════════════════ */
function CarouselCard({ print, isActive, onBuy, onExpand }) {
  const [hovered, setHovered] = useState(false);
  const [arActive, setArActive] = useState(false);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const imgSrc = `/marilyns/browse/${print.num}.jpg`;
  const videoSrc = `/prints/ar/drone-blonde-${print.num}.mp4`;

  const handleMouseEnter = () => {
    setHovered(true);
    timerRef.current = setTimeout(() => setArActive(true), 300);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    setArActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Try to play video when AR activates
  useEffect(() => {
    if (arActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!arActive && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [arActive]);

  const scale = isActive ? 1 : 0.88;
  const opacity = isActive ? 1 : 0.5;

  return (
    <div
      style={{
        flex: '0 0 auto',
        width: 'clamp(300px, 38vw, 480px)',
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: `scale(${hovered && isActive ? 1.02 : scale})`,
        opacity,
        filter: isActive ? 'none' : 'brightness(0.6)',
        cursor: isActive ? 'default' : 'pointer',
      }}
      onMouseEnter={isActive ? handleMouseEnter : undefined}
      onMouseLeave={isActive ? handleMouseLeave : undefined}
    >
      {/* Framed print */}
      <div style={{
        position: 'relative',
        background: '#f5f3f0',
        padding: 'clamp(10px, 2vw, 20px)',
        boxShadow: hovered
          ? '0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(176,200,212,0.15)'
          : '0 20px 60px rgba(0,0,0,0.6)',
        transition: 'all 0.5s ease',
        overflow: 'hidden',
      }}>
        {/* Diamond glint sweep */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          width: '45%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          animation: `glintSweep 8s ease-in-out infinite`,
          animationDelay: `${(print.num % 5) * 1.5}s`,
          pointerEvents: 'none', zIndex: 3,
        }} />

        {/* Artwork container */}
        <div style={{
          position: 'relative',
          aspectRatio: '3/2',
          overflow: 'hidden',
          background: '#111',
        }}>
          <img
            src={imgSrc}
            alt={print.title}
            loading="lazy"
            onClick={isActive && onExpand ? () => onExpand(print) : undefined}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              filter: arActive ? 'contrast(1.1) brightness(1.05)' : 'none',
              transition: 'filter 0.6s ease',
              cursor: isActive ? 'pointer' : 'default',
            }}
          />

          {/* AR video overlay (plays on hover if file exists) */}
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: arActive ? 1 : 0,
              transition: 'opacity 0.8s ease',
              pointerEvents: 'none',
            }}
          />

          {/* AR scan effect overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            opacity: arActive ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}>
            {/* Scan lines */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(176,200,212,0.04) 3px, rgba(176,200,212,0.04) 4px)',
              animation: arActive ? 'scanDrift 2s linear infinite' : 'none',
            }} />

            {/* Scanning beam */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(176,200,212,0.6) 30%, rgba(255,255,255,0.9) 50%, rgba(176,200,212,0.6) 70%, transparent 100%)',
              boxShadow: '0 0 20px rgba(176,200,212,0.4), 0 0 60px rgba(176,200,212,0.2)',
              animation: arActive ? 'scanBeam 2.5s ease-in-out infinite' : 'none',
            }} />

            {/* Holographic shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 60%, rgba(176,200,212,0.12) 0%, transparent 60%)',
              animation: arActive ? 'arPulse 1.5s ease-in-out infinite' : 'none',
            }} />

            {/* AR badge */}
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(176,200,212,0.3)',
              borderRadius: '2px',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#b0c8d4',
                boxShadow: '0 0 6px rgba(176,200,212,0.8)',
                animation: 'arDot 1s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: MONO, fontSize: '8px',
                letterSpacing: '0.2em',
                color: 'rgba(176,200,212,0.9)',
                textTransform: 'uppercase',
              }}>AR Active</span>
            </div>

            {/* Corner brackets */}
            {[[12, 40, 'Top', 'Left'], [null, 40, 'Top', 'Right'], [12, null, 'Bottom', 'Left'], [null, null, 'Bottom', 'Right']].map(([l, t, bv, bh], i) => (
              <div key={i} style={{
                position: 'absolute',
                ...(l !== null ? { left: l } : { right: 12 }),
                ...(t !== null ? { top: t } : { bottom: 12 }),
                width: '20px', height: '20px',
                [`border${bv}`]: '1px solid rgba(176,200,212,0.5)',
                [`border${bh}`]: '1px solid rgba(176,200,212,0.5)',
              }} />
            ))}
          </div>
        </div>

        {/* Signature strip */}
        <div style={{ paddingTop: 'clamp(6px, 1vw, 14px)', textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF, fontSize: '7px', fontStyle: 'italic',
            color: 'rgba(0,0,0,0.25)', letterSpacing: '0.15em',
          }}>Miss AL Simpson</div>
        </div>
      </div>

      {/* Title + AR hint */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <div style={{
          fontFamily: DISPLAY, fontSize: 'clamp(16px, 2vw, 22px)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'crystalShimmer 6s linear infinite',
        }}>
          {print.title}
        </div>
        <div style={{
          fontFamily: MONO, fontSize: '8px', letterSpacing: '0.15em',
          color: 'rgba(176,200,212,0.35)', marginTop: '8px',
        }}>
          {hovered || arActive ? 'AR dance activated' : 'Hover to preview AR'}
        </div>
      </div>

      {/* Action buttons */}
      {isActive && (
        <div style={{
          display: 'flex', gap: '10px', marginTop: '16px',
          animation: 'fadeUp 0.4s ease-out both',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(print); }}
            style={{
              flex: 1, padding: '14px 0',
              fontFamily: MONO, fontSize: '10px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              border: '1px solid rgba(176,200,212,0.4)',
              background: 'rgba(176,200,212,0.08)',
              color: '#fff', cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(176,200,212,0.18)';
              e.currentTarget.style.borderColor = 'rgba(176,200,212,0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(176,200,212,0.08)';
              e.currentTarget.style.borderColor = 'rgba(176,200,212,0.4)';
            }}
          >
            {PRICE_DISPLAY} — Order Print
          </button>
          <a
            href={`${OPENSEA_BASE}/${print.num}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '14px 18px',
              fontFamily: MONO, fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            OpenSea
          </a>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   CAROUSEL — horizontal scroll with snap, arrows, counter
   ═══════════════════════════════════════════════════════════════ */
function PrintCarousel({ onBuy, onExpand, initialIndex = 0 }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const scrollToIndex = useCallback((index) => {
    const clamped = Math.max(0, Math.min(ALL_BLONDES.length - 1, index));
    setActiveIndex(clamped);
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.children;
    if (cards[clamped]) {
      const cardWidth = cards[clamped].offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollPos = cards[clamped].offsetLeft - (containerWidth / 2) + (cardWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, []);

  // Scroll to initial index on mount
  useEffect(() => {
    if (initialIndex > 0) {
      setTimeout(() => scrollToIndex(initialIndex), 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Snap to nearest card on scroll end
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const containerCenter = container.scrollLeft + container.offsetWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        Array.from(container.children).forEach((child, i) => {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const dist = Math.abs(containerCenter - childCenter);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        if (closest !== activeIndex) setActiveIndex(closest);
      }, 80);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => { container.removeEventListener('scroll', handleScroll); clearTimeout(timeout); };
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') scrollToIndex(activeIndex - 1);
      if (e.key === 'ArrowRight') scrollToIndex(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, scrollToIndex]);

  // Mouse drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.pageX, scrollLeft: scrollRef.current.scrollLeft };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.pageX - dragStart.current.x;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };
  const handleMouseUp = () => setIsDragging(false);

  // Jump to specific blonde
  const [jumpValue, setJumpValue] = useState('');
  const handleJump = () => {
    const n = parseInt(jumpValue);
    const idx = ALL_BLONDES.findIndex(b => b.num === n);
    if (idx !== -1) scrollToIndex(idx);
    setJumpValue('');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Carousel track */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          display: 'flex',
          gap: 'clamp(20px, 3vw, 40px)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          padding: 'clamp(40px, 6vw, 80px) clamp(60px, 15vw, 200px)',
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          userSelect: 'none',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {ALL_BLONDES.map((print, i) => (
          <div
            key={print.id}
            onClick={() => scrollToIndex(i)}
            style={{ scrollSnapAlign: 'center', flex: '0 0 auto' }}
          >
            <CarouselCard
              print={print}
              isActive={i === activeIndex}
              onBuy={onBuy}
              onExpand={onExpand}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => scrollToIndex(activeIndex - 1)}
        disabled={activeIndex === 0}
        style={{
          ...arrowStyle,
          left: 'clamp(8px, 2vw, 24px)',
          opacity: activeIndex === 0 ? 0.2 : 0.7,
        }}
        aria-label="Previous print"
      >
        <span style={{ fontSize: '24px' }}>{'\u2039'}</span>
      </button>
      <button
        onClick={() => scrollToIndex(activeIndex + 1)}
        disabled={activeIndex === ALL_BLONDES.length - 1}
        style={{
          ...arrowStyle,
          right: 'clamp(8px, 2vw, 24px)',
          opacity: activeIndex === ALL_BLONDES.length - 1 ? 0.2 : 0.7,
        }}
        aria-label="Next print"
      >
        <span style={{ fontSize: '24px' }}>{'\u203A'}</span>
      </button>

      {/* Counter + Jump */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '24px', marginTop: '8px',
      }}>
        {/* Diamond counter */}
        <div style={{
          fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span style={{
            fontFamily: DISPLAY, fontSize: '20px',
            background: 'linear-gradient(110deg, #b0c8d4, #fff, #a8c0cc)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'crystalShimmer 5s linear infinite',
          }}>
            {String(activeIndex + 1).padStart(3, '0')}
          </span>
          <span style={{ margin: '0 6px' }}>/</span>
          <span>{ALL_BLONDES.length}</span>
        </div>

        {/* Jump input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            min="1"
            max={ALL_BLONDES.length}
            placeholder="#"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
            style={{
              width: '60px', padding: '6px 10px',
              fontFamily: MONO, fontSize: '11px',
              color: '#fff', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              outline: 'none', textAlign: 'center',
            }}
          />
          <button
            onClick={handleJump}
            style={{
              fontFamily: MONO, fontSize: '9px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '7px 12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
            }}
          >Go</button>
        </div>
      </div>

      {/* Scroll indicator dots (every 10th) */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '4px',
        marginTop: '20px', padding: '0 20px',
      }}>
        {Array.from({ length: 12 }, (_, i) => {
          const dotIndex = i * 10;
          const isNear = Math.abs(activeIndex - dotIndex) < 5;
          return (
            <button
              key={i}
              onClick={() => scrollToIndex(dotIndex)}
              style={{
                width: isNear ? '20px' : '6px',
                height: '3px',
                borderRadius: '1.5px',
                border: 'none',
                background: isNear
                  ? 'linear-gradient(90deg, rgba(176,200,212,0.6), rgba(255,255,255,0.8))'
                  : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                padding: 0,
              }}
              title={`Jump to #${dotIndex + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

const arrowStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-70%)',
  width: '48px', height: '48px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(12px)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  zIndex: 10,
  borderRadius: '50%',
};


/* ═══════════════════════════════════════════════════════════════
   CHECKOUT MODAL
   ═══════════════════════════════════════════════════════════════ */
function CheckoutModal({ print, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/print/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, print_id: print.id, print_title: print.title }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Checkout failed.');
        setLoading(false);
        return;
      }
      window.location.href = data.checkout_url;
    } catch {
      setError('Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%', maxWidth: '440px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#0e0e10',
          padding: 'clamp(32px, 5vw, 48px)',
        }}
      >
        <div style={{
          fontFamily: MONO, fontSize: '9px', letterSpacing: '0.4em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          marginBottom: '24px',
        }}>Order Print</div>

        <div style={{
          fontFamily: DISPLAY, fontSize: '22px', textTransform: 'uppercase',
          letterSpacing: '0.05em', marginBottom: '8px', color: '#fff',
        }}>{print.title}</div>

        <div style={{
          fontFamily: SERIF, fontSize: '14px', fontStyle: 'italic',
          color: 'rgba(255,255,255,0.4)', marginBottom: '32px', lineHeight: 1.8,
        }}>
          Signed A2 Hahnem{'\u00FC'}hle Photo Rag Metallic print with AR video activation.
        </div>

        {/* Print preview */}
        <div style={{
          marginBottom: '28px', textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: '#f5f3f0',
            padding: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}>
            <img
              src={`/marilyns/browse/${print.num}.jpg`}
              alt={print.title}
              style={{ width: '280px', height: '187px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        <div style={{
          fontFamily: DISPLAY, fontSize: '36px', letterSpacing: '0.02em',
          marginBottom: '28px', textAlign: 'center',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 15%, #ffffff 30%, #b4ccd8 50%, #ffffff 70%, #a4bcc8 100%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', animation: 'crystalShimmer 6s linear infinite',
        }}>{PRICE_DISPLAY}</div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block', fontFamily: MONO, fontSize: '9px',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)', marginBottom: '10px',
          }}>Email Address</label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              width: '100%', padding: '14px 16px',
              fontFamily: MONO, fontSize: '13px', color: '#fff',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(176,200,212,0.4)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckout()}
          />
        </div>

        {error && (
          <div style={{ fontFamily: MONO, fontSize: '11px', color: '#e57373', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            fontFamily: MONO, fontSize: '11px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            border: '1px solid rgba(176,200,212,0.4)',
            background: 'rgba(176,200,212,0.08)',
            color: '#fff', cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Redirecting to Stripe...' : `Pay ${PRICE_DISPLAY} \u2014 Secure Checkout`}
        </button>

        <button
          onClick={onClose}
          style={{
            display: 'block', width: '100%', marginTop: '12px',
            padding: '12px', fontFamily: MONO, fontSize: '10px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
          }}
        >Cancel</button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   PRINT GRID — view all 20 at once
   ═══════════════════════════════════════════════════════════════ */
function PrintGrid({ onBuy, onSwitchCarousel }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(20px, 4vw, 60px) clamp(16px, 3vw, 40px)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          fontFamily: MONO, fontSize: '10px', letterSpacing: '0.4em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '16px',
        }}>All 20 Signed Prints</div>
        <h2 style={{
          fontFamily: DISPLAY, fontSize: 'clamp(32px, 5vw, 56px)',
          textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 20px',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 60%, #ffffff 100%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', animation: 'crystalShimmer 5s linear infinite',
        }}>Choose Your Print</h2>
        <button
          onClick={onSwitchCarousel}
          style={{
            fontFamily: MONO, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '10px 24px', background: 'rgba(176,200,212,0.06)',
            border: '1px solid rgba(176,200,212,0.2)', color: 'rgba(176,200,212,0.5)',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.06)'; e.currentTarget.style.color = 'rgba(176,200,212,0.5)'; }}
        >
          {'\u2190'} Back to Carousel
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'clamp(16px, 2vw, 28px)',
        maxWidth: '1600px', margin: '0 auto',
      }}>
        {ALL_BLONDES.map((print) => {
          const isHovered = hovered === print.num;
          return (
            <div
              key={print.id}
              onMouseEnter={() => setHovered(print.num)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: '1px solid',
                borderColor: isHovered ? 'rgba(176,200,212,0.2)' : 'rgba(255,255,255,0.06)',
                padding: 'clamp(10px, 1.5vw, 16px)',
                transition: 'all 0.4s ease',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered ? '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(176,200,212,0.05)' : 'none',
              }}
            >
              {/* Framed print */}
              <div style={{
                background: '#f5f3f0', padding: 'clamp(6px, 1vw, 10px)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, width: '45%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'glintSweep 8s ease-in-out infinite',
                  animationDelay: `${(print.num % 7) * 1.2}s`,
                  pointerEvents: 'none', zIndex: 2,
                }} />
                <img
                  src={`/marilyns/browse/${print.num}.jpg`}
                  alt={print.title}
                  loading="lazy"
                  onClick={() => setLightbox(print)}
                  style={{
                    width: '100%', aspectRatio: '3/2', objectFit: 'cover', display: 'block',
                    background: '#111', cursor: 'pointer',
                  }}
                />
                <div style={{ paddingTop: '4px', textAlign: 'center' }}>
                  <div style={{
                    fontFamily: SERIF, fontSize: '6px', fontStyle: 'italic',
                    color: 'rgba(0,0,0,0.2)', letterSpacing: '0.15em',
                  }}>Miss AL Simpson</div>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '12px 0 4px' }}>
                <div style={{
                  fontFamily: DISPLAY, fontSize: '15px', textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: '8px',
                  background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', animation: 'crystalShimmer 6s linear infinite',
                }}>{print.title}</div>

                <div style={{
                  fontFamily: MONO, fontSize: '9px', letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.25)', marginBottom: '12px',
                }}>
                  {PRICE_DISPLAY} {'\u00B7'} Ed. of 50 {'\u00B7'} Signed A2 {'\u00B7'} AR Video
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onBuy(print)}
                    style={{
                      flex: 1, padding: '10px 0',
                      fontFamily: MONO, fontSize: '9px', letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(176,200,212,0.3)',
                      background: isHovered ? 'rgba(176,200,212,0.12)' : 'rgba(176,200,212,0.06)',
                      color: isHovered ? '#fff' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}
                  >Order Print</button>
                  <a
                    href={`${OPENSEA_BASE}/${print.num}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 14px',
                      fontFamily: MONO, fontSize: '9px', letterSpacing: '0.1em',
                      textTransform: 'uppercase', textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center',
                      transition: 'all 0.3s',
                    }}
                  >OpenSea</a>
                  <button
                    onClick={() => navigate('/drones/lounge')}
                    style={{
                      padding: '10px 14px',
                      fontFamily: MONO, fontSize: '9px', letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >Traits</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', marginTop: '60px',
        fontFamily: MONO, fontSize: '9px', letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.1)',
      }}>
        DIAMOND DRONES{'\u2122'} {'\u00B7'} The Diamond Press {'\u00B7'} 20 Prints
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)',
            cursor: 'pointer', animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Framed print */}
          <div style={{
            background: '#f5f3f0', padding: 'clamp(12px, 2vw, 24px)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(176,200,212,0.08)',
            maxWidth: '85vw', maxHeight: '75vh',
          }}>
            <img
              src={`/marilyns/web/${lightbox.num}.jpg`}
              alt={lightbox.title}
              style={{
                maxWidth: '100%', maxHeight: 'calc(75vh - 60px)',
                objectFit: 'contain', display: 'block',
              }}
            />
            <div style={{ paddingTop: '8px', textAlign: 'center' }}>
              <div style={{
                fontFamily: SERIF, fontSize: '9px', fontStyle: 'italic',
                color: 'rgba(0,0,0,0.25)', letterSpacing: '0.15em',
              }}>Miss AL Simpson</div>
            </div>
          </div>

          <div style={{
            fontFamily: DISPLAY, fontSize: 'clamp(18px, 3vw, 28px)',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '24px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'crystalShimmer 6s linear infinite',
          }}>{lightbox.title}</div>

          <div style={{
            fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.3)', marginTop: '8px',
          }}>
            {PRICE_DISPLAY} {'\u00B7'} Edition of 50 {'\u00B7'} Signed A2 {'\u00B7'} AR Video
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { onBuy(lightbox); setLightbox(null); }}
              style={{
                fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em',
                textTransform: 'uppercase', padding: '14px 32px',
                border: '1px solid rgba(176,200,212,0.4)',
                background: 'rgba(176,200,212,0.08)', color: '#fff',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.08)'; }}
            >Order Print</button>
            <a
              href={`${OPENSEA_BASE}/${lightbox.num}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em',
                textTransform: 'uppercase', padding: '14px 24px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', display: 'flex', alignItems: 'center',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >OpenSea</a>
          </div>

          <div style={{
            fontFamily: MONO, fontSize: '9px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
            marginTop: '20px',
          }}>Click anywhere to close</div>
        </div>
      )}
    </div>
  );
}


export default function DronePrintShop() {
  const [searchParams] = useSearchParams();
  const blondeParam = parseInt(searchParams.get('blonde'));
  const initialParamIndex = ALL_BLONDES.findIndex(b => b.num === blondeParam);
  const initialIndex = initialParamIndex !== -1 ? initialParamIndex : 0;

  const [checkoutPrint, setCheckoutPrint] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [viewMode, setViewMode] = useState('carousel');
  const [expandedPrint, setExpandedPrint] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccessMsg('Payment successful! Your print order is confirmed. You will receive an email with shipping details.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('cancelled') === 'true') {
      setSuccessMsg('');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>The Diamond Press | Drone Blonde Prints with AR</title>
        <meta property="og:title" content="The Diamond Press \u2014 20 Drone Blonde A2 Prints" />
        <meta property="og:description" content="Signed A2 Hahnem\u00FChle Photo Rag Metallic prints of the Drone Blondes by Miss AL Simpson. Each with AR video activation." />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta property="og:url" content="https://diamonddrones.world/drones/prints" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="description" content="20 Drone Blondes available as signed A2 Hahnem\u00FChle Photo Rag Metallic prints with AR video activation. \u00A3600 each." />
      </Helmet>

      <style>{`
        @keyframes crystalShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glintSweep {
          0%   { left: -50%; opacity: 0; }
          15%  { opacity: 0.5; }
          100% { left: 150%; opacity: 0; }
        }
        @keyframes scanBeam {
          0%   { top: -2px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scanDrift {
          0%   { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes arPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes arDot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        @keyframes diamondFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-12px) rotate(1deg); }
          66%      { transform: translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes sparkleFloat {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          20%  { transform: translateY(-20px) scale(1); opacity: 1; }
          80%  { transform: translateY(-80px) scale(0.5); opacity: 0.3; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
      `}</style>

      <div style={{ background: '#0a0a0a', color: '#fff', position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

        {/* Background film */}
        <video
          autoPlay muted loop playsInline
          src="/films/dd-diamond-drone-lounge-bg.mp4"
          style={{
            position: 'fixed', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0, opacity: 0.08,
            pointerEvents: 'none', filter: 'saturate(0) contrast(1.2)',
          }}
        />

        {/* Ambient diamond sparkle particles */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${5 + (i * 47) % 90}%`,
              top: `${10 + (i * 31) % 80}%`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              background: i % 5 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(176,200,212,0.5)',
              borderRadius: '50%',
              boxShadow: i % 3 === 0
                ? '0 0 8px rgba(255,255,255,0.4), 0 0 16px rgba(176,200,212,0.2)'
                : '0 0 4px rgba(176,200,212,0.3)',
              animation: `sparkleFloat ${3 + (i % 6) * 1.5}s ease-in-out ${i * 0.4}s infinite`,
            }} />
          ))}
        </div>

        {/* ═══════ HERO ═══════ */}
        <div style={{
          position: 'relative', textAlign: 'center',
          padding: 'clamp(100px, 14vw, 180px) clamp(24px, 6vw, 80px) clamp(20px, 3vw, 40px)',
          overflow: 'hidden', zIndex: 1,
        }}>
          {/* Radial glow */}
          <div style={{
            position: 'absolute', top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '900px', height: '600px',
            background: 'radial-gradient(ellipse, rgba(180,200,220,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontFamily: MONO, fontSize: '10px', letterSpacing: '0.5em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: '28px', animation: 'fadeUp 0.8s ease-out both',
          }}>
            20 Signed Prints {'\u00B7'} AR Video Activation
          </div>

          <h1 style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(52px, 9vw, 120px)',
            lineHeight: 1.0, textTransform: 'uppercase',
            letterSpacing: '0.03em', margin: '0 0 28px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'crystalShimmer 5s linear infinite, fadeUp 1s ease-out both',
          }}>
            THE DIAMOND<br />PRESS
          </h1>

          <p style={{
            fontFamily: SERIF, fontSize: 'clamp(14px, 1.6vw, 17px)',
            fontStyle: 'italic', color: 'rgba(255,255,255,0.35)',
            maxWidth: '600px', margin: '0 auto', lineHeight: 1.9,
            animation: 'fadeUp 1.2s ease-out both',
          }}>
            Every Drone Blonde, available as a signed A2 print on museum-grade
            Hahnem{'\u00FC'}hle Photo Rag Metallic. Each paired with a bespoke AR
            video activation that brings your Drone Blonde to life.
          </p>

          {/* View All 20 — prominent at top */}
          <button
            onClick={() => { setViewMode('grid'); window.scrollTo(0, 0); }}
            style={{
              display: 'inline-block', marginTop: '32px',
              fontFamily: DISPLAY, fontSize: 'clamp(14px, 2vw, 18px)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '16px 44px',
              border: '1px solid rgba(176,200,212,0.5)',
              background: 'rgba(176,200,212,0.08)', color: '#fff',
              cursor: 'pointer', transition: 'all 0.4s',
              animation: 'fadeUp 1.4s ease-out both',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.2)'; e.currentTarget.style.borderColor = 'rgba(176,200,212,0.8)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(176,200,212,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.08)'; e.currentTarget.style.borderColor = 'rgba(176,200,212,0.5)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            View All 20 Prints
          </button>
        </div>

        {/* ═══════ SUCCESS BANNER ═══════ */}
        {successMsg && (
          <div style={{
            maxWidth: '700px', margin: '0 auto 40px',
            padding: '20px 28px',
            border: '1px solid rgba(129,199,132,0.3)',
            background: 'rgba(129,199,132,0.06)',
            fontFamily: MONO, fontSize: '12px',
            color: 'rgba(129,199,132,0.9)',
            textAlign: 'center', lineHeight: 1.7, zIndex: 1, position: 'relative',
          }}>
            {successMsg}
          </div>
        )}

        {/* ═══════ CAROUSEL / GRID TOGGLE ═══════ */}
        {viewMode === 'carousel' ? (
          <>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PrintCarousel onBuy={setCheckoutPrint} onExpand={setExpandedPrint} initialIndex={initialIndex} />
            </div>

          </>
        ) : (
          <PrintGrid onBuy={setCheckoutPrint} onSwitchCarousel={() => { setViewMode('carousel'); window.scrollTo(0, 0); }} />
        )}

        {viewMode === 'carousel' && (
        <>
        {/* ═══════ AR CONCEPT ═══════ */}
        <div style={{
          maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1,
          padding: 'clamp(60px, 8vw, 100px) clamp(24px, 6vw, 80px) clamp(40px, 4vw, 60px)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(28px, 4vw, 44px)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            lineHeight: 1.1, marginBottom: '20px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'crystalShimmer 7s linear infinite',
          }}>
            AR Video Activation
          </div>
          <p style={{
            fontFamily: SERIF, fontSize: 'clamp(14px, 1.4vw, 16px)',
            fontStyle: 'italic', color: 'rgba(255,255,255,0.35)',
            maxWidth: '520px', margin: '0 auto 12px', lineHeight: 2,
          }}>
            Each print conceals a unique AR experience. Point your phone at the artwork
            and watch your Drone Blonde come alive in a bespoke video by Miss AL Simpson,
            embedded in the print itself.
          </p>
          <div style={{
            fontFamily: MONO, fontSize: '9px', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(176,200,212,0.3)',
            marginTop: '16px',
          }}>
            Hover over any print above to preview the AR activation
          </div>
        </div>

        {/* ═══════ THREE PILLARS ═══════ */}
        <div style={{
          maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1,
          padding: '0 clamp(24px, 6vw, 80px) clamp(60px, 6vw, 80px)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(20px, 3vw, 40px)',
          }}>
            {[
              { numeral: 'I', title: 'The Print', text: 'Hahnem\u00FChle Photo Rag Metallic, A2 scale. Deep blacks, metallic lustre. Hand-signed by Miss AL Simpson.' },
              { numeral: 'II', title: 'The AR Video', text: 'Point your phone at the print. Your Drone Blonde comes alive in a bespoke video by Miss AL Simpson.' },
              { numeral: 'III', title: 'All 20', text: '20 Drone Blondes selected from the collection. Each available as a signed A2 Metallic Rag print, edition of 50.' },
            ].map((pillar) => (
              <div key={pillar.numeral} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: DISPLAY, fontSize: '32px',
                  color: 'rgba(255,255,255,0.06)', marginBottom: '12px',
                }}>{pillar.numeral}</div>
                <div style={{
                  fontFamily: DISPLAY, fontSize: '18px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.7)', marginBottom: '12px',
                }}>{pillar.title}</div>
                <div style={{
                  fontFamily: SERIF, fontSize: '14px',
                  color: 'rgba(255,255,255,0.35)', lineHeight: 1.8,
                }}>{pillar.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ PRICE BLOCK ═══════ */}
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '900px', margin: '0 auto',
          padding: 'clamp(40px, 6vw, 80px) clamp(24px, 6vw, 80px)',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '48px 40px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{
              fontFamily: DISPLAY, fontSize: 'clamp(40px, 5vw, 56px)',
              letterSpacing: '0.02em', marginBottom: '8px',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 15%, #ffffff 30%, #b4ccd8 50%, #ffffff 70%, #a4bcc8 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', animation: 'crystalShimmer 6s linear infinite',
            }}>{PRICE_DISPLAY}</div>
            <div style={{
              fontFamily: MONO, fontSize: '10px', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            }}>
              Signed A2 Photo Rag Metallic Print + AR Video Activation
            </div>
          </div>
        </div>

        {/* ═══════ SPECS ═══════ */}
        <div style={{
          maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1,
          padding: '0 clamp(24px, 6vw, 80px) clamp(60px, 8vw, 100px)',
        }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 32px', background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{
              fontFamily: MONO, fontSize: '10px', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              marginBottom: '24px',
            }}>Print Specification</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              {SPECS.map(([label, value]) => (
                <div key={label}>
                  <div style={{
                    fontFamily: MONO, fontSize: '9px', letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
                    marginBottom: '6px',
                  }}>{label}</div>
                  <div style={{
                    fontFamily: SERIF, fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                  }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ FOOTER ═══════ */}
        <div style={{
          paddingBottom: '40px', paddingTop: 'clamp(40px, 6vw, 80px)',
          textAlign: 'center',
          fontFamily: MONO, fontSize: '9px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.1)',
          position: 'relative', zIndex: 1,
        }}>
          DIAMOND DRONES{'\u2122'} {'\u00B7'} The Diamond Press {'\u00B7'} 20 Prints
        </div>
        </>
        )}
      </div>

      {/* ═══════ CAROUSEL LIGHTBOX ═══════ */}
      {expandedPrint && (
        <div
          onClick={() => setExpandedPrint(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)',
            cursor: 'pointer', animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{
            background: '#f5f3f0', padding: 'clamp(12px, 2vw, 24px)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(176,200,212,0.08)',
            maxWidth: '85vw', maxHeight: '75vh',
          }}>
            <img
              src={`/marilyns/web/${expandedPrint.num}.jpg`}
              alt={expandedPrint.title}
              style={{ maxWidth: '100%', maxHeight: 'calc(75vh - 60px)', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ paddingTop: '8px', textAlign: 'center' }}>
              <div style={{ fontFamily: SERIF, fontSize: '9px', fontStyle: 'italic', color: 'rgba(0,0,0,0.25)', letterSpacing: '0.15em' }}>Miss AL Simpson</div>
            </div>
          </div>
          <div style={{
            fontFamily: DISPLAY, fontSize: 'clamp(18px, 3vw, 28px)',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '24px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'crystalShimmer 6s linear infinite',
          }}>{expandedPrint.title}</div>
          <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
            {PRICE_DISPLAY} {'\u00B7'} Edition of 50 {'\u00B7'} Signed A2 {'\u00B7'} AR Video
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setCheckoutPrint(expandedPrint); setExpandedPrint(null); }}
              style={{
                fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '14px 32px', border: '1px solid rgba(176,200,212,0.4)',
                background: 'rgba(176,200,212,0.08)', color: '#fff', cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(176,200,212,0.08)'; }}
            >Order Print</button>
            <a
              href={`${OPENSEA_BASE}/${expandedPrint.num}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '14px 24px', border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >OpenSea</a>
          </div>
          <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginTop: '20px' }}>
            Click anywhere to close
          </div>
        </div>
      )}

      {/* ═══════ CHECKOUT MODAL ═══════ */}
      {checkoutPrint && (
        <CheckoutModal
          print={checkoutPrint}
          onClose={() => setCheckoutPrint(null)}
        />
      )}
    </>
  );
}
