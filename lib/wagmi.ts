import { TARGET_NETWORKS } from "@/config/networks";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  baseAccount,
  injectedWallet,
  phantomWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { cookieStorage, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

// Wallets that require IndexedDB (WalletConnect-based)
const walletsUsingWalletConnect = [
  phantomWallet,
  rainbowWallet,
  walletConnectWallet,
];


export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: projectId,
  chains: TARGET_NETWORKS,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),

  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet,
        baseAccount,
        ...(typeof indexedDB !== 'undefined' ? walletsUsingWalletConnect : [phantomWallet]),
      ],
    },
  ],
});