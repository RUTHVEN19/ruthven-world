import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MINT_CONFIG, COLLECTOR_SET, SITE_META, ZONES } from '../../config/dronesContent';
import WalletConnect from '../../components/WalletConnect';

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes crystalShimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes glint1 {
    0%, 82%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    88%           { opacity: 1; transform: scale(1) rotate(15deg); }
  }
  @keyframes glint2 {
    0%, 28%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    38%           { opacity: 1; transform: scale(1) rotate(-10deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  @keyframes supplyBar {
    from { width: 0%; }
    to   { width: var(--supply-pct); }
  }
  @keyframes droneFloat {
    0%, 100% { transform: rotate(45deg) translateY(0px); }
    50%       { transform: rotate(45deg) translateY(-6px); }
  }
`;

// Mock mint state — wire to contract when ready
const MOCK_MINTED = 0;

export default function DroneMint() {
  const navigate = useNavigate();
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [hoveredSet, setHoveredSet] = useState(null);

  const supplyPct = (MOCK_MINTED / MINT_CONFIG.maxSupply) * 100;
  const remaining = MINT_CONFIG.maxSupply - MOCK_MINTED;

  // Placeholder mint function — replace with actual contract call
  const handleMint = async () => {
    setMintError(null);
    setMinting(true);
    try {
      // TODO: wire to bundle contract
      // const tx = await contract.mint({ value: parseEther('1') });
      // await tx.wait();
      await new Promise(r => setTimeout(r, 2000)); // simulate
      setMintSuccess(true);
    } catch (err) {
      setMintError(err?.message || 'Transaction failed. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <style>{keyframes}</style>

      {/* ── MINT SUCCESS STATE ── */}
      {mintSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px', textAlign: 'center',
        }}>
          {/* Spinning diamond */}
          <div style={{
            width: '80px', height: '80px',
            border: '1.5px solid rgba(255,255,255,0.4)',
            transform: 'rotate(45deg)',
            marginBottom: '48px',
            animation: 'droneFloat 2s ease-in-out infinite',
          }} />
          <div style={{
            fontSize: 'clamp(28px,4vw,52px)',
            fontFamily: '"Anton", sans-serif',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 1.0, marginBottom: '24px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'crystalShimmer 4s linear infinite',
          }}>
            Collector Set<br />Acquired
          </div>
          <p style={{
            fontSize: '13px', letterSpacing: '0.05em',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.5)', maxWidth: '360px',
            lineHeight: 1.9, marginBottom: '40px',
          }}>
            Your complete edition of DIAMOND DRONES ARE A GIRL'S BEST FRIEND™
            has been delivered to your wallet. 1 film · 1 album · 10 stills · 24 Diamond Drones.
          </p>
          <button
            onClick={() => window.open(`https://opensea.io`, '_blank')}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '14px 40px',
              fontSize: '10px', letterSpacing: '0.35em',
              textTransform: 'uppercase', fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            View on OpenSea →
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,80px) clamp(60px,7vw,90px)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontSize: '11px', letterSpacing: '0.45em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '28px', position: 'relative',
          animation: 'fadeUp 0.8s ease both',
        }}>
          {SITE_META.series} — {SITE_META.chapter}
        </div>

        {/* Title */}
        <div style={{
          position: 'relative', display: 'inline-block',
          animation: 'fadeUp 0.8s ease 0.1s both',
        }}>
          <span style={{ position: 'absolute', top: '5%',  left: '8%',  color: '#fff', fontSize: '18px', animation: 'glint1 4s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
          <span style={{ position: 'absolute', top: '10%', right: '5%', color: '#e0f0ff', fontSize: '12px', animation: 'glint2 5s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
          <h1 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(52px,10vw,130px)',
            fontWeight: 400, letterSpacing: '0.04em',
            textTransform: 'uppercase', lineHeight: 0.9,
            margin: '0 0 12px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'crystalShimmer 5s linear infinite',
          }}>
            MINT THE<br />COLLECTOR<br />SET
          </h1>
        </div>

        <div style={{
          marginTop: '32px', marginBottom: '48px',
          fontSize: 'clamp(12px,1.3vw,14px)',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)',
          animation: 'fadeUp 0.8s ease 0.25s both',
        }}>
          Diamond Drones Are a Girl's Best Friend™ · 200 Editions · 1 ETH
        </div>
      </div>

      {/* ── MAIN MINT PANEL ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'clamp(280px, 45%, 520px) 1fr',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* LEFT — Collector Set breakdown */}
        <div style={{
          padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,60px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '32px',
          }}>
            What One Mint Delivers
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {COLLECTOR_SET.map((item, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredSet(i)}
                onMouseLeave={() => setHoveredSet(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr',
                  gap: '16px', alignItems: 'flex-start',
                  padding: '20px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: hoveredSet === i ? 'rgba(255,255,255,0.02)' : 'transparent',
                  transition: 'background 0.2s',
                  margin: '0 -clamp(24px,5vw,60px)',
                  padding: '20px clamp(24px,5vw,60px)',
                }}
              >
                <div style={{
                  fontSize: 'clamp(18px,2vw,24px)',
                  color: hoveredSet === i ? 'rgba(200,230,255,0.8)' : 'rgba(255,255,255,0.4)',
                  transition: 'color 0.3s',
                  marginTop: '2px',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: 'clamp(13px,1.4vw,16px)',
                    fontFamily: '"Anton", sans-serif',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: hoveredSet === i ? '#fff' : 'rgba(255,255,255,0.8)',
                    marginBottom: '4px', transition: 'color 0.2s',
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '11px', letterSpacing: '0.05em',
                    fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)',
                    lineHeight: 1.6,
                  }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total value line */}
          <div style={{
            marginTop: '28px', padding: '20px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.3em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              One complete edition set
            </div>
            <div style={{
              fontSize: 'clamp(18px,2.2vw,26px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmerSlow 5s linear infinite',
            }}>
              1 ETH
            </div>
          </div>
        </div>

        {/* RIGHT — Mint action */}
        <div style={{
          padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,60px)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Supply counter */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <span style={{
                fontSize: '10px', letterSpacing: '0.3em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>
                Edition Supply
              </span>
              <span style={{
                fontSize: '11px', letterSpacing: '0.15em',
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.5)',
              }}>
                {MOCK_MINTED} / {MINT_CONFIG.maxSupply}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '1px', background: 'rgba(255,255,255,0.1)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: `${supplyPct}%`,
                background: 'linear-gradient(90deg, rgba(176,200,212,0.5), rgba(255,255,255,0.8))',
                transition: 'width 1s ease',
              }} />
            </div>

            <div style={{
              marginTop: '8px',
              fontSize: '10px', letterSpacing: '0.2em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: remaining > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,100,100,0.6)',
            }}>
              {remaining > 0
                ? `${remaining} editions remaining`
                : 'Sold Out'}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '10px', letterSpacing: '0.3em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: '8px',
            }}>
              Price per Edition
            </div>
            <div style={{
              fontSize: 'clamp(32px,5vw,64px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              {MINT_CONFIG.price}
            </div>
          </div>

          {/* Wallet connect */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '10px', letterSpacing: '0.3em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: '12px',
            }}>
              Step 1 — Connect Wallet
            </div>
            <WalletConnect />
          </div>

          {/* Mint button */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '10px', letterSpacing: '0.3em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: '12px',
            }}>
              Step 2 — Mint Collector Set
            </div>

            <button
              onClick={handleMint}
              disabled={minting || remaining === 0}
              style={{
                width: '100%',
                background: minting
                  ? 'rgba(255,255,255,0.03)'
                  : remaining === 0
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${minting ? 'rgba(255,255,255,0.15)' : remaining === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}`,
                color: minting || remaining === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
                padding: '20px 24px',
                fontSize: '12px', letterSpacing: '0.4em',
                textTransform: 'uppercase', fontFamily: 'monospace',
                cursor: minting || remaining === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px',
              }}
              onMouseEnter={e => {
                if (!minting && remaining > 0) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
                }
              }}
              onMouseLeave={e => {
                if (!minting && remaining > 0) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                }
              }}
            >
              {minting ? (
                <>
                  <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>◆</span>
                  Minting...
                </>
              ) : remaining === 0 ? (
                'Sold Out'
              ) : (
                <>
                  ✦ Mint the Collector Set
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {mintError && (
            <div style={{
              padding: '14px 16px',
              border: '1px solid rgba(255,80,80,0.2)',
              background: 'rgba(255,80,80,0.04)',
              fontSize: '11px', letterSpacing: '0.05em',
              fontFamily: 'monospace', color: 'rgba(255,150,150,0.7)',
              lineHeight: 1.6,
            }}>
              {mintError}
            </div>
          )}

          {/* Contract notice */}
          <div style={{
            marginTop: 'auto', paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.15)', lineHeight: 2,
            }}>
              Network: {MINT_CONFIG.network}<br />
              Contract: {MINT_CONFIG.bundleContractAddress}<br />
              One mint = complete set delivered to your wallet
            </div>
          </div>
        </div>
      </div>

      {/* ── WHAT YOU RECEIVE — full explainer ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '48px', textAlign: 'center',
        }}>
          The Complete Edition
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          {[
            {
              icon: '◆',
              label: 'Short Film',
              detail: 'Directed by Miss AL Simpson. Featuring the signature track. 200 editions worldwide.',
              link: '/drones/cinema',
              linkLabel: 'View Cinema',
            },
            {
              icon: '◇',
              label: 'Full Album',
              detail: 'The first-ever Drones of Suburbia album. 10 tracks across the cinematic universe. 200 editions.',
              link: '/drones/studio',
              linkLabel: 'View Studio',
            },
            {
              icon: '▪',
              label: '10 Film Stills',
              detail: 'Unique AI Ink Intervention works by Miss AL Simpson. Drawn from a pool of 2,000.',
              link: '/drones/gallery',
              linkLabel: 'View Gallery',
            },
            {
              icon: '✦',
              label: '24 Diamond Drones',
              detail: 'Your curated fleet. Five rarity tiers. Drawn from 100 unique designs. 4,800 total.',
              link: '/drones/shop',
              linkLabel: 'View Shop',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{ background: '#0a0a0a', padding: 'clamp(36px,5vw,56px) clamp(24px,4vw,44px)' }}
            >
              <div style={{
                fontSize: '28px', marginBottom: '20px',
                color: 'rgba(200,230,255,0.5)',
              }}>
                {item.icon}
              </div>
              <div style={{
                fontSize: 'clamp(14px,1.6vw,18px)',
                fontFamily: '"Anton", sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                marginBottom: '12px', color: 'rgba(255,255,255,0.85)',
              }}>
                {item.label}
              </div>
              <p style={{
                fontSize: '12px', letterSpacing: '0.03em',
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                color: 'rgba(255,255,255,0.35)', lineHeight: 1.8,
                marginBottom: '20px',
              }}>
                {item.detail}
              </p>
              <button
                onClick={() => navigate(item.link)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '10px', letterSpacing: '0.3em',
                  textTransform: 'uppercase', fontFamily: 'monospace',
                  cursor: 'pointer', padding: 0,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: '2px', transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                {item.linkLabel} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUNDLE MECHANICS EXPLAINER ── */}
      <section style={{
        padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '720px', margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          marginBottom: '20px',
        }}>
          Ownership
        </div>
        <p style={{
          fontSize: 'clamp(13px,1.4vw,16px)', lineHeight: 2,
          color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', marginBottom: '12px',
        }}>
          One mint delivers one complete edition set into your wallet as separate NFT tokens.
          You own each piece individually — the film, the album, each still, and each drone.
          Real ownership. Full composability.
        </p>
        <p style={{
          fontSize: 'clamp(11px,1.2vw,13px)', lineHeight: 1.9,
          color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}>
          {SITE_META.trademark}
        </p>
      </section>
    </div>
  );
}
