import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface DatasetAccess {
  datasetId: string;
  ipfsHash: string;
  decryptionKey?: string;
  accessUrl: string;
  expiresAt?: Date;
  downloadCount: number;
  maxDownloads?: number;
}

export function useDataAccess() {
  const { address, isConnected } = useAccount();
  const [accessData, setAccessData] = useState<DatasetAccess[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate access credentials after successful purchase
  const generateAccess = useCallback(async (
    datasetId: string,
    ipfsHash: string
  ): Promise<DatasetAccess | null> => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would:
      // 1. Verify the purchase on-chain
      // 2. Generate a unique decryption key
      // 3. Create a time-limited access URL
      // 4. Store access records in a secure backend

      // Simulate API call to generate access
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock decryption key generation
      const decryptionKey = `key_${datasetId}_${address}_${Date.now()}`;

      // Create access URL (in real app, this would be a secure gateway)
      const accessUrl = `https://ipfs.io/ipfs/${ipfsHash}?key=${encodeURIComponent(decryptionKey)}`;

      const newAccess: DatasetAccess = {
        datasetId,
        ipfsHash,
        decryptionKey,
        accessUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        downloadCount: 0,
        maxDownloads: 10
      };

      setAccessData(prev => {
        // Remove any existing access for this dataset and add the new one
        const filtered = prev.filter(access => access.datasetId !== datasetId);
        return [...filtered, newAccess];
      });

      setIsLoading(false);
      return newAccess;

    } catch (err: unknown) {
      console.error('Failed to generate access:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate access credentials');
      setIsLoading(false);
      return null;
    }
  }, [address, isConnected]);

  // Get access data for a specific dataset
  const getAccess = useCallback((datasetId: string): DatasetAccess | null => {
    return accessData.find(access => access.datasetId === datasetId) || null;
  }, [accessData]);

  // Download dataset (increments download count)
  const downloadDataset = useCallback(async (datasetId: string): Promise<boolean> => {
    const access = getAccess(datasetId);

    if (!access) {
      setError('No access credentials found for this dataset');
      return false;
    }

    if (access.maxDownloads && access.downloadCount >= access.maxDownloads) {
      setError('Download limit reached for this dataset');
      return false;
    }

    if (access.expiresAt && new Date() > access.expiresAt) {
      setError('Access has expired for this dataset');
      return false;
    }

    try {
      // In a real implementation:
      // 1. Verify access is still valid on-chain
      // 2. Fetch and decrypt the data
      // 3. Increment download counter
      // 4. Log the download for analytics

      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update download count
      setAccessData(prev =>
        prev.map(item =>
          item.datasetId === datasetId
            ? { ...item, downloadCount: item.downloadCount + 1 }
            : item
        )
      );

      // Open download URL
      window.open(access.accessUrl, '_blank');

      return true;

    } catch (err: unknown) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
      return false;
    }
  }, [getAccess]);

  // Check if user has access to a dataset
  const hasAccess = useCallback((datasetId: string): boolean => {
    const access = getAccess(datasetId);

    if (!access) return false;

    // Check if access has expired
    if (access.expiresAt && new Date() > access.expiresAt) {
      return false;
    }

    return true;
  }, [getAccess]);

  // Get remaining downloads for a dataset
  const getRemainingDownloads = useCallback((datasetId: string): number | null => {
    const access = getAccess(datasetId);

    if (!access || !access.maxDownloads) return null;

    return Math.max(0, access.maxDownloads - access.downloadCount);
  }, [getAccess]);

  // Refresh access (useful for extending expired access)
  const refreshAccess = useCallback(async (datasetId: string): Promise<boolean> => {
    const existingAccess = getAccess(datasetId);

    if (!existingAccess) return false;

    const newAccess = await generateAccess(datasetId, existingAccess.ipfsHash);
    return newAccess !== null;
  }, [getAccess, generateAccess]);

  return {
    accessData,
    isLoading,
    error,
    generateAccess,
    getAccess,
    downloadDataset,
    hasAccess,
    getRemainingDownloads,
    refreshAccess
  };
}