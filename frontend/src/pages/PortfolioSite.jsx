import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortfolioProvider } from './portfolio/PortfolioContext';
import { c, serif, mono, SOCIALS } from './portfolio/portfolioStyle';

const NAV = [
  { to: '/portfolio', label: 'Home', end: true },
  // { to: '/portfolio/drop', label: 'Drop' }, // hidden for launch — re-enable when the Graffiti Stilettos drop is ready
  { to: '/portfolio/worlds', label: 'Worlds' },
  { to: '/portfolio/cinema', label: 'AI Cinema' },
  { to: '/portfolio/works', label: 'Works' },
  { to: '/portfolio/originals', label: 'Originals' },
  { to: '/portfolio/projects', label: 'Projects' },
  { to: '/portfolio/exhibitions', label: 'Exhibitions' },
  { to: '/portfolio/feed', label: 'Feed' },
  { to: '/portfolio/about', label: 'About' },
];

// The artist site — a quiet museum catalogue.
export default function PortfolioSite() {
  const { pathname } = useLocation();

  // Home, the AI Cinema room and the Worlds page are dark, cinematic, full-bleed
  // (films/covers behind white lettering); every other view stays on quiet paper.
  const isCinema = pathname === '/portfolio/cinema';
  const isWorlds = pathname === '/portfolio/worlds';
  const isHome = pathname === '/portfolio';
  const isShop = pathname === '/portfolio/shop';
  const isDrift = pathname === '/portfolio/drift';
  const isDrop = pathname === '/portfolio/drop';
  const isDark = isHome || isShop || isCinema || isWorlds || isDrift || isDrop;
  // Home is the flat editorial landing (constrained + footer); the immersive
  // shop corridor and the other 3D routes stay full-bleed.
  const fullBleed = isShop || isCinema || isWorlds || isDrift || isDrop;
  const pageBg = isDark ? '#05060a' : c.paper;
  const headerBg = isDark ? 'rgba(5,6,10,0.72)' : 'rgba(255,255,255,0.92)';
  const headerInk = isDark ? '#ffffff' : c.ink;
  const headerFaint = isDark ? 'rgba(255,255,255,0.6)' : c.faint;
  const headerLine = isDark ? 'rgba(255,255,255,0.16)' : c.line;

  return (
    <PortfolioProvider>
      <Helmet>
        {/* Brand default (Home/Originals/Projects use this; other pages override). */}
        <title>Miss AL Simpson — Artist</title>
        <meta name="description" content="Miss AL Simpson is an award-winning Scottish cryptoartist working at the threshold of collage, ink and machine intelligence. Exhibited and sold at Sotheby’s, New York, and Bonhams, London." />
        <link rel="canonical" href={`https://missalsimpson.com${pathname}`} />
        {/* Open Graph / Twitter — shared defaults for the artist site. */}
        <meta property="og:site_name" content="Miss AL Simpson" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Miss AL Simpson — Scottish Cryptoartist" />
        <meta property="og:description" content="Award-winning Scottish cryptoartist. Collage, ink and machine intelligence. Exhibited at Sotheby’s, New York, and Bonhams, London." />
        <meta property="og:url" content={`https://missalsimpson.com${pathname}`} />
        <meta property="og:image" content="https://missalsimpson.com/about-portrait.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Miss AL Simpson — Scottish Cryptoartist" />
        <meta name="twitter:description" content="Award-winning Scottish cryptoartist. Collage, ink and machine intelligence." />
        <meta name="twitter:image" content="https://missalsimpson.com/about-portrait.jpg" />
        <style>{`html,body{margin:0;background:${pageBg};}`}</style>
      </Helmet>

      <div style={{ minHeight: '100vh', background: pageBg, color: headerInk, fontFamily: serif }}>
        {/* ── Header ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50, background: headerBg,
          backdropFilter: 'blur(8px)', borderBottom: `1px solid ${headerLine}`,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '18px clamp(20px,5vw,56px)', gap: 24, flexWrap: 'wrap',
        }}>
          <NavLink to="/portfolio" end style={{ textDecoration: 'none', color: headerInk, display: 'flex', alignItems: 'center' }}>
            {/* The logo art is white; invert it to black on the light (paper) pages. */}
            <img src="/LOGO MISS.png" alt="Miss AL Simpson" style={{ height: 72, width: 'auto', display: 'block', filter: isDark ? 'none' : 'invert(1)' }} />
          </NavLink>

          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                style={({ isActive }) => ({
                  fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                  textDecoration: 'none', paddingBottom: 3,
                  color: isActive ? headerInk : headerFaint,
                  borderBottom: isActive ? `1px solid ${headerInk}` : '1px solid transparent',
                })}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {/* ── Body ── */}
        {fullBleed ? (
          <main><Outlet /></main>
        ) : (
          <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,56px) 120px' }}>
            <Outlet />
          </main>
        )}

        {/* ── Corporate footer ── */}
        {!fullBleed && <Footer />}
      </div>
    </PortfolioProvider>
  );
}

// Corporate footer — the legal / IP base of the site. All works, marks and IP
// are held by Miss AL Simpson Limited. Always black with white writing.
function Footer() {
  const ink = '#ffffff';
  const faint = 'rgba(255,255,255,0.62)';
  const line = 'rgba(255,255,255,0.18)';
  const bg = '#000000';
  const live = SOCIALS.filter(s => s.href);
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: `1px solid ${line}`, background: bg, padding: 'clamp(48px,7vh,80px) clamp(20px,5vw,56px) 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(32px,5vh,52px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 440 }}>
            <img src="/LOGO MISS.png" alt="Miss AL Simpson" style={{ height: 64, width: 'auto', display: 'block' }} />
            <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.7, color: faint, marginTop: 14 }}>
              Miss AL Simpson Ltd is the holding company for the artist’s catalogue, intellectual
              property and brands.
            </p>
          </div>
          <nav style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 44px', alignContent: 'start' }}>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} style={{
                fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                textDecoration: 'none', color: faint,
              }}>{n.label}</NavLink>
            ))}
          </nav>
        </div>

        {live.length > 0 && (
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            {live.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                textDecoration: 'none', color: ink,
              }}>{s.label}</a>
            ))}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, color: faint, lineHeight: 1.9, maxWidth: 880 }}>
            © {year} Miss AL Simpson Limited. All rights reserved. All artworks, trademarks and
            intellectual property are owned and held by Miss AL Simpson Limited.
            Diamond Drones™ · The Drones of Suburbia™.
          </span>
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, color: faint }}>Registered in Scotland · No. SC867832</span>
        </div>
      </div>
    </footer>
  );
}
