import { useState, useCallback, useRef, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCollection, getCollectionNFTs, bulkUploadNFTs, deleteNFT } from '../utils/api';

// ── Memoized file card to prevent re-render on every keystroke ──
const FileCard = memo(function FileCard({ file, index, blobUrl, name, location, weather, weatherOptions, placeholder, onNameChange, onLocationChange, onWeatherChange, onRemove }) {
  const isVideo = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov'].includes(ext);
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group relative">
      <div className="aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
        {isVideo(file.name) ? (
          <video
            src={blobUrl}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseOver={e => e.target.play()}
            onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
          />
        ) : (
          <img src={blobUrl} alt={file.name} className="w-full h-full object-cover" />
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
        className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
      {isVideo(file.name) && (
        <div className="absolute top-2 left-2 bg-purple-600/90 text-[10px] px-2 py-0.5 rounded-full font-mono">VIDEO</div>
      )}
      <div className="p-2 space-y-1.5">
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={name}
          onBlur={(e) => onNameChange(index, e.target.value)}
          className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:border-green-600"
        />
        <input
          type="text"
          placeholder="Location (e.g. Glencoe, Isle of Skye)"
          defaultValue={location}
          onBlur={(e) => onLocationChange(index, e.target.value)}
          className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:border-green-600"
        />
        <select
          defaultValue={weather}
          onChange={(e) => onWeatherChange(index, e.target.value)}
          className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:border-green-600"
        >
          <option value="">Auto-assign weather</option>
          {weatherOptions.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default function BulkUpload() {
  const { brandId, collectionId } = useParams();
  const [files, setFiles] = useState([]);
  const [names, setNames] = useState({});
  const [locations, setLocations] = useState({});
  const [weatherEffects, setWeatherEffects] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const WEATHER_OPTIONS = [
    'Dawn Glow', 'Highland Mist', 'Storm Front', 'Northern Light',
    'Haar', 'Golden Hour', 'Gloaming', 'Snow Squall',
  ];

  const { data: collection } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => getCollection(collectionId),
  });

  const { data: existingNfts, refetch: refetchNfts } = useQuery({
    queryKey: ['nfts', collectionId],
    queryFn: () => getCollectionNFTs(collectionId),
  });

  // Memoize blob URLs so they don't get recreated on every render
  const blobUrls = useMemo(() => {
    return files.map(file => URL.createObjectURL(file));
  }, [files]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov'].includes(ext);
    });
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setNames(prev => { const c = { ...prev }; delete c[index]; return c; });
    setLocations(prev => { const c = { ...prev }; delete c[index]; return c; });
    setWeatherEffects(prev => { const c = { ...prev }; delete c[index]; return c; });
  };

  const updateName = (index, name) => {
    setNames(prev => ({ ...prev, [index]: name }));
  };

  const updateLocation = (index, loc) => {
    setLocations(prev => ({ ...prev, [index]: loc }));
  };

  const updateWeather = (index, weather) => {
    setWeatherEffects(prev => ({ ...prev, [index]: weather }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('collection_id', collectionId);

    const namesList = files.map((_, i) => names[i] || '');
    formData.append('names', JSON.stringify(namesList));

    const locationsList = files.map((_, i) => locations[i] || '');
    formData.append('locations', JSON.stringify(locationsList));

    const weatherList = files.map((_, i) => weatherEffects[i] || '');
    formData.append('weather_effects', JSON.stringify(weatherList));

    files.forEach(f => formData.append('files', f));

    try {
      const res = await bulkUploadNFTs(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      setResult(res);
      setFiles([]);
      setNames({});
      refetchNfts();
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNft = async (nftId) => {
    if (!confirm('Delete this NFT?')) return;
    await deleteNFT(nftId);
    refetchNfts();
  };

  const isVideo = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov'].includes(ext);
  };

  const nftCount = existingNfts?.length || 0;
  const maxSupply = collection?.max_supply || 0;
  const slotsRemaining = maxSupply - nftCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/brands/${brandId}/collections/${collectionId}`}
            className="text-sm text-gray-500 hover:text-gray-300 mb-2 inline-block"
          >
            &larr; Back to Collection
          </Link>
          <h1 className="text-2xl font-bold">{collection?.name || 'Collection'}</h1>
          <p className="text-gray-500 mt-1">
            {nftCount} / {maxSupply} NFTs uploaded &middot; {slotsRemaining} slots remaining
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-700 hover:border-gray-500 bg-gray-900/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-5xl mb-4">{dragOver ? '📥' : '🎨'}</div>
        <h3 className="text-xl font-semibold mb-2">
          {dragOver ? 'Drop your artwork here' : 'Drag & drop your NFT files'}
        </h3>
        <p className="text-gray-500">
          Images (PNG, JPG, WebP, GIF) and Videos (MP4, WebM, MOV)
        </p>
        <p className="text-gray-600 text-sm mt-2">
          or click to browse files
        </p>
      </div>

      {/* Staged files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{files.length} files ready to upload</h2>
            <div className="flex gap-3">
              <button
                onClick={() => { setFiles([]); setNames({}); }}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="px-6 py-2 text-sm font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                {uploading ? `Uploading... ${progress}%` : `Upload ${files.length} NFTs`}
              </button>
            </div>
          </div>

          {uploading && (
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, i) => (
              <FileCard
                key={`${file.name}-${i}`}
                file={file}
                index={i}
                blobUrl={blobUrls[i]}
                name={names[i] || ''}
                location={locations[i] || ''}
                weather={weatherEffects[i] || ''}
                weatherOptions={WEATHER_OPTIONS}
                placeholder={`${collection?.name || 'NFT'} #${nftCount + i}`}
                onNameChange={updateName}
                onLocationChange={updateLocation}
                onWeatherChange={updateWeather}
                onRemove={removeFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload result */}
      {result && (
        <div className={`rounded-xl p-4 ${result.error ? 'bg-red-900/30 border border-red-800' : 'bg-green-900/30 border border-green-800'}`}>
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <p className="text-green-400">✓ Successfully uploaded {result.count} NFTs!</p>
          )}
        </div>
      )}

      {/* Existing NFTs */}
      {existingNfts?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Uploaded NFTs ({existingNfts.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingNfts.map(nft => (
              <div key={nft.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group relative">
                <div className="aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
                  {nft.video_url ? (
                    <video
                      src={nft.video_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  ) : nft.image_url ? (
                    <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-700 text-4xl">🖼</div>
                  )}
                </div>

                {nft.video_url && (
                  <div className="absolute top-2 left-2 bg-purple-600/90 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    VIDEO
                  </div>
                )}

                <button
                  onClick={() => handleDeleteNft(nft.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>

                <div className="p-2">
                  <div className="text-xs font-medium truncate">{nft.name}</div>
                  <div className="text-[10px] text-gray-500">Token #{nft.token_id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
