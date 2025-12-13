"use client";

import { useState } from "react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { BlockieAvatar } from "../address/blockie-avatar";
import { AccountModal } from "./account-modal";
import { ChainModal } from "./chain-modal";
import { ChevronDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Chain Switch Button
// ============================================================================

type ChainSwitchButtonProps = {
  chain: {
    id: number;
    hasIcon?: boolean;
    iconUrl?: string;
    iconBackground?: string;
    name?: string;
    unsupported?: boolean;
  };
  showName?: boolean;
  className?: string;
};

export function ChainSwitchButton({
  chain,
  showName = true,
  className,
}: ChainSwitchButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        type="button"
        variant={chain.unsupported ? "destructive" : "outline"}
        size="sm"
        className={cn(!chain.unsupported && "gap-1.5", className)}
      >
        {chain.unsupported ? (
          "Wrong network"
        ) : (
          <>
            {chain.hasIcon && chain.iconUrl && (
              <Image
                alt={chain.name ?? "Chain icon"}
                src={chain.iconUrl}
                width={16}
                height={16}
                className="size-4 rounded-full"
                style={{ background: chain.iconBackground }}
              />
            )}
            {showName && <span className="hidden sm:inline">{chain.name}</span>}
            <ChevronDown className="size-3 opacity-50" />
          </>
        )}
      </Button>
      <ChainModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

// ============================================================================
// Account Info Button
// ============================================================================

type AccountInfoButtonProps = {
  account: {
    address: string;
    displayName: string;
    displayBalance?: string;
    ensAvatar?: string | null;
  };
  showBalance?: boolean;
  className?: string;
};

export function AccountInfoButton({
  account,
  showBalance = true,
  className,
}: AccountInfoButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        type="button"
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
      >
        <BlockieAvatar
          address={account.address as `0x${string}`}
          ensImage={account.ensAvatar ?? undefined}
          size={20}
        />
        <span className="font-medium">{account.displayName}</span>
        {showBalance && account.displayBalance && (
          <span className="hidden text-muted-foreground sm:inline">
            ({account.displayBalance})
          </span>
        )}
      </Button>
      <AccountModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

// ============================================================================
// Connect Wallet Button
// ============================================================================

type ConnectWalletButtonProps = {
  openConnectModal: () => void;
  className?: string;
};

export function ConnectWalletButton({
  openConnectModal,
  className,
}: ConnectWalletButtonProps) {
  return (
    <Button onClick={openConnectModal} type="button" className={className}>
      <Wallet className="size-4" />
      Connect Wallet
    </Button>
  );
}

// ============================================================================
// Custom Connect Button (Composed)
// ============================================================================

type CustomConnectButtonProps = {
  showBalance?: boolean;
  showChainButton?: boolean;
  className?: string;
};

export function CustomConnectButton({
  showBalance = true,
  showChainButton = true,
  className,
}: CustomConnectButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            className={cn("flex items-center gap-2", className)}
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {!connected && (
              <ConnectWalletButton openConnectModal={openConnectModal} />
            )}

            {connected && chain.unsupported && (
              <ChainSwitchButton chain={chain} />
            )}

            {connected && !chain.unsupported && (
              <>
                {showChainButton && <ChainSwitchButton chain={chain} />}
                <AccountInfoButton
                  account={account}
                  showBalance={showBalance}
                />
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
