"use client";

import * as React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { Check, ChevronDown, RefreshCw } from "lucide-react";
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

type ChainAttributes = {
  color: string | [string, string];
  icon?: React.ReactNode;
};

const NETWORK_COLORS: Record<number, ChainAttributes> = {
  1: { color: "#627EEA" }, // Mainnet
  11155111: { color: ["#5f4bb6", "#87ff65"] }, // Sepolia
  137: { color: "#8247E5" }, // Polygon
  80002: { color: "#8247E5" }, // Polygon Amoy
  10: { color: "#FF0420" }, // Optimism
  11155420: { color: "#FF0420" }, // Optimism Sepolia
  42161: { color: "#28A0F0" }, // Arbitrum
  421614: { color: "#28A0F0" }, // Arbitrum Sepolia
  8453: { color: "#0052FF" }, // Base
  84532: { color: "#0052FF" }, // Base Sepolia
  31337: { color: "#F6851B" }, // Hardhat/Localhost
};

function getNetworkColor(chainId: number, isDarkMode: boolean): string {
  const colorData = NETWORK_COLORS[chainId];
  if (!colorData) return isDarkMode ? "#ffffff" : "#000000";

  if (Array.isArray(colorData.color)) {
    return isDarkMode ? colorData.color[1] : colorData.color[0];
  }
  return colorData.color;
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
          ) : (
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor: currentChain
                  ? getNetworkColor(currentChain.id, false)
                  : undefined,
              }}
            />
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
          const networkColor = getNetworkColor(network.id, false);

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
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: networkColor }}
              />
              <span
                className="flex-1 truncate"
                style={{ color: isCurrentNetwork ? networkColor : undefined }}
              >
                {network.name}
              </span>
              {isCurrentNetwork && (
                <Check className="size-4 shrink-0" style={{ color: networkColor }} />
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
        const networkColor = getNetworkColor(network.id, false);

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
              <RefreshCw className="size-4" />
            )}
            <span>
              Switch to{" "}
              <span style={{ color: networkColor }}>{network.name}</span>
            </span>
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
  getNetworkColor,
  NETWORK_COLORS,
  type NetworkSwitcherProps,
  type NetworkOptionsProps,
};
