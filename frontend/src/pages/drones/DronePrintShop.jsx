import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ── 10 Drone Blondes for open edition prints (swap IDs when chosen) ── */
const PRINT_EDITIONS = [
  { id: 'db-07', num: 7,  title: 'Drone Blonde #7' },
  { id: 'db-17', num: 17, title: 'Drone Blonde #17' },
  { id: 'db-23', num: 23, title: 'Drone Blonde #23' },
  { id: 'db-34', num: 34, title: 'Drone Blonde #34' },
  { id: 'db-45', num: 45, title: 'Drone Blonde #45' },
  { id: 'db-58', num: 58, title: 'Drone Blonde #58' },
  { id: 'db-63', num: 63, title: 'Drone Blonde #63' },
  { id: 'db-71', num: 71, title: 'Drone Blonde #71' },
  { id: 'db-84', num: 84, title: 'Drone Blonde #84' },
  { id: 'db-99', num: 99, title: 'Drone Blonde #99' },
];

const PRICE_DISPLAY = '\u00A3295';
const PRICE_PENCE = 29500;

const SPECS = [
  ['Paper', 'Hahnem\u00FChle Photo Rag Metallic 340gsm'],
  ['Size', 'A2 (420 \u00D7 594 mm)'],
  ['Finish', 'Metallic lustre with deep blacks'],
  ['Signed', 'Hand-signed by Miss AL Simpson'],
  ['Edition', 'Unlimited Open Edition'],
  ['AR', 'Drone Blonde dance activation included'],
  ['Shipping', 'Worldwide \u00B7 Insured \u00B7 21 days'],
];

const MONO = "'Space Mono', monospace";
const SERIF = 'Georgia, serif';
const DISPLAY = '"Anton", "Arial Black", sans-serif';

/* ═══════════════════════════════════════════════════════════════
   AR PREVIEW CARD — shows the print, hover triggers AR dance sim
   ═══════════════════════════════════════════════════════════════ */
function PrintCard({ print, index, onBuy }) {
  const [hovered, setHovered] = useState(false);
  const [arActive, setArActive] = useState(false);
  const timerRef = useRef(null);

  const imgSrc = `/marilyns/Drone%20Blonde%20${print.num}.png`;

  const handleMouseEnter = () => {
    setHovered(true);
    timerRef.current = setTimeout(() => setArActive(true), 400);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setArActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Mobile tap toggle
  const handleTap = () => {
    if (arActive) {
      setArActive(false);
      setHovered(false);
    } else {
      setHovered(true);
      setTimeout(() => setArActive(true), 400);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div
      style={{
        animation: `fadeUp 0.8s ease-out ${0.1 * index}s both`,
      }}
    >
      {/* Framed print with AR overlay */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTap}
        style={{
          position: 'relative',
          background: '#f5f3f0',
          padding: 'clamp(10px, 2vw, 20px)',
          boxShadow: hovered
            ? '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(176,200,212,0.1)'
            : '0 12px 50px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          transition: 'all 0.5s ease',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          overflow: 'hidden',
        }}
      >
        {/* Glint sweep */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          width: '45%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: `glintSweep ${9 + index * 2}s ease-in-out infinite`,
          animationDelay: `${index * 1.5 + 3}s`,
          pointerEvents: 'none', zIndex: 3,
        }} />

        {/* Artwork */}
        <div style={{
          position: 'relative',
          aspectRatio: '1',
          overflow: 'hidden',
          background: '#111',
        }}>
          <img
            src={imgSrc}
            alt={print.title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: arActive ? 'contrast(1.1) brightness(1.05)' : 'none',
              transition: 'filter 0.6s ease',
            }}
          />

          {/* AR Dance Activation Overlay */}
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

            {/* Dancing silhouette shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 60%, rgba(176,200,212,0.12) 0%, transparent 60%)',
              animation: arActive ? 'arPulse 1.5s ease-in-out infinite' : 'none',
            }} />

            {/* Motion blur streaks */}
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${15 + i * 15}%`,
                top: '20%', bottom: '20%',
                width: '1px',
                background: `linear-gradient(180deg, transparent, rgba(176,200,212,${0.1 + i * 0.04}), transparent)`,
                animation: arActive ? `motionStreak 1.2s ease-in-out ${i * 0.15}s infinite alternate` : 'none',
              }} />
            ))}

            {/* AR badge */}
            <div style={{
              position: 'absolute',
              top: '12px', left: '12px',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(176,200,212,0.3)',
              borderRadius: '2px',
            }}>
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#b0c8d4',
                boxShadow: '0 0 6px rgba(176,200,212,0.8)',
                animation: 'arDot 1s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: MONO,
                fontSize: '8px',
                letterSpacing: '0.2em',
                color: 'rgba(176,200,212,0.9)',
                textTransform: 'uppercase',
              }}>
                AR Active
              </span>
            </div>

            {/* Corner brackets */}
            {[[12, 12, 'borderTop', 'borderLeft'], [null, 12, 'borderTop', 'borderRight'], [12, null, 'borderBottom', 'borderLeft'], [null, null, 'borderBottom', 'borderRight']].map(([l, t, bv, bh], i) => (
              <div key={`c${i}`} style={{
                position: 'absolute',
                ...(l !== null ? { left: l } : { right: 12 }),
                ...(t !== null ? { top: t + 28 } : { bottom: 12 }),
                width: '20px', height: '20px',
                [bv]: '1px solid rgba(176,200,212,0.5)',
                [bh]: '1px solid rgba(176,200,212,0.5)',
              }} />
            ))}
          </div>
        </div>

        {/* Signature strip */}
        <div style={{ paddingTop: 'clamp(6px, 1vw, 14px)', textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: '7px',
            fontStyle: 'italic',
            color: 'rgba(0,0,0,0.25)',
            letterSpacing: '0.15em',
          }}>
            Miss AL Simpson
          </div>
        </div>
      </div>

      {/* Label + AR hint */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <div style={{
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}>
          {print.title}
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: '8px',
          letterSpacing: '0.15em',
          color: 'rgba(176,200,212,0.3)',
          marginTop: '6px',
        }}>
          {hovered || arActive ? 'AR dance activated' : 'Hover to preview AR'}
        </div>
      </div>

      {/* Buy button */}
      <button
        onClick={(e) => { e.stopPropagation(); onBuy(print); }}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '16px',
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'transparent',
          color: 'rgba(255,255,255,0.6)',
          padding: '14px 0',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(176,200,212,0.5)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = 'rgba(176,200,212,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {PRICE_DISPLAY} — Order Print
      </button>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   CHECKOUT MODAL — email + Stripe redirect
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
          fontFamily: MONO,
          fontSize: '9px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.2)',
          marginBottom: '24px',
        }}>
          Order Print
        </div>

        <div style={{
          fontFamily: DISPLAY,
          fontSize: '22px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          color: '#fff',
        }}>
          {print.title}
        </div>

        <div style={{
          fontFamily: SERIF,
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '32px',
          lineHeight: 1.8,
        }}>
          Signed A2 Hahnem{'\u00FC'}hle Photo Rag Metallic print with AR Drone Blonde dance activation.
        </div>

        <div style={{
          fontFamily: DISPLAY,
          fontSize: '36px',
          letterSpacing: '0.02em',
          marginBottom: '28px',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 15%, #ffffff 30%, #b4ccd8 50%, #ffffff 70%, #a4bcc8 100%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'crystalShimmer 6s linear infinite',
        }}>
          {PRICE_DISPLAY}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
            marginBottom: '10px',
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              fontFamily: MONO,
              fontSize: '13px',
              color: '#fff',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(176,200,212,0.4)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckout()}
          />
        </div>

        {error && (
          <div style={{
            fontFamily: MONO,
            fontSize: '11px',
            color: '#e57373',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            fontFamily: MONO,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: '1px solid rgba(176,200,212,0.4)',
            background: 'rgba(176,200,212,0.08)',
            color: '#fff',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Redirecting to Stripe...' : `Pay ${PRICE_DISPLAY} — Secure Checkout`}
        </button>

        <button
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '12px',
            padding: '12px',
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function DronePrintShop() {
  const [checkoutPrint, setCheckoutPrint] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

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
        <title>The Diamond Press | Drone Blonde Open Edition Prints</title>
        <meta name="description" content="Signed A2 Hahnem\u00FChle Photo Rag Metallic prints of the Drone Blondes with AR dance activation. Unlimited edition, \u00A3295." />
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
        @keyframes motionStreak {
          0%   { opacity: 0; transform: translateX(-3px); }
          50%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateX(3px); }
        }
      `}</style>

      <div style={{ background: '#0a0a0a', color: '#fff', position: 'relative', minHeight: '100vh' }}>

        {/* ═══════ HERO ═══════ */}
        <div style={{
          position: 'relative',
          textAlign: 'center',
          padding: 'clamp(100px, 14vw, 180px) clamp(24px, 6vw, 80px) clamp(40px, 6vw, 80px)',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          <div style={{
            position: 'absolute', top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px', height: '500px',
            background: 'radial-gradient(ellipse, rgba(180,200,220,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            marginBottom: '28px',
            animation: 'fadeUp 0.8s ease-out both',
          }}>
            Open Edition Prints
          </div>

          <h1 style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(52px, 9vw, 110px)',
            lineHeight: 1.0,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: '0 0 28px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'crystalShimmer 5s linear infinite, fadeUp 1s ease-out both',
          }}>
            THE DIAMOND<br />PRESS
          </h1>

          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(14px, 1.6vw, 17px)',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.35)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.9,
            animation: 'fadeUp 1.2s ease-out both',
          }}>
            Ten Drone Blondes, printed on museum-grade Hahnem{'\u00FC'}hle Photo Rag Metallic
            at A2 scale. Hand-signed by the artist. Each paired with a bespoke AR dance
            activation that brings your Drone Blonde to life.
          </p>
        </div>

        {/* ═══════ SUCCESS BANNER ═══════ */}
        {successMsg && (
          <div style={{
            maxWidth: '700px', margin: '0 auto 40px',
            padding: '20px 28px',
            border: '1px solid rgba(129,199,132,0.3)',
            background: 'rgba(129,199,132,0.06)',
            fontFamily: MONO,
            fontSize: '12px',
            color: 'rgba(129,199,132,0.9)',
            textAlign: 'center',
            lineHeight: 1.7,
          }}>
            {successMsg}
          </div>
        )}

        {/* ═══════ AR CONCEPT SECTION ═══════ */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 clamp(24px, 6vw, 80px) clamp(60px, 8vw, 80px)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(28px, 4vw, 44px)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1.1,
            marginBottom: '20px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'crystalShimmer 7s linear infinite',
          }}>
            AR Dance Activation
          </div>
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(14px, 1.4vw, 16px)',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.35)',
            maxWidth: '520px',
            margin: '0 auto 12px',
            lineHeight: 2,
          }}>
            Each print conceals a unique AR experience. Point your phone at the artwork
            and watch your Drone Blonde dance with her Diamond Drones &mdash; a bespoke
            animation by Miss AL Simpson, embedded in the print itself.
          </p>
          <div style={{
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(176,200,212,0.3)',
            marginTop: '16px',
          }}>
            Hover over any print below to preview the AR activation
          </div>
        </div>

        {/* ═══════ PRINT GRID ═══════ */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: 'clamp(40px, 6vw, 80px) clamp(24px, 6vw, 80px)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'clamp(28px, 4vw, 48px)',
          }}>
            {PRINT_EDITIONS.map((print, i) => (
              <PrintCard
                key={print.id}
                print={print}
                index={i}
                onBuy={setCheckoutPrint}
              />
            ))}
          </div>
        </div>

        {/* ═══════ THREE PILLARS ═══════ */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: 'clamp(40px, 6vw, 80px) clamp(24px, 6vw, 80px)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(20px, 3vw, 40px)',
            marginBottom: '24px',
          }}>
            {[
              {
                numeral: 'I',
                title: 'The Print',
                text: 'Hahnem\u00FChle Photo Rag Metallic, A2 scale. Deep blacks, metallic lustre. Hand-signed by Miss AL Simpson.',
              },
              {
                numeral: 'II',
                title: 'The AR Dance',
                text: 'Point your phone at the print. Your Drone Blonde comes alive in a bespoke dance animation with her Diamond Drones.',
              },
              {
                numeral: 'III',
                title: 'Unlimited Edition',
                text: 'No scarcity games. Beautiful art, beautifully printed, available to everyone who wants one.',
              },
            ].map((pillar) => (
              <div key={pillar.numeral} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: DISPLAY,
                  fontSize: '32px',
                  color: 'rgba(255,255,255,0.06)',
                  marginBottom: '12px',
                }}>
                  {pillar.numeral}
                </div>
                <div style={{
                  fontFamily: DISPLAY,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '12px',
                }}>
                  {pillar.title}
                </div>
                <div style={{
                  fontFamily: SERIF,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.8,
                }}>
                  {pillar.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ PRICE BLOCK ═══════ */}
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '900px', margin: '0 auto',
          padding: '0 clamp(24px, 6vw, 80px)',
        }}>
          <div style={{
            textAlign: 'center',
            margin: 'clamp(20px, 4vw, 40px) 0 clamp(60px, 8vw, 100px)',
            padding: '48px 40px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(40px, 5vw, 56px)',
              letterSpacing: '0.02em',
              marginBottom: '8px',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 15%, #ffffff 30%, #b4ccd8 50%, #ffffff 70%, #a4bcc8 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'crystalShimmer 6s linear infinite',
            }}>
              {PRICE_DISPLAY}
            </div>
            <div style={{
              fontFamily: MONO,
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              Signed A2 Photo Rag Metallic Print + AR Dance Activation
            </div>
          </div>
        </div>

        {/* ═══════ SPECS ═══════ */}
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          padding: '0 clamp(24px, 6vw, 80px) clamp(60px, 8vw, 100px)',
        }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 32px',
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{
              fontFamily: MONO,
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: '24px',
            }}>
              Print Specification
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              {SPECS.map(([label, value]) => (
                <div key={label}>
                  <div style={{
                    fontFamily: MONO,
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    marginBottom: '6px',
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontFamily: SERIF,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ AR SECTION ═══════ */}
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          padding: 'clamp(60px, 8vw, 100px) clamp(24px, 6vw, 80px)',
        }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 32px',
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{
              fontFamily: MONO,
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: '24px',
            }}>
              AR Dance Activation
            </div>
            <div style={{
              fontFamily: SERIF,
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.9,
              maxWidth: '600px',
            }}>
              Each print ships with a discreet QR code on the reverse.
              Scan it with your phone camera to unlock the AR experience &mdash;
              your Drone Blonde dances with her Diamond Drones in a bespoke
              animation by Miss AL Simpson. The physical print becomes a portal
              to the digital artwork.
            </div>
          </div>
        </div>

        {/* ═══════ FOOTER ═══════ */}
        <div style={{
          paddingBottom: '40px',
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: '9px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.1)',
        }}>
          DIAMOND DRONES{'\u2122'} {'\u00B7'} The Diamond Press {'\u00B7'} Open Edition
        </div>
      </div>

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
