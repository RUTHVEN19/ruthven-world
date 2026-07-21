import { useParams, Link } from 'react-router-dom';
import { getProject, resolveImg } from '../../config/portfolioData';
import { usePortfolio } from './PortfolioContext';
import { c, serif, mono, caption } from './portfolioStyle';

export default function PortfolioProject() {
  const { slug } = useParams();
  const { openWork } = usePortfolio();
  const p = getProject(slug);

  if (!p) {
    return (
      <div style={{ padding: '120px 0', fontFamily: serif }}>
        <p>Project not found. <Link to="/portfolio/projects" style={{ color: c.ink }}>Back to projects</Link></p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 56 }}>
      <Link to="/portfolio/projects" style={{ ...caption, color: c.faint, textDecoration: 'none' }}>← Projects</Link>

      <header style={{ margin: '28px 0 48px', maxWidth: 760 }}>
        <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(34px,5.5vw,58px)', margin: '0 0 16px', lineHeight: 1.05 }}>
          {p.name}
        </h1>
        <div style={{ ...caption, marginBottom: 24 }}>{p.medium} · {p.year} · {p.count.toLocaleString()} works</div>
        <p style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.7, color: c.faint, margin: 0 }}>{p.blurb}</p>

        {p.world && (
          <a href={p.world} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: 28, fontFamily: mono, fontSize: 11,
              letterSpacing: 2, textTransform: 'uppercase', color: c.paper, background: c.ink,
              padding: '12px 22px', textDecoration: 'none',
            }}>
            Enter the world →
          </a>
        )}
      </header>

      {p.sample.length > 0 && (
        <div style={{
          display: 'grid', gap: 'clamp(14px,2vw,24px)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        }}>
          {p.sample.map(w => (
            <figure key={w.id} style={{ margin: 0, cursor: 'pointer' }} onClick={() => openWork(w)}>
              <div style={{ aspectRatio: '1/1', background: '#f4f4f4', overflow: 'hidden' }}>
                {w.image && <img src={resolveImg(w.image)} alt={w.title} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <figcaption style={{ ...caption, marginTop: 8, color: c.ink, textTransform: 'none', letterSpacing: 0.3, fontSize: 11 }}>
                {w.title}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
