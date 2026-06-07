import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_META, LORE_PAGE, ALBUM } from '../../config/dronesContent';

/* ── Film files for the strip ── */
const FILM_STRIP = [
  { src: '/films/01-the-drones-of-suburbia.mp4',          title: ALBUM.tracks[0].title },
  { src: '/films/02-les-drones-de-la-banlieue.mp4',       title: ALBUM.tracks[1].title },
  { src: '/films/03-the-drones-of-suburbia-roma.mp4',      title: ALBUM.tracks[2].title },
  { src: '/films/06-frequency-edit.mp4',                   title: ALBUM.tracks[5].title },
  { src: '/films/04-roma-summer-edit.mp4',                 title: ALBUM.tracks[3].title },
  { src: '/films/07-drone-driver.mp4',                     title: ALBUM.tracks[6].title },
  { src: '/films/08-suburbia-was-never-out-there.mp4',     title: ALBUM.tracks[7].title },
  { src: '/films/09-surveillance-subway.mp4',              title: ALBUM.tracks[8].title },
  { src: '/films/10-heist.mp4',                            title: ALBUM.tracks[9].title },
];

/* ── Intersection Observer hook ── */
function useVisibility(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Shared styles ── */
const MONO = "'Space Mono', monospace";
const SERIF = 'Georgia, serif';
const HEADING = '"Anton", sans-serif';

const kicker = (text) => ({
  fontSize: '11px', letterSpacing: '0.5em', fontFamily: MONO,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
  marginBottom: '24px',
});

const shimmerGradient = {
  background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/* ── Reusable film strip background ── */
function FilmStripBg({ opacity = 0.35, speed = 90, reverse = false }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      opacity,
      filter: 'grayscale(40%)',
    }}>
      {/* Sprocket holes top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '20px', zIndex: 1,
        background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px',
        borderBottom: '2px solid #222',
      }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={`st${i}`} style={{
            width: '10px', height: '7px', borderRadius: '2px',
            background: '#000', border: '1px solid #333',
            flexShrink: 0,
          }} />
        ))}
      </div>

      {/* Film frames with actual video */}
      <div style={{
        display: 'flex',
        animation: `filmStripScroll ${speed}s linear infinite${reverse ? ' reverse' : ''}`,
        position: 'absolute',
        top: '20px', bottom: '20px', left: 0,
      }}>
        {[...FILM_STRIP, ...FILM_STRIP].map((film, i) => (
          <div key={i} style={{
            flexShrink: 0,
            width: 'clamp(400px, 50vw, 700px)',
            height: '100%',
            position: 'relative',
            borderLeft: '3px solid #111',
            borderRight: '3px solid #111',
            background: '#151515',
            overflow: 'hidden',
          }}>
            <video
              autoPlay muted loop playsInline
              preload="metadata"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src={film.src} type="video/mp4" />
            </video>
            <div style={{
              position: 'absolute', bottom: '12px', left: '14px',
              fontSize: '9px', fontFamily: MONO,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
              zIndex: 1,
            }}>
              {String(i % FILM_STRIP.length + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      {/* Sprocket holes bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '20px', zIndex: 1,
        background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px',
        borderTop: '2px solid #222',
      }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={`sb${i}`} style={{
            width: '10px', height: '7px', borderRadius: '2px',
            background: '#000', border: '1px solid #333',
            flexShrink: 0,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function DroneLore() {
  const [heroRef, heroVisible] = useVisibility(0.1);
  const [originRef, originVisible] = useVisibility();
  const [seriesRef, seriesVisible] = useVisibility(0.1);
  const [sothebysRef, sothebysVisible] = useVisibility();
  const [artistRef, artistVisible] = useVisibility();
  const [processRef, processVisible] = useVisibility();

  /* Chapter visibility for staggered reveals */
  const chapterRefs = useRef([]);
  const [chapterVisible, setChapterVisible] = useState(
    LORE_PAGE.series.chapters.map(() => false),
  );
  useEffect(() => {
    const observers = chapterRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setChapterVisible(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }
        },
        { threshold: 0.2 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(obs => obs?.disconnect());
  }, []);

  const setChapterRef = useCallback((el, i) => {
    chapterRefs.current[i] = el;
  }, []);

  return (
    <>
      <Helmet>
        <title>Lore | Diamond Drones Are a Girl's Best Friend</title>
        <meta name="description" content="The origin story of Diamond Drones. Explore the cinematic lore behind Miss AL Simpson's AI ink interventions." />
        <meta property="og:title" content="Lore | Diamond Drones" />
        <meta property="og:description" content="The origin story of Diamond Drones. Explore the cinematic lore behind Miss AL Simpson's AI ink interventions." />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta property="og:url" content="https://diamonddrones.world/lore" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "The Origin Story of Diamond Drones",
          "url": "https://diamonddrones.world/lore",
          "description": "The origin story of Diamond Drones — from Edinburgh's weather system to Sotheby's New York.",
          "author": {
            "@type": "Person",
            "name": "Miss AL Simpson",
            "jobTitle": "Contemporary Artist",
            "address": { "@type": "PostalAddress", "addressLocality": "Edinburgh", "addressCountry": "GB" },
            "knowsAbout": ["Ink art", "AI art", "Cryptoart", "Cinema", "NFTs"],
            "description": "Contemporary artist working with ink, AI, and cinema. Exhibited at Sotheby's Contemporary Discoveries, New York, 2025."
          },
          "publisher": { "@type": "Organization", "name": "Diamond Drones™", "url": "https://diamonddrones.world" }
        })}</script>
      </Helmet>
    <div style={{ backgroundColor: '#3a3a3a', color: '#ffffff' }}>

      {/* Keyframes */}
      <style>{`
        @keyframes shimmerSlow {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes filmStripScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── HERO WITH FILM STRIP ── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* ── Full-page film strip background ── */}
        <FilmStripBg />

        {/* Overlay gradients for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse at center, rgba(26,26,26,0.7) 0%, rgba(26,26,26,0.3) 60%, rgba(26,26,26,0.6) 100%),
            linear-gradient(180deg, rgba(26,26,26,0.8) 0%, transparent 20%, transparent 80%, rgba(26,26,26,0.8) 100%)
          `,
        }} />

        {/* Hero text */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center', padding: '0 24px',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}>
          {LORE_PAGE.hero.kicker && (
            <div style={{
              ...kicker(),
              marginBottom: '32px',
            }}>
              ◇ {LORE_PAGE.hero.kicker} ◇
            </div>
          )}
          <h1 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(48px, 10vw, 120px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.9,
            margin: '0 0 32px',
            ...shimmerGradient,
            animation: heroVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            The Drones<br />of Suburbia
          </h1>
          <p style={{
            fontFamily: SERIF, fontStyle: 'italic',
            fontSize: 'clamp(16px, 2vw, 22px)',
            color: 'rgba(200,230,255,0.5)',
            lineHeight: 1.8,
            maxWidth: '600px', margin: '0 auto 16px',
          }}>
            "{LORE_PAGE.hero.quote.text}"
          </p>
          <div style={{
            fontSize: '9px', letterSpacing: '0.4em', fontFamily: MONO,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: '24px',
          }}>
            — {LORE_PAGE.hero.quote.source}
          </div>
          <div style={{
            fontSize: '9px', letterSpacing: '0.4em', fontFamily: MONO,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
          }}>
            11 films · The Complete Cinema
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section
        ref={originRef}
        style={{
          padding: 'clamp(100px, 12vw, 180px) clamp(24px, 6vw, 100px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          maxWidth: '740px', margin: '0 auto',
          opacity: originVisible ? 1 : 0,
          transform: originVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <div style={kicker()}>
            Origin
          </div>
          <h2 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(28px, 5vw, 56px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            margin: '0 0 48px',
            ...shimmerGradient,
            animation: originVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            {LORE_PAGE.origin.title}
          </h2>
          {LORE_PAGE.origin.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 'clamp(15px, 1.5vw, 18px)',
              lineHeight: 2.1,
              color: i === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
              marginBottom: '24px',
              opacity: originVisible ? 1 : 0,
              transform: originVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.8s ease ${0.2 + i * 0.15}s, transform 0.8s ease ${0.2 + i * 0.15}s`,
            }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* ── THE SERIES — A CINEMATIC WORLD ── */}
      <section
        ref={seriesRef}
        style={{
          position: 'relative',
          padding: 'clamp(100px, 12vw, 180px) clamp(24px, 6vw, 100px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* Film strip background — reverse scroll */}
        <FilmStripBg opacity={0.2} speed={120} reverse />
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse at center, rgba(26,26,26,0.6) 0%, rgba(26,26,26,0.3) 50%, rgba(26,26,26,0.7) 100%),
            linear-gradient(180deg, rgba(26,26,26,0.85) 0%, transparent 15%, transparent 85%, rgba(26,26,26,0.85) 100%)
          `,
        }} />
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          textAlign: 'center',
          position: 'relative', zIndex: 1,
          opacity: seriesVisible ? 1 : 0,
          transform: seriesVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <div style={kicker()}>
            The Series
          </div>
          <h2 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(28px, 5vw, 56px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            margin: '0 0 24px',
            ...shimmerGradient,
            animation: seriesVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            {LORE_PAGE.series.title}
          </h2>
          <p style={{
            fontFamily: SERIF, fontStyle: 'italic',
            fontSize: 'clamp(14px, 1.4vw, 17px)',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.9,
            maxWidth: '640px', margin: '0 auto 64px',
          }}>
            {LORE_PAGE.series.intro}
          </p>
        </div>

        {/* Chapter timeline */}
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {LORE_PAGE.series.chapters.map((ch, i) => (
            <div
              key={ch.city}
              ref={el => setChapterRef(el, i)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(100px, 160px) 1fr',
                gap: 'clamp(24px, 4vw, 48px)',
                padding: '40px 0',
                borderBottom: i < LORE_PAGE.series.chapters.length - 1
                  ? '1px solid rgba(255,255,255,0.06)' : 'none',
                opacity: chapterVisible[i] ? 1 : 0,
                transform: chapterVisible[i] ? 'translateY(0)' : 'translateY(25px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease',
              }}
            >
              <div>
                <div style={{
                  fontFamily: HEADING,
                  fontSize: 'clamp(20px, 3vw, 32px)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.1,
                  marginBottom: '8px',
                }}>
                  {ch.city}
                </div>
                <div style={{
                  fontFamily: MONO,
                  fontSize: '10px', letterSpacing: '0.3em',
                  color: 'rgba(200,230,255,0.35)',
                }}>
                  {ch.year}
                </div>
              </div>
              <p style={{
                fontFamily: SERIF, fontStyle: 'italic',
                fontSize: 'clamp(14px, 1.3vw, 16px)',
                lineHeight: 2,
                color: 'rgba(255,255,255,0.35)',
                margin: 0, alignSelf: 'center',
              }}>
                {ch.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS VIDEO — Journey with Ink and AI ── */}
      <section
        ref={processRef}
        style={{
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 100px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#1a1a1a',
        }}
      >
        <div style={{
          maxWidth: '500px', margin: '0 auto',
          textAlign: 'center',
          opacity: processVisible ? 1 : 0,
          transform: processVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <div style={kicker()}>
            Process
          </div>
          <h2 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(24px, 4vw, 48px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            margin: '0 0 16px',
            ...shimmerGradient,
            animation: processVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            Journey with Ink and AI
          </h2>
          <p style={{
            fontFamily: SERIF, fontStyle: 'italic',
            fontSize: 'clamp(13px, 1.3vw, 16px)',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.8,
            maxWidth: '600px', margin: '0 auto 40px',
          }}>
            Exhibited and sold at Sotheby's Contemporary Discoveries Auction, New York, 2025
          </p>
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '133.33%',
            borderRadius: '2px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <video
              controls
              playsInline
              preload="metadata"
              src="/lore/journey-ink-ai.mp4"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'contain',
                backgroundColor: '#111',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── SOTHEBY'S ── */}
      <section
        ref={sothebysRef}
        style={{
          padding: 'clamp(100px, 12vw, 180px) clamp(24px, 6vw, 100px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          maxWidth: '740px', margin: '0 auto',
          opacity: sothebysVisible ? 1 : 0,
          transform: sothebysVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <div style={kicker()}>
            Provenance
          </div>
          <h2 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(28px, 5vw, 56px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            margin: '0 0 12px',
            ...shimmerGradient,
            animation: sothebysVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            {LORE_PAGE.sothebys.title}
          </h2>
          <div style={{
            fontFamily: MONO,
            fontSize: '11px', letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'rgba(200,230,255,0.35)',
            marginBottom: '48px',
          }}>
            {LORE_PAGE.sothebys.subtitle}
          </div>

          {/* Film embed — Les Drones de la Banlieue (portrait 802×1080) */}
          <div style={{
            maxWidth: '500px',
            margin: '0 auto 32px',
            opacity: sothebysVisible ? 1 : 0,
            transform: sothebysVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
          }}>
            {/* Ornate gallery frame */}
            <div style={{
              position: 'relative',
              padding: '18px',
              background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #222222 60%, #181818 100%)',
              borderRadius: '3px',
              boxShadow: `
                0 8px 40px rgba(0,0,0,0.6),
                0 2px 8px rgba(0,0,0,0.4),
                inset 0 1px 0 rgba(255,255,255,0.1),
                inset 0 -1px 0 rgba(0,0,0,0.3)
              `,
            }}>
              {/* Inner bevel */}
              <div style={{
                padding: '4px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.07) 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(255,255,255,0.05)',
              }}>
                {/* Matte / mount */}
                <div style={{
                  padding: '12px',
                  background: '#0a0908',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '134.66%',
                    overflow: 'hidden',
                  }}>
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      src={LORE_PAGE.sothebys.film}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        objectFit: 'contain',
                        backgroundColor: '#0a0908',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Subtle corner accents */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
                <div key={corner} style={{
                  position: 'absolute',
                  width: '24px', height: '24px',
                  [corner.includes('top') ? 'top' : 'bottom']: '6px',
                  [corner.includes('left') ? 'left' : 'right']: '6px',
                  borderTop: corner.includes('top') ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  borderBottom: corner.includes('bottom') ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  borderLeft: corner.includes('left') ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  borderRight: corner.includes('right') ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  pointerEvents: 'none',
                }} />
              ))}
            </div>

            {/* Plaque */}
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
            }}>
              <div style={{
                display: 'inline-block',
                padding: '8px 24px',
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  Les Drones de la Banlieue
                </div>
                <div style={{
                  fontFamily: MONO,
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: '6px',
                }}>
                  Miss AL Simpson
                </div>
                <div style={{
                  fontFamily: MONO,
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  marginTop: '4px',
                }}>
                  Sotheby's Contemporary Discoveries · 2025
                </div>
              </div>
            </div>
          </div>

          {/* Sotheby's link */}
          <div style={{
            textAlign: 'center',
            marginBottom: '48px',
            opacity: sothebysVisible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.2s',
          }}>
            <a
              href={LORE_PAGE.sothebys.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: MONO,
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(200,230,255,0.5)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(200,230,255,0.2)',
                paddingBottom: '4px',
                transition: 'color 0.3s, border-color 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(200,230,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,230,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.2)'; }}
            >
              View on Sotheby's →
            </a>
          </div>

          {/* Sotheby's pull quote */}
          <div style={{
            margin: '0 0 56px',
            padding: '32px 0 32px 24px',
            borderLeft: '2px solid rgba(200,230,255,0.2)',
            opacity: sothebysVisible ? 1 : 0,
            transform: sothebysVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          }}>
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 'clamp(18px, 2.2vw, 26px)',
              lineHeight: 1.7,
              color: 'rgba(200,230,255,0.6)',
              margin: '0 0 16px',
            }}>
              "{LORE_PAGE.sothebys.quote.text}"
            </p>
            <div style={{
              fontFamily: MONO,
              fontSize: '10px', letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
            }}>
              — {LORE_PAGE.sothebys.quote.source} · {LORE_PAGE.sothebys.quote.catalogue}
            </div>
          </div>

          {LORE_PAGE.sothebys.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 'clamp(15px, 1.5vw, 18px)',
              lineHeight: 2.1,
              color: i === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
              marginBottom: '24px',
              opacity: sothebysVisible ? 1 : 0,
              transform: sothebysVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.8s ease ${0.2 + i * 0.15}s, transform 0.8s ease ${0.2 + i * 0.15}s`,
            }}>
              {p}
            </p>
          ))}

          {/* Institutional credibility markers */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '24px',
            marginTop: '48px', paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            opacity: sothebysVisible ? 1 : 0,
            transition: 'opacity 1s ease 0.6s',
          }}>
            {['Sotheby\'s', 'OpenSea', 'Edinburgh', 'New York City'].map(name => (
              <div key={name} style={{
                fontFamily: MONO,
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(200,230,255,0.25)',
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTIST STATEMENT ── */}
      <section
        ref={artistRef}
        style={{
          padding: 'clamp(100px, 12vw, 180px) clamp(24px, 6vw, 100px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, #3a3a3a 0%, #2e2e36 50%, #3a3a3a 100%)',
        }}
      >
        <div style={{
          maxWidth: '740px', margin: '0 auto',
          opacity: artistVisible ? 1 : 0,
          transform: artistVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <div style={kicker()}>
            {LORE_PAGE.artist.title}
          </div>
          <h2 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(32px, 6vw, 72px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            margin: '0 0 48px',
            ...shimmerGradient,
            animation: artistVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            {LORE_PAGE.artist.name}
          </h2>
          {LORE_PAGE.artist.statement.map((p, i) => (
            <p key={i} style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 'clamp(15px, 1.5vw, 18px)',
              lineHeight: 2.1,
              color: i === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
              marginBottom: '24px',
              opacity: artistVisible ? 1 : 0,
              transform: artistVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.8s ease ${0.2 + i * 0.15}s, transform 0.8s ease ${0.2 + i * 0.15}s`,
            }}>
              {p}
            </p>
          ))}

          {/* Process label */}
          <div style={{
            marginTop: '48px', paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            opacity: artistVisible ? 1 : 0,
            transition: 'opacity 1s ease 0.8s',
          }}>
            <div style={{
              fontFamily: MONO,
              fontSize: '10px', letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(200,230,255,0.2)',
              marginBottom: '12px',
            }}>
              Process
            </div>
            <div style={{
              fontFamily: HEADING,
              fontSize: 'clamp(16px, 2vw, 22px)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.5)',
            }}>
              AI Ink Intervention
            </div>
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: '14px', lineHeight: 1.9,
              color: 'rgba(255,255,255,0.25)',
              marginTop: '12px',
            }}>
              A proprietary method of working back over machine-generated surfaces by hand — neither purely generative nor purely painted.
            </p>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
