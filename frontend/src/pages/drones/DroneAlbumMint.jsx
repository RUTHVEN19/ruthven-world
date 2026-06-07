import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ALBUM, ALBUM_MINT_CONFIG, SITE_META } from '../../config/dronesContent';
import { useWallet } from '../../hooks/useWallet';
import WalletConnect from '../../components/WalletConnect';

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.9; }
  }
  @keyframes vinylSpin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

// Minimal ABI for the album contract
const ALBUM_ABI = [
  'function mint() payable',
  'function totalMinted() view returns (uint256)',
  'function mintPrice() view returns (uint256)',
  'function mintActive() view returns (bool)',
];

export default function DroneAlbumMint() {
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [totalMinted, setTotalMinted] = useState(0);

  const handleMint = async () => {
    setMintError(null);
    setMinting(true);
    try {
      if (!window.ethereum) throw new Error('No wallet detected');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        ALBUM_MINT_CONFIG.contractAddress,
        ALBUM_ABI,
        signer,
      );

      const tx = await contract.mint({
        value: ethers.parseEther(String(ALBUM_MINT_CONFIG.priceETH)),
      });
      await tx.wait();

      // Refresh total minted
      const newTotal = await contract.totalMinted();
      setTotalMinted(Number(newTotal));
      setMintSuccess(true);
    } catch (err) {
      setMintError(err?.reason || err?.message || 'Transaction failed');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div style={{ background: '#3a3a3a', minHeight: '100vh', color: '#fff' }}>
      <style>{keyframes}</style>

      {/* ── MINT SUCCESS OVERLAY ── */}
      {mintSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '32px',
        }}>
          <div style={{
            width: '120px', height: '120px', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              animation: 'spin 6s linear infinite',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '36px',
            }}>
              ◆
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '28px', letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: '12px',
            }}>
              Album Acquired
            </div>
            <p style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              lineHeight: 1.8, maxWidth: '360px',
            }}>
              THE DRONES OF SUBURBIA is now in your wallet.
              Head to the Studio to stream and download your album.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => navigate('/studio')}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', padding: '14px 36px',
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
                cursor: 'pointer',
              }}
            >
              Go to Studio →
            </button>
            <button
              onClick={() => setMintSuccess(false)}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', padding: '14px 24px',
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,12vw,160px) clamp(24px,6vw,80px)',
      }}>
        {/* Vinyl record decoration */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 'min(500px, 70vw)', height: 'min(500px, 70vw)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '50%', animation: 'vinylSpin 30s linear infinite',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: '30%',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', inset: '46%',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '50%',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '640px' }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: '24px', animation: 'fadeUp 0.8s ease both',
          }}>
            Drones of Suburbia Music Studios
          </div>
          <h1 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(36px,7vw,80px)',
            fontWeight: 400, letterSpacing: '0.05em',
            textTransform: 'uppercase', lineHeight: 0.95,
            margin: '0 0 24px', animation: 'fadeUp 0.8s ease 0.1s both',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            THE DRONES<br />OF SUBURBIA
          </h1>
          <p style={{
            fontSize: 'clamp(13px,1.4vw,16px)', lineHeight: 1.8,
            color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', maxWidth: '420px', margin: '0 auto',
            animation: 'fadeUp 0.8s ease 0.2s both',
          }}>
            The debut album by Miss AL Simpson.
            Eleven tracks from across the cinematic universe.
            Own it on-chain.
          </p>
        </div>
      </div>

      {/* ── TRACKLIST ── */}
      <section style={{
        padding: '0 clamp(24px,6vw,80px) clamp(48px,6vw,80px)',
        maxWidth: '720px', margin: '0 auto',
      }}>
        <div style={{
          fontSize: '10px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          marginBottom: '24px',
        }}>
          11 Tracks
        </div>
        {ALBUM.tracks.map((track, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '32px 1fr auto',
            gap: '12px', alignItems: 'center',
            padding: '14px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{
              fontSize: '11px', fontFamily: "'Space Mono', monospace",
              color: 'rgba(255,255,255,0.2)', textAlign: 'right',
            }}>
              {track.number}
            </div>
            <div style={{
              fontSize: 'clamp(13px,1.3vw,15px)',
              fontFamily: track.featured ? '"Anton", sans-serif' : 'Georgia, serif',
              fontStyle: track.featured ? 'normal' : 'italic',
              textTransform: track.featured ? 'uppercase' : 'none',
              letterSpacing: track.featured ? '0.04em' : '0.01em',
              color: track.featured ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)',
            }}>
              {track.title}
              {track.featured && (
                <span style={{
                  marginLeft: '10px', fontSize: '8px', letterSpacing: '0.3em',
                  fontFamily: "'Space Mono', monospace", color: 'rgba(200,230,255,0.4)',
                  verticalAlign: 'middle',
                }}>
                  Title Track
                </span>
              )}
            </div>
            <div style={{
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>
              {track.film}
            </div>
          </div>
        ))}
      </section>

      {/* ── MINT SECTION ── */}
      <section style={{
        padding: 'clamp(64px,8vw,100px) clamp(24px,6vw,80px)',
        maxWidth: '640px', margin: '0 auto',
      }}>
        <div style={{
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 'clamp(32px,4vw,48px)',
        }}>
          {/* Details grid */}
          {[
            ['Format', 'Digital Album NFT'],
            ['Artist', ALBUM_MINT_CONFIG.artist],
            ['Label', ALBUM_MINT_CONFIG.label],
            ['Tracks', '11'],
            ['Edition', 'Open Edition'],
            ['Price', ALBUM_MINT_CONFIG.price],
            ['Royalty', ALBUM_MINT_CONFIG.royaltyPct],
            ['Network', ALBUM_MINT_CONFIG.network],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{
                fontSize: '10px', letterSpacing: '0.25em', fontFamily: "'Space Mono', monospace",
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              }}>{k}</span>
              <span style={{
                fontSize: '11px', fontFamily: "'Space Mono', monospace",
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em',
              }}>{v}</span>
            </div>
          ))}

          {/* Minted counter */}
          {totalMinted > 0 && (
            <div style={{
              textAlign: 'center', padding: '16px 0 0',
              fontSize: '10px', fontFamily: "'Space Mono', monospace",
              color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em',
            }}>
              {totalMinted} COPIES MINTED
            </div>
          )}

          {/* Wallet + Mint */}
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <WalletConnect compact />

            <button
              onClick={handleMint}
              disabled={minting || !isConnected || ALBUM_MINT_CONFIG.contractAddress === 'TBA'}
              style={{
                width: '100%', padding: '18px',
                background: minting ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: `1px solid ${minting ? 'rgba(255,255,255,0.1)' : isConnected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: minting || !isConnected ? 'rgba(255,255,255,0.25)' : '#fff',
                fontSize: '11px', letterSpacing: '0.35em',
                textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
                cursor: minting || !isConnected ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                if (!minting && isConnected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                }
              }}
              onMouseLeave={e => {
                if (!minting && isConnected) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }
              }}
            >
              {minting ? (
                <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>Minting...</span>
              ) : !isConnected ? (
                'Connect Wallet to Mint'
              ) : ALBUM_MINT_CONFIG.contractAddress === 'TBA' ? (
                'Coming Soon'
              ) : (
                `Buy Album · ${ALBUM_MINT_CONFIG.price}`
              )}
            </button>

            {mintError && (
              <div style={{
                fontSize: '11px', color: '#ff6b6b',
                fontFamily: "'Space Mono', monospace", textAlign: 'center',
                padding: '8px', background: 'rgba(255,0,0,0.05)',
                border: '1px solid rgba(255,0,0,0.1)',
                width: '100%',
              }}>
                {mintError}
              </div>
            )}
          </div>
        </div>

        {/* What you get */}
        <div style={{
          marginTop: '48px', textAlign: 'center',
        }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: '20px',
          }}>
            What You Get
          </div>
          {[
            ['◆', 'On-chain album ownership', 'Numbered NFT in your wallet'],
            ['▶', 'Stream all 11 tracks', 'Token-gated player on the site'],
            ['↓', 'Download the full album', 'MP3 + lossless audio files'],
            ['↻', 'Resale rights', `Artist earns ${ALBUM_MINT_CONFIG.royaltyPct} on secondary`],
          ].map(([icon, title, detail]) => (
            <div key={title} style={{
              padding: '16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}>
              <div style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.6)',
                marginBottom: '4px',
              }}>
                <span style={{ marginRight: '12px', color: 'rgba(200,230,255,0.4)' }}>{icon}</span>
                {title}
              </div>
              <div style={{
                fontSize: '10px', fontFamily: "'Space Mono', monospace",
                color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em',
                paddingLeft: '28px',
              }}>
                {detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '48px clamp(24px,6vw,80px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '9px', fontFamily: "'Space Mono', monospace",
          color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em',
          textTransform: 'uppercase', lineHeight: 2.2,
        }}>
          {SITE_META.copyright}<br />
          Drones of Suburbia Music Studios<br />
          {ALBUM_MINT_CONFIG.contractAddress !== 'TBA' && (
            <>Contract: {ALBUM_MINT_CONFIG.contractAddress}</>
          )}
        </div>
        <button
          onClick={() => navigate('/studio')}
          style={{
            marginTop: '24px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)', padding: '12px 32px',
            fontSize: '10px', letterSpacing: '0.3em',
            textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
            cursor: 'pointer',
          }}
        >
          ← Back to Studio
        </button>
      </footer>
    </div>
  );
}
