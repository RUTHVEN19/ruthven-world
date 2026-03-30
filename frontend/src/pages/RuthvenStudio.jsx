import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMintData } from '../utils/api';

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Train the Eye',
    description: 'Ruthven feeds his own oil paintings and sketches of the Scottish Highlands into an AI model. The machine learns not to replicate, but to see the way he sees — the weight of cloud, the colour of peat water, the angle of winter light.',
    detail: 'The training dataset is exclusively Ruthven\'s own work. No stock images. No other artists. The AI becomes an extension of his visual memory.',
  },
  {
    num: '02',
    title: 'Generate',
    description: 'New works are generated from the trained model — landscapes that never existed but feel remembered. The AI produces something between a photograph and a dream of Scotland.',
    detail: 'Each generation is guided by location, weather, and time of day. The AI doesn\'t paint randomly — it paints from Glencoe at dawn, or Rannoch Moor in haar.',
  },
  {
    num: '03',
    title: 'The Hand',
    description: 'Ruthven draws into every generation by hand. This is the critical step — where human gesture meets machine vision. Paint strokes, charcoal marks, ink washes layered over the digital.',
    detail: 'No two interventions are the same. The hand responds to what the machine produced. Sometimes it fights the image. Sometimes it agrees. The tension is the art.',
  },
  {
    num: '04',
    title: 'Animate',
    description: 'The finished paintings are brought to life through Kling AI animation. Mist rolls. Water moves. Light breathes. The weather that inspired the painting now lives inside it.',
    detail: 'Each animation is hand-directed — Ruthven controls the movement, the timing, the mood. The loops are designed to feel like staring out of a bothy window.',
  },
  {
    num: '05',
    title: 'Mint',
    description: 'The final work is minted on Ethereum. The collector owns the painting, the animation, and the metadata forever. The artwork is theirs. The intellectual property remains with Ruthven.',
    detail: 'On-chain legal terms are embedded in the smart contract. Ownership is real, permanent, and verifiable.',
  },
];

export default function RuthvenStudio() {
  const [activeStep, setActiveStep] = useState(0);
  const { data } = useQuery({
    queryKey: ['mint', 'ruthven', 'first-light'],
    queryFn: () => getMintData('ruthven', 'first-light'),
  });
  const nfts = data?.nfts || [];
  // Pick a different painting than Gateway (use index 2 or fallback)
  const bgNft = nfts[2] || nfts[0];
  const bgSrc = bgNft?.image_cid
    ? `https://gateway.pinata.cloud/ipfs/${bgNft.image_cid}`
    : bgNft?.image_path
      ? `http://localhost:5001/uploads/${bgNft.image_path}`
      : null;

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#001A10' }}>
      {/* Background painting */}
      {bgSrc && (
        <div className="fixed inset-0 z-0">
          <img src={bgSrc} alt="" className="w-full h-full object-cover"
            style={{ opacity: 0.25, filter: 'saturate(0.6) brightness(0.9)' }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(0,26,16,0.7) 0%, rgba(0,26,16,0.5) 50%, rgba(0,26,16,0.85) 100%)',
          }} />
        </div>
      )}

      {/* Studio effects — paint splatters & brush strokes */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Floating paint drip */}
        <div className="absolute top-0 left-[15%] w-1 h-full opacity-[0.03]"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, #00E896 30%, transparent 60%)', animation: 'paint-drip 12s ease-in-out infinite' }} />
        <div className="absolute top-0 left-[72%] w-px h-full opacity-[0.02]"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, #ffffff 40%, transparent 70%)', animation: 'paint-drip 18s ease-in-out infinite 3s' }} />
        {/* Brush stroke overlay */}
        <div className="absolute top-[20%] -left-[10%] w-[120%] h-32 opacity-[0.015] rotate-[-3deg]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,232,150,0.5) 20%, rgba(0,232,150,0.3) 50%, transparent 80%)', animation: 'brush-sweep 20s ease-in-out infinite' }} />
        <div className="absolute top-[60%] -left-[5%] w-[110%] h-24 opacity-[0.01] rotate-[2deg]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 60%, transparent 90%)', animation: 'brush-sweep 25s ease-in-out infinite 5s' }} />
        {/* Paint splatter dots */}
        {[
          { x: '10%', y: '15%', s: 3, d: 0 }, { x: '85%', y: '25%', s: 2, d: 2 },
          { x: '30%', y: '70%', s: 4, d: 4 }, { x: '65%', y: '45%', s: 2.5, d: 1 },
          { x: '90%', y: '80%', s: 3.5, d: 3 }, { x: '20%', y: '90%', s: 2, d: 5 },
        ].map((dot, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: dot.x, top: dot.y,
              width: dot.s, height: dot.s,
              backgroundColor: i % 2 === 0 ? 'rgba(0,232,150,0.15)' : 'rgba(255,255,255,0.08)',
              animation: `splatter-pulse ${6 + i}s ease-in-out infinite ${dot.d}s`,
            }} />
        ))}
      </div>

      <style>{`
        @keyframes paint-drip {
          0%, 100% { transform: translateY(-5%); opacity: 0.03; }
          50% { transform: translateY(5%); opacity: 0.06; }
        }
        @keyframes brush-sweep {
          0%, 100% { transform: translateX(-5%) rotate(-3deg); opacity: 0.015; }
          50% { transform: translateX(5%) rotate(-1deg); opacity: 0.03; }
        }
        @keyframes splatter-pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(2.5); opacity: 0.25; }
        }
      `}</style>

      {/* Header */}
      <section className="relative z-10 pt-20 pb-12 px-6 text-center">
        <img src="/RUTHVEN LOGO.png" alt="Ruthven" className="h-12 mx-auto mb-6 object-contain opacity-60" />
        <div className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(0,232,150,0.3)' }}>
          The Studio
        </div>
        <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.85)' }}>
          How the Work is Made
        </h1>
        <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          A five-step process where AI learns from the artist, not the other way around.
        </p>
      </section>

      {/* Process Steps */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          {/* Step selector */}
          <div className="flex md:flex-col gap-2">
            {PROCESS_STEPS.map((step, i) => (
              <button
                key={step.num}
                onClick={() => setActiveStep(i)}
                className="text-left px-4 py-3 rounded-lg transition-all duration-500"
                style={{
                  backgroundColor: activeStep === i ? 'rgba(0,232,150,0.08)' : 'transparent',
                  border: `1px solid ${activeStep === i ? 'rgba(0,232,150,0.2)' : 'rgba(255,255,255,0.03)'}`,
                }}
              >
                <div className="text-xs font-mono" style={{ color: activeStep === i ? '#00E896' : 'rgba(0,232,150,0.25)' }}>
                  {step.num}
                </div>
                <div className="text-sm mt-0.5" style={{ color: activeStep === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>
                  {step.title}
                </div>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'rgba(0,40,26,0.25)',
              border: '1px solid rgba(0,232,150,0.08)',
            }}
          >
            {/* Painting for this step */}
            {(() => {
              const stepNft = nfts[activeStep % nfts.length];
              if (!stepNft) return null;
              const imgSrc = stepNft.image_cid
                ? `https://gateway.pinata.cloud/ipfs/${stepNft.image_cid}`
                : stepNft.image_path
                  ? `http://localhost:5001/uploads/${stepNft.image_path}`
                  : null;
              if (!imgSrc) return null;
              // Different filter per step to show the "process"
              const stepFilters = [
                'grayscale(0.8) brightness(0.7) contrast(1.2)',  // 01: raw training data feel
                'saturate(1.3) brightness(0.9) hue-rotate(10deg)', // 02: AI generation - vivid
                'saturate(0.6) brightness(0.85) contrast(1.1)',  // 03: hand-drawn, muted
                'brightness(1.05) saturate(1.1)',                 // 04: animated, bright
                'brightness(1) saturate(1)',                      // 05: final minted piece
              ];
              const stepLabels = [
                'TRAINING DATA', 'AI OUTPUT', 'HAND-DRAWN LAYER', 'ANIMATION FRAME', 'FINAL PIECE'
              ];
              return (
                <div className="relative">
                  <img src={imgSrc} alt={stepNft.name}
                    className="w-full object-cover transition-all duration-700"
                    style={{ aspectRatio: '16/9', filter: stepFilters[activeStep] || 'none' }} />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2"
                    style={{ background: 'linear-gradient(to top, rgba(0,26,16,0.9), transparent)' }}>
                    <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {stepNft.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ color: 'rgba(0,232,150,0.6)', backgroundColor: 'rgba(0,232,150,0.06)' }}>
                      {stepLabels[activeStep]}
                    </span>
                  </div>
                </div>
              );
            })()}
            <div className="p-8">
              <div className="text-xs font-mono mb-2" style={{ color: 'rgba(0,232,150,0.4)' }}>
                Step {PROCESS_STEPS[activeStep].num}
              </div>
              <h2 className="text-2xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(255,255,255,0.85)' }}>
                {PROCESS_STEPS[activeStep].title}
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {PROCESS_STEPS[activeStep].description}
              </p>
              <div className="rounded p-4" style={{ backgroundColor: 'rgba(0,232,150,0.03)', border: '1px solid rgba(0,232,150,0.06)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {PROCESS_STEPS[activeStep].detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: 'rgba(0,232,150,0.15)' }} />
        <blockquote
          className="text-xl md:text-2xl leading-relaxed"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          "The AI has learned to see Scotland the way I see it.
          But it can never feel the cold, or hear the wind.
          That's what the hand is for."
        </blockquote>
        <div className="mt-4 text-xs uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(0,232,150,0.25)' }}>
          — Ruthven
        </div>
        <div className="w-8 h-px mx-auto mt-8" style={{ backgroundColor: 'rgba(0,232,150,0.15)' }} />
      </section>
    </div>
  );
}
