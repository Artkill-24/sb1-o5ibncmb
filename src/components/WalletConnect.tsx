import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { connectWallet, disconnectWallet } from '../utils/web3';

interface WalletConnectProps {
  address: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export function WalletConnect({ address, onConnect, onDisconnect }: WalletConnectProps) {
  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      onConnect(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      onDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (!window.ethereum) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Wallet className="w-5 h-5" />
          Install MetaMask
        </a>
      </div>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:inline">
          Connected as
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="Disconnect wallet"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
}