import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CommissionGallery3D = lazy(() => import('./CommissionGallery3D'));

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const IMPACT = 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';

function PasswordGate({ onAuth, roomId }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/api/commissions/${roomId}/auth`, { password });
      onAuth(data.room, password);
    } catch {
      setError('Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <h1 className="text-white text-5xl tracking-[0.25em] uppercase mb-8"
            style={{ fontFamily: IMPACT }}>
          Miss AL Simpson
        </h1>
        <div className="w-20 h-px bg-neutral-600 mx-auto mb-8" />
        <p className="text-neutral-400 text-2xl uppercase tracking-[0.3em] mb-2"
           style={{ fontFamily: IMPACT }}>
          Private Viewing Room
        </p>
        <p className="text-neutral-600 text-xs mb-8">Enter password to access</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent border-b border-neutral-700 text-white px-2 py-3
                       focus:outline-none focus:border-white text-center tracking-[0.2em] text-sm
                       transition-colors placeholder:text-neutral-700"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full border border-neutral-700 text-white py-3 text-xs uppercase tracking-[0.3em]
                       hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-20"
          >
            {loading ? 'Entering...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Lightbox({ artwork, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.5, 5));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.002, 1), 5));
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPan((p) => ({
      x: p.x + (e.clientX - lastPos.current.x),
      y: p.y + (e.clientY - lastPos.current.y),
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setDragging(false);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
          className="w-10 h-10 rounded-full border border-neutral-700 text-white flex items-center justify-center
                     hover:bg-white hover:text-black transition-all text-lg">+</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
          className="w-10 h-10 rounded-full border border-neutral-700 text-white flex items-center justify-center
                     hover:bg-white hover:text-black transition-all text-lg">-</button>
        {zoom > 1 && (
          <button onClick={resetView}
            className="px-3 h-10 rounded-full border border-neutral-700 text-white flex items-center justify-center
                       hover:bg-white hover:text-black transition-all text-xs uppercase tracking-wider">Reset</button>
        )}
        <a href={`${API}/uploads/${artwork.filename}`} download
          className="h-10 px-4 rounded-full border border-neutral-700 text-white flex items-center justify-center
                     hover:bg-white hover:text-black transition-all text-[10px] uppercase tracking-[0.2em]">
          Download
        </a>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full border border-neutral-700 text-white flex items-center justify-center
                     hover:bg-white hover:text-black transition-all text-xl">&times;</button>
      </div>

      {/* Zoom level */}
      {zoom > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-neutral-500 text-xs tracking-widest z-10">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Image */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        {artwork.media_type === 'video' ? (
          <video
            src={`${API}/uploads/${artwork.filename}`}
            controls autoPlay
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />
        ) : (
          <img
            src={`${API}/uploads/${artwork.filename}`}
            alt={artwork.title}
            className="max-h-[85vh] object-contain transition-transform duration-150"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            }}
            draggable={false}
            onClick={(e) => { e.stopPropagation(); if (zoom === 1) setZoom(2); }}
          />
        )}
      </div>

      {/* Title bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-6 px-8 z-10">
        <p className="text-white text-lg font-light tracking-wide">{artwork.title}</p>
      </div>
    </div>
  );
}

function FeedbackPanel({ artwork, roomId, password, collectorName }) {
  const [comments, setComments] = useState(artwork.comments || []);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await axios.post(
        `${API}/api/commissions/${roomId}/artworks/${artwork.id}/comments`,
        { text: text.trim(), password, author: collectorName }
      );
      setComments((prev) => [...prev, data]);
      setText('');
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const quickReactions = ['Love this', 'Needs more detail', 'Perfect as is', 'Let\'s discuss'];

  return (
    <div className="border-t border-neutral-800/50 pt-5 mt-5">
      {/* Quick reactions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickReactions.map((r) => (
          <button
            key={r}
            onClick={() => setText(r)}
            className="px-3 py-1.5 text-[11px] uppercase tracking-wider border border-neutral-800
                       text-neutral-500 hover:text-white hover:border-neutral-500 transition-all rounded-full"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Thread */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4 scrollbar-thin">
        {comments.length === 0 && (
          <p className="text-neutral-700 text-xs italic">No feedback yet — be the first</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className={`flex gap-3 ${c.author === 'Artist' ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${
              c.author === 'Artist'
                ? 'bg-white text-black'
                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            }`}>
              {c.author === 'Artist' ? 'A' : c.author.charAt(0)}
            </div>
            <div className={`max-w-[80%] ${c.author === 'Artist' ? '' : 'text-right'}`}>
              <p className="text-neutral-300 text-sm leading-relaxed">{c.text}</p>
              <p className="text-neutral-700 text-[10px] mt-1">
                {new Date(c.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={postComment} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts..."
          className="flex-1 bg-transparent border-b border-neutral-800 text-white px-1 py-2
                     text-sm focus:outline-none focus:border-neutral-500 transition-colors
                     placeholder:text-neutral-700"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white
                     transition-colors disabled:opacity-20 px-3"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function ArtworkCard({ artwork, roomId, password, collectorName, index }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="group">
        {/* Number */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-neutral-700 text-[10px] tracking-[0.3em] uppercase">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex-1 h-px bg-neutral-900" />
          {artwork.uploaded_by !== 'Artist' && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-sky-600">
              {artwork.uploaded_by}
            </span>
          )}
        </div>

        {/* Image — clickable */}
        <div
          className="relative cursor-pointer overflow-hidden bg-neutral-950 border border-neutral-900
                     hover:border-neutral-700 transition-all duration-500"
          onClick={() => setLightboxOpen(true)}
        >
          {artwork.media_type === 'video' ? (
            <video
              src={`${API}/uploads/${artwork.filename}`}
              className="w-full object-contain"
              muted
            />
          ) : (
            <img
              src={`${API}/uploads/${artwork.filename}`}
              alt={artwork.title}
              className="w-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
            />
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500
                          flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500
                            text-white text-xs uppercase tracking-[0.3em] border border-white/50 px-4 py-2">
              {artwork.media_type === 'video' ? 'Play' : 'View'}
            </span>
          </div>
        </div>

        {/* Title + download + feedback */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-light tracking-wide">{artwork.title}</h3>
            <a
              href={`${API}/uploads/${artwork.filename}`}
              download
              className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 hover:text-white
                         border border-neutral-800 hover:border-neutral-500 px-3 py-1.5
                         transition-all flex-shrink-0 ml-4"
            >
              Download
            </a>
          </div>
          {artwork.description && (
            <p className="text-neutral-600 text-sm mt-1">{artwork.description}</p>
          )}
          <FeedbackPanel
            artwork={artwork}
            roomId={roomId}
            password={password}
            collectorName={collectorName}
          />
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox artwork={artwork} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}

function UploadWidget({ roomId, password, collectorName, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const upload = async (file, artTitle) => {
    if (!file || !artTitle.trim()) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('title', artTitle.trim());
    form.append('password', password);
    try {
      await axios.post(`${API}/api/commissions/${roomId}/artworks/collector`, form);
      setTitle('');
      setPendingFile(null);
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = pendingFile || fileRef.current?.files[0];
    if (file) upload(file, title);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setPendingFile(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Artwork title"
        className="w-full bg-transparent border-b border-neutral-700 text-white px-2 py-3
                   focus:outline-none focus:border-white text-center tracking-[0.2em] text-sm
                   transition-colors placeholder:text-neutral-700"
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border border-dashed rounded-none p-8 text-center transition-all duration-300
          ${dragOver ? 'border-white bg-white/5' : 'border-neutral-800 hover:border-neutral-600'}`}
      >
        <p className="text-neutral-600 text-xs uppercase tracking-[0.3em] mb-4">
          {uploading ? 'Uploading...' : pendingFile ? `Selected: ${pendingFile.name}` : 'Drop file here or'}
        </p>
        <input
          ref={fileRef} type="file" accept="image/*,video/*"
          className="hidden" id="collector-upload"
          onChange={(e) => { if (e.target.files[0]) setPendingFile(e.target.files[0]); }}
        />
        <label htmlFor="collector-upload"
          className="inline-block border border-neutral-700 text-neutral-400 px-6 py-2 text-xs
                     uppercase tracking-[0.2em] cursor-pointer hover:bg-white hover:text-black transition-all">
          Choose File
        </label>
      </div>
      {pendingFile && (
        <button
          type="submit"
          disabled={uploading || !title.trim()}
          className="w-full border border-neutral-700 text-white py-3 text-xs uppercase tracking-[0.3em]
                     hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-20"
        >
          {uploading ? 'Uploading...' : 'Upload Artwork'}
        </button>
      )}
    </form>
  );
}

export default function CommissionRoom() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [password, setPassword] = useState('');
  const [view3D, setView3D] = useState(false);
  const [lightboxArt, setLightboxArt] = useState(null);

  const handleAuth = (roomData, pwd) => {
    setRoom(roomData);
    setPassword(pwd);
  };

  const refresh = async () => {
    try {
      const { data } = await axios.post(`${API}/api/commissions/${roomId}/auth`, { password });
      setRoom(data.room);
    } catch {
      // silent
    }
  };

  if (!room) {
    return <PasswordGate roomId={roomId} onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 3D Gallery overlay */}
      {view3D && room.artworks?.length > 0 && (
        <Suspense fallback={
          <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
            <p className="text-neutral-600 text-xs uppercase tracking-[0.3em] animate-pulse">
              Loading Gallery...
            </p>
          </div>
        }>
          <CommissionGallery3D
            artworks={room.artworks}
            onSelectArtwork={(art) => { setLightboxArt(art); }}
            onExit={() => setView3D(false)}
          />
        </Suspense>
      )}

      {/* Lightbox from 3D gallery */}
      {lightboxArt && (
        <Lightbox artwork={lightboxArt} onClose={() => setLightboxArt(null)} />
      )}

      {/* Header */}
      <header className="px-6 pt-12 pb-10 text-center">
        <h2 className="text-white text-4xl tracking-[0.2em] uppercase mb-6"
            style={{ fontFamily: IMPACT }}>
          Miss AL Simpson
        </h2>
        <div className="w-12 h-px bg-neutral-700 mx-auto mb-6" />
        <p className="text-neutral-600 text-[10px] uppercase tracking-[0.4em] mb-2">Private Commission</p>
        <h1 className="text-2xl font-extralight tracking-wide">{room.title}</h1>
        <p className="text-neutral-500 text-sm mt-2 font-light">
          for <span className="text-amber-400">{room.collector_name}</span>
        </p>
        {room.description && (
          <p className="text-neutral-600 text-sm mt-3 max-w-xl mx-auto font-light leading-relaxed">
            {room.description}
          </p>
        )}

        {/* View toggle */}
        {room.artworks?.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setView3D(false)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all ${
                !view3D
                  ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                  : 'border-neutral-800 text-neutral-600 hover:text-white hover:border-neutral-600'
              }`}
            >
              Gallery View
            </button>
            <button
              onClick={() => setView3D(true)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all ${
                view3D
                  ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                  : 'border-neutral-800 text-neutral-600 hover:text-white hover:border-neutral-600'
              }`}
            >
              3D Gallery
            </button>
          </div>
        )}
      </header>

      <div className="w-full h-px bg-neutral-900" />

      {/* Gallery */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-20">
          {room.artworks?.map((artwork, i) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              roomId={roomId}
              password={password}
              collectorName={room.collector_name}
              index={i}
            />
          ))}
        </div>

        {/* Upload section */}
        <div className="mt-24 max-w-lg mx-auto">
          <p className="text-neutral-700 text-[10px] uppercase tracking-[0.3em] text-center mb-6">
            Upload your work
          </p>
          <UploadWidget
            roomId={roomId}
            password={password}
            collectorName={room.collector_name}
            onUploaded={refresh}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center">
        <div className="w-8 h-px bg-neutral-900 mx-auto mb-6" />
        <p className="text-neutral-700 text-sm tracking-[0.15em] uppercase"
           style={{ fontFamily: IMPACT }}>
          Miss AL Simpson
        </p>
        <p className="text-neutral-800 text-[9px] tracking-[0.3em] uppercase mt-2">
          Private Commission Room
        </p>
      </footer>
    </div>
  );
}
