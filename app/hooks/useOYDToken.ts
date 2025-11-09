'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import OYDTokenABI from '@/app/contracts/OYDToken.json';

const OYD_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_OYD_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';

export function useOYDToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get token balance for an address
  const useGetBalance = (address: string) => {
    return useReadContract({
      address: OYD_TOKEN_ADDRESS as `0x${string}`,
      abi: OYDTokenABI.abi,
      functionName: 'balanceOf',
      args: [address],
    });
  };

  // Get token details
  const useGetTokenInfo = () => {
    const name = useReadContract({
      address: OYD_TOKEN_ADDRESS as `0x${string}`,
      abi: OYDTokenABI.abi,
      functionName: 'name',
    });

    const symbol = useReadContract({
      address: OYD_TOKEN_ADDRESS as `0x${string}`,
      abi: OYDTokenABI.abi,
      functionName: 'symbol',
    });

    const decimals = useReadContract({
      address: OYD_TOKEN_ADDRESS as `0x${string}`,
      abi: OYDTokenABI.abi,
      functionName: 'decimals',
    });

    const uploadReward = useReadContract({
      address: OYD_TOKEN_ADDRESS as `0x${string}`,
      abi: OYDTokenABI.abi,
      functionName: 'UPLOAD_REWARD',
    });

    return { name, symbol, decimals, uploadReward };
  };

  // Reward tokens to an address (only callable by authorized contracts)
  const rewardTokens = async (to: string, amount: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!OYD_TOKEN_ADDRESS || OYD_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('OYD Token contract address not configured. Please set NEXT_PUBLIC_OYD_TOKEN_ADDRESS environment variable.');
      }

      const amountWei = parseEther(amount);

      writeContract({
        address: OYD_TOKEN_ADDRESS as `0x${string}`,
        abi: OYDTokenABI.abi,
        functionName: 'rewardTokens',
        args: [to, amountWei, reason],
      });

      return true;
    } catch (err) {
      let errorMessage = 'Failed to reward tokens';

      if (err instanceof Error) {
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

  return {
    useGetBalance,
    useGetTokenInfo,
    rewardTokens,
    isLoading: isLoading || isWritePending || isConfirming,
    isConfirmed,
    error,
    transactionHash: hash,
  };
}