/**
 * DronesZoneHero
 * Immersive room scene for each Drones mint zone.
 * Video is the focal point — framed appropriately per zone.
 * Mouse parallax adds depth across 3 layers.
 */
import { useState, useRef, useCallback } from 'react';

const PINATA = 'https://moccasin-legislative-falcon-246.mypinata.cloud/ipfs';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function resolveVideoSrc(collection, nfts = []) {
  if (collection?.video_url) return collection.video_url;
  const n = nfts.find(x => x.video_cid || x.video_path);
  if (!n) return null;
  if (n.video_cid) return `${PINATA}/${n.video_cid}`;
  if (n.video_path) return `${API}/uploads/${n.video_path}`;
  return null;
}

export default function DronesZoneHero({ zone, collection, nfts = [] }) {
  const ref = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const videoSrc = resolveVideoSrc(collection, nfts);

  const onMouseMove = useCallback(e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top)  / r.height - 0.5,
    });
  }, []);

  /* px(n): translate by n*mouse — higher n = nearer / faster */
  const px = (n, yScale = 0.45) => ({
    transform: `translate(${-mouse.x * n}px, ${-mouse.y * n * yScale}px)`,
    transition: 'transform 0.14s linear',
    willChange: 'transform',
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative w-full overflow-hidden bg-black select-none"
      style={{ height: 'clamp(440px, 68vh, 660px)' }}
    >
      {zone === 'diamond-shop' && <DiamondRoom  px={px} videoSrc={videoSrc} collection={collection} />}
      {zone === 'cinema'       && <CinemaRoom   px={px} videoSrc={videoSrc} collection={collection} />}
      {zone === 'gallery'      && <GalleryRoom  px={px} videoSrc={videoSrc} collection={collection} />}

      {/* Zone label — bottom left, always on top */}
      <div className="absolute bottom-5 left-6 z-30 pointer-events-none">
        <div className="font-mono text-[9px] uppercase tracking-[0.45em] text-white/30">
          {zone === 'diamond-shop' && '◆ Diamond Shop'}
          {zone === 'cinema'       && '▶ The Cinema'}
          {zone === 'gallery'      && '◻ Art Gallery'}
        </div>
        {collection?.name && (
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 mt-0.5"
            style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif', fontSize: '1.1rem' }}>
            {collection.name}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CINEMA ROOM
   Dark auditorium, huge screen, seat silhouettes
───────────────────────────────────────────── */
function CinemaRoom({ px, videoSrc, collection }) {
  return (
    <>
      {/* Far layer — back wall + screen surround */}
      <div className="absolute inset-0 z-0" style={px(3)}>
        {/* Dark auditorium walls */}
        <div className="absolute inset-0 bg-black" />
        {/* Ceiling */}
        <div className="absolute top-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)' }} />
        {/* Side walls converging to screen */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(to right, rgba(30,30,30,0.6) 0%, transparent 30%),
            linear-gradient(to left,  rgba(30,30,30,0.6) 0%, transparent 30%)
          `
        }} />
      </div>

      {/* Mid layer — screen + curtains */}
      <div className="absolute inset-0 z-10 flex items-center justify-center" style={px(6)}>
        {/* Curtains */}
        <div className="absolute left-0 top-0 bottom-16 w-[12%]"
          style={{ background: 'linear-gradient(to right, #0d0d0d 60%, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-16 w-[12%]"
          style={{ background: 'linear-gradient(to left, #0d0d0d 60%, transparent)' }} />

        {/* Projection beam from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '50%',
            height: '85%',
            background: 'conic-gradient(from 90deg at 50% 0%, transparent 38%, rgba(255,255,255,0.025) 45%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.025) 55%, transparent 62%)',
          }} />

        {/* Screen assembly */}
        <div className="relative" style={{ width: '70%', maxWidth: '720px' }}>
          {/* Marquee lights above screen */}
          <div className="flex items-center justify-between px-1 mb-1.5">
            <div className="font-mono text-[8px] tracking-[0.5em] text-white/25 uppercase">Now Showing</div>
            <div className="flex gap-1.5">
              {Array.from({length:8},(_,i)=>(
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30" />
              ))}
            </div>
          </div>

          {/* The Screen */}
          <div className="relative" style={{ aspectRatio: '16/9' }}>
            {/* Screen frame */}
            <div className="absolute -inset-[3px]"
              style={{ border: '1px solid rgba(255,255,255,0.18)', background: '#050505' }} />
            {/* Letterbox bars */}
            <div className="absolute top-0 left-0 right-0 h-[6%] bg-black z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-black z-10" />
            {/* Video or placeholder */}
            {videoSrc ? (
              <video src={videoSrc} autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <CinemaPlaceholder />
            )}
            {/* Screen glow onto "air" */}
            <div className="absolute -inset-8 z-[-1] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
          </div>

          {/* Screen caption */}
          <div className="text-center mt-2">
            <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/20">
              {collection?.name || 'Cinema Reels'} · Select Your Reel Below
            </div>
          </div>
        </div>
      </div>

      {/* Near layer — seat silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" style={px(18, 0.1)}>
        <svg viewBox="0 0 1200 120" className="w-full" preserveAspectRatio="xMidYMax meet">
          {/* Three rows of seats, bottom = closest */}
          {[
            { y: 120, count: 18, w: 50, h: 35, gap: 8, ry: 6 },
            { y: 80,  count: 14, w: 42, h: 28, gap: 6, ry: 5 },
            { y: 50,  count: 10, w: 34, h: 22, gap: 4, ry: 4 },
          ].map((row, ri) => {
            const total = row.count * (row.w + row.gap) - row.gap;
            const startX = (1200 - total) / 2;
            return Array.from({length: row.count}, (_, i) => (
              <rect
                key={`${ri}-${i}`}
                x={startX + i * (row.w + row.gap)}
                y={row.y - row.h}
                width={row.w}
                height={row.h}
                rx={row.ry}
                fill={ri === 0 ? '#141414' : ri === 1 ? '#0d0d0d' : '#090909'}
              />
            ));
          })}
        </svg>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)' }} />
    </>
  );
}

/* ─────────────────────────────────────────────
   DIAMOND SHOP ROOM
   Spotlight interior, display case focal point
───────────────────────────────────────────── */
function DiamondRoom({ px, videoSrc, collection }) {
  return (
    <>
      {/* Far layer — walls */}
      <div className="absolute inset-0 z-0" style={px(3)}>
        <div className="absolute inset-0 bg-[#050505]" />
        {/* Back wall panel */}
        <div className="absolute top-0 left-[15%] right-[15%] bottom-[20%]"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }} />
        {/* Ceiling cornice */}
        <div className="absolute top-0 left-0 right-0 h-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }} />
        {/* Skirting */}
        <div className="absolute bottom-[18%] left-0 right-0 h-px bg-white/8" />
      </div>

      {/* Mid layer — spotlights + display case */}
      <div className="absolute inset-0 z-10 flex items-center justify-center" style={px(8)}>
        {/* Spotlight beams from above */}
        {[-28, 0, 28].map((offset, i) => (
          <div key={i} className="absolute top-0 pointer-events-none"
            style={{
              left: `calc(50% + ${offset}%)`,
              transform: 'translateX(-50%)',
              width: '18%',
              height: '80%',
              background: 'conic-gradient(from 90deg at 50% 0%, transparent 35%, rgba(255,255,255,0.018) 45%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.018) 55%, transparent 65%)',
              opacity: i === 1 ? 1 : 0.5,
            }}
          />
        ))}

        {/* Display case */}
        <div className="relative" style={{ width: '52%', maxWidth: '560px' }}>
          {/* Case pedestal */}
          <div className="absolute bottom-0 left-4 right-4 h-4"
            style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.25)', transform: 'translateY(100%)' }} />

          {/* Case frame — ornate corners */}
          <div className="relative" style={{ aspectRatio: '4/3' }}>
            {/* Glass case border */}
            <div className="absolute inset-0 rounded-sm"
              style={{ border: '1px solid rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.6)' }} />
            {/* Corner diamonds */}
            {['top-1 left-1','top-1 right-1','bottom-1 left-1','bottom-1 right-1'].map(pos => (
              <div key={pos} className={`absolute ${pos} font-mono text-[10px] text-white/40`}>◆</div>
            ))}
            {/* Spotlight glow inside case */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 65%)' }} />
            {/* Video or placeholder */}
            {videoSrc ? (
              <video src={videoSrc} autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: '1px' }} />
            ) : (
              <DiamondPlaceholder />
            )}
            {/* Case reflective top gloss */}
            <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)' }} />
          </div>

          {/* Case label plaque */}
          <div className="text-center mt-6">
            <div className="inline-block border border-white/20 px-4 py-1">
              <div className="font-mono text-[8px] uppercase tracking-[0.5em] text-white/40">
                {collection?.name || 'Diamond Drones'} · Select Below
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Near layer — counter silhouette */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" style={px(20, 0.1)}>
        <div className="h-[18%] bg-[#0a0a0a]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
    </>
  );
}

/* ─────────────────────────────────────────────
   ART GALLERY ROOM
   White cube interior, video as installation
───────────────────────────────────────────── */
function GalleryRoom({ px, videoSrc, collection }) {
  return (
    <>
      {/* Far layer — gallery walls */}
      <div className="absolute inset-0 z-0" style={px(3)}>
        <div className="absolute inset-0 bg-[#060606]" />
        {/* Ceiling strip lights */}
        {[25,50,75].map(left => (
          <div key={left} className="absolute top-0"
            style={{
              left: `${left}%`, transform: 'translateX(-50%)',
              width: '2px', height: '100%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 30%, transparent 50%)'
            }} />
        ))}
        {/* Floor line */}
        <div className="absolute bottom-[16%] left-0 right-0 h-px"
          style={{ background: 'rgba(255,255,255,0.07)' }} />
        {/* Side wall frames (ghost) */}
        {[1,2].map(i => (
          <div key={i} className="absolute" style={{
            top: '15%', bottom: '25%',
            left: i===1 ? '3%' : undefined,
            right: i===2 ? '3%' : undefined,
            width: '10%',
            border: '1px solid rgba(255,255,255,0.06)',
          }} />
        ))}
      </div>

      {/* Mid layer — main installation */}
      <div className="absolute inset-0 z-10 flex items-center justify-center" style={px(7)}>
        <div className="relative" style={{ width: '60%', maxWidth: '640px' }}>
          {/* Gallery overhead light beam onto piece */}
          <div className="absolute -top-full left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
            style={{ background: 'conic-gradient(from 90deg at 50% 0%, transparent 35%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 55%, transparent 65%)' }} />

          {/* Museum frame */}
          <div className="relative" style={{ aspectRatio: '4/3' }}>
            {/* Outer mount */}
            <div className="absolute -inset-4" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)' }} />
            {/* Inner frame */}
            <div className="absolute -inset-1" style={{ border: '2px solid rgba(255,255,255,0.35)' }} />
            {/* Video or placeholder */}
            {videoSrc ? (
              <video src={videoSrc} autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <GalleryPlaceholder />
            )}
          </div>

          {/* Caption plaque */}
          <div className="mt-8 flex items-start gap-4">
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/60">
                {collection?.name || 'Gallery Stills'}
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/25 mt-0.5">
                Drones of Suburbia · FAL Generated · Blind Mint
              </div>
            </div>
            <div className="w-px h-8 bg-white/15 self-center" />
            <div className="font-mono text-[8px] text-white/20 text-right">
              1000<br />Editions
            </div>
          </div>
        </div>
      </div>

      {/* Near layer — polished floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" style={px(16, 0.08)}>
        <div className="h-[16%]"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.6) 100%)' }} />
    </>
  );
}

/* ── Zone-specific placeholder content (no video yet) ── */

function CinemaPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center gap-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/15">
        Reels Loading
      </div>
      <div className="flex gap-1.5">
        {Array.from({length:12},(_,i)=>(
          <div key={i} className="w-2 h-6 rounded-sm"
            style={{ background: `rgba(255,255,255,${0.04 + (i%3)*0.03})` }} />
        ))}
      </div>
    </div>
  );
}

function DiamondPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[#080808] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl text-white/20 mb-2">◆</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/15">
          Awaiting Drone
        </div>
      </div>
    </div>
  );
}

function GalleryPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[#060606] grid grid-cols-3 grid-rows-3 gap-1 p-2">
      {Array.from({length:9},(_,i)=>(
        <div key={i} className="rounded-sm"
          style={{ background: `rgba(255,255,255,${0.03 + (i%3)*0.02})` }} />
      ))}
    </div>
  );
}
