import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const connectWallet = async () => {
    if (connectors.length > 0) {
      try {
        connect({ connector: connectors[0] });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const getShortAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    address,
    isConnected,
    isConnecting,
    isReady,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    connectors
  };
}