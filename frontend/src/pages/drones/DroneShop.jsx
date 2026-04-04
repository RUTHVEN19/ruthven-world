import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DRONE_CUTS, ZONES } from '../../config/dronesContent';

const zone = ZONES.find(z => z.slug === 'shop');

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes droneFloat {
    0%, 100% { transform: rotate(45deg) translateY(0px); }
    50%       { transform: rotate(45deg) translateY(-8px); }
  }
  @keyframes droneGlow {
    0%, 100% { box-shadow: 0 0 12px rgba(200,230,255,0.08); }
    50%       { box-shadow: 0 0 28px rgba(200,230,255,0.22); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

// Deterministic drone grid — 12 preview cards
const DRONE_PREVIEWS = [
  { cut: 'Brilliant Cut', id: '#0001', size: 52, delay: '0s' },
  { cut: 'Princess Cut',  id: '#0043', size: 40, delay: '0.4s' },
  { cut: 'Marquise Cut',  id: '#0128', size: 36, delay: '0.8s' },
  { cut: 'Rose Cut',      id: '#0247', size: 30, delay: '0.2s' },
  { cut: 'Baguette Cut',  id: '#0391', size: 28, delay: '0.6s' },
  { cut: 'Princess Cut',  id: '#0062', size: 42, delay: '1.0s' },
  { cut: 'Brilliant Cut', id: '#0007', size: 50, delay: '0.3s' },
  { cut: 'Rose Cut',      id: '#0518', size: 32, delay: '0.7s' },
  { cut: 'Marquise Cut',  id: '#0203', size: 38, delay: '1.2s' },
  { cut: 'Baguette Cut',  id: '#0644', size: 26, delay: '0.5s' },
  { cut: 'Princess Cut',  id: '#0089', size: 44, delay: '0.9s' },
  { cut: 'Rose Cut',      id: '#0712', size: 34, delay: '1.4s' },
];

const RARITY_COLOR = {
  Legendary: '#e8f8ff',
  Rare: '#c8e8ff',
  Uncommon: '#b0d4f0',
  Common: 'rgba(255,255,255,0.35)',
};

export default function DroneShop() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCut, setHoveredCut] = useState(null);

  const getRarity = (cutName) => {
    const found = DRONE_CUTS.find(c => c.name === cutName);
    return found ? found.rarity : 'Common';
  };

  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff' }}>
      <style>{keyframes}</style>

      {/* ── ZONE HERO ── */}
      <div style={{
        position: 'relative',
        height: '60vh',
        minHeight: '400px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '64px',
      }}>
        {/* Background image */}
        <img
          src="/dd-shop.png"
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'grayscale(100%) contrast(1.1)',
            opacity: 0.35,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(17,17,17,0.2) 0%, rgba(17,17,17,0.9) 75%, #111 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px,6vw,100px)', width: '100%' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            marginBottom: '16px', animation: 'fadeUp 0.8s ease both',
          }}>
            Zone {zone.numeral} — Diamond Drones Are a Girl's Best Friend™
          </div>
          <h1 style={{
            fontFamily: '"Anton", "Arial Black", sans-serif',
            fontSize: 'clamp(40px, 7vw, 90px)',
            fontWeight: 400, letterSpacing: '0.04em',
            textTransform: 'uppercase', lineHeight: 0.9,
            margin: 0, marginBottom: '20px',
            animation: 'fadeUp 0.8s ease 0.1s both',
          }}>
            {zone.title}
          </h1>
          <p style={{
            fontSize: 'clamp(13px,1.4vw,16px)', letterSpacing: '0.02em',
            lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            maxWidth: '520px', animation: 'fadeUp 0.8s ease 0.2s both',
          }}>
            {zone.tagline}
          </p>
        </div>
      </div>

      {/* ── RARITY TIERS ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,100px)' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '40px',
        }}>
          Five Cut Tiers
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.07)' }}>
          {DRONE_CUTS.map((cut) => (
            <div
              key={cut.name}
              onMouseEnter={() => setHoveredCut(cut.name)}
              onMouseLeave={() => setHoveredCut(null)}
              style={{
                background: hoveredCut === cut.name ? 'rgba(255,255,255,0.04)' : '#111',
                padding: '32px 28px',
                transition: 'background 0.3s',
              }}
            >
              {/* Diamond icon */}
              <div style={{
                width: '28px', height: '28px',
                border: `1.5px solid ${hoveredCut === cut.name ? cut.glow : 'rgba(255,255,255,0.2)'}`,
                transform: 'rotate(45deg)',
                marginBottom: '24px',
                transition: 'border-color 0.3s',
                boxShadow: hoveredCut === cut.name ? `0 0 16px ${cut.glow}40` : 'none',
              }} />
              <div style={{
                fontSize: 'clamp(14px,1.6vw,17px)',
                fontFamily: '"Anton", sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '8px',
                color: hoveredCut === cut.name ? '#fff' : 'rgba(255,255,255,0.8)',
              }}>
                {cut.name}
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: RARITY_COLOR[cut.rarity], marginBottom: '12px',
              }}>
                {cut.rarity}
              </div>
              <div style={{
                fontSize: '11px', letterSpacing: '0.15em',
                fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)',
              }}>
                {cut.count} in existence · {cut.pct}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DRONE PREVIEW GRID ── */}
      <section style={{
        padding: '0 clamp(24px,6vw,100px) clamp(60px,8vw,100px)',
      }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '40px',
        }}>
          Preview Fleet — Your 24 will be drawn from the full collection
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          {DRONE_PREVIEWS.map((drone, i) => {
            const rarity = getRarity(drone.cut);
            const cutData = DRONE_CUTS.find(c => c.name === drone.cut);
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: hoveredCard === i ? 'rgba(255,255,255,0.04)' : '#111',
                  padding: '36px 24px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: 'background 0.3s',
                  minHeight: '200px', justifyContent: 'center',
                  gap: '16px',
                }}
              >
                {/* Drone diamond shape */}
                <div style={{
                  width: drone.size, height: drone.size,
                  border: `1.5px solid ${hoveredCard === i ? (cutData?.glow || 'rgba(255,255,255,0.6)') : 'rgba(255,255,255,0.25)'}`,
                  background: hoveredCard === i ? 'rgba(200,230,255,0.06)' : 'rgba(255,255,255,0.02)',
                  animation: `droneFloat 3s ${drone.delay} ease-in-out infinite, droneGlow 3s ${drone.delay} ease-in-out infinite`,
                  transition: 'border-color 0.3s',
                  flexShrink: 0,
                }} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '10px', letterSpacing: '0.25em',
                    fontFamily: 'monospace', textTransform: 'uppercase',
                    color: RARITY_COLOR[rarity], marginBottom: '4px',
                  }}>
                    {rarity}
                  </div>
                  <div style={{
                    fontSize: '11px', letterSpacing: '0.15em',
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '2px',
                  }}>
                    {drone.cut}
                  </div>
                  <div style={{
                    fontSize: '10px', letterSpacing: '0.1em',
                    fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)',
                  }}>
                    {drone.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 24-CARAT STATEMENT ── */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,100px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 'clamp(11px,1vw,13px)', letterSpacing: '0.4em',
          fontFamily: 'monospace', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)', marginBottom: '28px',
        }}>
          24-Carat
        </div>
        <div style={{
          fontSize: 'clamp(28px,4vw,52px)',
          fontFamily: '"Anton", sans-serif',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          lineHeight: 1.05, marginBottom: '24px',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%, #b4ccd8 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmerSlow 6s linear infinite',
        }}>
          24 Diamond Drones<br />per Collector
        </div>
        <p style={{
          fontSize: 'clamp(13px,1.4vw,16px)', lineHeight: 1.9,
          color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', maxWidth: '500px', margin: '0 auto 48px',
        }}>
          Referencing the 24-carat Moon of Baroda — the historic diamond
          associated with Marilyn Monroe. Twenty-four per collector set.
          4,800 in existence worldwide.
        </p>

        <button
          onClick={() => navigate('/drones/mint')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '16px 48px',
            fontSize: '11px', letterSpacing: '0.35em',
            textTransform: 'uppercase', fontFamily: 'monospace',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
        >
          Mint the Collector Set →
        </button>
      </section>
    </div>
  );
}
