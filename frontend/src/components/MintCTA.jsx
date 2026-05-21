import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';

/**
 * MintCTA — reusable mint call-to-action for the Diamond Drones world zones.
 *
 * Two states:
 *   1. Coming Soon (when config.mintUrl is null) — wallet-based allowlist signup
 *   2. Live mint    (when config.mintUrl is set)  — links externally to OpenSea/Manifold
 *
 * Props:
 *   config: one of EXTERNAL_MINT.{diamondDrones, droneBlondes, album}
 */

const ALLOWLIST_API = '/api/allowlist';

export default function MintCTA({ config }) {
  const { account, isConnected, isConnecting, connect } = useWallet();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Check existing allowlist registration when wallet connects
  useEffect(() => {
    if (!account || !config?.slug) return;
    fetch(`${ALLOWLIST_API}?wallet=${account}&drop=${config.slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.registered) setIsRegistered(true);
      })
      .catch(() => {/* silent — backend may be offline pre-launch */});
  }, [account, config?.slug]);

  const handleAllowlistJoin = async () => {
    if (!account || !config) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const message = `I want to join the ${config.title} allowlist.\n\nWallet: ${account}\nDrop: ${config.slug}\nTimestamp: ${Date.now()}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });

      const res = await fetch(ALLOWLIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: account,
          drop: config.slug,
          message,
          signature,
        }),
      });

      if (!res.ok) throw new Error('Failed to register — please try again');
      setIsRegistered(true);
    } catch (err) {
      setError(err?.message?.includes('User denied') ? 'Signature cancelled' : (err.message || 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── LIVE MINT STATE ────────────────────────────────────────────────────
  if (config?.mintUrl) {
    return (
      <div style={containerStyle}>
        <div style={kickerStyle}>{config.subtitle}</div>
        <a
          href={config.mintUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaButtonStyle}
        >
          ✦ {config.cta}
        </a>
        <div style={noteStyle}>
          via {config.platform} · {config.network}
        </div>
      </div>
    );
  }

  // ── COMING SOON / ALLOWLIST STATE ──────────────────────────────────────
  return (
    <div style={containerStyle}>
      <div style={kickerStyle}>{config.subtitle}</div>

      <div style={comingSoonBadgeStyle}>
        ◆ MINT COMING SOON ◆
      </div>

      <p style={noteStyle}>{config.comingSoonNote}</p>

      <div style={{ marginTop: '24px' }}>
        {!isConnected && (
          <button
            onClick={connect}
            disabled={isConnecting}
            style={{ ...ctaButtonStyle, opacity: isConnecting ? 0.6 : 1 }}
          >
            {isConnecting ? '✦ CONNECTING...' : '✦ CONNECT WALLET TO JOIN ALLOWLIST'}
          </button>
        )}

        {isConnected && !isRegistered && (
          <button
            onClick={handleAllowlistJoin}
            disabled={isSubmitting}
            style={{
              ...ctaButtonStyle,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'wait' : 'pointer',
            }}
          >
            {isSubmitting ? '✦ AWAITING SIGNATURE...' : `✦ JOIN ${config.title} ALLOWLIST`}
          </button>
        )}

        {isConnected && isRegistered && (
          <div style={registeredStyle}>
            ✓ YOU'RE ON THE ALLOWLIST
            <div style={{ ...noteStyle, marginTop: '8px' }}>
              We'll notify you when minting opens.
            </div>
          </div>
        )}

        {error && (
          <div style={errorStyle}>{error}</div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const containerStyle = {
  textAlign: 'center',
  padding: 'clamp(40px, 6vw, 60px) clamp(20px, 4vw, 40px)',
  maxWidth: '700px',
  margin: '0 auto',
};

const kickerStyle = {
  fontSize: 'clamp(11px, 1.2vw, 13px)',
  fontFamily: "'Space Mono', monospace",
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.45)',
  marginBottom: '24px',
};

const comingSoonBadgeStyle = {
  display: 'inline-block',
  padding: '12px 32px',
  fontFamily: "'Anton', sans-serif",
  fontSize: 'clamp(16px, 2vw, 22px)',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  border: '1px solid rgba(160,210,230,0.4)',
  color: 'rgba(220,235,245,0.85)',
  background: 'linear-gradient(110deg, rgba(106,138,154,0.08) 0%, rgba(176,200,212,0.12) 50%, rgba(106,138,154,0.08) 100%)',
  marginBottom: '20px',
};

const ctaButtonStyle = {
  display: 'inline-block',
  marginTop: '16px',
  padding: '14px 36px',
  fontFamily: "'Anton', sans-serif",
  fontSize: 'clamp(14px, 1.5vw, 17px)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  border: '1px solid rgba(160,210,230,0.4)',
  background: 'linear-gradient(110deg, rgba(106,138,154,0.15) 0%, rgba(176,200,212,0.2) 25%, rgba(255,255,255,0.25) 50%, rgba(168,192,204,0.2) 75%, rgba(106,138,154,0.15) 100%)',
  backgroundSize: '300% auto',
  color: '#ffffff',
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(160,210,230,0.2), 0 0 50px rgba(160,210,230,0.1)',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const noteStyle = {
  fontSize: 'clamp(11px, 1.1vw, 13px)',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  color: 'rgba(255,255,255,0.5)',
  marginTop: '16px',
  letterSpacing: '0.05em',
  lineHeight: 1.7,
};

const registeredStyle = {
  display: 'inline-block',
  padding: '16px 36px',
  fontFamily: "'Space Mono', monospace",
  fontSize: 'clamp(11px, 1.2vw, 13px)',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: 'rgba(180,255,200,0.85)',
  border: '1px solid rgba(180,255,200,0.3)',
  background: 'rgba(60,90,75,0.15)',
};

const errorStyle = {
  marginTop: '16px',
  fontSize: '12px',
  fontFamily: "'Space Mono', monospace",
  color: 'rgba(255,180,180,0.8)',
  letterSpacing: '0.1em',
};
