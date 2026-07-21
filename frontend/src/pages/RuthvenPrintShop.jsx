import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { RUTHVEN_PRINTS as PRINTS } from '../config/ruthvenPrints';

const API = import.meta.env.VITE_API_URL || 'https://diamond-drones.onrender.com/api';

const PRICE_DISPLAY = '\u00A3600';

const SPECS = [
  ['Paper', 'Hahnem\u00FChle Photo Rag Metallic 300gsm'],
  ['Size', 'A2 (420 \u00D7 594 mm)'],
  ['Finish', 'Metallic lustre with deep blacks'],
  ['Signed', 'Hand-signed by Ruthven'],
  ['Edition', 'Limited Edition of 50'],
  ['Shipping', 'Worldwide \u00B7 Insured \u00B7 21 days'],
];

const MINT = '#00E896';
const GREEN_BG = '#002A1A';
const MONO = "'Space Mono', monospace";
const SERIF = 'Georgia, serif';

/* ── Single print card ── */
function PrintCard({ print, onBuy }) {
  const [imgOk, setImgOk] = useState(true);
  const imgSrc = `/ruthven/prints/${print.num}.jpg`;

  return (
    <div
      className="group relative rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'rgba(0,20,12,0.6)',
        border: '1px solid rgba(0,232,150,0.08)',
      }}
    >
      {/* Image / placeholder */}
      <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: '#001209' }}>
        {imgOk ? (
          <img
            src={imgSrc}
            alt={print.title}
            onError={() => setImgOk(false)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6"
            style={{ background: 'radial-gradient(circle at 50% 35%, rgba(0,232,150,0.05), transparent 70%)' }}>
            <div className="text-5xl mb-3" style={{ fontFamily: SERIF, color: 'rgba(0,232,150,0.25)' }}>
              {String(print.num).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.25)' }}>
              Painting coming soon
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-5">
        <h3 className="text-lg mb-1" style={{ fontFamily: SERIF, color: '#fff' }}>{print.title}</h3>
        <div className="text-[11px] uppercase tracking-[0.2em] mb-4" style={{ fontFamily: MONO, color: 'rgba(0,232,150,0.5)' }}>
          A2 Print · Edition of 50
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl" style={{ fontFamily: SERIF, color: '#fff' }}>{PRICE_DISPLAY}</span>
          <button
            onClick={() => onBuy(print)}
            className="px-4 py-2 text-[11px] uppercase tracking-[0.2em] rounded transition-all duration-300"
            style={{
              fontFamily: MONO,
              color: GREEN_BG,
              backgroundColor: MINT,
            }}
          >
            Buy Print
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Email capture / checkout modal ── */
function CheckoutModal({ print, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/ruthven-print/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, print_id: print.id, print_title: print.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,10,6,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg p-8"
        style={{ backgroundColor: GREEN_BG, border: '1px solid rgba(0,232,150,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ fontFamily: MONO, color: 'rgba(0,232,150,0.5)' }}>
          Order
        </div>
        <h3 className="text-2xl mb-1" style={{ fontFamily: SERIF, color: '#fff' }}>{print.title}</h3>
        <div className="text-sm mb-6" style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.4)' }}>
          {PRICE_DISPLAY} · A2 · Edition of 50
        </div>

        <label className="block text-[11px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.5)' }}>
          Email for order updates
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded mb-4 outline-none"
          style={{
            fontFamily: MONO,
            backgroundColor: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,232,150,0.15)',
            color: '#fff',
          }}
        />

        {error && (
          <div className="text-xs mb-4" style={{ fontFamily: MONO, color: '#ff6b6b' }}>{error}</div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded text-sm uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50"
          style={{ fontFamily: MONO, color: GREEN_BG, backgroundColor: MINT }}
        >
          {loading ? 'Redirecting…' : 'Continue to payment'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 mt-2 text-[11px] uppercase tracking-[0.2em]"
          style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.3)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function RuthvenPrintShop() {
  const [selected, setSelected] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    if (success || cancelled) {
      const t = setTimeout(() => setSearchParams({}), 6000);
      return () => clearTimeout(t);
    }
  }, [success, cancelled, setSearchParams]);

  return (
    <div style={{ backgroundColor: GREEN_BG, minHeight: '100vh' }}>
      <Helmet>
        <title>Prints — Ruthven</title>
        <meta name="description" content="Signed limited-edition Ruthven prints. A2 Hahnemühle Photo Rag Metallic, edition of 50." />
        <meta property="og:title" content="Ruthven Prints" />
        <meta property="og:description" content="Signed limited-edition Highland prints. A2 Hahnemühle Photo Rag Metallic, edition of 50." />
      </Helmet>

      {/* Status banners */}
      {success && (
        <div className="px-6 py-3 text-center text-sm" style={{ fontFamily: MONO, backgroundColor: 'rgba(0,232,150,0.12)', color: MINT }}>
          Order received — check your email for confirmation. Thank you.
        </div>
      )}
      {cancelled && (
        <div className="px-6 py-3 text-center text-sm" style={{ fontFamily: MONO, backgroundColor: 'rgba(255,107,107,0.12)', color: '#ff6b6b' }}>
          Checkout cancelled — no payment was taken.
        </div>
      )}

      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="text-[11px] uppercase tracking-[0.4em] mb-4" style={{ fontFamily: MONO, color: 'rgba(0,232,150,0.5)' }}>
          The Print Archive
        </div>
        <h1 className="text-5xl md:text-6xl mb-6" style={{ fontFamily: SERIF, color: '#fff' }}>
          Ruthven Prints
        </h1>
        <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ fontFamily: SERIF, color: 'rgba(255,255,255,0.5)' }}>
          Signed, limited-edition Highland works by Ruthven — oil, algorithm, and Scottish light,
          rendered on archival Hahnemühle Photo Rag Metallic.
        </p>
      </header>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRINTS.map(p => (
            <PrintCard key={p.id} print={p} onBuy={setSelected} />
          ))}
        </div>
      </section>

      {/* Specs */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="rounded-lg p-8" style={{ backgroundColor: 'rgba(0,20,12,0.5)', border: '1px solid rgba(0,232,150,0.08)' }}>
          <div className="text-[11px] uppercase tracking-[0.3em] mb-6" style={{ fontFamily: MONO, color: 'rgba(0,232,150,0.5)' }}>
            Specifications
          </div>
          <div className="space-y-3">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex justify-between items-baseline gap-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[11px] uppercase tracking-[0.2em] shrink-0" style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                <span className="text-sm text-right" style={{ fontFamily: SERIF, color: 'rgba(255,255,255,0.8)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selected && <CheckoutModal print={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
