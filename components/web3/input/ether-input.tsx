"use client";

import * as React from "react";
import { parseEther, formatEther } from "viem";
import { useBalance } from "wagmi";
import { useCurrentChain } from "@/hooks/use-native-currency";
import { TokenIcon } from "@web3icons/react/dynamic";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseInput } from "./base-input";
import { SIGNED_NUMBER_REGEX, MAX_DECIMALS_ETH } from "./utils";
import type { CommonInputProps } from "./utils";

type NativeTokenIconProps = {
  symbol: string;
  size?: number;
  variant?: "branded" | "mono";
  className?: string;
};

function NativeTokenIcon({ symbol, size = 16, variant = "branded", className }: NativeTokenIconProps) {
  return (
    <TokenIcon
      symbol={symbol}
      size={size}
      variant={variant}
      className={cn("shrink-0", className)}
      fallback={<Coins className={cn("shrink-0", className)} size={size} />}
    />
  );
}

export type NativeCurrencyInputProps = Omit<CommonInputProps<string>, "value"> & {
  /** Value in native currency (as string) */
  value?: string;
  /** Show max balance button */
  showMaxButton?: boolean;
  /** Callback with parsed value in wei */
  onValueChange?: (valueInWei: bigint | undefined) => void;
};

/**
 * @deprecated Use NativeCurrencyInput instead
 */
export type EtherInputProps = NativeCurrencyInputProps;

/**
 * NativeCurrencyInput Component
 *
 * An input component for entering native currency values (ETH, MATIC, etc.).
 * Automatically displays the correct currency symbol based on connected chain.
 *
 * Features:
 * - Validates decimal input
 * - Optional max balance button
 * - Converts between native currency string and wei
 * - Displays current balance with correct currency symbol
 * - Supports all EVM chains (Ethereum, Polygon, Arbitrum, etc.)
 *
 * @example
 * ```tsx
 * const [amount, setAmount] = useState("");
 *
 * <NativeCurrencyInput
 *   value={amount}
 *   onChange={setAmount}
 *   showMaxButton
 *   onValueChange={(wei) => console.log("Wei:", wei)}
 * />
 * ```
 */
export function NativeCurrencyInput({
  value = "",
  onChange,
  onValueChange,
  name,
  placeholder = "0.0",
  disabled,
  showMaxButton = true,
  className,
}: NativeCurrencyInputProps) {
  const { address, isConnected, nativeCurrency } = useCurrentChain();

  const { data: balance } = useBalance({
    address,
    query: {
      enabled: isConnected,
    },
  });

  const [error, setError] = React.useState(false);

  // Parse value to wei when it changes
  React.useEffect(() => {
    if (!value || value === "") {
      onValueChange?.(undefined);
      setError(false);
      return;
    }

    try {
      const wei = parseEther(value);
      onValueChange?.(wei);
      setError(false);
    } catch {
      onValueChange?.(undefined);
      setError(true);
    }
  }, [value, onValueChange]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      // Allow empty
      if (!newValue) {
        onChange("");
        return;
      }

      // Validate number format
      if (!SIGNED_NUMBER_REGEX.test(newValue)) {
        return;
      }

      // Limit decimal places
      const parts = newValue.split(".");
      if (parts[1] && parts[1].length > MAX_DECIMALS_ETH) {
        return;
      }

      // Don't allow negative values
      if (newValue.startsWith("-")) {
        return;
      }

      onChange(newValue);
    },
    [onChange]
  );

  const handleMaxClick = React.useCallback(() => {
    if (balance) {
      const maxValue = formatEther(balance.value);
      onChange(maxValue);
    }
  }, [balance, onChange]);

  const prefix = (
    <div className="flex items-center gap-2 bg-muted rounded-l-md px-2 py-1 -ml-px border-r">
      <NativeTokenIcon symbol={nativeCurrency.symbol} size={24} />
      <span className="text-sm text-muted-foreground font-medium">{nativeCurrency.symbol}</span>
    </div>
  );

  const suffix = React.useMemo(() => {
    if (!showMaxButton || !balance || !isConnected) return null;

    return (
      <button
        type="button"
        onClick={handleMaxClick}
        disabled={disabled}
        className="text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        MAX
      </button>
    );
  }, [showMaxButton, balance, isConnected, disabled, handleMaxClick]);

  return (
    <div className="space-y-1">
      <BaseInput<string>
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        prefix={prefix}
        suffix={suffix}
        className={className}
      />
      {balance && isConnected && (
        <p className="text-xs text-muted-foreground text-right">
          Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {nativeCurrency.symbol}
        </p>
      )}
    </div>
  );
}

/**
 * @deprecated Use NativeCurrencyInput instead
 */
export const EtherInput = NativeCurrencyInput;
