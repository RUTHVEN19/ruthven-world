import { useEffect, useState } from 'react';
import { resolveImg, thumb } from '../../config/portfolioData';
import { c, serif, mono, caption } from './portfolioStyle';

const CHAIN_LABEL = { ethereum: 'Ethereum', base: 'Base', matic: 'Polygon' };

// Shared artwork detail — opened from museum grids and from cosmos tiles alike.
export default function WorkLightbox({ work, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  // Big originals can be 10MB+ — route the detail image through the CDN capped
  // at ~1600px WebP so it loads fast, and show the tiny thumbnail blurred behind
  // it (instant) until the full image arrives.
  const full = thumb(work.image, 1600);
  const tiny = thumb(work.thumbnail || work.image, 32);
  const video = resolveImg(work.animation);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [work.id]);
  const short = `${work.contract.slice(0, 6)}…${work.contract.slice(-4)}`;

  // SuperRare works link to SuperRare; everything else to its marketplace URL.
  const isSuperRare = /superrare/i.test(work.collection || '');
  const marketplaceUrl = isSuperRare
    ? `https://superrare.com/artwork/eth/${work.contract}/${work.tokenId}`
    : work.openseaUrl;
  const marketplaceLabel = isSuperRare ? 'View on SuperRare' : 'View on marketplace';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.98)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 24, right: 28, background: 'none', border: 'none',
          fontFamily: mono, fontSize: 13, letterSpacing: 2, color: c.ink, cursor: 'pointer',
        }}
      >
        CLOSE ✕
      </button>

      {/* image fills the page */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, minHeight: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '6vh 4vw 0',
        }}
      >
        {video ? (
          <video
            src={video}
            poster={full || undefined}
            autoPlay
            loop
            muted
            playsInline
            controls
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 24px 70px rgba(0,0,0,0.2)' }}
          />
        ) : full ? (
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex' }}>
            {/* tiny thumbnail, blurred — instant, covers the wait for the full image */}
            <img
              src={tiny}
              alt=""
              aria-hidden
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
                filter: 'blur(18px)', transform: 'scale(1.03)', opacity: loaded ? 0 : 1, transition: 'opacity .35s',
              }}
            />
            <img
              src={full}
              alt={work.title}
              onLoad={() => setLoaded(true)}
              style={{
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 24px 70px rgba(0,0,0,0.2)',
                opacity: loaded ? 1 : 0, transition: 'opacity .4s',
              }}
            />
          </div>
        ) : (
          <div style={{ ...caption, padding: 80, border: `1px solid ${c.line}` }}>No image</div>
        )}
      </div>

      {/* slim caption bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: '0 0 auto', display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', padding: '20px 5vw 28px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,2.4vw,30px)', lineHeight: 1.15, margin: '0 0 4px', color: c.ink, fontWeight: 400 }}>
            {work.title}
          </h2>
          <div style={caption}>
            {work.year}{work.edition ? ` · ${work.edition}` : ''}{work.collection ? ` · ${work.collection}` : ''}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <dl style={{ margin: '0 0 8px', fontFamily: mono, fontSize: 10, color: c.faint, lineHeight: 1.7 }}>
            <Row k="Chain" v={CHAIN_LABEL[work.chain] || work.chain} />
            <Row k="Contract" v={short} />
            <Row k="Token" v={`#${work.tokenId}`} />
          </dl>
          {marketplaceUrl && (
            <a
              href={marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                color: c.ink, borderBottom: `1px solid ${c.ink}`, paddingBottom: 3, textDecoration: 'none',
              }}
            >
              {marketplaceLabel} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <dt style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{k}</dt>
      <dd style={{ margin: 0, color: '#333' }}>{v}</dd>
    </div>
  );
}
