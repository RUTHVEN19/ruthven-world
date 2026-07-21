import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ANDROIDS_BASE } from '../../config/androidsContent';

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export default function AndroidsAbout() {
  return (
    <div style={{ background: '#050508', minHeight: '100vh', position: 'relative' }}>
      <Helmet>
        <title>About — Porcelain Android</title>
        <meta name="description" content="About Porcelain Android by Miss AL Simpson. The Manga Machine, the world, and the artist behind the archive." />
      </Helmet>

      <style>{`
        @keyframes aboutGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,45,120,0.15); }
          50% { text-shadow: 0 0 40px rgba(255,45,120,0.3); }
        }
        @keyframes aboutLine {
          from { width: 0; }
          to { width: 60px; }
        }
      `}</style>

      <article style={{
        maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1,
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 48px) 80px',
      }}>

        {/* ── Header ── */}
        <FadeIn>
          <header style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.5em', textTransform: 'uppercase',
              color: 'rgba(255,45,120,0.5)', marginBottom: '20px',
            }}>
              CLASSIFIED // ABOUT THIS ARCHIVE
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 6vw, 52px)',
              fontFamily: '"Anton", "Impact", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #ff2d78, #ff6b9d, #ffffff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'aboutGlow 4s ease-in-out infinite',
            }}>
              Porcelain Android
            </h1>
            <div style={{
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              fontFamily: "'Space Mono', monospace",
              color: 'rgba(255,255,255,0.35)',
              marginTop: '12px', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              The Manga Machine
            </div>
            <div style={{
              width: '60px', height: '1px',
              background: 'rgba(255,45,120,0.25)',
              margin: '28px auto 0',
              animation: 'aboutLine 1s ease-out both',
            }} />
          </header>
        </FadeIn>

        {/* ── The Project ── */}
        <FadeIn delay={100}>
          <section style={{ marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '10px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: '#ff2d78', marginBottom: '24px',
            }}>
              The Project
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              fontFamily: 'Georgia, serif',
              lineHeight: 2,
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '16px',
            }}>
              Porcelain Android is an immersive cryptoart world built around <strong style={{ color: '#fff' }}>The Manga Machine</strong> — a degrading digital printing press that transforms porcelain android stills into living manga.
            </p>
            <p style={{
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              fontFamily: "'Space Mono', monospace",
              lineHeight: 2,
              color: 'rgba(255,255,255,0.6)',
            }}>
              Each artwork emerges as a triptych: the original porcelain still, a transformation video, and the manga drawing. As the Machine prints, its ink depletes — the art degrades and the aesthetic shifts from pristine to corrupted. When the ink runs out, the Machine stops forever.
            </p>
          </section>
        </FadeIn>

        {/* ── The World ── */}
        <FadeIn delay={300}>
          <section style={{ marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '10px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: '#ff2d78', marginBottom: '24px',
            }}>
              The World
            </h2>
            <p style={{
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              fontFamily: "'Space Mono', monospace",
              lineHeight: 2,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '16px',
            }}>
              This site is not a storefront — it's an archive. Every zone is a location inside the Porcelain Android universe: the neon-lit Alley, the Nightclub playing the original film soundtrack, the Lore chamber where the founding myth is recovered one scroll at a time, and the Machine itself — a 3D arcade cabinet that degrades in real time as editions are minted.
            </p>
            <p style={{
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              fontFamily: "'Space Mono', monospace",
              lineHeight: 2,
              color: 'rgba(255,255,255,0.6)',
            }}>
              The Originals gallery houses Miss AL Simpson's 1/1 original digital artworks. The Graffiti wall displays her physical graffiti collage analogue artworks — collected on SuperRare and Transient.
            </p>
          </section>
        </FadeIn>

        {/* ── The Artist ── */}
        <FadeIn delay={400}>
          <section style={{ marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '10px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: '#ff2d78', marginBottom: '24px',
            }}>
              The Artist
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              fontFamily: 'Georgia, serif',
              lineHeight: 2,
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '16px',
            }}>
              <strong style={{ color: '#fff' }}>Miss AL Simpson</strong> is a cryptoartist working between Edinburgh and Roppongi, across AI imagery trained on her own graffiti collage and paintings, hand-drawn over by the artist, photography, film, music, and immersive web worlds.
            </p>
            <p style={{
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              fontFamily: "'Space Mono', monospace",
              lineHeight: 2,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '16px',
            }}>
              Porcelain Android is the second world in her multiverse — a cyberpunk manga universe built between Edinburgh and Roppongi, from AI art trained on her own paintings and drawn over by hand, original fiction, and custom smart contracts. The first, <a href="https://diamonddrones.world/" target="_blank" rel="noopener noreferrer" style={{ color: '#ff2d78', textDecoration: 'none', borderBottom: '1px solid rgba(255,45,120,0.3)' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#ff2d78'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,45,120,0.3)'}>Diamond Drones</a>, is live on Ethereum.
            </p>
            <p style={{
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              fontFamily: "'Space Mono', monospace",
              lineHeight: 2,
              color: 'rgba(255,255,255,0.6)',
            }}>
              Every artwork, every line of fiction, every frame of film, and the world you're standing in right now — all made by one artist.
            </p>

            <div style={{
              display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap',
            }}>
              <a href="https://x.com/missalsimpson" target="_blank" rel="noopener noreferrer" style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,45,120,0.2)',
                background: 'rgba(255,45,120,0.04)',
                fontSize: '11px', fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.2)'; }}
              >
                Miss AL Simpson on X
              </a>
              <a href="https://x.com/PorcelAndroid" target="_blank" rel="noopener noreferrer" style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,45,120,0.2)',
                background: 'rgba(255,45,120,0.04)',
                fontSize: '11px', fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.2)'; }}
              >
                Porcelain Android on X
              </a>
              <a href="https://www.instagram.com/porcelain_android/" target="_blank" rel="noopener noreferrer" style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,45,120,0.2)',
                background: 'rgba(255,45,120,0.04)',
                fontSize: '11px', fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.2)'; }}
              >
                @porcelain_android
              </a>
            </div>
          </section>
        </FadeIn>

        {/* ── Tech ── */}
        <FadeIn delay={500}>
          <section style={{ marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '10px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: '#ff2d78', marginBottom: '24px',
            }}>
              Tech Stack
            </h2>
            <div style={{
              fontSize: '13px', fontFamily: "'Space Mono', monospace",
              lineHeight: 2.2, color: 'rgba(255,255,255,0.45)',
            }}>
              <div>Blockchain: Ethereum &middot; ERC-1155</div>
              <div>Art: AI trained on original paintings &middot; Hand-drawn post-production</div>
              <div>Film: AI video (Kling) &middot; Original soundtrack</div>
              <div>Fiction: Original five-chapter founding myth</div>
              <div>3D: React Three Fiber &middot; Real-time degrading arcade cabinet</div>
              <div>World: React &middot; Immersive zone-based architecture</div>
            </div>
          </section>
        </FadeIn>

        {/* ── CTA ── */}
        <FadeIn delay={600}>
          <div style={{
            textAlign: 'center', paddingTop: '40px',
            borderTop: '1px solid rgba(255,45,120,0.08)',
          }}>
            <Link to={`${ANDROIDS_BASE}/manga-machine`} style={{
              display: 'inline-block',
              padding: '18px 48px',
              border: '1px solid rgba(255,45,120,0.3)',
              background: 'rgba(255,45,120,0.04)',
              textDecoration: 'none',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,45,120,0.6)'; e.currentTarget.style.background = 'rgba(255,45,120,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,45,120,0.3)'; e.currentTarget.style.background = 'rgba(255,45,120,0.04)'; }}
            >
              <div style={{
                fontSize: '16px', fontFamily: '"Anton", "Impact", sans-serif',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#ff2d78',
              }}>
                Enter The Machine
              </div>
              <div style={{
                fontSize: '8px', fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', marginTop: '6px',
              }}>
                マンガマシンへ
              </div>
            </Link>
          </div>
        </FadeIn>
      </article>
    </div>
  );
}
