import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// ── Lazy-loaded routes (code-split per page) ──
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BrandManager = lazy(() => import('./pages/BrandManager'));
const CollectionEditor = lazy(() => import('./pages/CollectionEditor'));
const TraitMixer = lazy(() => import('./pages/TraitMixer'));
const BulkUpload = lazy(() => import('./pages/BulkUpload'));
const MintPage = lazy(() => import('./pages/MintPage'));
const RuthvenWorld = lazy(() => import('./pages/RuthvenWorld'));
const RuthvenGateway = lazy(() => import('./pages/RuthvenGateway'));
const RuthvenStudio = lazy(() => import('./pages/RuthvenStudio'));
const RuthvenSignal = lazy(() => import('./pages/RuthvenSignal'));
const RuthvenArtist = lazy(() => import('./pages/RuthvenArtist'));
const BatchStudio = lazy(() => import('./pages/BatchStudio'));
const CommissionRoom = lazy(() => import('./pages/CommissionRoom'));
const CommissionAdmin = lazy(() => import('./pages/CommissionAdmin'));
const DiamondDronesHome = lazy(() => import('./pages/DiamondDronesHome'));
const DronesWorld = lazy(() => import('./pages/drones/DronesWorld'));
const DroneMuseum = lazy(() => import('./pages/drones/DroneMuseum'));
const DroneCinema3D = lazy(() => import('./pages/drones/DroneCinema3D'));
const DroneStudio = lazy(() => import('./pages/drones/DroneStudio'));
const DroneLore = lazy(() => import('./pages/drones/DroneLore'));
const DroneBoudoir = lazy(() => import('./pages/drones/DroneBoudoir'));
const DronePrintShop = lazy(() => import('./pages/drones/DronePrintShop'));
const DroneDownloads = lazy(() => import('./pages/drones/DroneDownloads'));

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
              <Link to="/admin/commissions" className="text-gray-400 hover:text-white transition-colors text-sm">
                Commissions
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
    <Routes>
      {/* ═══ RUTHVEN WORLD ═══ */}
      <Route path="/ruthven" element={<RuthvenWorld />}>
        <Route index element={<RuthvenGateway />} />
        <Route path="first-light" element={<MintPage />} />
        <Route path="studio" element={<RuthvenStudio />} />
        <Route path="artist" element={<RuthvenArtist />} />
        <Route path="signal" element={<RuthvenSignal />} />
      </Route>

      {/* ═══ DRONES OF SUBURBIA WORLD ═══
           Drops mint externally on OpenSea (Diamond Drones, Drone Blondes)
           and Manifold (Album). Each drop is showcased in its corresponding
           gallery zone (Vault / Drone Blondes / Studio) with mint CTAs that
           link out. Cinema is content-only (the 4 films). */}
      <Route path="/drones" element={<ErrorBoundary><DronesWorld /></ErrorBoundary>}>
        <Route index element={<DiamondDronesHome />} />
        <Route path="vault" element={<DroneMuseum />} />
        <Route path="cinema" element={<DroneCinema3D />} />
        <Route path="studio" element={<DroneStudio />} />
        <Route path="lore" element={<DroneLore />} />
        <Route path="lounge" element={<DroneBoudoir />} />
        <Route path="prints" element={<DronePrintShop />} />
        <Route path="downloads" element={<DroneDownloads />} />
      </Route>

      {/* ═══ COMMISSION ROOMS ═══ */}
      <Route path="/commission/:roomId" element={<CommissionRoom />} />

      {/* Legacy mint page route (still works) */}
      <Route path="/mint/:brandSlug/:collectionSlug" element={<MintPage />} />

      {/* Root redirects to the world */}
      <Route path="/" element={<Navigate to="/drones" replace />} />

      {/* Admin NFT Studio — accessible at /admin */}
      <Route path="/admin" element={<Layout><Dashboard /></Layout>} />
      <Route path="/brands/:brandId" element={<Layout><BrandManager /></Layout>} />
      <Route path="/brands/:brandId/collections/:collectionId" element={<Layout><CollectionEditor /></Layout>} />
      <Route path="/brands/:brandId/collections/:collectionId/traits" element={<Layout><TraitMixer /></Layout>} />
      <Route path="/brands/:brandId/collections/:collectionId/upload" element={<Layout><BulkUpload /></Layout>} />
      <Route path="/admin/batch-studio" element={<Layout><BatchStudio /></Layout>} />
      <Route path="/admin/commissions" element={<Layout><CommissionAdmin /></Layout>} />
    </Routes>
    </Suspense>
  );
}
