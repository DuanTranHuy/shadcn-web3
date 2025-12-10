"use client";

import * as React from "react";
import {
  useSendTransaction,
  useEstimateGas,
  useGasPrice,
  useAccount,
} from "wagmi";
import type { TransactionConfig } from "./use-transaction";

export type UseSendTxOptions = {
  /** Callback when transaction is sent successfully */
  onSuccess?: (hash: `0x${string}`) => void;
  /** Callback when transaction fails */
  onError?: (error: Error) => void;
};

export type SendTxParams = TransactionConfig;

export type UseSendTxReturn = {
  /** Send the transaction */
  sendTx: (params: SendTxParams) => Promise<`0x${string}` | undefined>;
  /** Whether a transaction is being sent */
  isPending: boolean;
  /** Whether gas estimation is loading */
  isEstimatingGas: boolean;
  /** The estimated gas for the transaction */
  estimatedGas: bigint | undefined;
  /** The current gas price */
  gasPrice: bigint | undefined;
  /** Estimated total gas cost (gas * gasPrice) */
  estimatedGasCost: bigint | undefined;
  /** Estimate gas for a transaction config */
  estimateGasForTx: (config: TransactionConfig) => void;
  /** Error from the last transaction attempt */
  error: Error | null;
  /** Reset error state */
  resetError: () => void;
};

/**
 * Hook for sending transactions to the blockchain
 *
 * Handles wallet interaction, gas estimation, and errors
 *
 * @example
 * ```tsx
 * const { sendTx, isPending, estimatedGasCost } = useSendTx({
 *   onSuccess: (hash) => console.log("Sent:", hash),
 *   onError: (error) => console.error("Failed:", error),
 * });
 *
 * // Send a transaction
 * await sendTx({ to: "0x...", value: parseEther("0.1") });
 * ```
 */
export function useSendTx(options?: UseSendTxOptions): UseSendTxReturn {
  const { onSuccess, onError } = options ?? {};
  const { isConnected } = useAccount();

  const [txConfig, setTxConfig] = React.useState<TransactionConfig | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const { sendTransactionAsync, isPending } = useSendTransaction();

  const { data: gasPrice } = useGasPrice({
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  const { data: estimatedGas, isLoading: isEstimatingGas } = useEstimateGas({
    to: txConfig?.to,
    value: txConfig?.value,
    data: txConfig?.data,
    query: {
      enabled: !!txConfig?.to && isConnected,
    },
  });

  const estimatedGasCost = React.useMemo(() => {
    if (estimatedGas && gasPrice) {
      return estimatedGas * gasPrice;
    }
    return undefined;
  }, [estimatedGas, gasPrice]);

  const estimateGasForTx = React.useCallback((config: TransactionConfig) => {
    setTxConfig(config);
  }, []);

  const sendTx = React.useCallback(
    async (params: SendTxParams): Promise<`0x${string}` | undefined> => {
      if (!isConnected) {
        const err = new Error("Wallet not connected");
        setError(err);
        onError?.(err);
        return undefined;
      }

      try {
        setError(null);

        const hash = await sendTransactionAsync({
          to: params.to,
          value: params.value,
          data: params.data,
          gas: params.gas,
          gasPrice: params.gasPrice,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        });

        onSuccess?.(hash);
        return hash;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Transaction failed");

        // Handle user rejection
        if (
          error.message.includes("User rejected") ||
          error.message.includes("user rejected") ||
          error.message.includes("User denied")
        ) {
          const rejectionError = new Error("Transaction rejected by user");
          setError(rejectionError);
          onError?.(rejectionError);
          return undefined;
        }

        setError(error);
        onError?.(error);
        return undefined;
      }
    },
    [isConnected, sendTransactionAsync, onSuccess, onError]
  );

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    sendTx,
    isPending,
    isEstimatingGas,
    estimatedGas,
    gasPrice,
    estimatedGasCost,
    estimateGasForTx,
    error,
    resetError,
  };
}
