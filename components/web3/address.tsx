"use client";

import * as React from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockieAvatar } from "./blockie-avatar";

const addressVariants = cva(
  "inline-flex items-center gap-2 font-mono",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
    },
    defaultVariants: {
      size: "base",
    },
  }
);

const avatarSizeMap: Record<NonNullable<VariantProps<typeof addressVariants>["size"]>, number> = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
};

const iconSizeMap: Record<NonNullable<VariantProps<typeof addressVariants>["size"]>, string> = {
  xs: "size-3",
  sm: "size-3.5",
  base: "size-4",
  lg: "size-4",
  xl: "size-5",
};

type AddressProps = VariantProps<typeof addressVariants> & {
  address?: `0x${string}`;
  ensName?: string;
  ensAvatar?: string;
  format?: "short" | "long";
  disableAddressLink?: boolean;
  disableCopy?: boolean;
  showAvatar?: boolean;
  blockExplorerUrl?: string;
  isLoading?: boolean;
  className?: string;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function AddressCopyButton({
  address,
  iconSize,
}: {
  address: string;
  iconSize: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className={cn(iconSize, "text-green-500")} />
          ) : (
            <Copy className={iconSize} />
          )}
          <span className="sr-only">Copy address</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {copied ? "Copied!" : "Copy address"}
      </TooltipContent>
    </Tooltip>
  );
}

function AddressLinkWrapper({
  children,
  href,
  disabled,
  iconSize,
}: {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  iconSize: string;
}) {
  if (disabled || !href) {
    return <>{children}</>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 hover:underline"
    >
      {children}
      <ExternalLink className={cn(iconSize, "text-muted-foreground")} />
    </a>
  );
}

function Address({
  address,
  ensName,
  ensAvatar,
  format = "short",
  size = "base",
  disableAddressLink = false,
  disableCopy = false,
  showAvatar = true,
  blockExplorerUrl,
  isLoading = false,
  className,
}: AddressProps) {
  const iconSize = iconSizeMap[size ?? "base"];
  const avatarSize = avatarSizeMap[size ?? "base"];

  if (isLoading) {
    return (
      <div className={cn(addressVariants({ size }), className)}>
        {showAvatar && <Skeleton className="size-6 rounded-full" />}
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!address) {
    return (
      <span className={cn(addressVariants({ size }), "text-muted-foreground", className)}>
        -
      </span>
    );
  }

  const displayText = ensName || (format === "short" ? truncateAddress(address) : address);
  const explorerLink = blockExplorerUrl
    ? `${blockExplorerUrl}/address/${address}`
    : undefined;

  return (
    <div className={cn(addressVariants({ size }), className)}>
      {showAvatar && (
        <BlockieAvatar
          address={address}
          ensImage={ensAvatar}
          size={avatarSize}
        />
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <AddressLinkWrapper
              href={explorerLink}
              disabled={disableAddressLink}
              iconSize={iconSize}
            >
              {displayText}
            </AddressLinkWrapper>
          </span>
        </TooltipTrigger>
        <TooltipContent className="font-mono text-xs">
          {address}
        </TooltipContent>
      </Tooltip>
      {!disableCopy && (
        <AddressCopyButton address={address} iconSize={iconSize} />
      )}
    </div>
  );
}

export { Address, addressVariants, type AddressProps };
