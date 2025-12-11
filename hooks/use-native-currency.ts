"use client";

import { useChainId, useChains, useConnection } from "wagmi";

/**
 * Native currency information
 */
export type NativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};

/**
 * Block explorer information
 */
export type BlockExplorer = {
  name: string;
  url: string;
};

const DEFAULT_NATIVE_CURRENCY: NativeCurrency = {
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
};

const DEFAULT_BLOCK_EXPLORER: BlockExplorer = {
  name: "Etherscan",
  url: "https://etherscan.io",
};

/**
 * Hook to get the native currency of the currently connected chain
 *
 * Uses wagmi as the single source of truth - no separate state management.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { symbol, name, decimals } = useNativeCurrency();
 *   return <span>{symbol}</span>; // "ETH", "BNB", "MATIC", etc.
 * }
 * ```
 */
export function useNativeCurrency(): NativeCurrency {
  const chainId = useChainId();
  const chains = useChains();

  const currentChain = chains.find((c) => c.id === chainId);

  return currentChain?.nativeCurrency ?? DEFAULT_NATIVE_CURRENCY;
}

/**
 * Hook to get the current chain with connection info, native currency, and explorer
 *
 * Combines useConnection with chain info for convenience.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address, isConnected, nativeCurrency, blockExplorer } = useCurrentChain();
 *   if (!isConnected) return <span>Not connected</span>;
 *   return (
 *     <a href={`${blockExplorer.url}/address/${address}`}>
 *       {nativeCurrency.symbol}
 *     </a>
 *   );
 * }
 * ```
 */
export function useCurrentChain() {
  const { address, isConnected, chain } = useConnection();
  const nativeCurrency = chain?.nativeCurrency ?? DEFAULT_NATIVE_CURRENCY;
  const blockExplorer = chain?.blockExplorers?.default ?? DEFAULT_BLOCK_EXPLORER;

  return {
    address,
    isConnected,
    chain,
    chainId: chain?.id,
    nativeCurrency,
    blockExplorer,
    isTestnet: chain?.testnet ?? false,
  };
}

/**
 * Helper to build explorer URLs
 */
export function getExplorerTxUrl(explorerUrl: string, hash: string): string {
  return `${explorerUrl}/tx/${hash}`;
}

export function getExplorerAddressUrl(explorerUrl: string, address: string): string {
  return `${explorerUrl}/address/${address}`;
}
