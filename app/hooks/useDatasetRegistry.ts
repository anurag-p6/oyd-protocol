'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import DatasetRegistryABI from '@/app/contracts/DatasetRegistry.json';

// Replace with your deployed contract address
const DATASET_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_DATASET_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';

export interface DatasetMetadata {
  name: string;
  description: string;
  priceETH: string;
  priceUSDC: string;
  category: string;
}

export function useDatasetRegistry() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const registerDataset = async (ipfsHash: string, metadata: DatasetMetadata) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!ipfsHash) {
        throw new Error('IPFS hash is required');
      }

      // Validate contract address
      if (!DATASET_REGISTRY_ADDRESS || DATASET_REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('Dataset registry contract address not configured. Please set NEXT_PUBLIC_DATASET_REGISTRY_ADDRESS environment variable.');
      }

      // Validate price inputs
      if (!metadata.priceETH || isNaN(Number(metadata.priceETH)) || Number(metadata.priceETH) <= 0) {
        throw new Error('Invalid ETH price. Must be a positive number.');
      }

      if (!metadata.priceUSDC || isNaN(Number(metadata.priceUSDC)) || Number(metadata.priceUSDC) <= 0) {
        throw new Error('Invalid USDC price. Must be a positive number.');
      }

      // Convert prices to wei/smallest units
      const priceETHWei = parseEther(metadata.priceETH);
      const priceUSDCWei = parseUnits(metadata.priceUSDC, 6); // USDC has 6 decimals

      writeContract({
        address: DATASET_REGISTRY_ADDRESS as `0x${string}`,
        abi: DatasetRegistryABI.abi,
        functionName: 'registerDataset',
        args: [
          ipfsHash,
          metadata.name,
          metadata.description,
          priceETHWei,
          priceUSDCWei,
          metadata.category,
        ],
      });

      return true;
    } catch (err) {
      let errorMessage = 'Failed to register dataset';

      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction rejected by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (err.message.includes('gas')) {
          errorMessage = 'Gas estimation failed. Please try again.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const useGetDataset = (ipfsHash: string) => {
    return useReadContract({
      address: DATASET_REGISTRY_ADDRESS as `0x${string}`,
      abi: DatasetRegistryABI.abi,
      functionName: 'getDataset',
      args: [ipfsHash],
    });
  };

  const useGetAllDatasets = () => {
    return useReadContract({
      address: DATASET_REGISTRY_ADDRESS as `0x${string}`,
      abi: DatasetRegistryABI.abi,
      functionName: 'getAllDatasets',
    });
  };

  const useGetDatasetsByCompany = (companyAddress: string) => {
    return useReadContract({
      address: DATASET_REGISTRY_ADDRESS as `0x${string}`,
      abi: DatasetRegistryABI.abi,
      functionName: 'getDatasetsByCompany',
      args: [companyAddress],
    });
  };

  return {
    registerDataset,
    useGetDataset,
    useGetAllDatasets,
    useGetDatasetsByCompany,
    isLoading: isLoading || isWritePending || isConfirming,
    isConfirmed,
    error,
    transactionHash: hash,
  };
}