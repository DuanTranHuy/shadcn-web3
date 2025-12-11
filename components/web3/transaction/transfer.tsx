"use client";

import * as React from "react";
import { isAddress, type Address } from "viem";
import { useCurrentChain } from "@/hooks/use-native-currency";
import { Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TxButton } from "./tx-button";
import { TxConfirmModal } from "./tx-confirm-modal";
import { TxStatusModal } from "./tx-status-modal";
import { AddressInput, NativeCurrencyInput } from "@/components/web3/input";
import { useTransaction } from "@/hooks/use-transaction";
import { useSendTx } from "@/hooks/use-send-tx";
import { useWaitForReceipt } from "@/hooks/use-wait-for-receipt";

export type TransferProps = {
  /** Optional className for styling */
  className?: string;
};

/**
 * Transfer component for sending ETH to another address
 *
 * Features:
 * - Address input with ENS support
 * - Amount input with balance display
 * - Gas estimation
 * - Transaction confirmation modal
 * - Transaction status tracking
 *
 * @example
 * ```tsx
 * <Transfer />
 * ```
 */
export function Transfer({ className }: TransferProps) {
  const { isConnected, nativeCurrency } = useCurrentChain();

  const [toAddress, setToAddress] = React.useState<Address | string>("");
  const [amount, setAmount] = React.useState("");
  const [amountInWei, setAmountInWei] = React.useState<bigint | undefined>();

  const tx = useTransaction();
  const sendTx = useSendTx({
    onSuccess: (hash) => {
      tx.setTransactionHash(hash);
    },
    onError: (error) => {
      tx.setError(error);
    },
  });

  const { confirmationCount } = useWaitForReceipt({
    hash: tx.hash,
    onSuccess: () => {
      tx.setSuccess(1);
      setToAddress("");
      setAmount("");
      setAmountInWei(undefined);
    },
    onError: (error) => {
      tx.setError(error);
    },
  });

  const canSubmit = React.useMemo(() => {
    return (
      isConnected &&
      toAddress &&
      isAddress(toAddress) &&
      amountInWei &&
      amountInWei > BigInt(0)
    );
  }, [isConnected, toAddress, amountInWei]);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || !amountInWei) return;

      try {
        tx.requestConfirmation({
          to: toAddress as `0x${string}`,
          value: amountInWei,
        });
        sendTx.estimateGasForTx({
          to: toAddress as `0x${string}`,
          value: amountInWei,
        });
      } catch (err) {
        console.error("Failed to prepare transaction:", err);
      }
    },
    [canSubmit, toAddress, amountInWei, tx, sendTx]
  );

  const handleConfirm = React.useCallback(async () => {
    if (!tx.config) return;
    tx.confirmTransaction();
    await sendTx.sendTx(tx.config);
  }, [tx, sendTx]);

  const handleStatusClose = React.useCallback(() => {
    tx.reset();
    sendTx.resetError();
  }, [tx, sendTx]);

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={className}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to-address">Recipient Address</Label>
            <AddressInput
              name="to-address"
              value={toAddress}
              onChange={setToAddress}
              placeholder="0x... or ENS name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <NativeCurrencyInput
              name="amount"
              value={amount}
              onChange={setAmount}
              onValueChange={setAmountInWei}
              showMaxButton
            />
          </div>

          <TxButton
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            isPending={tx.isLoading}
            pendingText="Processing..."
          >
            <Send className="size-4 mr-2" />
            Send {nativeCurrency.symbol}
          </TxButton>
        </div>
      </form>

      <TxConfirmModal
        open={tx.status === "confirming"}
        onOpenChange={(open) => !open && tx.cancelTransaction()}
        config={tx.config}
        estimatedGas={sendTx.estimatedGas}
        gasPrice={sendTx.gasPrice}
        estimatedGasCost={sendTx.estimatedGasCost}
        isEstimatingGas={sendTx.isEstimatingGas}
        isPending={sendTx.isPending}
        onConfirm={handleConfirm}
        onCancel={tx.cancelTransaction}
        title="Confirm Transfer"
        description={`Review the details before sending ${nativeCurrency.symbol}.`}
      />

      <TxStatusModal
        open={tx.status === "pending" || tx.status === "success" || tx.status === "error"}
        onOpenChange={(open) => !open && handleStatusClose()}
        status={tx.status}
        hash={tx.hash}
        error={tx.error}
        confirmations={confirmationCount}
        canRetry={tx.canRetry}
        onRetry={tx.canRetry ? tx.retry : undefined}
        onClose={handleStatusClose}
      />
    </>
  );
}
