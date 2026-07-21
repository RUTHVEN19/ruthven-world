import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProject, thumb } from '../../config/portfolioData';
import { serif, mono } from './portfolioStyle';

// Worlds — the three built universes that grew out of the practice. A dark,
// full-bleed, cinematic page: each world is a full-viewport panel with its own
// front door (external site or in-site reel) and a strip of sample works.
//
// Each entry references a real Project slug (single source of truth for count /
// cover / samples), and adds a tagline + the world's front door.
const WORLDS = [
  {
    slug: 'drones-of-suburbia',
    tagline: 'AI Cinema',
    note: 'Exhibited & sold · Sotheby’s, New York',
    door: { label: 'Watch the reel', to: '/portfolio/cinema' },
    poster: '/films/02-les-drones-de-la-banlieue.mp4',
  },
  {
    slug: 'diamond-drones',
    tagline: 'The flagship collection',
    note: '1,000 cut digital diamonds',
    door: { label: 'Enter diamonddrones.world', href: 'https://diamonddrones.world' },
    poster: '/films/dd-diamond-drone-lounge-bg.mp4',
  },
  {
    slug: 'porcelain-android',
    tagline: 'Fragile machine femininity',
    note: 'Glaze, circuitry & graffiti',
    door: { label: 'Enter porcelainandroid.com', href: 'https://porcelainandroid.com' },
    poster: '/androids/film/the-manga-machine.mp4',
  },
];

const cap = { fontFamily: mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' };

export default function PortfolioWorlds() {
  const worlds = WORLDS.map(w => ({ ...w, project: getProject(w.slug) })).filter(w => w.project);

  return (
    <div style={{ background: '#05060a', color: '#fff' }}>
      <Helmet>
        <title>Miss AL Simpson — Worlds</title>
        <meta name="description" content="The built worlds of Miss AL Simpson — The Drones of Suburbia, Diamond Drones and Porcelain Android." />
        <style>{`html,body{margin:0;background:#05060a;}`}</style>
      </Helmet>

      {/* ── Intro ── */}
      <section style={{ padding: 'clamp(48px,8vh,96px) clamp(20px,5vw,56px) 24px', maxWidth: 1100 }}>
        <div style={{ ...cap, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Not collections — universes</div>
        <h1 style={{
          fontFamily: serif, fontWeight: 400, fontSize: 'clamp(64px,16vw,220px)',
          lineHeight: 0.96, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 26px',
        }}>
          Worlds
        </h1>
        <p style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
          Some bodies of work outgrew the frame and became places you can enter. Three of them —
          a cinematic universe, a flagship collection of cut diamonds, and a world of porcelain machines.
        </p>
      </section>

      {/* ── Each world, full-viewport ── */}
      {worlds.map((w, i) => (
        <WorldPanel key={w.slug} world={w} index={i} />
      ))}
    </div>
  );
}

function WorldPanel({ world, index }) {
  const { project: p, tagline, note, door, poster } = world;
  const cover = thumb(p.cover, 1400);
  const samples = (p.sample || []).slice(0, 5);

  return (
    <section style={{
      position: 'relative', minHeight: 'min(86vh, 760px)', display: 'flex', alignItems: 'flex-end',
      borderTop: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
      width: '100vw', marginLeft: 'calc(50% - 50vw)',
    }}>
      {/* Cover — film for Drones, image otherwise */}
      <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
        {poster ? (
          <video src={poster} autoPlay loop muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.62 }} />
        ) : cover ? (
          <img src={cover} alt={p.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.58 }} />
        ) : null}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,6,10,0.95) 6%, rgba(5,6,10,0.25) 60%, rgba(5,6,10,0.55))' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(28px,5vw,64px)', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ ...cap, color: 'rgba(255,255,255,0.7)' }}>
          {String(index + 1).padStart(2, '0')} · {tagline}
        </div>
        <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(40px,8vw,92px)', lineHeight: 1, margin: '10px 0 14px' }}>
          {p.name}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(15px,1.6vw,19px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: '0 0 8px', maxWidth: 620 }}>
          {p.blurb}
        </p>
        <div style={{ ...cap, color: 'rgba(255,255,255,0.55)', fontSize: 10, marginBottom: 26 }}>
          {note}{p.count ? ` · ${p.count.toLocaleString()} works` : ''}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {door.href ? (
            <a href={door.href} target="_blank" rel="noopener noreferrer" style={ctaSolid}>{door.label} ↗</a>
          ) : (
            <Link to={door.to} style={ctaSolid}>{door.label} →</Link>
          )}
          <Link to={`/portfolio/projects/${p.slug}`} style={ctaGhost}>View the works →</Link>
        </div>

        {/* Sample strip */}
        {samples.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 30, flexWrap: 'wrap' }}>
            {samples.map(s => (
              <div key={s.id} style={{ width: 84, height: 84, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flex: '0 0 auto' }}>
                {s.image && <img src={thumb(s.thumbnail || s.image, 180)} alt={s.title} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const ctaSolid = {
  fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
  color: '#05060a', background: '#fff', padding: '13px 22px', textDecoration: 'none',
  borderRadius: 999,
};
const ctaGhost = {
  fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
  color: '#fff', border: '1px solid rgba(255,255,255,0.5)', padding: '12px 22px',
  textDecoration: 'none', borderRadius: 999,
};
