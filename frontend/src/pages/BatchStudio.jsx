import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBrands } from '../utils/api';

const API = 'http://localhost:5001/api';

const MODELS = [
  { value: 'fal-ai/flux-pro', label: 'Flux Pro' },
  { value: 'fal-ai/flux/dev', label: 'Flux Dev' },
  { value: 'fal-ai/flux-lora', label: 'Flux LoRA' },
  { value: 'fal-ai/stable-diffusion-v3-medium', label: 'SD3 Medium' },
];

const SIZES = [
  { value: '1024x1024', label: '1024 × 1024 (Square)', w: 1024, h: 1024 },
  { value: '1280x720', label: '1280 × 720 (Landscape 16:9)', w: 1280, h: 720 },
  { value: '768x1024', label: '768 × 1024 (Portrait)', w: 768, h: 1024 },
  { value: '1024x768', label: '1024 × 768 (Landscape 4:3)', w: 1024, h: 768 },
];

function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Lightbox({ image, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownload = async () => {
    const url = `http://localhost:5001${image.image_url}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = image.image_path?.split('/').pop() || 'image.png';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
        <img
          src={`http://localhost:5001${image.image_url}`}
          alt={image.prompt}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
        <div className="mt-3 text-sm text-gray-300 text-center">{image.prompt}</div>
        <div className="mt-2 flex justify-center">
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
          >↓ Download</button>
        </div>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-lg leading-none"
        >×</button>
      </div>
    </div>
  );
}

function ImageCard({ image, selected, onToggle, upscaling, onView }) {
  const isUpscaled = image.image_path?.includes('upscaled_');
  return (
    <div
      className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-900 border-2 transition-all duration-150"
      style={{ borderColor: selected ? '#22c55e' : 'transparent' }}
      onClick={onToggle}
    >
      <div className="aspect-square">
        <img
          src={`http://localhost:5001${image.image_url}`}
          alt={image.prompt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      {/* View full size button */}
      <button
        onClick={e => { e.stopPropagation(); onView(); }}
        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
        title="View full size"
      >⤢</button>

      {/* Checkbox */}
      <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
        ${selected ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-black/50 opacity-0 group-hover:opacity-100'}`}>
        {selected && <span className="text-white text-[10px]">✓</span>}
      </div>

      {/* Upscaling spinner */}
      {upscaling && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-[10px] text-gray-300 truncate">{image.prompt}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-gray-500 font-mono">#{image.prompt_index + 1} var{image.variation}</span>
          {isUpscaled && (
            <span className="text-[9px] bg-purple-600/80 text-purple-200 px-1 rounded">↑ upscaled</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BatchStudio() {
  const [promptText, setPromptText] = useState('');
  const [variations, setVariations] = useState(2);
  const [modelId, setModelId] = useState('fal-ai/flux-pro');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [sizeKey, setSizeKey] = useState('1024x1024');
  const [collectionId, setCollectionId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [numSteps, setNumSteps] = useState(28);
  const [loraUrl, setLoraUrl] = useState('');
  const [loraScale, setLoraScale] = useState(1.0);

  const [batchTarget, setBatchTarget] = useState(null); // null = use prompts × variations
  const [chunkSize, setChunkSize] = useState(10);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [recentBatches, setRecentBatches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  // Load recent batches list
  useEffect(() => {
    fetch(`${API}/generate/recent-batches`)
      .then(r => r.json())
      .then(d => setRecentBatches(d.batches || []))
      .catch(() => {});
  }, []);
  const [upscalingSet, setUpscalingSet] = useState(new Set());
  const [upscaleScale, setUpscaleScale] = useState(2);
  const [showUpscaleMenu, setShowUpscaleMenu] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errors, setErrors] = useState([]);

  const upscaleMenuRef = useRef(null);

  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getBrands });

  // Flatten collections for dropdown
  const [allCollections, setAllCollections] = useState([]);
  useEffect(() => {
    if (brands.length === 0) return;
    Promise.all(
      brands.map(b =>
        fetch(`${API}/brands/${b.id}/collections`)
          .then(r => r.json())
          .then(cols => cols.map(c => ({ ...c, brandName: b.name })))
          .catch(() => [])
      )
    ).then(results => {
      setAllCollections(results.flat());
    });
  }, [brands]);

  const size = SIZES.find(s => s.value === sizeKey) || SIZES[0];

  const prompts = promptText.split('\n').map(p => p.trim()).filter(Boolean);
  const numPrompts = Math.max(prompts.length, 1);

  // If a batch target is set, auto-calculate variations needed; otherwise use manual setting
  const computedVariations = batchTarget ? Math.ceil(batchTarget / numPrompts) : variations;
  const totalImages = batchTarget || (prompts.length * variations);

  // Estimated time: ~20s per image, 4 parallel workers per chunk
  const estSeconds = Math.ceil(totalImages / 4) * 20;
  const estLabel = estSeconds < 60
    ? `~${estSeconds}s`
    : estSeconds < 3600
      ? `~${Math.round(estSeconds / 60)}m`
      : `~${(estSeconds / 3600).toFixed(1)}h`;

  // Target presets → sensible chunk sizes
  const TARGET_PRESETS = [
    { label: 'Auto', value: null, chunk: 10 },
    { label: '100', value: 100, chunk: 10 },
    { label: '300', value: 300, chunk: 15 },
    { label: '500', value: 500, chunk: 20 },
    { label: '1k', value: 1000, chunk: 25 },
    { label: '5k', value: 5000, chunk: 50 },
    { label: '10k', value: 10000, chunk: 50 },
  ];

  const handleGenerate = useCallback(async () => {
    if (prompts.length === 0) return;
    setGenerating(true);
    setImages([]);
    setSelected(new Set());
    setErrors([]);
    setProgress({ done: 0, total: totalImages });
    setStatusMsg(`Generating ${totalImages} images in chunks of ${chunkSize}...`);

    const basePayload = {
      variations_per_prompt: computedVariations,
      model_id: modelId,
      width: size.w,
      height: size.h,
      guidance_scale: guidanceScale,
      num_inference_steps: numSteps,
    };
    if (loraUrl.trim()) {
      basePayload.loras = [{ path: loraUrl.trim(), scale: parseFloat(loraScale) }];
    }

    // Split prompts into chunks of chunkSize
    const chunks = [];
    for (let i = 0; i < prompts.length; i += chunkSize) {
      chunks.push(prompts.slice(i, i + chunkSize));
    }

    let totalDone = 0;
    let totalFailed = 0;
    const allErrors = [];

    try {
      for (let ci = 0; ci < chunks.length; ci++) {
        const chunk = chunks[ci];
        setStatusMsg(`Chunk ${ci + 1} of ${chunks.length} — generating ${chunk.length * variations} images...`);

        const res = await fetch(`${API}/generate/fal-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, prompts: chunk }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generation failed');

        // Remap prompt_index to be global (offset by prompts already processed)
        const offset = ci * chunkSize;
        const remapped = (data.images || []).map(img => ({
          ...img,
          prompt_index: img.prompt_index + offset,
        }));

        setImages(prev => [...prev, ...remapped]);
        totalDone += data.succeeded;
        totalFailed += data.failed;
        if (data.errors?.length) allErrors.push(...data.errors);
        setProgress({ done: totalDone, total: totalImages });
      }

      if (totalFailed > 0) {
        setErrors(allErrors);
        setStatusMsg(`Done — ${totalDone} generated, ${totalFailed} failed`);
      } else {
        setStatusMsg(`✓ ${totalDone} images generated`);
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }, [prompts, computedVariations, chunkSize, modelId, size, guidanceScale, numSteps, loraUrl, loraScale, totalImages]);

  const toggleSelect = useCallback((idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const selectAll = () => setSelected(new Set(images.map((_, i) => i)));
  const selectNone = () => setSelected(new Set());

  const handleUpscale = async (scale) => {
    setShowUpscaleMenu(false);
    const toUpscale = [...selected].map(i => images[i]).filter(Boolean);
    if (toUpscale.length === 0) return;

    const upscalingIndices = new Set([...selected]);
    setUpscalingSet(upscalingIndices);
    setStatusMsg(`Upscaling ${toUpscale.length} image${toUpscale.length > 1 ? 's' : ''}...`);

    try {
      const res = await fetch(`${API}/generate/upscale-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_paths: toUpscale.map(img => img.image_path),
          scale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upscale failed');

      // Replace upscaled images in the list
      setImages(prev => {
        const next = [...prev];
        const selectedArr = [...upscalingIndices];
        data.images.forEach((result, ri) => {
          const originalIdx = selectedArr[ri];
          if (originalIdx !== undefined && result.ok !== false) {
            next[originalIdx] = {
              ...next[originalIdx],
              image_path: result.image_path,
              image_url: result.image_url,
            };
          }
        });
        return next;
      });

      setStatusMsg(`✓ Upscaled ${data.succeeded} image${data.succeeded !== 1 ? 's' : ''}`);
    } catch (err) {
      setStatusMsg(`Upscale error: ${err.message}`);
    } finally {
      setUpscalingSet(new Set());
    }
  };

  const handleAddToCollection = async () => {
    if (!collectionId || selected.size === 0) return;
    setAddingToCollection(true);
    setStatusMsg(`Adding ${selected.size} image${selected.size > 1 ? 's' : ''} to collection...`);

    const toAdd = [...selected].map(i => images[i]).filter(Boolean);
    let added = 0;
    let failed = 0;

    for (const img of toAdd) {
      try {
        // Fetch image blob, then upload as NFT
        const imgRes = await fetch(`http://localhost:5001${img.image_url}`);
        const blob = await imgRes.blob();
        const form = new FormData();
        const filename = img.image_path.split('/').pop();
        form.append('image', blob, filename);
        form.append('collection_id', collectionId);
        form.append('name', `${img.prompt.slice(0, 40)} #${Date.now()}`);

        const res = await fetch(`${API}/generate/upload-direct`, { method: 'POST', body: form });
        if (res.ok) added++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setStatusMsg(`✓ Added ${added} NFT${added !== 1 ? 's' : ''} to collection${failed > 0 ? ` (${failed} failed)` : ''}`);
    setAddingToCollection(false);
    setSelected(new Set());
  };

  // Close upscale dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (upscaleMenuRef.current && !upscaleMenuRef.current.contains(e.target)) {
        setShowUpscaleMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {lightboxImage && <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />}
      <div className="max-w-[1600px] mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Studio</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Generate large image batches with variation, upscale picks, assign to collection
            </p>
          </div>
          {recentBatches.length > 0 && (
            <button
              onClick={() => setShowRecent(v => !v)}
              className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
            >
              {showRecent ? 'Hide' : '📂 Recent Batches'} ({recentBatches.length})
            </button>
          )}
        </div>

        {/* Recent Batches panel */}
        {showRecent && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Batches — click to reload</h2>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {recentBatches.map(batch => (
                <div key={batch.id} className="bg-gray-800 rounded-lg p-3 flex items-center gap-4">
                  {/* Thumbnail strip */}
                  <div className="flex gap-1 flex-shrink-0">
                    {batch.images.slice(0, 5).map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:5001${img.image_url}`}
                        className="w-12 h-12 object-cover rounded"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 font-mono truncate">{batch.model_id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {batch.succeeded} images · {new Date(batch.created_at * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate mt-0.5">{batch.prompts?.slice(0,3).join(' · ')}</p>
                  </div>
                  {/* Load button */}
                  <button
                    onClick={() => {
                      setImages(batch.images);
                      setSelected(new Set());
                      setShowRecent(false);
                    }}
                    className="flex-shrink-0 text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg transition-colors text-white"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">

          {/* ── LEFT PANEL ── */}
          <div className="w-80 flex-shrink-0 space-y-4">

            {/* Prompts */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Prompts <span className="text-gray-600 normal-case font-normal">— one per line</span>
              </label>
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                rows={10}
                placeholder={"aerial drone view of suburban cul-de-sac, golden hour, photorealistic\nconcrete gardens, wheelie bins, satellite dishes, documentary\nsurburban rooftops from above, overcast UK sky, melancholy"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600 resize-none font-mono leading-relaxed"
              />
              {prompts.length > 0 && (
                <p className="text-xs text-gray-500 mt-1.5">{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</p>
              )}
            </div>

            {/* Batch target */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Target total
              </label>
              <p className="text-[11px] text-gray-600 mb-3">
                {batchTarget ? 'Variations auto-calculated from your prompts' : 'Or set manually below'}
              </p>
              <div className="flex flex-wrap gap-2">
                {TARGET_PRESETS.map(({ label, value, chunk }) => (
                  <button
                    key={label}
                    onClick={() => { setBatchTarget(value); setChunkSize(chunk); }}
                    className={`px-3 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      batchTarget === value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Manual variations (only shown when Auto) */}
              {!batchTarget && (
                <div className="mt-3">
                  <p className="text-[11px] text-gray-500 mb-2">Variations per prompt</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setVariations(n)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                          variations === n
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {prompts.length > 0 && (
                <div className="mt-3 space-y-0.5">
                  {batchTarget && (
                    <p className="text-[11px] text-gray-500 font-mono">
                      {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} × {computedVariations} variations
                    </p>
                  )}
                  <p className="text-xs text-green-500 font-mono font-semibold">
                    → {totalImages.toLocaleString()} images · {estLabel}
                  </p>
                  {totalImages >= 1000 && (
                    <p className="text-[11px] text-amber-500/80 mt-1">
                      ⚠ Large batch — runs in background, images appear as chunks complete
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Generate at a time */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Generate at a time
              </label>
              <p className="text-[11px] text-gray-600 mb-3">Images appear in the grid after each group</p>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 20, 25, 50].map(n => (
                  <button
                    key={n}
                    onClick={() => setChunkSize(n)}
                    className={`w-10 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      chunkSize === n
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {prompts.length > 0 && (
                <p className="text-[11px] text-gray-600 mt-2 font-mono">
                  → {Math.ceil(totalImages / chunkSize)} batch{Math.ceil(totalImages / chunkSize) !== 1 ? 'es' : ''}
                </p>
              )}
            </div>

            {/* Model */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Model</label>
              <select
                value={modelId}
                onChange={e => setModelId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-600"
              >
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Size</label>
              <select
                value={sizeKey}
                onChange={e => setSizeKey(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-600"
              >
                {SIZES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Collection */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Collection <span className="text-gray-600 normal-case font-normal">— optional</span>
              </label>
              <select
                value={collectionId}
                onChange={e => setCollectionId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-600"
              >
                <option value="">— select later —</option>
                {allCollections.map(c => (
                  <option key={c.id} value={c.id}>{c.brandName} / {c.name}</option>
                ))}
              </select>
            </div>

            {/* Advanced */}
            <div className="bg-gray-900 rounded-xl border border-gray-800">
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                <span>Advanced</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
              </button>
              {showAdvanced && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Guidance Scale <span className="text-green-400">{guidanceScale}</span>
                    </label>
                    <input
                      type="range" min="1" max="15" step="0.5"
                      value={guidanceScale}
                      onChange={e => setGuidanceScale(parseFloat(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Steps <span className="text-green-400">{numSteps}</span>
                    </label>
                    <input
                      type="range" min="10" max="50" step="1"
                      value={numSteps}
                      onChange={e => setNumSteps(parseInt(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">LoRA URL</label>
                    <input
                      type="text"
                      value={loraUrl}
                      onChange={e => setLoraUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-green-600"
                    />
                  </div>
                  {loraUrl.trim() && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        LoRA Scale <span className="text-green-400">{loraScale}</span>
                      </label>
                      <input
                        type="range" min="0.1" max="2" step="0.1"
                        value={loraScale}
                        onChange={e => setLoraScale(parseFloat(e.target.value))}
                        className="w-full accent-green-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || prompts.length === 0}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#22c55e', color: '#000' }}
            >
              {generating
                ? `Generating...`
                : prompts.length === 0
                  ? 'Enter prompts to begin'
                  : `Generate ${totalImages.toLocaleString()} image${totalImages !== 1 ? 's' : ''} · ${estLabel}`
              }
            </button>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 min-w-0">

            {/* Status + Progress */}
            {(generating || statusMsg) && (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4 space-y-3">
                {generating && (
                  <ProgressBar value={progress.done} max={progress.total} label="Generating" />
                )}
                {statusMsg && (
                  <p className="text-sm text-gray-300">{statusMsg}</p>
                )}
                {errors.length > 0 && (
                  <details className="text-xs text-red-400">
                    <summary className="cursor-pointer">{errors.length} error{errors.length > 1 ? 's' : ''}</summary>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {errors.map((e, i) => (
                        <li key={i}><span className="text-gray-500">#{e.prompt_index + 1} var{e.variation}:</span> {e.error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {/* Controls bar (only when there are images) */}
            {images.length > 0 && (
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <button onClick={selectAll} className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  Select All
                </button>
                <button onClick={selectNone} className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  None
                </button>
                {selected.size > 0 && (
                  <span className="text-xs text-green-400 font-mono">{selected.size} selected</span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {/* Upscale dropdown */}
                  {selected.size > 0 && (
                    <div className="relative" ref={upscaleMenuRef}>
                      <button
                        onClick={() => setShowUpscaleMenu(v => !v)}
                        disabled={upscalingSet.size > 0}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40"
                        style={{ backgroundColor: '#7c3aed', color: '#fff' }}
                      >
                        {upscalingSet.size > 0 ? 'Upscaling...' : `↑ Upscale ${selected.size}`}
                      </button>
                      {showUpscaleMenu && (
                        <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[120px]">
                          {[2, 4].map(s => (
                            <button
                              key={s}
                              onClick={() => handleUpscale(s)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors"
                            >
                              {s}× upscale
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to collection */}
                  {selected.size > 0 && (
                    <button
                      onClick={handleAddToCollection}
                      disabled={!collectionId || addingToCollection}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40"
                      style={{ backgroundColor: '#22c55e', color: '#000' }}
                      title={!collectionId ? 'Select a collection first' : ''}
                    >
                      {addingToCollection ? 'Adding...' : `+ Add ${selected.size} to collection`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Image grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <ImageCard
                    key={i}
                    image={img}
                    selected={selected.has(i)}
                    onToggle={() => toggleSelect(i)}
                    upscaling={upscalingSet.has(i)}
                    onView={() => setLightboxImage(img)}
                  />
                ))}
              </div>
            ) : !generating ? (
              <div className="flex items-center justify-center h-80 text-center">
                <div>
                  <div className="text-5xl mb-4 opacity-20">⬛</div>
                  <p className="text-gray-500 text-sm">Enter prompts and click Generate</p>
                  <p className="text-gray-600 text-xs mt-1">Images will appear here as they're generated</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <svg className="animate-spin w-10 h-10 text-green-500 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-gray-400 text-sm mt-4">Running batch...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
