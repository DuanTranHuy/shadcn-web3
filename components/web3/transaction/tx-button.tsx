"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export type TxButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Whether transaction is pending */
    isPending?: boolean;
    /** Text to show while pending */
    pendingText?: string;
    /** Custom loading spinner */
    loadingSpinner?: React.ReactNode;
    /** Whether to show the loading spinner */
    showSpinner?: boolean;
    /** Use Slot for composition */
    asChild?: boolean;
  };

/**
 * Transaction button with loading states
 *
 * - Shows loading spinner during pending transactions
 * - Automatically disabled during pending state
 * - Prevents duplicate submissions
 *
 * @example
 * ```tsx
 * <TxButton
 *   isPending={tx.status === "pending"}
 *   pendingText="Sending..."
 *   onClick={handleSend}
 * >
 *   Send Transaction
 * </TxButton>
 * ```
 */
function TxButton({
  children,
  isPending = false,
  pendingText,
  loadingSpinner,
  showSpinner = true,
  disabled,
  className,
  variant,
  size,
  asChild,
  onClick,
  ...props
}: TxButtonProps) {
  // Prevent double-clicks during pending state
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isPending) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    },
    [isPending, onClick]
  );

  const spinner = loadingSpinner ?? (
    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
  );

  const buttonContent = isPending ? (
    <>
      {showSpinner && spinner}
      {pendingText ?? children}
    </>
  ) : (
    children
  );

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        isPending && "cursor-not-allowed",
        className
      )}
      disabled={disabled || isPending}
      onClick={handleClick}
      asChild={asChild}
      aria-busy={isPending}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}

export { TxButton };
