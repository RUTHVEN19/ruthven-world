import { useWallet } from '../hooks/useWallet';

export default function WalletConnect({ compact = false }) {
  const { isConnected, isConnecting, connect, disconnect, shortAddress } = useWallet();

  if (isConnected) {
    return (
      <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'}`}>
        <div className={`bg-gray-800 border border-gray-700 rounded flex items-center space-x-2 ${compact ? 'px-2 py-1' : 'px-4 py-2 rounded-lg'}`}>
          <div className={`rounded-full bg-white ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}></div>
          <span className={`font-mono ${compact ? 'text-xs' : 'text-sm'}`}>{shortAddress}</span>
        </div>
        <button
          onClick={disconnect}
          className={`text-gray-500 hover:text-white ${compact ? 'text-xs' : 'text-sm'}`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded border transition-all duration-300"
        style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', background: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
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
