"use client";

import { useCallback } from "react";
import { useAccount, useBalance, useDisconnect, useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { useCopyToClipboard } from "usehooks-ts";
import { Check, Copy, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { BlockieAvatar } from "../address/blockie-avatar";
import { cn, truncateAddress, formatBalance } from "@/lib/utils";

type AccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AccountContent({
  address,
  ensName,
  balance,
  chain,
  copied,
  addressExplorerLink,
  onCopy,
  onDisconnect,
}: {
  address: `0x${string}`;
  ensName?: string | null;
  balance?: { value: bigint; decimals: number; symbol: string };
  chain?: { name?: string };
  copied: boolean;
  addressExplorerLink?: string;
  onCopy: () => void;
  onDisconnect: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 py-4">
        {/* Avatar */}
        <BlockieAvatar address={address} size={80} className="rounded-full" />

        {/* Name / Address */}
        <div className="flex flex-col items-center gap-1">
          {ensName && (
            <span className="text-lg font-semibold">{ensName}</span>
          )}
          <span
            className={cn(
              "font-mono text-muted-foreground",
              ensName ? "text-sm" : "text-base font-medium text-foreground"
            )}
          >
            {truncateAddress(address)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy Address
              </>
            )}
          </Button>

          {addressExplorerLink && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a
                href={addressExplorerLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Explorer
              </a>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Balance */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-muted-foreground">Balance</span>
        <span className="font-mono font-medium">
          {balance
            ? `${formatBalance(balance.value, balance.decimals)} ${balance.symbol}`
            : "—"}
        </span>
      </div>

      {/* Network */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-muted-foreground">Network</span>
        <span className="font-medium">{chain?.name ?? "Unknown"}</span>
      </div>

      <Separator />

      {/* Disconnect */}
      <Button
        variant="destructive"
        onClick={onDisconnect}
        className="w-full gap-2"
      >
        <LogOut className="size-4" />
        Disconnect
      </Button>
    </>
  );
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [copiedValue, copy] = useCopyToClipboard();

  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
    query: { enabled: !!address },
  });

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const copied = copiedValue === address;

  const handleCopy = useCallback(() => {
    if (address) {
      copy(address);
    }
  }, [address, copy]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    onOpenChange(false);
  }, [disconnect, onOpenChange]);

  const explorerUrl = chain?.blockExplorers?.default?.url;
  const addressExplorerLink =
    explorerUrl && address ? `${explorerUrl}/address/${address}` : undefined;

  if (!address) return null;

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Account">
      <AccountContent
        address={address}
        ensName={ensName}
        balance={balance}
        chain={chain}
        copied={copied}
        addressExplorerLink={addressExplorerLink}
        onCopy={handleCopy}
        onDisconnect={handleDisconnect}
      />
    </ResponsiveModal>
  );
}
