import { useState, useEffect } from 'react';

function getTimeRemaining(targetDate) {
  const now = new Date();
  const diff = new Date(targetDate) - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export default function MintPhaseIndicator({
  mintPhase,
  presaleStart,
  presaleEnd,
  publicStart,
  isAllowlisted,
  walletConnected,
}) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const targets = {
      not_started: presaleStart || publicStart,
      presale: presaleEnd,
      between: publicStart,
    };
    const target = targets[mintPhase];
    if (!target) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(target);
      setCountdown(remaining || '');
      if (!remaining) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [mintPhase, presaleStart, presaleEnd, publicStart]);

  const phases = {
    not_started: {
      label: presaleStart ? 'Presale Starting Soon' : 'Mint Starting Soon',
      color: 'text-gray-400',
      bg: 'bg-gray-800',
      border: 'border-gray-700',
    },
    presale: {
      label: 'Presale Active',
      color: 'text-white',
      bg: 'bg-white/10',
      border: 'border-white/30',
    },
    between: {
      label: 'Public Mint Starting Soon',
      color: 'text-gray-400',
      bg: 'bg-gray-800',
      border: 'border-gray-700',
    },
    public: {
      label: 'Public Mint Open',
      color: 'text-white',
      bg: 'bg-white/10',
      border: 'border-white/30',
    },
    ended: {
      label: 'Mint Ended',
      color: 'text-gray-500',
      bg: 'bg-gray-900',
      border: 'border-gray-800',
    },
  };

  const phase = phases[mintPhase] || phases.public;

  return (
    <div className={`rounded-lg border ${phase.border} ${phase.bg} p-4 text-center`}>
      <div className={`font-semibold ${phase.color}`}>{phase.label}</div>

      {countdown && (
        <div className="text-2xl font-mono font-bold text-white mt-1">
          {countdown}
        </div>
      )}

      {mintPhase === 'presale' && walletConnected && (
        <div className="mt-2">
          {isAllowlisted ? (
            <span className="text-sm text-white">
              &#10003; Your wallet is on the allowlist
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              Your wallet is not on the allowlist
            </span>
          )}
        </div>
      )}

      {mintPhase === 'not_started' && (
        <div className="text-xs text-gray-500 mt-2">
          {presaleStart && `Presale: ${new Date(presaleStart).toLocaleString()}`}
          {publicStart && (
            <span className="block mt-0.5">
              Public: {new Date(publicStart).toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
