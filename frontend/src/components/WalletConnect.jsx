import { useWallet } from '../hooks/useWallet';

export default function WalletConnect() {
  const { isConnected, isConnecting, connect, disconnect, shortAddress } = useWallet();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="text-sm font-mono">{shortAddress}</span>
        </div>
        <button onClick={disconnect} className="text-sm text-gray-500 hover:text-white">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="btn-mint"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
