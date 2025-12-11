"use client";

import * as React from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther, formatGwei } from "viem";
import { AlertTriangle, ArrowRight, Fuel, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Address } from "@/components/web3/address";
import { TxButton } from "./tx-button";
import type { TransactionConfig } from "@/hooks/use-transaction";

export type TxConfirmModalProps = {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Transaction configuration */
  config: TransactionConfig | null;
  /** Estimated gas amount */
  estimatedGas?: bigint;
  /** Gas price */
  gasPrice?: bigint;
  /** Estimated total gas cost */
  estimatedGasCost?: bigint;
  /** Whether gas is being estimated */
  isEstimatingGas?: boolean;
  /** Whether transaction is being sent */
  isPending?: boolean;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Additional content to show in the modal */
  children?: React.ReactNode;
};

function formatValue(value: bigint | undefined): string {
  if (value === undefined) return "0";
  return formatEther(value);
}

function GasEstimate({
  estimatedGas,
  gasPrice,
  estimatedGasCost,
  isLoading,
}: {
  estimatedGas?: bigint;
  gasPrice?: bigint;
  estimatedGasCost?: bigint;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm flex items-center gap-2">
          <Fuel className="size-4" />
          Estimated Gas Fee
        </span>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm flex items-center gap-2">
          <Fuel className="size-4" />
          Estimated Gas Fee
        </span>
        <span className="font-mono text-sm">
          {estimatedGasCost
            ? `~${parseFloat(formatEther(estimatedGasCost)).toFixed(6)} ETH`
            : "Unable to estimate"}
        </span>
      </div>
      {gasPrice && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Gas Price</span>
          <span className="font-mono">{formatGwei(gasPrice)} Gwei</span>
        </div>
      )}
      {estimatedGas && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Gas Limit</span>
          <span className="font-mono">{estimatedGas.toString()}</span>
        </div>
      )}
    </div>
  );
}

function InsufficientFundsWarning({
  balance,
  required,
}: {
  balance: bigint;
  required: bigint;
}) {
  if (balance >= required) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Insufficient funds</p>
        <p className="text-xs mt-1">
          You need {formatEther(required - balance)} more ETH to complete this
          transaction.
        </p>
      </div>
    </div>
  );
}

/**
 * Transaction confirmation modal
 *
 * Shows transaction details including:
 * - Recipient address
 * - Value being sent
 * - Estimated gas fees
 * - Balance check
 *
 * @example
 * ```tsx
 * <TxConfirmModal
 *   open={tx.status === "confirming"}
 *   onOpenChange={(open) => !open && tx.cancelTransaction()}
 *   config={tx.config}
 *   estimatedGasCost={sendTx.estimatedGasCost}
 *   isEstimatingGas={sendTx.isEstimatingGas}
 *   isPending={sendTx.isPending}
 *   onConfirm={handleConfirm}
 *   onCancel={tx.cancelTransaction}
 * />
 * ```
 */
function TxConfirmModal({
  open,
  onOpenChange,
  config,
  estimatedGas,
  gasPrice,
  estimatedGasCost,
  isEstimatingGas,
  isPending,
  onConfirm,
  onCancel,
  title = "Confirm Transaction",
  description = "Review the transaction details before proceeding.",
  children,
}: TxConfirmModalProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address && open,
    },
  });

  const totalCost = React.useMemo(() => {
    const value = config?.value ?? BigInt(0);
    const gas = estimatedGasCost ?? BigInt(0);
    return value + gas;
  }, [config?.value, estimatedGasCost]);

  const hasInsufficientFunds =
    balance && totalCost > BigInt(0) && balance.value < totalCost;

  const handleCancel = React.useCallback(() => {
    onCancel();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction details */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            {/* From -> To */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <Address
                  address={address}
                  size="sm"
                  showAvatar={false}
                  disableAddressLink
                  disableCopy
                />
              </div>
              <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <Address
                  address={config.to}
                  size="sm"
                  showAvatar={false}
                  disableAddressLink
                  disableCopy
                />
              </div>
            </div>

            <Separator />

            {/* Value */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Wallet className="size-4" />
                Amount
              </span>
              <span className="font-mono font-medium">
                {formatValue(config.value)} ETH
              </span>
            </div>

            <Separator />

            {/* Gas estimate */}
            <GasEstimate
              estimatedGas={estimatedGas}
              gasPrice={gasPrice}
              estimatedGasCost={estimatedGasCost}
              isLoading={isEstimatingGas}
            />

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span className="font-mono">
                ~{parseFloat(formatEther(totalCost)).toFixed(6)} ETH
              </span>
            </div>
          </div>

          {/* Balance warning */}
          {hasInsufficientFunds && balance && (
            <InsufficientFundsWarning
              balance={balance.value}
              required={totalCost}
            />
          )}

          {/* Custom content */}
          {children}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <TxButton
            isPending={isPending}
            pendingText="Sending..."
            onClick={onConfirm}
            disabled={hasInsufficientFunds || isEstimatingGas}
          >
            Confirm
          </TxButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { TxConfirmModal };
