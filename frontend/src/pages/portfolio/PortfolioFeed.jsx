import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { c, serif, mono, caption, SOCIALS } from './portfolioStyle';
import { JOURNAL } from '../../config/portfolioJournal';

// Feed — the studio's OWN journal, rendered natively (no third-party embeds).
// Interactive + parallax: the masthead drifts on scroll, each card floats at its
// own depth as you scroll, tilts toward the cursor on hover, and its image
// parallax-shifts inside the frame. Still quiet, still in the museum register.

export default function PortfolioFeed() {
  const live = SOCIALS.filter(s => s.href);
  const has = JOURNAL.length > 0;

  // Parallax registry: each card registers its parallax wrapper + a depth; a
  // single scroll rAF drifts them by depth so the wall reads as layered space.
  const tiles = useRef(new Map());
  const mastheadRef = useRef(null);
  const regCard = useCallback((id) => ({
    set: (el, depth) => tiles.current.set(id, { el, depth }),
    remove: () => tiles.current.delete(id),
  }), []);

  useEffect(() => {
    let raf;
    const loop = () => {
      const vh = window.innerHeight || 1;
      // masthead drifts up a touch slower than the page (classic parallax header)
      if (mastheadRef.current) {
        const y = (window.scrollY || 0) * 0.28;
        mastheadRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
        mastheadRef.current.style.opacity = String(Math.max(0, 1 - (window.scrollY || 0) / 520));
      }
      tiles.current.forEach(({ el, depth }) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2) / vh;          // 0 top → 1 bottom of viewport
        const drift = (0.5 - p) * (26 + depth * 90);     // deeper cards drift more
        el.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <Helmet>
        <title>Miss AL Simpson — Feed</title>
        <meta name="description" content="The studio journal of Miss AL Simpson — exhibitions, new work and milestones, in her own words." />
      </Helmet>

      {/* ── Masthead (parallax) ── */}
      <section style={{ padding: '72px 0 40px', overflow: 'hidden' }}>
        <div ref={mastheadRef} style={{ willChange: 'transform, opacity' }}>
          <div style={{ ...caption, marginBottom: 18 }}>The studio journal</div>
          <h1 style={{
            fontFamily: serif, fontWeight: 800, fontSize: 'clamp(52px,11vw,150px)',
            lineHeight: 0.9, letterSpacing: -2, textTransform: 'uppercase', margin: '0 0 28px',
          }}>
            Feed
          </h1>
          <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.7, color: c.faint, margin: '0 0 28px', maxWidth: 640 }}>
            Exhibitions, new work and milestones — in the studio’s own words.
          </p>

          {/* Follow row */}
          {live.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {live.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none', color: c.ink, border: `1px solid ${c.line}`,
                    padding: '9px 16px', borderRadius: 999, fontFamily: mono, fontSize: 11,
                    letterSpacing: 1, textTransform: 'uppercase', transition: 'background .2s, color .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = c.ink; e.currentTarget.style.color = c.paper; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.ink; }}>
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── The wall ── */}
      {has ? (
        <section style={{ borderTop: `1px solid ${c.line}`, padding: '40px 0', columnWidth: 360, columnGap: 'clamp(16px,2.4vw,34px)' }}>
          {JOURNAL.map((entry, i) => (
            <Card key={entry.link || entry.title || i} entry={entry} index={i} regCard={regCard} />
          ))}
        </section>
      ) : (
        <EmptyState live={live} />
      )}
    </div>
  );
}

// One journal entry → a native card. Floats at its own scroll-parallax depth,
// tilts toward the cursor on hover, and parallax-shifts its image in the frame.
function Card({ entry, index, regCard }) {
  const [showImg, setShowImg] = useState(Boolean(entry.image));
  const [shown, setShown] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const artRef = useRef(null);         // layout box (observed)
  const plxRef = useRef(null);         // parent-driven scroll-parallax wrapper
  const imgRef = useRef(null);         // image, parallax-shifted on hover
  const depth = useMemo(() => ((index * 7) % 10) / 10, [index]);   // 10 depth layers

  // register the parallax wrapper with the parent scroll loop
  const handle = useMemo(() => regCard(entry.link || entry.title || index), [regCard, entry, index]);
  useEffect(() => {
    if (plxRef.current) handle.set(plxRef.current, depth);
    return () => handle.remove();
  }, [handle, depth]);

  // scroll-reveal (fade / rise in once)
  useEffect(() => {
    if (!artRef.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: '80px' });
    io.observe(artRef.current);
    return () => io.disconnect();
  }, []);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 6, ry: px * 6, active: true });
    if (imgRef.current) imgRef.current.style.transform = `scale(1.06) translate(${(-px * 14).toFixed(1)}px, ${(-py * 14).toFixed(1)}px)`;
  };
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, active: false });
    if (imgRef.current) imgRef.current.style.transform = 'scale(1) translate(0,0)';
  };

  return (
    <div ref={plxRef} style={{ willChange: 'transform', perspective: 900, breakInside: 'avoid', margin: '0 0 clamp(16px,2.4vw,34px)' }}>
      <article
        ref={artRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          border: `1px solid ${c.line}`, background: c.paper, overflow: 'hidden',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${shown ? 0 : 26}px)`,
          opacity: shown ? 1 : 0,
          boxShadow: tilt.active ? '0 26px 60px rgba(0,0,0,0.20)' : '0 0 0 rgba(0,0,0,0)',
          transition: 'transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease, opacity .7s ease',
        }}
      >
        {showImg && (
          <div style={{ overflow: 'hidden', borderBottom: `1px solid ${c.line}` }}>
            <img
              ref={imgRef}
              src={entry.image}
              alt={entry.title}
              loading="lazy"
              onError={() => setShowImg(false)}
              style={{ width: '100%', display: 'block', transition: 'transform .5s cubic-bezier(.2,.7,.2,1)', willChange: 'transform' }}
            />
          </div>
        )}
        <div style={{ padding: '20px 22px 22px' }}>
          {entry.date && (
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.faint, marginBottom: 10 }}>
              {entry.date}
            </div>
          )}
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, lineHeight: 1.2, letterSpacing: -0.3, margin: '0 0 10px', color: c.ink }}>
            {entry.title}
          </h2>
          {entry.body && (
            <p style={{ fontFamily: serif, fontSize: 16, lineHeight: 1.65, color: c.faint, margin: 0 }}>
              {entry.body}
            </p>
          )}
          {entry.link && (
            <a href={entry.link} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-block', marginTop: 16, fontFamily: mono, fontSize: 11,
                letterSpacing: 1, textTransform: 'uppercase', color: c.ink, textDecoration: 'none',
                borderBottom: `1px solid ${c.ink}`, paddingBottom: 2,
              }}>
              {entry.linkLabel || 'Read more'} →
            </a>
          )}
        </div>
      </article>
    </div>
  );
}

// Shown while the journal is still being assembled — keeps the page composed.
function EmptyState({ live }) {
  return (
    <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(56px,10vh,120px) 0', textAlign: 'center' }}>
      <div style={{ ...caption, marginBottom: 16 }}>Journal in preparation</div>
      <p style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.7, color: c.faint, maxWidth: 520, margin: '0 auto 28px' }}>
        The journal is being assembled. In the meantime, the studio is most active here.
      </p>
      {live.length > 0 && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {live.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{
                textDecoration: 'none', color: c.ink, border: `1px solid ${c.line}`,
                padding: '10px 18px', borderRadius: 999, fontFamily: mono, fontSize: 11,
                letterSpacing: 1, textTransform: 'uppercase',
              }}>
              {s.label} · {s.handle}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
