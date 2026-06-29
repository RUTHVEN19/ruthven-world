import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { c, serif, mono, caption, SOCIALS } from './portfolioStyle';
import { FEED } from '../../config/portfolioFeed';

// Feed — a live wall of the studio's social posts. Each card is the REAL post,
// hydrated by the platform's own official embed (current image/video, likes and
// caption). No API keys, no monthly fee — the catalogue of posts is curated by
// hand in config/portfolioFeed.js (paste a post URL to add it).

const SCRIPTS = {
  instagram: 'https://www.instagram.com/embed.js',
  tiktok: 'https://www.tiktok.com/embed.js',
  x: 'https://platform.twitter.com/widgets.js',
};

// Load a platform's embed script once.
function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = resolve;
    document.body.appendChild(s);
  });
}

// Ask each platform to scan the DOM and turn our blockquotes into real embeds.
function hydrate() {
  if (window.instgrm?.Embeds) window.instgrm.Embeds.process();
  if (window.twttr?.widgets) window.twttr.widgets.load();
}

export default function PortfolioFeed() {
  const live = SOCIALS.filter(s => s.href);
  const has = FEED.length > 0;

  // Load only the scripts for the platforms actually present, then hydrate.
  useEffect(() => {
    if (!has) return;
    const kinds = [...new Set(FEED.map(p => p.type))];
    Promise.all(kinds.map(k => loadScript(SCRIPTS[k]))).then(() => {
      hydrate();
      // A second pass catches embeds whose script finished after first scan.
      const t = setTimeout(hydrate, 1200);
      return () => clearTimeout(t);
    });
  }, [has]);

  return (
    <div>
      <Helmet>
        <title>Miss AL Simpson — Feed</title>
        <meta name="description" content="The studio feed of Miss AL Simpson — the latest from Instagram, TikTok and X." />
      </Helmet>

      {/* ── Masthead ── */}
      <section style={{ padding: '72px 0 40px' }}>
        <div style={{ ...caption, marginBottom: 18 }}>Live · Instagram · TikTok · X</div>
        <h1 style={{
          fontFamily: serif, fontWeight: 800, fontSize: 'clamp(52px,11vw,150px)',
          lineHeight: 0.9, letterSpacing: -2, textTransform: 'uppercase', margin: '0 0 28px',
        }}>
          Feed
        </h1>
        <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.7, color: c.faint, margin: '0 0 28px', maxWidth: 640 }}>
          The studio in motion — selected posts from across the platforms, pulled live from each account.
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
      </section>

      {/* ── The wall ── */}
      {has ? (
        <section style={{ borderTop: `1px solid ${c.line}`, padding: '40px 0', columnWidth: 340, columnGap: 'clamp(16px,2vw,30px)' }}>
          {FEED.map((post, i) => (
            <div key={post.url || i} style={{ breakInside: 'avoid', margin: '0 0 clamp(16px,2vw,30px)' }}>
              <Embed post={post} />
            </div>
          ))}
        </section>
      ) : (
        <EmptyState live={live} />
      )}
    </div>
  );
}

// One post → the platform's official blockquote, which the embed scripts hydrate
// into the real card.
function Embed({ post }) {
  if (post.type === 'instagram') {
    return (
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={post.url}
        data-instgrm-version="14"
        style={{ background: '#fff', border: `1px solid ${c.line}`, margin: 0, width: '100%' }}
      />
    );
  }
  if (post.type === 'tiktok') {
    const id = (post.url.match(/video\/(\d+)/) || [])[1];
    return (
      <blockquote className="tiktok-embed" cite={post.url} data-video-id={id} style={{ margin: 0, minWidth: 0, maxWidth: 340 }}>
        <section />
      </blockquote>
    );
  }
  if (post.type === 'x') {
    return (
      <blockquote className="twitter-tweet" data-dnt="true">
        <a href={post.url.replace('x.com', 'twitter.com')}> </a>
      </blockquote>
    );
  }
  return null;
}

// Shown while the feed is still being assembled — keeps the page composed.
function EmptyState({ live }) {
  return (
    <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(56px,10vh,120px) 0', textAlign: 'center' }}>
      <div style={{ ...caption, marginBottom: 16 }}>Feed in preparation</div>
      <p style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.7, color: c.faint, maxWidth: 520, margin: '0 auto 28px' }}>
        The wall is being assembled. In the meantime, the studio is most active here.
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
