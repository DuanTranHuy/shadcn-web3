"use client";

import * as React from "react";
import { isAddress, type Address } from "viem";
import { useEnsAddress, useEnsName, useEnsAvatar } from "wagmi";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { useDebounceValue } from "usehooks-ts";
import { Loader2 } from "lucide-react";
import { BaseInput } from "./base-input";
import { BlockieAvatar } from "@/components/web3/address";
import type { CommonInputProps } from "./utils";

export type AddressInputProps = CommonInputProps<Address | string> & {
  /** Chain ID for ENS resolution (defaults to mainnet) */
  ensChainId?: number;
  /** Debounce delay in ms for ENS resolution (default: 500) */
  debounceMs?: number;
};

/**
 * Safely normalize an ENS name, returning undefined if invalid
 */
function safeNormalize(name: string): string | undefined {
  try {
    return normalize(name);
  } catch {
    return undefined;
  }
}

/**
 * Check if a string looks like a valid ENS name (has TLD, not just trailing dot)
 */
function isValidEnsFormat(value: string): boolean {
  // Must contain a dot, not start or end with dot, and have content after the last dot
  const parts = value.split(".");
  return (
    parts.length >= 2 &&
    parts.every((part) => part.length > 0) &&
    !value.startsWith(".") &&
    !value.endsWith(".")
  );
}

/**
 * AddressInput Component
 *
 * An enhanced input for Ethereum addresses with ENS name resolution.
 *
 * Features:
 * - Accepts both Ethereum addresses and ENS names
 * - Automatically resolves ENS names to addresses
 * - Displays ENS avatars when available
 * - Shows loading states during resolution
 * - Displays blockie avatar for resolved addresses
 *
 * @example
 * ```tsx
 * const [address, setAddress] = useState<string>("");
 *
 * <AddressInput
 *   value={address}
 *   onChange={setAddress}
 *   placeholder="0x... or ENS name"
 * />
 * ```
 */
export function AddressInput({
  value,
  onChange,
  name,
  placeholder = "0x... or ENS name",
  disabled,
  ensChainId = mainnet.id,
  debounceMs = 500,
  className,
}: AddressInputProps) {
  const [inputValue, setInputValue] = React.useState(value?.toString() ?? "");
  const [enteredEnsName, setEnteredEnsName] = React.useState<string>();

  // Debounce the input value for ENS resolution
  const [debouncedInputValue] = useDebounceValue(inputValue, debounceMs);

  // Check if input looks like a valid ENS name (not incomplete like "huyduan.")
  const isEnsInput = isValidEnsFormat(debouncedInputValue) && !isAddress(debouncedInputValue);

  // Safely normalize the ENS name
  const normalizedEnsName = isEnsInput ? safeNormalize(debouncedInputValue) : undefined;

  // Resolve ENS name to address
  const {
    data: ensAddress,
    isLoading: isEnsAddressLoading,
    isError: isEnsAddressError,
  } = useEnsAddress({
    name: normalizedEnsName,
    chainId: ensChainId,
    query: {
      enabled: !!normalizedEnsName,
    },
  });

  // Resolve address to ENS name (for display when valid address is entered)
  const addressToResolve = isAddress(inputValue) ? inputValue : undefined;
  const {
    data: ensName,
    isLoading: isEnsNameLoading,
  } = useEnsName({
    address: addressToResolve as `0x${string}` | undefined,
    chainId: ensChainId,
    query: {
      enabled: !!addressToResolve,
    },
  });

  // Get ENS avatar
  const nameForAvatar = ensName ?? (isEnsInput && ensAddress ? debouncedInputValue : undefined);
  const normalizedAvatarName = nameForAvatar ? safeNormalize(nameForAvatar) : undefined;
  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: normalizedAvatarName,
    chainId: ensChainId,
    query: {
      enabled: !!normalizedAvatarName,
    },
  });

  // Derive the resolved address
  const resolvedAddress = React.useMemo(() => {
    if (isAddress(inputValue)) return inputValue as Address;
    if (ensAddress) return ensAddress;
    return undefined;
  }, [inputValue, ensAddress]);

  const isLoading = isEnsAddressLoading || isEnsNameLoading;
  const hasError = isEnsInput && isEnsAddressError;

  // When ENS resolves, update parent
  React.useEffect(() => {
    if (ensAddress) {
      setEnteredEnsName(inputValue);
      onChange(ensAddress);
    }
  }, [ensAddress, inputValue, onChange]);

  // When input changes
  const handleChange = React.useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      setEnteredEnsName(undefined);

      // If it's a valid address, notify parent immediately
      if (isAddress(newValue)) {
        onChange(newValue as Address);
      } else if (!newValue.includes(".")) {
        // Clear if not a potential ENS name
        onChange("" as Address);
      }
    },
    [onChange]
  );

  // Sync external value changes using ref to avoid dependency issues
  const previousValueRef = React.useRef(value);
  React.useEffect(() => {
    // Only sync if the external value actually changed (controlled component update)
    if (value !== previousValueRef.current) {
      previousValueRef.current = value;
      // Don't override if the new value matches what we resolved via ENS
      if (value !== ensAddress) {
        setInputValue(value?.toString() ?? "");
      }
    }
  }, [value, ensAddress]);

  // Determine what to show in prefix
  const prefixContent = React.useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 bg-muted rounded-l-md px-2 py-1 -ml-px border-r">
          <div className="size-6 rounded-full bg-muted-foreground/20 animate-pulse" />
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (ensName || enteredEnsName) {
      return (
        <div className="flex items-center gap-2 bg-muted rounded-l-md px-2 py-1 -ml-px border-r">
          {isEnsAvatarLoading ? (
            <div className="size-6 rounded-full bg-muted-foreground/20 animate-pulse" />
          ) : resolvedAddress ? (
            <BlockieAvatar
              address={resolvedAddress}
              ensImage={ensAvatar ?? undefined}
              size={24}
            />
          ) : null}
          <span className="text-sm text-muted-foreground">
            {enteredEnsName ?? ensName}
          </span>
        </div>
      );
    }

    return null;
  }, [isLoading, ensName, enteredEnsName, ensAvatar, isEnsAvatarLoading, resolvedAddress]);

  // Suffix shows blockie for resolved address
  const suffixContent = React.useMemo(() => {
    if (resolvedAddress && !ensName && !enteredEnsName) {
      return (
        <BlockieAvatar
          address={resolvedAddress}
          size={24}
        />
      );
    }
    return null;
  }, [resolvedAddress, ensName, enteredEnsName]);

  return (
    <BaseInput<string>
      name={name}
      value={enteredEnsName ? resolvedAddress ?? "" : inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      error={hasError}
      prefix={prefixContent}
      suffix={suffixContent}
      reFocus={hasError || ensName === null || ensAddress === null}
      className={className}
    />
  );
}
