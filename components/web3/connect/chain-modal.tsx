"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { cn } from "@/lib/utils";
import { ChainIcon } from "../network/network-switcher";

type ChainModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChainInfo = {
  id: number;
  name: string;
};

function ChainContent({
  chains,
  currentChainId,
  pendingChainId,
  onSwitch,
}: {
  chains: ChainInfo[];
  currentChainId?: number;
  pendingChainId: number | null;
  onSwitch: (chainId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 py-2">
      {chains.map((network) => {
        const isCurrentNetwork = currentChainId === network.id;
        const isSwitching = pendingChainId === network.id;

        return (
          <Button
            key={network.id}
            variant={isCurrentNetwork ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-12",
              isCurrentNetwork && "bg-accent"
            )}
            disabled={pendingChainId !== null || isCurrentNetwork}
            onClick={() => onSwitch(network.id)}
          >
            {isSwitching ? (
              <RefreshCw className="size-5 animate-spin" />
            ) : (
              <ChainIcon chainId={network.id} size={20} />
            )}
            <span className="flex-1 text-left font-medium">{network.name}</span>
            {isCurrentNetwork && <Check className="size-5 text-green-500" />}
          </Button>
        );
      })}
    </div>
  );
}

export function ChainModal({ open, onOpenChange }: ChainModalProps) {
  const { chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const [pendingChainId, setPendingChainId] = useState<number | null>(null);

  const handleSwitch = (chainId: number) => {
    setPendingChainId(chainId);
    switchChain?.(
      { chainId },
      {
        onSuccess: () => {
          setPendingChainId(null);
          onOpenChange(false);
        },
        onError: () => {
          setPendingChainId(null);
        },
      }
    );
  };

  const chainsInfo: ChainInfo[] = chains.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Switch Network"
    >
      <ChainContent
        chains={chainsInfo}
        currentChainId={chain?.id}
        pendingChainId={pendingChainId}
        onSwitch={handleSwitch}
      />
    </ResponsiveModal>
  );
}
