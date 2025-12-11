"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrentChain, getExplorerTxUrl } from "@/hooks/use-native-currency";

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
  /** Custom block explorer URL (overrides chain's default) */
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
  explorerUrl: customExplorerUrl,
  variant = "default",
  size = "sm",
  showIcon = true,
  truncate = true,
  label,
  className,
}: TxExplorerLinkProps) {
  const { blockExplorer } = useCurrentChain();
  const iconSize = iconSizeMap[size ?? "sm"];

  // Use custom URL if provided, otherwise use chain's default explorer
  const explorerUrl = customExplorerUrl ?? blockExplorer.url;
  const explorerName = customExplorerUrl ? "Explorer" : blockExplorer.name;

  const displayText = label ?? (truncate ? truncateHash(hash) : hash);
  const txUrl = explorerUrl ? getExplorerTxUrl(explorerUrl, hash) : undefined;

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
          {label ?? `View on ${explorerName}`}
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

export { TxExplorerLink, txExplorerLinkVariants };
