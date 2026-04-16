import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { getMintData } from '../utils/api';

// Placeholder transmissions — these would come from a backend CMS/API later
const TRANSMISSIONS = [
  {
    id: 1,
    date: '2026-03-24',
    time: '06:47',
    location: 'Rannoch Moor',
    title: 'First Light is ready.',
    body: 'Twenty-five paintings. Each one started in the dark, finished at dawn. The AI saw Scotland through my eyes. I drew the weather back into every frame. The collection drops on the 28th. This is the test signal.',
    type: 'dispatch',
  },
  {
    id: 2,
    date: '2026-03-21',
    time: '14:22',
    location: 'Glen Affric',
    title: 'Training the model on pine forests.',
    body: 'Fed sixty paintings of Caledonian pines into the model today. The AI keeps wanting to straighten the trees. Scottish pines don\'t grow straight. They grow sideways, into the wind. Had to retrain three times before it understood that beauty isn\'t symmetry.',
    type: 'studio-note',
  },
  {
    id: 3,
    date: '2026-03-18',
    time: '05:15',
    location: 'Glencoe',
    title: 'Haar.',
    body: 'Woke up to haar rolling down the glen. Visibility ten metres. The kind of weather that makes you paint from memory because you can\'t see what\'s in front of you. Fed the morning into the model. It produced something I\'ve never seen before. Keeping it for the collection.',
    type: 'field-note',
  },
  {
    id: 4,
    date: '2026-03-14',
    time: '19:30',
    location: 'Isle of Skye',
    title: 'Why I draw into the AI.',
    body: 'People ask why I don\'t just let the AI finish the work. Because the AI doesn\'t know what it feels like to stand on the Quiraing in January with frozen hands. It can approximate the light. It can\'t approximate the experience. The hand drawing is the difference between illustration and art.',
    type: 'dispatch',
  },
  {
    id: 5,
    date: '2026-03-10',
    time: '08:00',
    location: 'Cairngorms',
    title: 'Snow squall on the plateau.',
    body: 'The plateau went white in ninety seconds. Horizontal snow. The kind that finds every gap in your jacket. Captured it on camera. The AI turned it into something calmer than it was. I drew the violence back in.',
    type: 'field-note',
  },
];

const TYPE_LABELS = {
  'dispatch': { label: 'Dispatch', color: 'rgba(0,232,150,0.5)' },
  'studio-note': { label: 'Studio Note', color: 'rgba(150,200,255,0.5)' },
  'field-note': { label: 'Field Note', color: 'rgba(255,200,100,0.5)' },
};

export default function RuthvenSignal() {
  const [expandedId, setExpandedId] = useState(null);
  const { data } = useQuery({
    queryKey: ['mint', 'ruthven', 'first-light'],
    queryFn: () => getMintData('ruthven', 'first-light'),
  });
  const nfts = data?.nfts || [];
  // Use a different painting (index 4 or fallback)
  const bgNft = nfts[4] || nfts[1] || nfts[0];
  const bgSrc = bgNft?.image_cid
    ? `https://gateway.pinata.cloud/ipfs/${bgNft.image_cid}`
    : bgNft?.image_path
      ? `http://localhost:5001/uploads/${bgNft.image_path}`
      : null;

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#001A10' }}>
      <Helmet>
        <title>Signal — Ruthven</title>
        <meta name="description" content="Transmissions from Ruthven — dispatches, studio notes, and field reports from the Scottish Highlands." />
        <meta property="og:title" content="Signal — Ruthven" />
        <meta property="og:description" content="Transmissions from Ruthven" />
      </Helmet>
      {/* Background painting */}
      {bgSrc && (
        <div className="fixed inset-0 z-0">
          <img src={bgSrc} alt="" className="w-full h-full object-cover"
            style={{ opacity: 0.2, filter: 'saturate(0.4) brightness(0.8) contrast(1.1)' }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,26,16,0.6) 0%, rgba(0,26,16,0.75) 50%, rgba(0,26,16,0.95) 100%)',
          }} />
        </div>
      )}

      {/* Signal effects — scan lines, static, transmission wave */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* CRT scan lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,232,150,0.1) 2px, rgba(0,232,150,0.1) 3px)',
          }} />
        {/* Moving scan bar */}
        <div className="absolute left-0 right-0 h-20 opacity-[0.04]"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,232,150,0.15), transparent)',
            animation: 'signal-scan 8s linear infinite',
          }} />
        {/* Static noise flicker */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ animation: 'signal-static 0.15s steps(3) infinite' }} />
        {/* Transmission wave — sine wave across the page */}
        <svg className="absolute top-[12%] left-0 w-full h-16 opacity-[0.06]" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0,30 Q50,10 100,30 Q150,50 200,30 Q250,10 300,30 Q350,50 400,30 Q450,10 500,30 Q550,50 600,30 Q650,10 700,30 Q750,50 800,30 Q850,10 900,30 Q950,50 1000,30 Q1050,10 1100,30 Q1150,50 1200,30"
            fill="none" stroke="#00E896" strokeWidth="1"
            style={{ animation: 'signal-wave 4s linear infinite' }} />
        </svg>
        {/* Signal strength bars */}
        <div className="absolute top-6 right-6 flex items-end gap-1 opacity-[0.08]">
          {[8, 12, 18, 24, 16, 10].map((h, i) => (
            <div key={i} className="w-1 rounded-sm"
              style={{
                height: h,
                backgroundColor: '#00E896',
                animation: `signal-bar ${1 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
              }} />
          ))}
        </div>
        {/* Frequency text */}
        <div className="absolute top-6 left-6 font-mono text-[10px] opacity-[0.06]" style={{ color: '#00E896' }}>
          <div style={{ animation: 'signal-flicker 3s steps(2) infinite' }}>FREQ: 57.7°N</div>
          <div style={{ animation: 'signal-flicker 4s steps(2) infinite 1s' }}>BAND: HIGHLAND</div>
        </div>
      </div>

      <style>{`
        @keyframes signal-scan {
          0% { top: -80px; }
          100% { top: 100vh; }
        }
        @keyframes signal-static {
          0% { background-position: 0 0; }
          33% { background-position: -10px 5px; }
          66% { background-position: 5px -10px; }
          100% { background-position: 0 0; }
        }
        @keyframes signal-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200px); }
        }
        @keyframes signal-bar {
          0%, 100% { transform: scaleY(1); opacity: 0.08; }
          50% { transform: scaleY(1.8); opacity: 0.2; }
        }
        @keyframes signal-flicker {
          0%, 90%, 100% { opacity: 0.06; }
          92% { opacity: 0; }
          95% { opacity: 0.1; }
        }
      `}</style>

      {/* Header */}
      <section className="relative z-10 pt-20 pb-8 px-6 text-center">
        <img src="/RUTHVEN LOGO.png" alt="Ruthven" className="h-12 mx-auto mb-6 object-contain opacity-60" />
        <div className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(0,232,150,0.3)' }}>
          The Signal
        </div>
        <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.85)' }}>
          Transmissions from the North
        </h1>
        <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Dispatches, studio notes, and field reports from the Highlands.
        </p>
      </section>

      {/* Signal line */}
      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <div className="absolute left-[calc(1.5rem+12px)] top-0 bottom-0 w-px" style={{ backgroundColor: 'rgba(0,232,150,0.06)' }} />

        {TRANSMISSIONS.map((tx, i) => {
          const isExpanded = expandedId === tx.id;
          const typeInfo = TYPE_LABELS[tx.type] || TYPE_LABELS.dispatch;
          return (
            <div key={tx.id} className="relative pl-10 pb-10">
              {/* Timeline dot */}
              <div
                className="absolute left-6 top-2 w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: isExpanded ? '#00E896' : 'rgba(0,232,150,0.2)',
                  boxShadow: isExpanded ? '0 0 10px rgba(0,232,150,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />

              {/* Card */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                className="w-full text-left rounded-lg p-5 transition-all duration-500"
                style={{
                  backgroundColor: isExpanded ? 'rgba(0,40,26,0.35)' : 'rgba(0,40,26,0.15)',
                  border: `1px solid ${isExpanded ? 'rgba(0,232,150,0.15)' : 'rgba(0,232,150,0.04)'}`,
                }}
              >
                {/* Meta */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {tx.date} / {tx.time}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    {tx.location}
                  </span>
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: typeInfo.color,
                      backgroundColor: typeInfo.color.replace('0.5', '0.06'),
                    }}
                  >
                    {typeInfo.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {tx.title}
                </h3>

                {/* Body + painting */}
                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: isExpanded ? '600px' : '0',
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  {/* Show matching painting from collection */}
                  {(() => {
                    const matchingNft = nfts.find(nft => {
                      const loc = nft.traits?.find(t => t.trait_type === 'Location');
                      return loc && loc.value.toLowerCase().includes(tx.location.toLowerCase().split(' ')[0]);
                    }) || nfts[i % nfts.length];
                    if (!matchingNft) return null;
                    const imgSrc = matchingNft.image_cid
                      ? `https://gateway.pinata.cloud/ipfs/${matchingNft.image_cid}`
                      : matchingNft.image_path
                        ? `http://localhost:5001/uploads/${matchingNft.image_path}`
                        : null;
                    if (!imgSrc) return null;
                    return (
                      <div className="mt-4 mb-3 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,232,150,0.1)' }}>
                        <img src={imgSrc} alt={matchingNft.name}
                          className="w-full object-cover"
                          style={{ aspectRatio: '16/9', filter: 'brightness(0.85) saturate(0.9)' }} />
                        <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(0,40,26,0.6)' }}>
                          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {matchingNft.name}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'rgba(0,232,150,0.3)' }}>
                            FIELD CAPTURE
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-sm leading-relaxed pt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {tx.body}
                  </p>
                </div>

                {/* Expand indicator */}
                {!isExpanded && (
                  <div className="text-[10px] font-mono mt-2" style={{ color: 'rgba(0,232,150,0.25)' }}>
                    Read transmission →
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* End signal */}
      <div className="relative z-10 text-center py-16">
        <div className="text-xs font-mono" style={{ color: 'rgba(0,232,150,0.1)', letterSpacing: '0.3em' }}>
          END OF SIGNAL // MORE TO COME
        </div>
      </div>
    </div>
  );
}
