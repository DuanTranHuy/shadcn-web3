"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BLOCK_EXPLORERS: Record<number, { name: string; url: string }> = {
  1: { name: "Etherscan", url: "https://etherscan.io" },
  11155111: { name: "Sepolia Etherscan", url: "https://sepolia.etherscan.io" },
  137: { name: "Polygonscan", url: "https://polygonscan.com" },
  80002: { name: "Amoy Polygonscan", url: "https://amoy.polygonscan.com" },
  10: { name: "Optimism Explorer", url: "https://optimistic.etherscan.io" },
  11155420: { name: "Optimism Sepolia", url: "https://sepolia-optimism.etherscan.io" },
  42161: { name: "Arbiscan", url: "https://arbiscan.io" },
  421614: { name: "Arbitrum Sepolia", url: "https://sepolia.arbiscan.io" },
  8453: { name: "BaseScan", url: "https://basescan.org" },
  84532: { name: "Base Sepolia", url: "https://sepolia.basescan.org" },
  31337: { name: "Local Explorer", url: "" },
};

const txExplorerLinkVariants = cva(
  "inline-flex items-center gap-1.5 font-mono transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary hover:text-primary/80 hover:underline",
        muted: "text-muted-foreground hover:text-foreground",
        button: "",
      },
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

const iconSizeMap: Record<string, string> = {
  xs: "size-3",
  sm: "size-3.5",
  base: "size-4",
};

export type TxExplorerLinkProps = VariantProps<typeof txExplorerLinkVariants> & {
  /** Transaction hash */
  hash: `0x${string}`;
  /** Chain ID (defaults to connected chain) */
  chainId?: number;
  /** Custom block explorer URL (overrides default) */
  explorerUrl?: string;
  /** Show the explorer icon */
  showIcon?: boolean;
  /** Truncate the hash display */
  truncate?: boolean;
  /** Custom label (overrides hash display) */
  label?: string;
  /** Additional class names */
  className?: string;
};

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function getExplorerUrl(
  chainId: number | undefined,
  customUrl?: string
): { name: string; url: string } | null {
  if (customUrl) {
    return { name: "Explorer", url: customUrl };
  }

  if (!chainId) return null;

  return BLOCK_EXPLORERS[chainId] ?? null;
}

/**
 * Chain-aware block explorer link for transactions
 *
 * Automatically detects the current chain and generates the appropriate
 * explorer URL (Etherscan, BaseScan, etc.)
 *
 * @example
 * ```tsx
 * <TxExplorerLink hash="0x..." />
 * <TxExplorerLink hash="0x..." variant="button" />
 * <TxExplorerLink hash="0x..." label="View on Etherscan" />
 * ```
 */
function TxExplorerLink({
  hash,
  chainId: chainIdProp,
  explorerUrl,
  variant = "default",
  size = "sm",
  showIcon = true,
  truncate = true,
  label,
  className,
}: TxExplorerLinkProps) {
  const { chain } = useAccount();
  const chainId = chainIdProp ?? chain?.id;

  const explorer = getExplorerUrl(chainId, explorerUrl);
  const iconSize = iconSizeMap[size ?? "sm"];

  const displayText = label ?? (truncate ? truncateHash(hash) : hash);
  const txUrl = explorer?.url ? `${explorer.url}/tx/${hash}` : undefined;

  // Button variant
  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
        asChild
        disabled={!txUrl}
      >
        <a
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={!txUrl ? "pointer-events-none opacity-50" : undefined}
        >
          {showIcon && <ExternalLink className="size-4" />}
          {label ?? `View on ${explorer?.name ?? "Explorer"}`}
        </a>
      </Button>
    );
  }

  // No explorer available
  if (!txUrl) {
    return (
      <span
        className={cn(
          txExplorerLinkVariants({ size }),
          "text-muted-foreground cursor-not-allowed",
          className
        )}
      >
        {displayText}
      </span>
    );
  }

  return (
    <a
      href={txUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(txExplorerLinkVariants({ variant, size }), className)}
    >
      {displayText}
      {showIcon && <ExternalLink className={iconSize} />}
    </a>
  );
}

export {
  TxExplorerLink,
  txExplorerLinkVariants,
  BLOCK_EXPLORERS,
  getExplorerUrl,
};
