import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Data DAO',
  projectId: 'a2e7a700058c0ec2bf3705bb43a7c0f5', // Get this from WalletConnect Cloud
  chains: [mainnet, polygon, sepolia, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});