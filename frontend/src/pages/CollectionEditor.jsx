import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollection, updateCollection, getCollectionNFTs,
  uploadToIPFS, uploadDirectoryToIPFS, deployContract,
  recallNFTs, togglePause, withdrawFunds, bulkGenerate,
  generateMerkleRoot, getTopWishlisted,
} from '../utils/api';
import ImageGenerator from '../components/ImageGenerator';
import NFTPreview from '../components/NFTPreview';

function PriceTierEditor({ tiers, basePriceWei, onSave, isPending }) {
  const [editTiers, setEditTiers] = useState(tiers.length > 0 ? tiers : []);
  const [isEditing, setIsEditing] = useState(false);

  const addTier = () => {
    const lastThreshold = editTiers.length > 0 ? editTiers[editTiers.length - 1].threshold : 0;
    const lastPrice = editTiers.length > 0
      ? (Number(editTiers[editTiers.length - 1].price_wei) / 1e18)
      : (Number(basePriceWei) / 1e18);
    setEditTiers([...editTiers, {
      threshold: lastThreshold + 50,
      price_wei: String(Math.round((lastPrice + 0.02) * 1e18)),
    }]);
  };

  const removeTier = (index) => {
    setEditTiers(editTiers.filter((_, i) => i !== index));
  };

  const updateTier = (index, field, value) => {
    const updated = [...editTiers];
    if (field === 'price_eth') {
      updated[index] = { ...updated[index], price_wei: String(Math.round(parseFloat(value || 0) * 1e18)) };
    } else {
      updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    }
    setEditTiers(updated);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <label className="label mb-0">Price Tiers</label>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-gray-400 hover:text-white"
        >
          {isEditing ? 'Cancel' : editTiers.length > 0 ? 'Edit Tiers' : '+ Add Tiers'}
        </button>
      </div>

      {!isEditing && editTiers.length === 0 && (
        <p className="text-sm text-gray-500">No price tiers set. Price stays at base rate.</p>
      )}

      {!isEditing && editTiers.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm text-gray-400">
            Base: {(Number(basePriceWei) / 1e18).toFixed(4)} ETH (first {editTiers[0]?.threshold || 0} mints)
          </div>
          {editTiers.map((tier, i) => (
            <div key={i} className="text-sm text-gray-400">
              After {tier.threshold} mints: {(Number(tier.price_wei) / 1e18).toFixed(4)} ETH
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-2">
            Base price: {(Number(basePriceWei) / 1e18).toFixed(4)} ETH (applies before first tier threshold)
          </div>
          {editTiers.map((tier, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">After mint #</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={tier.threshold}
                  onChange={(e) => updateTier(i, 'threshold', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Price (ETH)</label>
                <input
                  type="text"
                  className="input text-sm"
                  value={(Number(tier.price_wei) / 1e18).toFixed(4)}
                  onChange={(e) => updateTier(i, 'price_eth', e.target.value)}
                />
              </div>
              <button onClick={() => removeTier(i)} className="text-gray-500 hover:text-red-400 mt-4">
                &times;
              </button>
            </div>
          ))}
          <div className="flex space-x-2">
            <button onClick={addTier} className="text-xs text-gray-400 hover:text-white">+ Add Tier</button>
          </div>
          <button
            onClick={() => { onSave(editTiers); setIsEditing(false); }}
            className="btn-primary text-sm"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Tiers'}
          </button>
        </div>
      )}
    </div>
  );
}

function AllowlistManager({ collection, onUpdate, isPending, onGenerateMerkle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [addressText, setAddressText] = useState('');
  const [presaleStart, setPresaleStart] = useState(collection.presale_start?.slice(0, 16) || '');
  const [presaleEnd, setPresaleEnd] = useState(collection.presale_end?.slice(0, 16) || '');
  const [publicStart, setPublicStart] = useState(collection.public_start?.slice(0, 16) || '');
  const [maxPerWallet, setMaxPerWallet] = useState(collection.max_presale_per_wallet || 1);

  const handleSaveAllowlist = () => {
    const addresses = addressText
      .split(/[\n,]+/)
      .map(a => a.trim())
      .filter(a => /^0x[a-fA-F0-9]{40}$/.test(a));

    onUpdate({
      allowlist: addresses,
      presale_start: presaleStart ? new Date(presaleStart).toISOString() : null,
      presale_end: presaleEnd ? new Date(presaleEnd).toISOString() : null,
      public_start: publicStart ? new Date(publicStart).toISOString() : null,
      max_presale_per_wallet: maxPerWallet,
    });
    setIsEditing(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Allowlist & Presale</h3>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            if (!isEditing) {
              // Load existing addresses
              const existing = JSON.parse(collection.allowlist_json || '[]');
              setAddressText(existing.join('\n'));
            }
          }}
          className="text-xs text-gray-400 hover:text-white"
        >
          {isEditing ? 'Cancel' : collection.allowlist_count > 0 ? 'Edit' : '+ Set Up Allowlist'}
        </button>
      </div>

      {!isEditing && (
        <div className="space-y-2 text-sm">
          {collection.allowlist_count > 0 ? (
            <>
              <div className="text-gray-400">
                {collection.allowlist_count} address{collection.allowlist_count !== 1 ? 'es' : ''} on allowlist
              </div>
              {collection.merkle_root && (
                <div className="text-xs text-gray-600 font-mono truncate">
                  Merkle Root: {collection.merkle_root}
                </div>
              )}
              {collection.presale_start && (
                <div className="text-gray-400 text-xs">
                  Presale: {new Date(collection.presale_start).toLocaleString()}
                  {' - '}
                  {collection.presale_end ? new Date(collection.presale_end).toLocaleString() : '...'}
                </div>
              )}
              {collection.public_start && (
                <div className="text-gray-400 text-xs">
                  Public: {new Date(collection.public_start).toLocaleString()}
                </div>
              )}
              {!collection.merkle_root && (
                <button
                  onClick={onGenerateMerkle}
                  className="btn-primary text-sm mt-2"
                  disabled={isPending}
                >
                  Generate Merkle Root
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500">No allowlist set. Minting will be open to everyone.</p>
          )}
        </div>
      )}

      {isEditing && (
        <div className="space-y-4">
          <div>
            <label className="label">Wallet Addresses (one per line)</label>
            <textarea
              className="input min-h-[120px] font-mono text-xs"
              placeholder="0x1234...abcd&#10;0x5678...efgh&#10;0x9abc...ijkl"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-1">
              {addressText.split(/[\n,]+/).filter(a => /^0x[a-fA-F0-9]{40}$/.test(a.trim())).length} valid addresses
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Presale Start</label>
              <input
                type="datetime-local"
                className="input text-sm"
                value={presaleStart}
                onChange={(e) => setPresaleStart(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Presale End</label>
              <input
                type="datetime-local"
                className="input text-sm"
                value={presaleEnd}
                onChange={(e) => setPresaleEnd(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Public Mint Start</label>
              <input
                type="datetime-local"
                className="input text-sm"
                value={publicStart}
                onChange={(e) => setPublicStart(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Max Per Wallet (Presale)</label>
              <input
                type="number"
                className="input text-sm"
                value={maxPerWallet}
                onChange={(e) => setMaxPerWallet(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
              />
            </div>
          </div>

          <button
            onClick={handleSaveAllowlist}
            className="btn-primary"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Allowlist Settings'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CollectionEditor() {
  const { brandId, collectionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [bulkCount, setBulkCount] = useState(10);
  const [status, setStatus] = useState('');
  const [editingSupply, setEditingSupply] = useState(false);
  const [newMaxSupply, setNewMaxSupply] = useState(null);

  const updateMutation = useMutation({
    mutationFn: (data) => updateCollection(collectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      setEditingSupply(false);
    },
  });

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => getCollection(collectionId),
  });

  const { data: nfts = [] } = useQuery({
    queryKey: ['nfts', collectionId],
    queryFn: () => getCollectionNFTs(collectionId),
  });

  const ipfsMutation = useMutation({
    mutationFn: () => uploadToIPFS(collectionId),
    onSuccess: (data) => {
      setStatus(`Uploaded ${data.uploaded} images to IPFS!`);
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
    },
    onError: (err) => setStatus(`IPFS upload failed: ${err.response?.data?.error || err.message}`),
  });

  const ipfsDirMutation = useMutation({
    mutationFn: () => uploadDirectoryToIPFS(collectionId),
    onSuccess: (data) => {
      setStatus(`Metadata uploaded! Base URI: ${data.base_uri}`);
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
    },
    onError: (err) => setStatus(`Metadata upload failed: ${err.response?.data?.error || err.message}`),
  });

  const deployMutation = useMutation({
    mutationFn: () => deployContract(collectionId, { network: collection.network }),
    onSuccess: (data) => {
      setStatus(`Contract deployed at ${data.contract_address}`);
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
    },
    onError: (err) => setStatus(`Deploy failed: ${err.response?.data?.error || err.message}`),
  });

  const recallMutation = useMutation({
    mutationFn: () => recallNFTs(collectionId),
    onSuccess: () => {
      setStatus('All NFTs recalled to your vault wallet!');
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
    },
    onError: (err) => setStatus(`Recall failed: ${err.response?.data?.error || err.message}`),
  });

  const pauseMutation = useMutation({
    mutationFn: (pause) => togglePause(collectionId, { pause }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collection', collectionId] }),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => withdrawFunds(collectionId),
    onSuccess: (data) => setStatus(`Funds withdrawn! TX: ${data.transaction_hash}`),
    onError: (err) => setStatus(`Withdraw failed: ${err.response?.data?.error || err.message}`),
  });

  const bulkMutation = useMutation({
    mutationFn: () => bulkGenerate({ collection_id: parseInt(collectionId), count: bulkCount }),
    onSuccess: (data) => {
      setStatus(`Generated ${data.count} unique NFTs!`);
      queryClient.invalidateQueries({ queryKey: ['nfts', collectionId] });
    },
    onError: (err) => setStatus(`Generation failed: ${err.response?.data?.error || err.message}`),
  });

  const merkleMutation = useMutation({
    mutationFn: () => generateMerkleRoot(collectionId),
    onSuccess: (data) => {
      setStatus(`Merkle root generated: ${data.merkle_root.slice(0, 18)}...`);
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
    },
    onError: (err) => setStatus(`Merkle generation failed: ${err.response?.data?.error || err.message}`),
  });

  const { data: topWishlisted = [] } = useQuery({
    queryKey: ['topWishlisted', collectionId],
    queryFn: () => getTopWishlisted(collectionId),
    enabled: collection?.mint_mode === 'choose',
  });

  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'generate', label: 'Generate' },
    { id: 'nfts', label: `NFTs (${nfts.length})` },
    { id: 'deploy', label: 'Deploy & Mint' },
  ];

  return (
    <div>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white">Dashboard</Link>
        <span>/</span>
        <Link to={`/brands/${brandId}`} className="hover:text-white">{collection?.brand?.name}</Link>
        <span>/</span>
        <span className="text-white">{collection?.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{collection?.name}</h1>
        <div className="flex space-x-2">
          <Link
            to={`/brands/${brandId}/collections/${collectionId}/traits`}
            className="btn-secondary"
          >
            Manage Traits
          </Link>
          <Link
            to={`/brands/${brandId}/collections/${collectionId}/upload`}
            className="btn-secondary"
          >
            Bulk Upload
          </Link>
          {collection?.contract_address && (
            <a
              href={`/mint/${collection.brand?.slug}/${collection.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              View Mint Page
            </a>
          )}
        </div>
      </div>

      {status && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 text-sm">
          {status}
          <button onClick={() => setStatus('')} className="ml-2 text-gray-500 hover:text-white">&times;</button>
        </div>
      )}

      <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-white">{nfts.length}</div>
            <div className="text-sm text-gray-500 mt-1">NFTs Generated</div>
          </div>
          <div
            className="card text-center cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => { setEditingSupply(true); setNewMaxSupply(collection.max_supply); }}
          >
            {editingSupply ? (
              <div onClick={(e) => e.stopPropagation()}>
                <div className="text-3xl font-bold text-white mb-2">
                  {(newMaxSupply || collection.max_supply).toLocaleString()}
                </div>
                <input
                  type="range"
                  min="1"
                  max="10000"
                  step={newMaxSupply <= 100 ? 1 : newMaxSupply <= 1000 ? 10 : 100}
                  value={newMaxSupply}
                  onChange={(e) => setNewMaxSupply(parseInt(e.target.value))}
                  className="w-full accent-white mb-2"
                />
                <div className="flex justify-center space-x-2 mb-2">
                  {[100, 500, 1000, 5000, 10000].map(v => (
                    <button
                      key={v}
                      onClick={() => setNewMaxSupply(v)}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                        newMaxSupply === v ? 'bg-white text-black font-bold' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {v >= 1000 ? `${v/1000}k` : v}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => updateMutation.mutate({ max_supply: newMaxSupply })}
                    className="text-xs px-3 py-1 bg-white text-black rounded font-medium hover:bg-gray-200"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingSupply(false)}
                    className="text-xs px-3 py-1 text-gray-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-white">{collection.max_supply.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Max Supply <span className="text-xs">(click to edit)</span></div>
              </>
            )}
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-white">{collection.mint_price_eth} ETH</div>
            <div className="text-sm text-gray-500 mt-1">Mint Price</div>
          </div>
          <div className="card text-center">
            <div className={`text-3xl font-bold ${collection.contract_address ? 'text-gray-300' : 'text-gray-600'}`}>
              {collection.contract_address ? 'Live' : 'Draft'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Status</div>
          </div>
          {collection.contract_address && (
            <div className="card col-span-full">
              <div className="text-sm text-gray-400 mb-1">Contract Address</div>
              <div className="font-mono text-sm text-gray-300 break-all">{collection.contract_address}</div>
              <div className="text-xs text-gray-600 mt-1">Network: {collection.network}</div>
            </div>
          )}
        </div>

        {/* ─── Advanced Minting Settings ─── */}
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Minting Configuration</h2>

          {/* Mint Mode */}
          <div className="card">
            <label className="label">Mint Mode</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => updateMutation.mutate({ mint_mode: 'blind' })}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  collection.mint_mode === 'blind'
                    ? 'border-white bg-white/10 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Blind Mint</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Random allocation, works for any supply size
                </div>
              </button>
              <button
                onClick={() => {
                  if (collection.max_supply > 500) {
                    setStatus('Choose mode requires max supply of 500 or less');
                    return;
                  }
                  updateMutation.mutate({ mint_mode: 'choose' });
                }}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  collection.mint_mode === 'choose'
                    ? 'border-white bg-white/10 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Choose Your NFT</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Collectors pick their piece (max 500 supply)
                </div>
              </button>
            </div>
          </div>

          {/* Price Tiers */}
          <PriceTierEditor
            tiers={collection.price_tiers || []}
            basePriceWei={collection.mint_price_wei}
            onSave={(tiers) => updateMutation.mutate({ price_tiers: tiers })}
            isPending={updateMutation.isPending}
          />

          {/* Wishlist Analytics (choose mode only) */}
          {collection.mint_mode === 'choose' && topWishlisted.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3">Top Wishlisted</h3>
              <p className="text-xs text-gray-500 mb-3">Most popular pieces your collectors are eyeing</p>
              <div className="space-y-2">
                {topWishlisted.map((item, i) => (
                  <div key={item.token_id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      <span className="text-gray-600 mr-2">#{i + 1}</span>
                      Token #{item.token_id}
                    </span>
                    <span className="text-white font-medium">{item.count} ♥</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {activeTab === 'generate' && (
        <div className="space-y-6">
          <ImageGenerator collectionId={collectionId} onGenerated={() => {
            queryClient.invalidateQueries({ queryKey: ['nfts', collectionId] });
          }} />

          <div className="card">
            <h3 className="font-semibold mb-4">Bulk Generate from Traits</h3>
            <p className="text-sm text-gray-400 mb-4">
              Automatically generate unique NFTs by combining your trait layers randomly.
              Make sure you've set up traits first.
            </p>
            <div className="flex items-end space-x-4">
              <div>
                <label className="label">Number to Generate</label>
                <input
                  type="number"
                  className="input w-32"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(parseInt(e.target.value))}
                  min="1"
                  max={collection.max_supply}
                />
              </div>
              <button
                onClick={() => bulkMutation.mutate()}
                className="btn-primary"
                disabled={bulkMutation.isPending}
              >
                {bulkMutation.isPending ? 'Generating...' : 'Bulk Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nfts' && (
        <div>
          {nfts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No NFTs generated yet. Go to the Generate tab to create some.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {nfts.map(nft => (
                <NFTPreview key={nft.id} nft={nft} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'deploy' && (
        <div className="space-y-6">
          {/* Step 1: Upload to IPFS */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                collection.base_uri ? 'bg-white text-black' : 'bg-gray-700'
              }`}>1</div>
              <h3 className="font-semibold">Upload to IPFS</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Upload all NFT images and metadata to IPFS via Pinata for permanent decentralized storage.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => ipfsMutation.mutate()}
                className="btn-secondary"
                disabled={ipfsMutation.isPending || nfts.length === 0}
              >
                {ipfsMutation.isPending ? 'Uploading Images...' : 'Upload Images'}
              </button>
              <button
                onClick={() => ipfsDirMutation.mutate()}
                className="btn-secondary"
                disabled={ipfsDirMutation.isPending}
              >
                {ipfsDirMutation.isPending ? 'Uploading Metadata...' : 'Upload Metadata Directory'}
              </button>
            </div>
            {collection.base_uri && (
              <div className="mt-3 text-xs text-gray-300">Base URI: {collection.base_uri}</div>
            )}
          </div>

          {/* Step 2: Deploy Contract */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                collection.contract_address ? 'bg-white text-black' : 'bg-gray-700'
              }`}>2</div>
              <h3 className="font-semibold">Deploy Smart Contract</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Deploy your ERC-721 smart contract to {collection.network}. This creates the on-chain
              collection that collectors can mint from.
            </p>
            {collection.contract_address ? (
              <div className="text-sm text-gray-300">
                Deployed at: <span className="font-mono">{collection.contract_address}</span>
              </div>
            ) : (
              <button
                onClick={() => deployMutation.mutate()}
                className="btn-primary"
                disabled={deployMutation.isPending || !collection.base_uri}
              >
                {deployMutation.isPending ? 'Deploying...' : `Deploy to ${collection.network}`}
              </button>
            )}
          </div>

          {/* Step 2.5: Allowlist & Presale (between deploy and manage) */}
          <AllowlistManager
            collection={collection}
            onUpdate={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
            onGenerateMerkle={() => merkleMutation.mutate()}
          />

          {/* Step 3: Manage Minting */}
          {collection.contract_address && (
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white text-black">3</div>
                <h3 className="font-semibold">Manage Collection</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => pauseMutation.mutate(!collection.is_minting_active)}
                  className="btn-secondary"
                  disabled={pauseMutation.isPending}
                >
                  {collection.is_minting_active ? 'Pause Minting' : 'Resume Minting'}
                </button>
                <button
                  onClick={() => withdrawMutation.mutate()}
                  className="btn-secondary"
                  disabled={withdrawMutation.isPending}
                >
                  Withdraw Funds
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('This will transfer ALL minted NFTs back to your wallet. Are you sure?')) {
                      recallMutation.mutate();
                    }
                  }}
                  className="btn-danger"
                  disabled={recallMutation.isPending}
                >
                  {recallMutation.isPending ? 'Recalling...' : 'Recall All to Vault'}
                </button>
                <a
                  href={`/mint/${collection.brand?.slug}/${collection.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-center"
                >
                  Open Mint Page
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
