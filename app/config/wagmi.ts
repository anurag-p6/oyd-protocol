import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, arbitrumSepolia, polygon, optimism, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Data DAO',
  projectId: 'a2e7a700058c0ec2bf3705bb43a7c0f5', // Get this from WalletConnect Cloud
  chains: [arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});