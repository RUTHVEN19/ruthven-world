import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateFal, uploadDirectNFT, compositeImage, bulkComposite } from '../utils/api';

// Preset models with LoRA configurations
const MODEL_PRESETS = [
  {
    id: 'ink-intervention',
    name: 'Ink Intervention (Drones of Suburbia)',
    model_id: 'fal-ai/flux-lora',
    loras: [{ path: 'https://storage.googleapis.com/fal-flux-lora/1fc806a7d5a146ff81cdadb7d06b713a_pytorch_lora_weights.safetensors', scale: 1.0 }],
    guidance_scale: 3.5,
    num_inference_steps: 28,
    defaultPrompt: 'black and white, ink style, ',
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 Dev (General)',
    model_id: 'fal-ai/flux/dev',
    loras: null,
    guidance_scale: 3.5,
    num_inference_steps: 28,
    defaultPrompt: '',
  },
  {
    id: 'custom',
    name: 'Custom Model',
    model_id: '',
    loras: null,
    guidance_scale: 3.5,
    num_inference_steps: 28,
    defaultPrompt: '',
  },
];

const SIZE_PRESETS = [
  { id: 'square', label: 'Square', width: 1024, height: 1024 },
  { id: 'square_hd', label: 'Square HD', width: 1408, height: 1408 },
  { id: 'portrait_3_4', label: 'Portrait 3:4', width: 768, height: 1024 },
  { id: 'portrait_9_16', label: 'Portrait 9:16', width: 576, height: 1024 },
  { id: 'landscape_4_3', label: 'Landscape 4:3', width: 1024, height: 768 },
  { id: 'landscape_16_9', label: 'Landscape 16:9', width: 1024, height: 576 },
];

export default function ImageGenerator({ collectionId, onGenerated }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('ink-intervention');
  const [customModelId, setCustomModelId] = useState('');
  const [customLoraUrl, setCustomLoraUrl] = useState('');
  const [customLoraScale, setCustomLoraScale] = useState(1.0);
  const [selectedSize, setSelectedSize] = useState('portrait_3_4');
  const [numImages, setNumImages] = useState(4);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [inferenceSteps, setInferenceSteps] = useState(28);
  const [seed, setSeed] = useState(-1); // -1 = random
  const [loraScale, setLoraScale] = useState(1.0);

  // Layer composition state
  const [selectedBaseImage, setSelectedBaseImage] = useState(null);
  const [layerFiles, setLayerFiles] = useState([]);
  const [layerPreviews, setLayerPreviews] = useState([]);
  const layerInputRef = useRef(null);

  // Bulk layer compose state
  const [bulkLayers, setBulkLayers] = useState([]);
  const [bulkLayerPreviews, setBulkLayerPreviews] = useState([]);
  const [bulkBaseImages, setBulkBaseImages] = useState([]); // [{image_path, image_url}]
  const [bulkMode, setBulkMode] = useState('each'); // 'each' or 'random'
  const [bulkCount, setBulkCount] = useState(10);
  const bulkLayerInputRef = useRef(null);

  const preset = MODEL_PRESETS.find(p => p.id === selectedPreset) || MODEL_PRESETS[0];
  const sizePreset = SIZE_PRESETS.find(s => s.id === selectedSize) || SIZE_PRESETS[0];

  const falMutation = useMutation({
    mutationFn: (data) => generateFal(data),
    onSuccess: (data) => {
      const images = data.images || [{ image_url: data.image_url, image_path: data.image_path }];
      setGeneratedImages(images);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadDirectNFT(formData),
    onSuccess: () => {
      setUploadProgress(prev => ({ ...prev, done: prev.done + 1 }));
      onGenerated?.();
    },
  });

  const compositeMutation = useMutation({
    mutationFn: (formData) => compositeImage(formData),
    onSuccess: () => {
      setSelectedBaseImage(null);
      setLayerFiles([]);
      setLayerPreviews([]);
      onGenerated?.();
    },
  });

  const bulkCompositeMutation = useMutation({
    mutationFn: (formData) => bulkComposite(formData),
    onSuccess: (data) => {
      onGenerated?.();
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadProgress({ done: 0, total: files.length });

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('collection_id', collectionId);
      formData.append('name', file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      await uploadMutation.mutateAsync(formData);
    }
  };

  const handleFalGenerate = () => {
    const modelId = selectedPreset === 'custom' ? customModelId : preset.model_id;

    let loras = preset.loras;
    if (selectedPreset === 'custom' && customLoraUrl) {
      loras = [{ path: customLoraUrl, scale: customLoraScale }];
    }
    // Apply LoRA scale override for presets with LoRAs
    if (loras && selectedPreset !== 'custom') {
      loras = loras.map(l => ({ ...l, scale: loraScale }));
    }

    falMutation.mutate({
      model_id: modelId,
      prompt,
      collection_id: parseInt(collectionId),
      loras,
      guidance_scale: guidanceScale,
      num_inference_steps: inferenceSteps,
      seed: seed === -1 ? undefined : seed,
      width: sizePreset.width,
      height: sizePreset.height,
      num_images: numImages,
    });
  };

  const handleSaveFalImage = async (image) => {
    const response = await fetch(image.image_url);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('image', blob, 'fal-generated.png');
    formData.append('collection_id', collectionId);
    uploadMutation.mutate(formData);
  };

  const handleSaveAllImages = async () => {
    for (const image of generatedImages) {
      await handleSaveFalImage(image);
    }
  };

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    const p = MODEL_PRESETS.find(m => m.id === presetId);
    if (p?.defaultPrompt && !prompt) {
      setPrompt(p.defaultPrompt);
    }
    // Reset advanced settings to preset defaults
    if (p) {
      setGuidanceScale(p.guidance_scale);
      setInferenceSteps(p.num_inference_steps);
      if (p.loras) setLoraScale(p.loras[0].scale);
    }
  };

  // Select a generated image as the base for layer composition
  const handleSelectAsBase = (image) => {
    setSelectedBaseImage(image);
    setActiveTab('layers');
  };

  // Add generated image to bulk compose base images
  const handleAddToBulkBases = (image) => {
    if (!bulkBaseImages.find(b => b.image_path === image.image_path)) {
      setBulkBaseImages(prev => [...prev, image]);
    }
    setActiveTab('bulk-compose');
  };

  // Handle layer file uploads
  const handleLayerUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newFiles = [...layerFiles, ...files];
    setLayerFiles(newFiles);

    // Create preview URLs
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setLayerPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveLayer = (index) => {
    setLayerFiles(prev => prev.filter((_, i) => i !== index));
    setLayerPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleComposite = () => {
    if (!selectedBaseImage || layerFiles.length === 0) return;

    const formData = new FormData();
    formData.append('collection_id', collectionId);
    formData.append('base_image', selectedBaseImage.image_path);

    layerFiles.forEach(file => {
      formData.append('layers', file);
    });

    compositeMutation.mutate(formData);
  };

  // Bulk layer handlers
  const handleBulkLayerUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBulkLayers(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setBulkLayerPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveBulkLayer = (index) => {
    setBulkLayers(prev => prev.filter((_, i) => i !== index));
    setBulkLayerPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveBulkBase = (index) => {
    setBulkBaseImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkComposite = () => {
    if (bulkBaseImages.length === 0 || bulkLayers.length === 0) return;

    const formData = new FormData();
    formData.append('collection_id', collectionId);
    formData.append('base_paths', JSON.stringify(bulkBaseImages.map(b => b.image_path)));
    formData.append('mode', bulkMode);
    if (bulkMode === 'random') {
      formData.append('count', bulkCount.toString());
    }

    bulkLayers.forEach(file => {
      formData.append('layers', file);
    });

    bulkCompositeMutation.mutate(formData);
  };

  const totalBulkOutput = bulkMode === 'each'
    ? bulkBaseImages.length * bulkLayers.length
    : bulkCount;

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'fal', label: 'FAL AI' },
    { id: 'layers', label: 'Compose' },
    { id: 'bulk-compose', label: 'Bulk Compose' },
  ];

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Add Images</h3>

      <div className="flex space-x-1 mb-4 bg-gray-800 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'bulk-compose' && bulkBaseImages.length > 0 && (
              <span className="ml-1.5 bg-white text-black text-xs px-1.5 py-0.5 rounded-full">
                {bulkBaseImages.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== UPLOAD TAB ===== */}
      {activeTab === 'upload' && (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            Upload Midjourney renders, scanned drawings, or any artwork to add directly as 1/1 NFTs.
            You can select multiple files at once.
          </p>
          <label className="block border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 transition-colors">
            <div className="text-4xl mb-2">&#128247;</div>
            <div className="text-sm text-gray-400 mb-1">
              Drop images here or click to upload
            </div>
            <div className="text-xs text-gray-600">PNG, JPG, WebP, GIF supported &middot; Multi-select enabled</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadProgress.total > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={uploadProgress.done === uploadProgress.total ? 'text-gray-300' : 'text-white'}>
                  {uploadProgress.done === uploadProgress.total
                    ? `All ${uploadProgress.total} images uploaded!`
                    : `Uploading ${uploadProgress.done + 1} of ${uploadProgress.total}...`
                  }
                </span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FAL AI GENERATE TAB ===== */}
      {activeTab === 'fal' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Generate images from FAL AI models. Choose a preset or use a custom model.
          </p>

          {/* Model Preset Selector */}
          <div>
            <label className="label">Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MODEL_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedPreset === p.id
                      ? 'border-white bg-white/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  {p.model_id && <div className="text-xs text-gray-500 mt-0.5">{p.model_id}</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Custom model fields */}
          {selectedPreset === 'custom' && (
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <div>
                <label className="label">FAL Model ID</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., fal-ai/flux/dev"
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                />
              </div>
              <div>
                <label className="label">LoRA Weights URL (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="https://storage.googleapis.com/..."
                  value={customLoraUrl}
                  onChange={(e) => setCustomLoraUrl(e.target.value)}
                />
              </div>
              {customLoraUrl && (
                <div>
                  <label className="label">LoRA Scale</label>
                  <input
                    type="number"
                    className="input w-24"
                    value={customLoraScale}
                    onChange={(e) => setCustomLoraScale(parseFloat(e.target.value))}
                    step="0.1"
                    min="0"
                    max="2"
                  />
                </div>
              )}
            </div>
          )}

          {/* LoRA info for presets */}
          {preset.loras && selectedPreset !== 'custom' && (
            <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg px-3 py-2">
              LoRA: {preset.loras[0].path.split('/').pop().split('?')[0]} (scale: {loraScale})
            </div>
          )}

          {/* Image Size & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Image Size</label>
              <select
                className="input"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {SIZE_PRESETS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.width} x {s.height})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Number of Images</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumImages(n)}
                    className={`w-10 h-10 rounded-lg border text-sm font-bold transition-colors ${
                      numImages === n
                        ? 'border-white bg-white/20 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Advanced Settings</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-gray-800/50 rounded-lg space-y-4">
                {/* Guidance Scale */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-300">Guidance Scale</label>
                    <span className="text-sm text-white font-mono">{guidanceScale}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                    <span>1 (Creative)</span>
                    <span>20 (Strict)</span>
                  </div>
                </div>

                {/* Inference Steps */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-300">Inference Steps</label>
                    <span className="text-sm text-white font-mono">{inferenceSteps}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={inferenceSteps}
                    onChange={(e) => setInferenceSteps(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                    <span>1 (Fast)</span>
                    <span>50 (Quality)</span>
                  </div>
                </div>

                {/* LoRA Scale - only for models with LoRA */}
                {(preset.loras || (selectedPreset === 'custom' && customLoraUrl)) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-300">LoRA Scale</label>
                      <span className="text-sm text-white font-mono">{loraScale}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={loraScale}
                      onChange={(e) => setLoraScale(parseFloat(e.target.value))}
                      className="w-full accent-white"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                      <span>0 (Off)</span>
                      <span>2 (Strong)</span>
                    </div>
                  </div>
                )}

                {/* Seed */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-300">Seed</label>
                    <button
                      onClick={() => setSeed(-1)}
                      className={`text-xs px-2 py-0.5 rounded ${
                        seed === -1 ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Random
                    </button>
                  </div>
                  <input
                    type="number"
                    className="input"
                    placeholder="Random (-1)"
                    value={seed === -1 ? '' : seed}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSeed(v === '' ? -1 : parseInt(v));
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Use a fixed seed to reproduce the same image. Leave random for variety.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Prompt</label>
            <textarea
              className="input min-h-[80px]"
              placeholder={preset.defaultPrompt
                ? `e.g., ${preset.defaultPrompt}a drone hovering over suburban houses`
                : 'Describe the artwork you want to generate...'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={handleFalGenerate}
            className="btn-primary"
            disabled={falMutation.isPending || !prompt}
          >
            {falMutation.isPending ? `Generating ${numImages} image${numImages > 1 ? 's' : ''}...` : `Generate ${numImages} Image${numImages > 1 ? 's' : ''}`}
          </button>
          {falMutation.isError && (
            <div className="text-sm text-red-400">
              {falMutation.error?.response?.data?.error || 'Generation failed. Check your FAL API key.'}
            </div>
          )}

          {/* Generated Images Grid */}
          {generatedImages.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{generatedImages.length} image{generatedImages.length > 1 ? 's' : ''} generated</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      generatedImages.forEach(img => handleAddToBulkBases(img));
                    }}
                    className="btn-secondary text-sm"
                  >
                    Add All to Bulk
                  </button>
                  <button onClick={handleSaveAllImages} className="btn-secondary text-sm">
                    Save All as NFTs
                  </button>
                </div>
              </div>
              <div className={`grid gap-3 ${generatedImages.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-2'}`}>
                {generatedImages.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-700">
                    <img src={img.image_url} alt={`Generated ${i + 1}`} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 flex-wrap p-2">
                      <button
                        onClick={() => handleSaveFalImage(img)}
                        className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Save as NFT
                      </button>
                      <button
                        onClick={() => handleSelectAsBase(img)}
                        className="px-3 py-1.5 bg-gray-700 rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
                      >
                        Add Layers
                      </button>
                      <button
                        onClick={() => handleAddToBulkBases(img)}
                        className="px-3 py-1.5 bg-gray-600 rounded-lg text-xs font-medium hover:bg-gray-500 transition-colors"
                      >
                        Bulk Compose
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== LAYER COMPOSE TAB ===== */}
      {activeTab === 'layers' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Composite drawing layers on top of a base image. Select a FAL-generated or uploaded image as
            the base, then add your hand-drawn ink layers on top. Layers are composited with alpha transparency.
          </p>

          {/* Base Image */}
          <div>
            <label className="label">Base Image</label>
            {selectedBaseImage ? (
              <div className="flex items-start space-x-4">
                <img
                  src={selectedBaseImage.image_url}
                  alt="Base"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-2">Base image selected</p>
                  <button
                    onClick={() => setSelectedBaseImage(null)}
                    className="text-xs text-gray-500 hover:text-red-400"
                  >
                    Remove base image
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="mb-2">No base image selected</p>
                <p className="text-xs text-gray-600">
                  Generate images in the FAL AI tab, then hover and click "Add Layers" to use one as a base.
                  Or upload a base image below.
                </p>
                <label className="inline-block mt-3 px-4 py-2 bg-gray-700 rounded-lg text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors text-xs">
                  Upload Base Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Upload as source first
                      const formData = new FormData();
                      formData.append('image', file);
                      formData.append('collection_id', collectionId);
                      const { uploadImage } = await import('../utils/api');
                      const result = await uploadImage(formData);
                      setSelectedBaseImage({
                        image_url: result.image_url,
                        image_path: result.image_path,
                      });
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Drawing Layers */}
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Drawing Layers (PNG with transparency)</label>
              <button
                onClick={() => layerInputRef.current?.click()}
                className="text-xs text-white hover:text-gray-300"
              >
                + Add Layer
              </button>
            </div>
            <input
              ref={layerInputRef}
              type="file"
              accept="image/png,image/webp"
              multiple
              onChange={handleLayerUpload}
              className="hidden"
            />

            {layerPreviews.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {layerPreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={preview}
                      alt={`Layer ${i + 1}`}
                      className="w-full aspect-square object-contain rounded-lg border border-gray-700 bg-gray-900"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-xs px-1.5 py-0.5 rounded">
                      L{i + 1}
                    </div>
                    <button
                      onClick={() => handleRemoveLayer(i)}
                      className="absolute top-1 right-1 bg-red-600/80 text-xs w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                  <span className="text-2xl text-gray-600">+</span>
                  <input
                    type="file"
                    accept="image/png,image/webp"
                    multiple
                    onChange={handleLayerUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-gray-500 transition-colors mt-2">
                <div className="text-2xl mb-1">&#127912;</div>
                <div className="text-sm text-gray-400">Upload drawing layers</div>
                <div className="text-xs text-gray-600 mt-1">PNG with transparency recommended</div>
                <input
                  type="file"
                  accept="image/png,image/webp"
                  multiple
                  onChange={handleLayerUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Composite Button */}
          <button
            onClick={handleComposite}
            className="btn-primary w-full"
            disabled={!selectedBaseImage || layerFiles.length === 0 || compositeMutation.isPending}
          >
            {compositeMutation.isPending
              ? 'Compositing...'
              : `Composite ${layerFiles.length} Layer${layerFiles.length !== 1 ? 's' : ''} onto Base`
            }
          </button>
          {compositeMutation.isSuccess && (
            <div className="text-sm text-gray-300">Composite saved as NFT!</div>
          )}
          {compositeMutation.isError && (
            <div className="text-sm text-red-400">
              {compositeMutation.error?.response?.data?.error || 'Composition failed'}
            </div>
          )}
        </div>
      )}

      {/* ===== BULK COMPOSE TAB ===== */}
      {activeTab === 'bulk-compose' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Upload drawing layers in bulk, add base images, and generate many unique composites at once.
            Like Bueno Art&rsquo;s generative model &mdash; every layer gets applied to create unique 1/1s.
          </p>

          {/* Base Images */}
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Base Images ({bulkBaseImages.length})</label>
              <label className="text-xs text-white hover:text-gray-300 cursor-pointer">
                + Upload Base
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const file of files) {
                      const formData = new FormData();
                      formData.append('image', file);
                      formData.append('collection_id', collectionId);
                      const { uploadImage } = await import('../utils/api');
                      const result = await uploadImage(formData);
                      setBulkBaseImages(prev => [...prev, {
                        image_url: result.image_url,
                        image_path: result.image_path,
                      }]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {bulkBaseImages.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                {bulkBaseImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.image_url}
                      alt={`Base ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      onClick={() => handleRemoveBulkBase(i)}
                      className="absolute top-1 right-1 bg-red-600/80 text-xs w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-800/50 rounded-lg p-4 text-center mt-2">
                <p>No base images added yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Generate images in FAL AI tab, then click "Bulk Compose" on each image.
                  Or upload base images above.
                </p>
              </div>
            )}
          </div>

          {/* Layer Files */}
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Drawing Layers ({bulkLayers.length})</label>
              <button
                onClick={() => bulkLayerInputRef.current?.click()}
                className="text-xs text-white hover:text-gray-300"
              >
                + Add Layers
              </button>
            </div>
            <input
              ref={bulkLayerInputRef}
              type="file"
              accept="image/png,image/webp"
              multiple
              onChange={handleBulkLayerUpload}
              className="hidden"
            />

            {bulkLayerPreviews.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                {bulkLayerPreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={preview}
                      alt={`Layer ${i + 1}`}
                      className="w-full aspect-square object-contain rounded-lg border border-gray-700 bg-gray-900"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-xs px-1.5 py-0.5 rounded">
                      {bulkLayers[i]?.name?.split('.')[0]?.slice(0, 8) || `L${i + 1}`}
                    </div>
                    <button
                      onClick={() => handleRemoveBulkLayer(i)}
                      className="absolute top-1 right-1 bg-red-600/80 text-xs w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                  <span className="text-2xl text-gray-600">+</span>
                  <input
                    type="file"
                    accept="image/png,image/webp"
                    multiple
                    onChange={handleBulkLayerUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-gray-500 transition-colors mt-2">
                <div className="text-2xl mb-1">&#127912;</div>
                <div className="text-sm text-gray-400">Bulk upload drawing layers</div>
                <div className="text-xs text-gray-600 mt-1">Select many PNG/WebP files at once &middot; Transparency supported</div>
                <input
                  type="file"
                  accept="image/png,image/webp"
                  multiple
                  onChange={handleBulkLayerUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Generation Mode */}
          {bulkBaseImages.length > 0 && bulkLayers.length > 0 && (
            <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
              <label className="label">Generation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBulkMode('each')}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    bulkMode === 'each'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">Every Combination</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Each base &times; each layer = {bulkBaseImages.length * bulkLayers.length} NFTs
                  </div>
                </button>
                <button
                  onClick={() => setBulkMode('random')}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    bulkMode === 'random'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">Random Mix</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Choose how many to generate
                  </div>
                </button>
              </div>

              {bulkMode === 'random' && (
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Number to Generate</label>
                  <input
                    type="number"
                    className="input w-32"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="1000"
                  />
                </div>
              )}

              <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
                Will generate <span className="text-white font-bold">{totalBulkOutput}</span> unique NFTs
                from {bulkBaseImages.length} base{bulkBaseImages.length !== 1 ? 's' : ''} &times; {bulkLayers.length} layer{bulkLayers.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleBulkComposite}
            className="btn-primary w-full"
            disabled={
              bulkBaseImages.length === 0 ||
              bulkLayers.length === 0 ||
              bulkCompositeMutation.isPending
            }
          >
            {bulkCompositeMutation.isPending
              ? `Generating ${totalBulkOutput} composites...`
              : `Generate ${totalBulkOutput} Composite NFT${totalBulkOutput !== 1 ? 's' : ''}`
            }
          </button>
          {bulkCompositeMutation.isSuccess && (
            <div className="text-sm text-gray-300">
              {bulkCompositeMutation.data?.count || totalBulkOutput} NFTs created!
            </div>
          )}
          {bulkCompositeMutation.isError && (
            <div className="text-sm text-red-400">
              {bulkCompositeMutation.error?.response?.data?.error || 'Bulk composition failed'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
