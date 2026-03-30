import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  getCollection, getTraits, createTraitCategory, deleteTraitCategory,
  reorderCategories, createTraitValue, deleteTraitValue, composeNFT,
} from '../utils/api';

export default function TraitMixer() {
  const { brandId, collectionId } = useParams();
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const [selectedTraits, setSelectedTraits] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingValueTo, setAddingValueTo] = useState(null);
  const [newValueName, setNewValueName] = useState('');
  const [newValueFile, setNewValueFile] = useState(null);

  const { data: collection } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => getCollection(collectionId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['traits', collectionId],
    queryFn: () => getTraits(collectionId),
  });

  const createCatMutation = useMutation({
    mutationFn: (name) => createTraitCategory(collectionId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traits', collectionId] });
      setNewCategoryName('');
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id) => deleteTraitCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['traits', collectionId] }),
  });

  const createValMutation = useMutation({
    mutationFn: ({ categoryId, formData }) => createTraitValue(categoryId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traits', collectionId] });
      setAddingValueTo(null);
      setNewValueName('');
      setNewValueFile(null);
    },
  });

  const deleteValMutation = useMutation({
    mutationFn: (id) => deleteTraitValue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['traits', collectionId] }),
  });

  const composeMutation = useMutation({
    mutationFn: () => {
      const trait_selections = Object.entries(selectedTraits).map(([catId, valId]) => ({
        category_id: parseInt(catId),
        value_id: valId,
      }));
      return composeNFT({ collection_id: parseInt(collectionId), trait_selections });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfts', collectionId] });
    },
  });

  // Canvas preview - draw selected trait layers
  const drawPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    const size = 20;
    for (let x = 0; x < canvas.width; x += size) {
      for (let y = 0; y < canvas.height; y += size) {
        ctx.fillStyle = (x + y) % (size * 2) === 0 ? '#1f2937' : '#111827';
        ctx.fillRect(x, y, size, size);
      }
    }

    // Draw layers in order
    for (const cat of categories) {
      const selectedValueId = selectedTraits[cat.id];
      if (!selectedValueId) continue;

      const value = cat.values.find(v => v.id === selectedValueId);
      if (!value) continue;

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = `/uploads/${value.image_path}`;
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        // Skip if image fails to load
      }
    }
  }, [categories, selectedTraits]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = [...categories];
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    reorderCategories(newOrder.map(c => c.id));
    queryClient.invalidateQueries({ queryKey: ['traits', collectionId] });
  };

  const handleAddValue = (categoryId) => {
    if (!newValueName || !newValueFile) return;
    const formData = new FormData();
    formData.append('value', newValueName);
    formData.append('image', newValueFile);
    createValMutation.mutate({ categoryId, formData });
  };

  return (
    <div>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white">Dashboard</Link>
        <span>/</span>
        <Link to={`/brands/${brandId}`} className="hover:text-white">{collection?.brand?.name}</Link>
        <span>/</span>
        <Link to={`/brands/${brandId}/collections/${collectionId}`} className="hover:text-white">
          {collection?.name}
        </Link>
        <span>/</span>
        <span className="text-white">Trait Mixer</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">Trait Mixer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trait categories and values */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add category */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              className="input"
              placeholder="New layer name (e.g., Background, Body, Eyes)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              onClick={() => newCategoryName && createCatMutation.mutate(newCategoryName)}
              className="btn-primary whitespace-nowrap"
              disabled={!newCategoryName}
            >
              Add Layer
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {categories.map((cat, index) => (
                    <Draggable key={cat.id} draggableId={String(cat.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`card ${snapshot.isDragging ? 'ring-2 ring-white' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div {...provided.dragHandleProps} className="cursor-grab text-gray-600 hover:text-gray-400">
                                &#9776;
                              </div>
                              <h3 className="font-semibold">{cat.name}</h3>
                              <span className="text-xs text-gray-500">
                                Layer {index + 1} &middot; {cat.values.length} values
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setAddingValueTo(addingValueTo === cat.id ? null : cat.id)}
                                className="text-xs btn-secondary"
                              >
                                + Add Value
                              </button>
                              <button
                                onClick={() => window.confirm(`Delete "${cat.name}" layer?`) && deleteCatMutation.mutate(cat.id)}
                                className="text-xs text-red-500 hover:text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Value thumbnails */}
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {cat.values.map(val => (
                              <div
                                key={val.id}
                                onClick={() => setSelectedTraits(prev => ({
                                  ...prev,
                                  [cat.id]: prev[cat.id] === val.id ? undefined : val.id,
                                }))}
                                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedTraits[cat.id] === val.id
                                    ? 'border-white ring-2 ring-white/30'
                                    : 'border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <img
                                  src={`/uploads/${val.image_path}`}
                                  alt={val.value}
                                  className="w-full aspect-square object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-xs truncate">
                                  {val.value}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteValMutation.mutate(val.id);
                                  }}
                                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add value form */}
                          {addingValueTo === cat.id && (
                            <div className="mt-3 flex items-end space-x-2 bg-gray-800 p-3 rounded-lg">
                              <div className="flex-1">
                                <label className="label">Trait Name</label>
                                <input
                                  type="text"
                                  className="input"
                                  placeholder="e.g., Red, Blue, Gold"
                                  value={newValueName}
                                  onChange={(e) => setNewValueName(e.target.value)}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="label">Layer Image (PNG)</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setNewValueFile(e.target.files[0])}
                                  className="input text-sm"
                                />
                              </div>
                              <button
                                onClick={() => handleAddValue(cat.id)}
                                className="btn-primary"
                                disabled={createValMutation.isPending}
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {categories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Add your first trait layer above (e.g., Background, Body, Accessories)
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="card sticky top-24">
            <h3 className="font-semibold mb-3">Live Preview</h3>
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              className="w-full aspect-square rounded-lg border border-gray-700"
            />
            <div className="mt-3 space-y-1">
              {categories.map(cat => {
                const selectedVal = cat.values.find(v => v.id === selectedTraits[cat.id]);
                return (
                  <div key={cat.id} className="flex justify-between text-sm">
                    <span className="text-gray-500">{cat.name}</span>
                    <span className="text-white">{selectedVal?.value || '(none)'}</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => composeMutation.mutate()}
              className="btn-primary w-full mt-4"
              disabled={composeMutation.isPending || Object.keys(selectedTraits).length === 0}
            >
              {composeMutation.isPending ? 'Saving...' : 'Save as NFT'}
            </button>
            {composeMutation.isSuccess && (
              <div className="text-sm text-gray-300 mt-2 text-center">
                NFT saved successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
