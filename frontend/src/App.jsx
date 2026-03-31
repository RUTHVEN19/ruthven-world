import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BrandManager from './pages/BrandManager';
import CollectionEditor from './pages/CollectionEditor';
import TraitMixer from './pages/TraitMixer';
import BulkUpload from './pages/BulkUpload';
import MintPage from './pages/MintPage';
import RuthvenWorld from './pages/RuthvenWorld';
import RuthvenGateway from './pages/RuthvenGateway';
import RuthvenStudio from './pages/RuthvenStudio';
import RuthvenSignal from './pages/RuthvenSignal';
import RuthvenArtist from './pages/RuthvenArtist';
import BatchStudio from './pages/BatchStudio';
import DronesWorld from './pages/drones/DronesWorld';
import DronesGateway from './pages/drones/DronesGateway';

function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center space-x-3">
              <img src="/logo.png" alt="Miss AL Simpson" className="h-10 w-auto" />
              <span className="font-bold text-lg tracking-tight">
                <span className="text-gray-400">NFT Studio</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ═══ RUTHVEN WORLD ═══ */}
      <Route path="/ruthven" element={<RuthvenWorld />}>
        <Route index element={<RuthvenGateway />} />
        <Route path="first-light" element={<MintPage />} />
        <Route path="studio" element={<RuthvenStudio />} />
        <Route path="artist" element={<RuthvenArtist />} />
        <Route path="signal" element={<RuthvenSignal />} />
      </Route>

      {/* ═══ DRONES OF SUBURBIA WORLD ═══ */}
      <Route path="/drones" element={<DronesWorld />}>
        <Route index element={<DronesGateway />} />
        <Route path="diamond-shop" element={<MintPage />} />
        <Route path="cinema" element={<MintPage />} />
        <Route path="gallery" element={<MintPage />} />
      </Route>

      {/* Legacy mint page route (still works) */}
      <Route path="/mint/:brandSlug/:collectionSlug" element={<MintPage />} />

      {/* Root redirects to Ruthven World public site */}
      <Route path="/" element={<Navigate to="/ruthven" replace />} />

      {/* Admin NFT Studio — accessible at /admin */}
      <Route path="/admin" element={<Layout><Dashboard /></Layout>} />
      <Route path="/brands/:brandId" element={<Layout><BrandManager /></Layout>} />
      <Route path="/brands/:brandId/collections/:collectionId" element={<Layout><CollectionEditor /></Layout>} />
      <Route path="/brands/:brandId/collections/:collectionId/traits" element={<Layout><TraitMixer /></Layout>} />
      <Route path="/brands/:brandId/collections/:collectionId/upload" element={<Layout><BulkUpload /></Layout>} />
      <Route path="/admin/batch-studio" element={<Layout><BatchStudio /></Layout>} />
    </Routes>
  );
}
