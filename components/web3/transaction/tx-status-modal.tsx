"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
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
import { TxExplorerLink } from "./tx-explorer-link";
import type { TransactionStatus } from "@/hooks/use-transaction";

export type TxStatusModalProps = {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Current transaction status */
  status: TransactionStatus;
  /** Transaction hash */
  hash?: `0x${string}`;
  /** Error message */
  error?: Error | null;
  /** Number of confirmations */
  confirmations?: number;
  /** Whether retry is available */
  canRetry?: boolean;
  /** Callback when user clicks retry */
  onRetry?: () => void;
  /** Callback when user clicks close/done */
  onClose?: () => void;
  /** Custom titles for each status */
  titles?: Partial<Record<TransactionStatus, string>>;
  /** Custom descriptions for each status */
  descriptions?: Partial<Record<TransactionStatus, string>>;
};

const defaultTitles: Record<TransactionStatus, string> = {
  idle: "Transaction",
  confirming: "Confirm in Wallet",
  pending: "Transaction Pending",
  success: "Transaction Successful",
  error: "Transaction Failed",
};

const defaultDescriptions: Record<TransactionStatus, string> = {
  idle: "",
  confirming: "Please confirm the transaction in your wallet.",
  pending: "Your transaction is being processed. This may take a moment.",
  success: "Your transaction has been confirmed on the blockchain.",
  error: "Something went wrong with your transaction.",
};

const statusIcons: Record<TransactionStatus, React.ReactNode> = {
  idle: null,
  confirming: (
    <div className="relative">
      <div className="size-16 rounded-full border-4 border-primary/20 animate-pulse" />
      <Loader2 className="size-8 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  ),
  pending: (
    <div className="relative">
      <div className="size-16 rounded-full border-4 border-yellow-500/20" />
      <div className="size-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin absolute top-0 left-0" />
      <Loader2 className="size-8 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  ),
  success: (
    <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center">
      <CheckCircle2 className="size-10 text-green-500" />
    </div>
  ),
  error: (
    <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
      <XCircle className="size-10 text-destructive" />
    </div>
  ),
};

function getErrorMessage(error: Error | null | undefined): string {
  if (!error) return "An unknown error occurred.";

  const message = error.message.toLowerCase();

  if (
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("rejected by user")
  ) {
    return "You rejected the transaction in your wallet.";
  }

  if (message.includes("insufficient funds")) {
    return "Insufficient funds to complete this transaction.";
  }

  if (message.includes("nonce too low")) {
    return "Transaction nonce conflict. Please try again.";
  }

  if (message.includes("gas")) {
    return "Gas estimation failed. The transaction may fail or require more gas.";
  }

  if (message.includes("reverted")) {
    return "The transaction was reverted by the contract.";
  }

  if (message.includes("timeout") || message.includes("timed out")) {
    return "The transaction request timed out. Please try again.";
  }

  // Return original message if no specific case matched
  return error.message;
}

/**
 * Transaction status modal
 *
 * Displays the current state of a transaction:
 * - Confirming: Waiting for wallet confirmation
 * - Pending: Transaction submitted, waiting for confirmation
 * - Success: Transaction confirmed
 * - Error: Transaction failed
 *
 * @example
 * ```tsx
 * <TxStatusModal
 *   open={tx.status !== "idle" && tx.status !== "confirming"}
 *   onOpenChange={(open) => !open && tx.reset()}
 *   status={tx.status}
 *   hash={tx.hash}
 *   error={tx.error}
 *   confirmations={receipt.confirmationCount}
 *   canRetry={tx.canRetry}
 *   onRetry={tx.retry}
 *   onClose={tx.reset}
 * />
 * ```
 */
function TxStatusModal({
  open,
  onOpenChange,
  status,
  hash,
  error,
  confirmations = 0,
  canRetry,
  onRetry,
  onClose,
  titles,
  descriptions,
}: TxStatusModalProps) {
  const title = titles?.[status] ?? defaultTitles[status];
  const description = descriptions?.[status] ?? defaultDescriptions[status];

  const handleClose = React.useCallback(() => {
    onClose?.();
    onOpenChange(false);
  }, [onClose, onOpenChange]);

  // Don't show modal in idle state
  if (status === "idle") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mb-4">{statusIcons[status]}</div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {status === "error" ? getErrorMessage(error) : description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction hash and explorer link */}
          {hash && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Transaction Hash
                </span>
                <TxExplorerLink hash={hash} size="xs" />
              </div>
              {status === "success" && confirmations > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Confirmations
                  </span>
                  <span className="text-sm font-mono text-green-500">
                    {confirmations} block{confirmations !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error details */}
          {status === "error" && error && (
            <details className="rounded-lg border bg-muted/30 p-4 text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Show error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-xs text-destructive font-mono">
                {error.message}
              </pre>
            </details>
          )}

          {/* Pending animation hint */}
          {status === "pending" && (
            <p className="text-center text-xs text-muted-foreground">
              Do not close this window while the transaction is processing.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {status === "error" && canRetry && (
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          )}

          {status === "pending" ? (
            <Button disabled className="flex-1">
              <Loader2 className="size-4 animate-spin mr-2" />
              Processing...
            </Button>
          ) : (
            <Button
              onClick={handleClose}
              variant={status === "success" ? "default" : "outline"}
              className="flex-1"
            >
              {status === "success" ? "Done" : "Close"}
            </Button>
          )}

          {hash && status !== "pending" && (
            <TxExplorerLink
              hash={hash}
              variant="button"
              label="View Transaction"
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { TxStatusModal, getErrorMessage };
