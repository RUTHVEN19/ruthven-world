import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Brands
export const getBrands = () => api.get('/brands').then(r => r.data);
export const getBrand = (id) => api.get(`/brands/${id}`).then(r => r.data);
export const createBrand = (data) => api.post('/brands', data).then(r => r.data);
export const updateBrand = (id, data) => api.put(`/brands/${id}`, data).then(r => r.data);
export const deleteBrand = (id) => api.delete(`/brands/${id}`).then(r => r.data);
export const uploadBrandLogo = (id, formData) =>
  api.post(`/brands/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

// Collections
export const getCollections = (brandId) => api.get(`/brands/${brandId}/collections`).then(r => r.data);
export const getCollection = (id) => api.get(`/collections/${id}`).then(r => r.data);
export const createCollection = (data) => api.post('/collections', data).then(r => r.data);
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data).then(r => r.data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`).then(r => r.data);
export const getCollectionStats = (id) => api.get(`/collections/${id}/stats`).then(r => r.data);

// Traits
export const getTraits = (collectionId) => api.get(`/collections/${collectionId}/traits`).then(r => r.data);
export const createTraitCategory = (collectionId, data) =>
  api.post(`/collections/${collectionId}/traits/categories`, data).then(r => r.data);
export const updateTraitCategory = (categoryId, data) =>
  api.put(`/traits/categories/${categoryId}`, data).then(r => r.data);
export const deleteTraitCategory = (categoryId) =>
  api.delete(`/traits/categories/${categoryId}`).then(r => r.data);
export const reorderCategories = (order) =>
  api.put('/traits/categories/reorder', { order }).then(r => r.data);

export const createTraitValue = (categoryId, formData) =>
  api.post(`/traits/categories/${categoryId}/values`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
export const deleteTraitValue = (valueId) =>
  api.delete(`/traits/values/${valueId}`).then(r => r.data);

// Generation
export const generateFal = (data) => api.post('/generate/fal', data).then(r => r.data);
export const uploadImage = (formData) =>
  api.post('/generate/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
export const composeNFT = (data) => api.post('/generate/compose', data).then(r => r.data);
export const bulkGenerate = (data) => api.post('/generate/bulk', data).then(r => r.data);
export const uploadDirectNFT = (formData) =>
  api.post('/generate/upload-direct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
export const bulkComposite = (formData) =>
  api.post('/generate/bulk-composite', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
export const bulkUploadNFTs = (formData, onProgress) =>
  api.post('/generate/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }).then(r => r.data);
export const getCollectionNFTs = (collectionId) =>
  api.get(`/collections/${collectionId}/nfts`).then(r => r.data);
export const deleteNFT = (nftId) => api.delete(`/nfts/${nftId}`).then(r => r.data);
export const compositeImage = (formData) =>
  api.post('/generate/composite', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

// IPFS
export const uploadToIPFS = (collectionId) =>
  api.post(`/collections/${collectionId}/upload-ipfs`).then(r => r.data);
export const uploadDirectoryToIPFS = (collectionId) =>
  api.post(`/collections/${collectionId}/upload-ipfs-directory`).then(r => r.data);

// Deploy
export const deployContract = (collectionId, data) =>
  api.post(`/collections/${collectionId}/deploy`, data).then(r => r.data);
export const recallNFTs = (collectionId) =>
  api.post(`/collections/${collectionId}/recall`).then(r => r.data);
export const togglePause = (collectionId, data) =>
  api.post(`/collections/${collectionId}/pause`, data).then(r => r.data);
export const withdrawFunds = (collectionId) =>
  api.post(`/collections/${collectionId}/withdraw`).then(r => r.data);

// Mint page
export const getMintData = (brandSlug, collectionSlug) =>
  api.get(`/mint/${brandSlug}/${collectionSlug}`).then(r => r.data);

// Wishlist
export const getWishlistCounts = (collectionId) =>
  api.get(`/collections/${collectionId}/wishlist`).then(r => r.data);
export const toggleWishlist = (collectionId, tokenId, action) =>
  api.post(`/collections/${collectionId}/wishlist/${tokenId}`, { action }).then(r => r.data);
export const getTopWishlisted = (collectionId) =>
  api.get(`/collections/${collectionId}/wishlist/top`).then(r => r.data);

// Allowlist / Merkle
export const generateMerkleRoot = (collectionId) =>
  api.post(`/collections/${collectionId}/allowlist/merkle`).then(r => r.data);
export const getMerkleProof = (collectionId, walletAddress) =>
  api.get(`/collections/${collectionId}/allowlist/proof/${walletAddress}`).then(r => r.data);

// Kling Video Generation
export const generateNftVideo = (nftId, prompt, options = {}) =>
  api.post('/generate/video', {
    nft_id: nftId,
    prompt,
    duration: options.duration || '5',
    mode: options.mode || 'std',
    model: options.model || 'kling-v3',
  }).then(r => r.data);

export const submitVideoTask = (nftId, prompt, options = {}) =>
  api.post('/generate/video/submit', {
    nft_id: nftId,
    prompt,
    duration: options.duration || '5',
    mode: options.mode || 'std',
    model: options.model || 'kling-v3',
  }).then(r => r.data);

export const checkVideoStatus = (taskId) =>
  api.get(`/generate/video/status/${taskId}`).then(r => r.data);

export const completeVideoTask = (nftId, taskId, videoUrl) =>
  api.post('/generate/video/complete', {
    nft_id: nftId,
    task_id: taskId,
    video_url: videoUrl,
  }).then(r => r.data);

export const batchGenerateVideos = (collectionId, prompt, options = {}) =>
  api.post('/generate/video/batch', {
    collection_id: collectionId,
    prompt,
    nft_ids: options.nftIds,
    duration: options.duration || '5',
    mode: options.mode || 'std',
    model: options.model || 'kling-v3',
  }).then(r => r.data);

// Video
export const uploadCollectionVideo = (collectionId, file) => {
  const formData = new FormData();
  formData.append('video', file);
  return api.post(`/collections/${collectionId}/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export default api;
