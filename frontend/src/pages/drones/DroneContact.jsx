import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const font = {
  display: "'Oswald', 'Anton', sans-serif",
  body:    "'Crimson Pro', Georgia, serif",
  mono:    "'JetBrains Mono', 'Space Mono', monospace",
};

const C = {
  bg:        '#0a0a0c',
  line:      '#2a2a30',
  text:      '#e8e8ec',
  textDim:   '#8a8a92',
  textFaint: '#4a4a52',
  ice:       '#d9e6f0',
  iceBright: '#e9f1f8',
};

export default function DroneContact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    window.location.href = `mailto:info@thedronesofsuburbia.com?subject=${encodeURIComponent(subject || 'Collector Enquiry')}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact | Diamond Drones Are a Girl's Best Friend</title>
        <meta name="description" content="Private enquiries for Diamond Drones. Contact Miss AL Simpson." />
        <meta property="og:title" content="Contact | Diamond Drones™" />
        <meta property="og:description" content="Private enquiries for Diamond Drones. Contact Miss AL Simpson." />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta property="og:url" content="https://diamonddrones.world/contact" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Diamond Drones™",
          "url": "https://diamonddrones.world/contact",
          "description": "Private enquiries for Diamond Drones. Contact Miss AL Simpson.",
          "mainEntity": {
            "@type": "Person",
            "name": "Miss AL Simpson",
            "email": "info@thedronesofsuburbia.com",
            "jobTitle": "Contemporary Artist",
            "address": { "@type": "PostalAddress", "addressLocality": "Edinburgh", "addressCountry": "GB" }
          }
        })}</script>
      </Helmet>

      <style>{`
        @keyframes ddContactShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ddContactFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ddContactLine {
          from { width: 0; }
          to   { width: 80px; }
        }
        .dd-contact-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(217,230,240,0.12);
          color: #e8e8ec;
          padding: 16px 20px;
          font-family: ${font.body};
          font-size: 1rem;
          font-style: italic;
          line-height: 1.6;
          transition: all 0.4s ease;
          outline: none;
          box-sizing: border-box;
        }
        .dd-contact-input::placeholder {
          color: rgba(138,138,146,0.6);
          font-style: italic;
        }
        .dd-contact-input:focus {
          border-color: rgba(217,230,240,0.35);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 30px rgba(217,230,240,0.04);
        }
        .dd-contact-submit {
          font-family: ${font.display};
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 18px 48px;
          border: 1px solid rgba(217,230,240,0.3);
          background: rgba(217,230,240,0.04);
          color: #d9e6f0;
          cursor: pointer;
          transition: all 0.4s ease;
        }
        .dd-contact-submit:hover {
          border-color: rgba(217,230,240,0.6);
          background: rgba(217,230,240,0.1);
          box-shadow: 0 0 30px rgba(217,230,240,0.08);
        }
        @media (max-width: 700px) {
          .dd-contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        background: C.bg, color: C.text,
        fontFamily: font.body, fontStyle: 'italic',
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        lineHeight: 1.6,
      }}>

        {/* Background film */}
        <video
          autoPlay muted loop playsInline preload="none"
          style={{
            position: 'fixed', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.08, pointerEvents: 'none', zIndex: 0,
          }}
        >
          <source src="/films/dd-jewellery-box.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(10,10,12,0.3) 0%, rgba(10,10,12,0.97) 70%)',
        }} />

        {/* Hero */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          padding: 'clamp(120px, 16vw, 200px) clamp(24px, 6vw, 80px) clamp(40px, 5vw, 60px)',
        }}>
          <div style={{
            fontFamily: font.mono, fontSize: '0.6rem', letterSpacing: '0.5em',
            textTransform: 'uppercase', color: C.textFaint, fontStyle: 'normal',
            marginBottom: '2rem',
            animation: 'ddContactFadeUp 0.8s ease-out both',
          }}>
            Private Enquiries
          </div>

          <h1 style={{
            fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            margin: '0 0 2rem',
            background: 'linear-gradient(105deg, #8a9aaa 0%, #d9e6f0 20%, #ffffff 30%, #d9e6f0 40%, #8a9aaa 50%, #d9e6f0 60%, #ffffff 70%, #d9e6f0 80%, #8a9aaa 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'ddContactShimmer 6s linear infinite, ddContactFadeUp 1s ease-out both',
          }}>
            CONTACT
          </h1>

          {/* Animated line */}
          <div style={{
            width: '80px', height: '1px', margin: '0 auto 2rem',
            background: 'linear-gradient(90deg, transparent, rgba(217,230,240,0.4), transparent)',
            animation: 'ddContactLine 1.5s ease-out both',
          }} />

          <p style={{
            fontFamily: font.body, fontStyle: 'italic',
            fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
            color: C.textDim,
            maxWidth: '520px', margin: '0 auto',
            lineHeight: 1.9,
            animation: 'ddContactFadeUp 1.2s ease-out both',
          }}>
            For enquiries regarding Diamond Drones.
          </p>
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          padding: '0 clamp(24px, 6vw, 80px) clamp(80px, 10vw, 140px)',
          position: 'relative', zIndex: 1,
        }}>

          <div className="dd-contact-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 'clamp(40px, 6vw, 80px)',
            animation: 'ddContactFadeUp 1.4s ease-out both',
          }}>

            {/* Left — Info */}
            <div>
              <div style={{
                fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                fontSize: '1.1rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: C.iceBright,
                marginBottom: '24px',
              }}>
                Miss AL Simpson
              </div>

              <div style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: '1rem', color: C.textDim,
                lineHeight: 2, marginBottom: '16px',
              }}>
                Edinburgh, Scotland.
              </div>

              <div style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: '1rem', color: C.textDim,
                lineHeight: 2, marginBottom: '16px',
              }}>
                Contemporary artist working with ink, AI, and cinema.
              </div>

              <div style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: '1rem', color: C.textDim,
                lineHeight: 2, marginBottom: '16px',
              }}>
                Recent exhibition: Sotheby's New York, Contemporary Discoveries, 2025.
              </div>

              <div style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: '1rem', color: C.textDim,
                lineHeight: 2, marginBottom: '32px',
              }}>
                Enquiries are answered personally.
              </div>

              <div style={{
                width: '40px', height: '1px', marginBottom: '32px',
                background: 'rgba(217,230,240,0.15)',
              }} />

              <div style={{
                fontFamily: font.mono, fontStyle: 'normal',
                fontSize: '0.6rem', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.textFaint,
                marginBottom: '12px',
              }}>
                Direct Email
              </div>
              <a
                href="mailto:info@thedronesofsuburbia.com"
                style={{
                  fontFamily: font.mono, fontStyle: 'normal',
                  fontSize: '0.8rem', letterSpacing: '0.08em',
                  color: C.ice,
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(217,230,240,0.2)',
                  paddingBottom: '2px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,230,240,0.5)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(217,230,240,0.2)'; e.currentTarget.style.color = C.ice; }}
              >
                info@thedronesofsuburbia.com
              </a>
            </div>

            {/* Right — Form */}
            <div>
              {sent ? (
                <div style={{
                  border: `1px solid ${C.line}`,
                  background: 'rgba(255,255,255,0.015)',
                  padding: 'clamp(40px, 5vw, 60px)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                    fontSize: '1.3rem', letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: C.iceBright,
                    marginBottom: '16px',
                  }}>
                    Thank You
                  </div>
                  <div style={{
                    fontFamily: font.body, fontStyle: 'italic',
                    fontSize: '1rem', color: C.textDim, lineHeight: 1.8,
                  }}>
                    Your email client should have opened with the message pre-filled.
                    We look forward to hearing from you.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{
                  border: `1px solid ${C.line}`,
                  background: 'rgba(255,255,255,0.015)',
                  padding: 'clamp(28px, 4vw, 48px)',
                  position: 'relative',
                }}>
                  {/* Top accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(217,230,240,0.15), transparent)',
                  }} />

                  <div style={{
                    fontFamily: font.mono, fontStyle: 'normal',
                    fontSize: '0.55rem', letterSpacing: '0.35em',
                    textTransform: 'uppercase', color: C.textFaint,
                    marginBottom: '28px',
                  }}>
                    Enquiry Form
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                      className="dd-contact-input"
                      type="text"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={handleChange('name')}
                    />
                    <input
                      className="dd-contact-input"
                      type="email"
                      placeholder="Your email"
                      required
                      value={formData.email}
                      onChange={handleChange('email')}
                    />
                    <input
                      className="dd-contact-input"
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange('subject')}
                    />
                    <textarea
                      className="dd-contact-input"
                      placeholder="Your message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange('message')}
                      style={{ resize: 'vertical', minHeight: '140px' }}
                    />
                  </div>

                  <div style={{ marginTop: '28px', textAlign: 'right' }}>
                    <button type="submit" className="dd-contact-submit">
                      Send Enquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer line */}
          <div style={{
            marginTop: 'clamp(60px, 8vw, 100px)',
            paddingBottom: '40px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: font.mono, fontStyle: 'normal',
              fontSize: '0.55rem', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: C.textFaint,
            }}>
              Diamond Drones{'\u2122'} {'\u00B7'} Miss AL Simpson {'\u00B7'} All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
