import { base, baseSepolia, bsc, mainnet } from "wagmi/chains";
import type { Chain } from "viem";

/**
 * Extended chain type with additional display attributes
 */
export type ChainWithAttributes = Chain & {
  /** Color for UI display (hex) */
  color?: string;
  /** Whether this is a testnet */
  isTestnet?: boolean;
};

/**
 * Extra display data for networks (colors, icons, etc.)
 */
export const NETWORKS_EXTRA_DATA: Record<number, Partial<ChainWithAttributes>> = {
  // Ethereum Mainnet
  [mainnet.id]: {
    color: "#627EEA",
    isTestnet: false,
  },
  // Base
  [base.id]: {
    color: "#0052FF",
    isTestnet: false,
  },
  // Base Sepolia
  [baseSepolia.id]: {
    color: "#0052FF",
    isTestnet: true,
  },
  // BNB Smart Chain
  [bsc.id]: {
    color: "#F0B90B",
    isTestnet: false,
  },
};

/**
 * Supported networks configuration
 * Add or remove networks here to change what's available in the app
 */
export const TARGET_NETWORKS = [mainnet, baseSepolia, base, bsc] as const;

/**
 * Default network (first in the list)
 */
export const DEFAULT_NETWORK = TARGET_NETWORKS[0];

/**
 * Get chain with extended attributes
 */
export function getChainWithAttributes(chain: Chain): ChainWithAttributes {
  return {
    ...chain,
    ...NETWORKS_EXTRA_DATA[chain.id],
  };
}

/**
 * Get all supported chains with attributes
 */
export function getAllChainsWithAttributes(): ChainWithAttributes[] {
  return TARGET_NETWORKS.map(getChainWithAttributes);
}

/**
 * Find a chain by ID
 */
export function getChainById(chainId: number): ChainWithAttributes | undefined {
  const chain = TARGET_NETWORKS.find((c) => c.id === chainId);
  return chain ? getChainWithAttributes(chain) : undefined;
}
