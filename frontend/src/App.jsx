import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

const isAndroidsDomain = ['porcelainandroid.com', 'www.porcelainandroid.com', 'porcelain-android.netlify.app'].includes(window.location.hostname);

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
const DroneContact = lazy(() => import('./pages/drones/DroneContact'));
const DronePrintShop = lazy(() => import('./pages/drones/DronePrintShop'));
const AndroidsWorld = lazy(() => import('./pages/androids/AndroidsWorld'));
const PorcelainAndroidsHome = lazy(() => import('./pages/androids/PorcelainAndroidsHome'));
const AndroidsOriginals = lazy(() => import('./pages/androids/AndroidsOriginals'));
const MangaMachine = lazy(() => import('./pages/androids/MangaMachine'));
const AndroidsNightclub = lazy(() => import('./pages/androids/AndroidsCinema'));
const AndroidsGraffiti = lazy(() => import('./pages/androids/AndroidsGraffiti'));
const AndroidsPrintShop = lazy(() => import('./pages/androids/AndroidsPrintShop'));
const AndroidsLore = lazy(() => import('./pages/androids/AndroidsLore'));
const RestrictedZone = lazy(() => import('./components/RestrictedZone'));
const AndroidsSocial = lazy(() => import('./pages/androids/AndroidsSocial'));
const AndroidsAbout = lazy(() => import('./pages/androids/AndroidsAbout'));

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

      {/* ═══ DIAMOND DRONES WORLD (diamonddrones.world) ═══ */}
      {!isAndroidsDomain && (
        <Route path="/" element={<ErrorBoundary><DronesWorld /></ErrorBoundary>}>
          <Route index element={<DiamondDronesHome />} />
          <Route path="vault" element={<DroneMuseum />} />
          <Route path="cinema" element={<DroneCinema3D />} />
          <Route path="studio" element={<DroneStudio />} />
          <Route path="lore" element={<DroneLore />} />
          <Route path="lounge" element={<DroneBoudoir />} />
          <Route path="prints" element={<DronePrintShop />} />
          <Route path="contact" element={<DroneContact />} />
        </Route>
      )}

      {/* ═══ PORCELAIN ANDROIDS WORLD ═══ */}
      {/* On porcelainandroid.com: mounted at / */}
      {isAndroidsDomain && (
        <Route path="/" element={<ErrorBoundary><AndroidsWorld /></ErrorBoundary>}>
          <Route index element={<PorcelainAndroidsHome />} />
          <Route path="originals" element={<RestrictedZone zoneName="PORCELAIN ANDROIDS" zoneNameJp="磁器"><AndroidsOriginals /></RestrictedZone>} />
          <Route path="manga-machine" element={<MangaMachine />} />
          <Route path="nightclub" element={<AndroidsNightclub />} />
          <Route path="graffiti" element={<AndroidsGraffiti />} />
          <Route path="prints" element={<RestrictedZone zoneName="PRINT ARCHIVE" zoneNameJp="印刷"><AndroidsPrintShop /></RestrictedZone>} />
          <Route path="lore" element={<AndroidsLore />} />
          <Route path="social" element={<AndroidsSocial />} />
          <Route path="about" element={<AndroidsAbout />} />
        </Route>
      )}
      {/* On diamonddrones.world: mounted at /androids */}
      {!isAndroidsDomain && (
        <Route path="/androids" element={<ErrorBoundary><AndroidsWorld /></ErrorBoundary>}>
          <Route index element={<PorcelainAndroidsHome />} />
          <Route path="originals" element={<RestrictedZone zoneName="PORCELAIN ANDROIDS" zoneNameJp="磁器"><AndroidsOriginals /></RestrictedZone>} />
          <Route path="manga-machine" element={<MangaMachine />} />
          <Route path="nightclub" element={<AndroidsNightclub />} />
          <Route path="graffiti" element={<AndroidsGraffiti />} />
          <Route path="prints" element={<RestrictedZone zoneName="PRINT ARCHIVE" zoneNameJp="印刷"><AndroidsPrintShop /></RestrictedZone>} />
          <Route path="lore" element={<AndroidsLore />} />
          <Route path="social" element={<AndroidsSocial />} />
          <Route path="about" element={<AndroidsAbout />} />
        </Route>
      )}

      {/* ═══ COMMISSION ROOMS ═══ */}
      <Route path="/commission/:roomId" element={<CommissionRoom />} />

      {/* Legacy mint page route (still works) */}
      <Route path="/mint/:brandSlug/:collectionSlug" element={<MintPage />} />

      {/* Legacy /drones URLs redirect to new paths */}
      <Route path="/drones" element={<Navigate to="/" replace />} />
      <Route path="/drones/*" element={<Navigate to="/" replace />} />

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
