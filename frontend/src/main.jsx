import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { HelmetProvider } from 'react-helmet-async';
import { config } from './config/wagmiConfig';
import { WalletProvider } from './hooks/useWallet';
import App from './App';
import './index.css';
import './styles/drones-shared.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  // Note: StrictMode removed — React 18 StrictMode double-mount breaks
  // R3F Canvas initialization (render loop never starts after unmount/remount).
  // This is a known issue with @react-three/fiber + React 18 StrictMode.
  <HelmetProvider>
    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WalletProvider>
          <App />
        </WalletProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </WagmiProvider>
  </HelmetProvider>
);
