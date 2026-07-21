import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { projects, thumb } from '../../config/portfolioData';
import { c, serif, mono, caption } from './portfolioStyle';

// Projects — her bodies of work / generative worlds, largest first. A dynamic
// card grid with covers + hover, and a callout to the three built Worlds.
export default function PortfolioProjects() {
  return (
    <div style={{ paddingTop: 72 }}>
      <Helmet>
        <title>Projects &amp; Worlds — Miss AL Simpson</title>
        <meta name="description" content={`The ${projects.length} bodies of work by Miss AL Simpson — generative collections and built worlds, each with its own logic, scale and front door.`} />
      </Helmet>
      <header style={{ maxWidth: 720, marginBottom: 36 }}>
        <div style={{ ...caption, marginBottom: 18 }}>Bodies of work · {projects.length} projects</div>
        <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(32px,4.8vw,48px)', margin: '0 0 20px' }}>
          Projects &amp; Worlds
        </h1>
        <p style={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.7, color: c.faint, margin: 0 }}>
          Beyond the singular works, larger bodies — generative collections and built worlds,
          each with its own logic, scale and, where it exists, its own front door.
        </p>
      </header>

      {/* ── Callout: the three built worlds ── */}
      <Link to="/portfolio/worlds" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        textDecoration: 'none', color: c.paper, background: c.ink, padding: 'clamp(22px,3vw,34px)',
        marginBottom: 48,
      }}>
        <div>
          <div style={{ ...caption, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Step inside</div>
          <div style={{ fontFamily: serif, fontSize: 'clamp(20px,2.6vw,30px)' }}>
            The Worlds — Drones of Suburbia, Diamond Drones &amp; Porcelain Android
          </div>
        </div>
        <span style={{ ...caption, color: c.paper, whiteSpace: 'nowrap' }}>Enter the Worlds →</span>
      </Link>

      {/* ── All projects, as cards ── */}
      <div style={{
        display: 'grid', gap: 'clamp(16px,2.4vw,32px)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      }}>
        {projects.map(p => <ProjectCard key={p.slug} p={p} />)}
      </div>
    </div>
  );
}

function ProjectCard({ p }) {
  const [hover, setHover] = useState(false);
  const cover = thumb(p.cover, 600);
  return (
    <Link
      to={`/portfolio/projects/${p.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ textDecoration: 'none', color: c.ink, display: 'block' }}
    >
      <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#f4f4f4', overflow: 'hidden' }}>
        {cover ? (
          <img src={cover} alt={p.name} loading="lazy" style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transition: 'transform .5s ease', transform: hover ? 'scale(1.05)' : 'scale(1)',
          }} />
        ) : (
          // No cover resolves for projects whose tokens live off the fetched
          // chain (e.g. Interface on Base) — show the name on ink, not a void.
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: c.ink, padding: '0 24px',
          }}>
            <span style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(22px,3vw,30px)', color: c.paper, textAlign: 'center', lineHeight: 1.15 }}>
              {p.name}
            </span>
          </div>
        )}
        {/* count badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontFamily: mono, fontSize: 10, letterSpacing: 1, padding: '5px 9px', borderRadius: 999,
        }}>
          {p.count.toLocaleString()} works
        </div>
        {/* world badge */}
        {p.world && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', color: c.ink,
            fontFamily: mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
            padding: '5px 9px',
          }}>
            ◍ World
          </div>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 21, margin: '0 0 5px' }}>{p.name}</h2>
        <div style={{ ...caption, marginBottom: 10 }}>{p.medium} · {p.year}</div>
        <p style={{
          fontFamily: serif, fontSize: 14, lineHeight: 1.55, color: c.faint, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {p.blurb}
        </p>
      </div>
    </Link>
  );
}
