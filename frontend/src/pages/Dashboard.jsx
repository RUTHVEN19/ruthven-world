import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrands, createBrand } from '../utils/api';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', description: '' });
  const [themeColors, setThemeColors] = useState({
    primary_color: '#ffffff',
    secondary_color: '#000000',
    font_family: 'Inter',
  });

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setShowCreate(false);
      setNewBrand({ name: '', description: '' });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...newBrand,
      theme: themeColors,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">
              NFT Studio
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Manage your brands and NFT collections</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          + New Brand
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Brand</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., The Drones of Suburbia"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <input
                type="text"
                className="input"
                placeholder="Brand description..."
                value={newBrand.description}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={themeColors.primary_color}
                  onChange={(e) => setThemeColors({ ...themeColors, primary_color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  className="input"
                  value={themeColors.primary_color}
                  onChange={(e) => setThemeColors({ ...themeColors, primary_color: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Secondary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={themeColors.secondary_color}
                  onChange={(e) => setThemeColors({ ...themeColors, secondary_color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  className="input"
                  value={themeColors.secondary_color}
                  onChange={(e) => setThemeColors({ ...themeColors, secondary_color: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Brand'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading brands...</div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">&#127912;</div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No brands yet</h2>
          <p className="text-gray-500 mb-4">Create your first brand to start building NFT collections</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create Your First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link key={brand.id} to={`/brands/${brand.id}`} className="card group">
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${brand.theme?.primary_color || '#ffffff'}, ${brand.theme?.secondary_color || '#000000'})`,
                  }}
                >
                  {brand.name.charAt(0)}
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {brand.collection_count} collection{brand.collection_count !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-4 group-hover:text-gray-300 transition-colors">
                {brand.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
              <div className="mt-4 flex space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: brand.theme?.primary_color || '#ffffff' }}
                />
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: brand.theme?.secondary_color || '#000000' }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
