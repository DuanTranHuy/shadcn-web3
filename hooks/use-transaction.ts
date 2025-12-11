"use client";

import * as React from "react";

export type TransactionStatus =
  | "idle"
  | "confirming"
  | "pending"
  | "success"
  | "error";

export type TransactionState = {
  status: TransactionStatus;
  hash: `0x${string}` | undefined;
  error: Error | null;
  confirmations: number;
};

export type TransactionConfig = {
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

export type TransactionActions = {
  /** Open the confirmation modal */
  requestConfirmation: (config: TransactionConfig) => void;
  /** User confirmed, proceed with sending */
  confirmTransaction: () => void;
  /** Cancel the transaction */
  cancelTransaction: () => void;
  /** Set the transaction hash after sending */
  setTransactionHash: (hash: `0x${string}`) => void;
  /** Mark transaction as successful */
  setSuccess: (confirmations?: number) => void;
  /** Mark transaction as failed */
  setError: (error: Error) => void;
  /** Reset to idle state */
  reset: () => void;
  /** Retry the last failed transaction */
  retry: () => void;
};

export type UseTransactionReturn = TransactionState & TransactionActions & {
  /** The transaction config being processed */
  config: TransactionConfig | null;
  /** Whether user can retry the transaction */
  canRetry: boolean;
  /** Whether the transaction is in a loading state */
  isLoading: boolean;
};

const initialState: TransactionState = {
  status: "idle",
  hash: undefined,
  error: null,
  confirmations: 0,
};

type Action =
  | { type: "REQUEST_CONFIRMATION"; config: TransactionConfig }
  | { type: "CONFIRM" }
  | { type: "CANCEL" }
  | { type: "SET_HASH"; hash: `0x${string}` }
  | { type: "SET_SUCCESS"; confirmations: number }
  | { type: "SET_ERROR"; error: Error }
  | { type: "RESET" };

function transactionReducer(
  state: TransactionState & { config: TransactionConfig | null },
  action: Action
): TransactionState & { config: TransactionConfig | null } {
  switch (action.type) {
    case "REQUEST_CONFIRMATION":
      return {
        ...initialState,
        config: action.config,
        status: "confirming",
      };
    case "CONFIRM":
      return {
        ...state,
        status: "pending",
        error: null,
      };
    case "CANCEL":
      return {
        ...initialState,
        config: null,
      };
    case "SET_HASH":
      return {
        ...state,
        hash: action.hash,
        status: "pending",
      };
    case "SET_SUCCESS":
      return {
        ...state,
        status: "success",
        confirmations: action.confirmations,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
      };
    case "RESET":
      return {
        ...initialState,
        config: null,
      };
    default:
      return state;
  }
}

/**
 * Central controller hook for managing transaction lifecycle
 *
 * States: idle → confirming → pending → success / error
 *
 * @example
 * ```tsx
 * const tx = useTransaction();
 *
 * // Start a transaction flow
 * tx.requestConfirmation({ to: "0x...", value: parseEther("0.1") });
 *
 * // In confirmation modal
 * <button onClick={tx.confirmTransaction}>Confirm</button>
 * <button onClick={tx.cancelTransaction}>Cancel</button>
 * ```
 */
export function useTransaction(): UseTransactionReturn {
  const [state, dispatch] = React.useReducer(transactionReducer, {
    ...initialState,
    config: null,
  });

  const lastConfig = React.useRef<TransactionConfig | null>(null);

  const requestConfirmation = React.useCallback((config: TransactionConfig) => {
    lastConfig.current = config;
    dispatch({ type: "REQUEST_CONFIRMATION", config });
  }, []);

  const confirmTransaction = React.useCallback(() => {
    dispatch({ type: "CONFIRM" });
  }, []);

  const cancelTransaction = React.useCallback(() => {
    dispatch({ type: "CANCEL" });
  }, []);

  const setTransactionHash = React.useCallback((hash: `0x${string}`) => {
    dispatch({ type: "SET_HASH", hash });
  }, []);

  const setSuccess = React.useCallback((confirmations: number = 1) => {
    dispatch({ type: "SET_SUCCESS", confirmations });
  }, []);

  const setError = React.useCallback((error: Error) => {
    dispatch({ type: "SET_ERROR", error });
  }, []);

  const reset = React.useCallback(() => {
    lastConfig.current = null;
    dispatch({ type: "RESET" });
  }, []);

  const retry = React.useCallback(() => {
    if (lastConfig.current) {
      dispatch({ type: "REQUEST_CONFIRMATION", config: lastConfig.current });
    }
  }, []);

  const isLoading = state.status === "confirming" || state.status === "pending";
  const canRetry = state.status === "error" && lastConfig.current !== null;

  return {
    ...state,
    requestConfirmation,
    confirmTransaction,
    cancelTransaction,
    setTransactionHash,
    setSuccess,
    setError,
    reset,
    retry,
    canRetry,
    isLoading,
  };
}
