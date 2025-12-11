"use client";

import * as React from "react";
import { useWaitForTransactionReceipt, useBlockNumber } from "wagmi";
import type { TransactionReceipt } from "viem";

export type ReceiptStatus = "pending" | "success" | "reverted";

export type UseWaitForReceiptOptions = {
  /** Transaction hash to wait for */
  hash: `0x${string}` | undefined;
  /** Number of confirmations to wait for (default: 1) */
  confirmations?: number;
  /** Callback when receipt is received */
  onSuccess?: (receipt: TransactionReceipt) => void;
  /** Callback when transaction reverts */
  onError?: (error: Error) => void;
};

export type UseWaitForReceiptReturn = {
  /** The transaction receipt */
  receipt: TransactionReceipt | undefined;
  /** Whether waiting for receipt */
  isLoading: boolean;
  /** Whether transaction was successful */
  isSuccess: boolean;
  /** Whether transaction reverted */
  isReverted: boolean;
  /** Receipt status */
  status: ReceiptStatus;
  /** Number of confirmations */
  confirmationCount: number;
  /** Error if any */
  error: Error | null;
};

/**
 * Hook for waiting for transaction confirmation
 *
 * Returns receipt status and block confirmation count
 *
 * @example
 * ```tsx
 * const { status, confirmationCount, receipt } = useWaitForReceipt({
 *   hash: "0x...",
 *   confirmations: 2,
 *   onSuccess: (receipt) => console.log("Confirmed:", receipt),
 * });
 * ```
 */
export function useWaitForReceipt(
  options: UseWaitForReceiptOptions
): UseWaitForReceiptReturn {
  const { hash, confirmations = 1, onSuccess, onError } = options;

  const [confirmationCount, setConfirmationCount] = React.useState(0);
  const [hasNotified, setHasNotified] = React.useState(false);

  const {
    data: receipt,
    isLoading,
    isSuccess: receiptReceived,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations,
    query: {
      enabled: !!hash,
    },
  });

  const { data: currentBlockNumber } = useBlockNumber({
    watch: !!hash && !receipt,
    query: {
      enabled: !!hash && !receipt,
      refetchInterval: 3000, // Check every 3 seconds
    },
  });

  // Calculate confirmation count
  React.useEffect(() => {
    if (receipt && currentBlockNumber) {
      const txBlockNumber = receipt.blockNumber;
      const count = Number(currentBlockNumber - txBlockNumber) + 1;
      setConfirmationCount(Math.max(0, count));
    }
  }, [receipt, currentBlockNumber]);

  // Reset notification state when hash changes
  React.useEffect(() => {
    setHasNotified(false);
    setConfirmationCount(0);
  }, [hash]);

  // Handle success/error callbacks
  React.useEffect(() => {
    if (hasNotified || !receipt) return;

    if (receipt.status === "success") {
      setHasNotified(true);
      onSuccess?.(receipt);
    } else if (receipt.status === "reverted") {
      setHasNotified(true);
      onError?.(new Error("Transaction reverted"));
    }
  }, [receipt, hasNotified, onSuccess, onError]);

  const isSuccess = receiptReceived && receipt?.status === "success";
  const isReverted = receiptReceived && receipt?.status === "reverted";

  const status: ReceiptStatus = React.useMemo(() => {
    if (!hash || isLoading) return "pending";
    if (isReverted) return "reverted";
    if (isSuccess) return "success";
    return "pending";
  }, [hash, isLoading, isSuccess, isReverted]);

  const error = React.useMemo(() => {
    if (receiptError) return receiptError;
    if (isReverted) return new Error("Transaction reverted");
    return null;
  }, [receiptError, isReverted]);

  return {
    receipt,
    isLoading: isLoading && !!hash,
    isSuccess,
    isReverted,
    status,
    confirmationCount,
    error,
  };
}
