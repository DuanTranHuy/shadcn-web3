"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { NetworkIcon } from "@web3icons/react/dynamic";
import { Check, ChevronDown, RefreshCw, Globe } from "lucide-react";
import type { Chain } from "viem";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

type ChainIconProps = {
  chainId: number;
  size?: number;
  variant?: "branded" | "mono";
  className?: string;
};

function ChainIcon({ chainId, size = 16, variant = "branded", className }: ChainIconProps) {
  return (
    <NetworkIcon
      chainId={chainId}
      size={size}
      variant={variant}
      className={cn("shrink-0", className)}
      fallback={<Globe className={cn("shrink-0", className)} style={{ width: size, height: size }} />}
    />
  );
}

type NetworkSwitcherProps = {
  chains: readonly Chain[];
  className?: string;
  showLabel?: boolean;
  align?: "start" | "center" | "end";
};

function NetworkSwitcher({
  chains: allowedChains,
  className,
  showLabel = true,
  align = "end",
}: NetworkSwitcherProps) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) {
    return null;
  }

  const currentChain = chain;
  const isUnsupportedNetwork = currentChain && !allowedChains.find(c => c.id === currentChain.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            isUnsupportedNetwork && "border-destructive text-destructive",
            className
          )}
          disabled={isPending}
        >
          {isPending ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : currentChain ? (
            <ChainIcon chainId={currentChain.id} size={16} />
          ) : (
            <Globe className="size-4" />
          )}
          {showLabel && (
            <span className="max-w-24 truncate">
              {isUnsupportedNetwork
                ? "Unsupported"
                : currentChain?.name ?? "Select Network"}
            </span>
          )}
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allowedChains.map((network) => {
          const isCurrentNetwork = currentChain?.id === network.id;

          return (
            <DropdownMenuItem
              key={network.id}
              onClick={() => {
                if (!isCurrentNetwork) {
                  switchChain?.({ chainId: network.id });
                }
              }}
              className={cn(
                "gap-2 cursor-pointer",
                isCurrentNetwork && "bg-accent"
              )}
              disabled={isPending}
            >
              <ChainIcon chainId={network.id} size={16} />
              <span className="flex-1 truncate">
                {network.name}
              </span>
              {isCurrentNetwork && (
                <Check className="size-4 shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type NetworkOptionsProps = {
  chains: readonly Chain[];
  onNetworkChange?: (chainId: number) => void;
  className?: string;
};

function NetworkOptions({
  chains: allowedChains,
  onNetworkChange,
  className,
}: NetworkOptionsProps) {
  const { chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const availableNetworks = allowedChains.filter(
    (network) => network.id !== chain?.id
  );

  if (availableNetworks.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {availableNetworks.map((network) => {
        return (
          <Button
            key={network.id}
            variant="ghost"
            size="sm"
            className="justify-start gap-2"
            disabled={isPending}
            onClick={() => {
              switchChain?.({ chainId: network.id });
              onNetworkChange?.(network.id);
            }}
          >
            {isPending ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <ChainIcon chainId={network.id} size={16} />
            )}
            <span>Switch to {network.name}</span>
          </Button>
        );
      })}
    </div>
  );
}

function NetworkSwitcherSkeleton() {
  return <Skeleton className="h-8 w-32" />;
}

export {
  NetworkSwitcher,
  NetworkOptions,
  NetworkSwitcherSkeleton,
  ChainIcon,
  type NetworkSwitcherProps,
  type NetworkOptionsProps,
  type ChainIconProps,
};
