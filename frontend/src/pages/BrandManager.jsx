import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrand, getCollections, createCollection, updateBrand, uploadBrandLogo } from '../utils/api';

export default function BrandManager() {
  const { brandId } = useParams();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '', description: '', max_supply: 100, mint_price_eth: '0.05',
  });
  const logoInputRef = useRef(null);

  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => getBrand(brandId),
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', brandId],
    queryFn: () => getCollections(brandId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createCollection({ ...data, brand_id: parseInt(brandId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', brandId] });
      setShowCreate(false);
      setNewCollection({ name: '', description: '', max_supply: 100, mint_price_eth: '0.05' });
    },
  });

  const logoMutation = useMutation({
    mutationFn: (formData) => uploadBrandLogo(brandId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(newCollection);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    logoMutation.mutate(formData);
  };

  if (brandLoading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white">Dashboard</Link>
        <span>/</span>
        <span className="text-white">{brand?.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {brand?.logo_url ? (
            <div
              className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-gray-700 hover:border-gray-500 transition-colors"
              onClick={() => logoInputRef.current?.click()}
              title="Click to change logo"
            >
              <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain bg-white" />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${brand?.theme?.primary_color || '#ffffff'}, ${brand?.theme?.secondary_color || '#000000'})`,
              }}
              onClick={() => logoInputRef.current?.click()}
              title="Click to upload logo"
            >
              {brand?.name?.charAt(0)}
            </div>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <div>
            <h1 className="text-2xl font-bold">{brand?.name}</h1>
            <p className="text-gray-400 text-sm">{brand?.description}</p>
            {logoMutation.isPending && (
              <p className="text-xs text-white mt-1">Uploading logo...</p>
            )}
            {!brand?.logo_url && (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="text-xs text-gray-500 hover:text-white mt-1 transition-colors"
              >
                + Upload brand logo
              </button>
            )}
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          + New Collection
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Collection Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Genesis"
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <input
                type="text"
                className="input"
                placeholder="Collection description..."
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Max Supply</label>
                <span className="text-sm text-white font-mono font-bold">
                  {(newCollection.max_supply || 100).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10000"
                step={newCollection.max_supply <= 100 ? 1 : newCollection.max_supply <= 1000 ? 10 : 100}
                value={newCollection.max_supply || 100}
                onChange={(e) => setNewCollection({ ...newCollection, max_supply: parseInt(e.target.value) })}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                <span>1</span>
                <div className="flex space-x-3">
                  {[100, 500, 1000, 5000, 10000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewCollection({ ...newCollection, max_supply: v })}
                      className={`hover:text-white transition-colors ${
                        newCollection.max_supply === v ? 'text-white font-bold' : ''
                      }`}
                    >
                      {v >= 1000 ? `${v/1000}k` : v}
                    </button>
                  ))}
                </div>
                <span>10k</span>
              </div>
            </div>
            <div>
              <label className="label">Mint Price (ETH)</label>
              <input
                type="text"
                className="input"
                placeholder="0.05"
                value={newCollection.mint_price_eth}
                onChange={(e) => setNewCollection({ ...newCollection, mint_price_eth: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Collection'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {collectionsLoading ? (
        <div className="text-center py-12 text-gray-500">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">&#128444;</div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No collections yet</h2>
          <p className="text-gray-500 mb-4">Create your first NFT collection for {brand?.name}</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/brands/${brandId}/collections/${col.id}`}
              className="card group"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold group-hover:text-white transition-colors">
                  {col.name}
                </h3>
                {col.contract_address ? (
                  <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                    Deployed
                  </span>
                ) : (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">{col.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{col.nft_count}</div>
                  <div className="text-xs text-gray-500">NFTs</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{col.max_supply}</div>
                  <div className="text-xs text-gray-500">Max Supply</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{col.mint_price_eth} ETH</div>
                  <div className="text-xs text-gray-500">Mint Price</div>
                </div>
              </div>
              {col.contract_address && (
                <div className="mt-3 text-xs text-gray-600 font-mono truncate">
                  {col.contract_address}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
