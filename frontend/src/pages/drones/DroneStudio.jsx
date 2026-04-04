import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALBUM, ZONES } from '../../config/dronesContent';

const zone = ZONES.find(z => z.slug === 'studio');

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes waveform {
    0%, 100% { transform: scaleY(0.3); }
    50%       { transform: scaleY(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.9; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

// Waveform bar heights — purely decorative
const WAVE_BARS = [0.4, 0.7, 0.5, 1.0, 0.6, 0.9, 0.4, 0.8, 0.3, 0.7, 0.5, 1.0, 0.6, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.6, 0.8, 0.4, 1.0, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.4, 1.0, 0.6, 0.3, 0.9, 0.5, 0.7, 0.4];

export default function DroneStudio() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);

  const toggleAudio = (trackIndex) => {
    if (!audioRef.current) return;
    if (playing && playingTrack === trackIndex) {
      audioRef.current.pause();
      setPlaying(false);
      setPlayingTrack(null);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
        setPlayingTrack(trackIndex);
      }).catch(() => {});
    }
  };

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#fff' }}>
      <style>{keyframes}</style>

      {/* Hidden audio element */}
      <audio ref={audioRef} loop style={{ display: 'none' }}>
        <source src="/drones-ambient.m4a" type="audio/mp4" />
        <source src="/drones-hero.mp4" type="video/mp4" />
      </audio>

      {/* ── STUDIO HEADER ── */}
      <div style={{
        padding: 'clamp(72px,10vw,140px) clamp(24px,6vw,80px) clamp(48px,6vw,72px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'end',
      }}>
        <div>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '16px', animation: 'fadeUp 0.8s ease both',
          }}>
            Zone {zone.numeral} — Diamond Drones Are a Girl's Best Friend™
          </div>
          <h1 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(36px,6vw,78px)',
            fontWeight: 400, letterSpacing: '0.04em',
            textTransform: 'uppercase', lineHeight: 0.92,
            margin: '0 0 24px',
            animation: 'fadeUp 0.8s ease 0.1s both',
          }}>
            {zone.title}
          </h1>
          <p style={{
            fontSize: 'clamp(13px,1.3vw,16px)', lineHeight: 1.9,
            color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', maxWidth: '420px',
            animation: 'fadeUp 0.8s ease 0.2s both',
          }}>
            {zone.tagline}
          </p>
        </div>

        {/* Album art placeholder — diamond spinner */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          animation: 'fadeUp 0.8s ease 0.3s both',
        }}>
          <div style={{
            position: 'relative',
            width: 'clamp(160px, 20vw, 240px)',
            height: 'clamp(160px, 20vw, 240px)',
          }}>
            {/* Outer ring */}
            <div style={{
              position: 'absolute', inset: 0,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: playing ? 'spin 8s linear infinite' : 'none',
            }} />
            {/* Inner diamond */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: '55%', height: '55%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.02)',
            }} />
            {/* Center label */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '8px', letterSpacing: '0.3em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                lineHeight: 1.8,
              }}>
                The Drones<br />of Suburbia<br />Vol. I
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WAVEFORM VISUALISER ── */}
      <div style={{
        padding: '0 clamp(24px,6vw,80px)',
        height: '80px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '2px',
        overflow: 'hidden',
      }}>
        {WAVE_BARS.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              background: playing
                ? `rgba(200,230,255,${h * 0.5})`
                : 'rgba(255,255,255,0.08)',
              minHeight: '3px',
              maxHeight: '60px',
              transition: 'background 0.3s',
              animation: playing ? `waveform ${1 + (i % 4) * 0.3}s ease-in-out ${i * 0.04}s infinite` : 'none',
            }}
          />
        ))}

        {/* Play/pause control in waveform */}
        <button
          onClick={() => toggleAudio(0)}
          style={{
            marginLeft: '16px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.5)',
            padding: '6px 14px',
            fontSize: '10px', letterSpacing: '0.3em',
            fontFamily: 'monospace', textTransform: 'uppercase',
            cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
        >
          {playing && playingTrack === 0 ? '▐▐' : '▶'}
        </button>
      </div>

      {/* ── TRACKLIST ── */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
              marginBottom: '6px',
            }}>
              Album
            </div>
            <div style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: 'clamp(18px,2.5vw,30px)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmerSlow 6s linear infinite',
            }}>
              {ALBUM.title}
            </div>
          </div>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em',
            fontFamily: 'monospace', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            {ALBUM.year} · 200 Editions
          </div>
        </div>

        {/* Track rows */}
        <div>
          {ALBUM.tracks.map((track, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredTrack(i)}
              onMouseLeave={() => setHoveredTrack(null)}
              onClick={() => toggleAudio(i)}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                background: hoveredTrack === i ? 'rgba(255,255,255,0.02)' : 'transparent',
                transition: 'background 0.2s',
                margin: '0 -clamp(24px,6vw,80px)',
                padding: '16px clamp(24px,6vw,80px)',
              }}
            >
              {/* Number / play indicator */}
              <div style={{
                fontSize: '11px', letterSpacing: '0.15em',
                fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)',
                textAlign: 'right',
              }}>
                {playing && playingTrack === i
                  ? <span style={{ color: 'rgba(200,230,255,0.7)', animation: 'pulse 1s ease-in-out infinite' }}>▶</span>
                  : hoveredTrack === i
                  ? <span style={{ color: 'rgba(255,255,255,0.5)' }}>▶</span>
                  : track.number}
              </div>

              {/* Title + film */}
              <div>
                <div style={{
                  fontSize: 'clamp(13px,1.4vw,16px)',
                  fontFamily: track.featured ? '"Anton", sans-serif' : 'Georgia, serif',
                  fontStyle: track.featured ? 'normal' : 'italic',
                  textTransform: track.featured ? 'uppercase' : 'none',
                  letterSpacing: track.featured ? '0.04em' : '0.01em',
                  color: track.featured
                    ? (hoveredTrack === i ? '#fff' : 'rgba(255,255,255,0.85)')
                    : (hoveredTrack === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)'),
                  transition: 'color 0.2s',
                  marginBottom: '3px',
                }}>
                  {track.title}
                  {track.featured && (
                    <span style={{
                      marginLeft: '10px',
                      fontSize: '9px', letterSpacing: '0.3em',
                      fontFamily: 'monospace', textTransform: 'uppercase',
                      color: 'rgba(200,230,255,0.5)',
                      verticalAlign: 'middle',
                    }}>
                      Title Track
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.2em',
                  fontFamily: 'monospace', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  {track.film}
                </div>
              </div>

              {/* Preview tag */}
              {(hoveredTrack === i || (playing && playingTrack === i)) && (
                <div style={{
                  fontSize: '9px', letterSpacing: '0.2em',
                  fontFamily: 'monospace', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)',
                }}>
                  {playing && playingTrack === i ? 'Playing' : 'Preview'}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── ALBUM STATEMENT ── */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
        background: 'rgba(255,255,255,0.06)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ background: '#080808', padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,60px)' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '16px',
          }}>
            First Edition
          </div>
          <p style={{
            fontSize: 'clamp(15px,1.8vw,22px)', lineHeight: 2,
            color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}>
            The first-ever Drones of Suburbia album. A decade of cinematic
            sound collected into one sovereign object — ten tracks, ten films,
            one universe.
          </p>
        </div>
        <div style={{
          background: '#080808', borderLeft: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,60px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {[
            ['Format', 'Digital Album · NFT'],
            ['Tracks', '10'],
            ['Artist', 'Miss AL Simpson'],
            ['Label', 'The Drones of Suburbia'],
            ['Editions', '200 worldwide'],
            ['Includes', "Sotheby's track + more"],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.25em', fontFamily: 'monospace', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>{k}</span>
              <span style={{ fontSize: '11px', letterSpacing: '0.05em', fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)' }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(60px,7vw,90px) clamp(24px,6vw,80px)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(13px,1.3vw,15px)', lineHeight: 1.9,
          color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', maxWidth: '440px', margin: '0 auto 36px',
        }}>
          One album edition is included in every Collector Set.
          200 editions worldwide. 1 ETH.
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
