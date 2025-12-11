"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { BaseInputProps } from "./utils";

/**
 * BaseInput Component
 *
 * A flexible input component used as the foundation for custom inputs
 * (e.g., EtherInput, AddressInput).
 *
 * Features:
 * - Supports prefix and suffix elements for icons or adornments
 * - Handles error and disabled states with visual feedback
 * - Can auto-focus and set cursor position at the end when `reFocus` is true
 *
 * @example
 * ```tsx
 * <BaseInput
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Enter value"
 *   prefix={<Icon />}
 *   error={hasError}
 * />
 * ```
 */
export function BaseInput<T extends { toString: () => string } | undefined = string>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
  reFocus,
  className,
}: BaseInputProps<T>) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange]
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (reFocus !== undefined) {
        e.currentTarget.setSelectionRange(
          e.currentTarget.value.length,
          e.currentTarget.value.length
        );
      }
    },
    [reFocus]
  );

  React.useEffect(() => {
    if (reFocus) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [reFocus]);

  return (
    <div
      className={cn(
        "flex items-center border rounded-md bg-background transition-colors",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        error && "border-destructive focus-within:ring-destructive/50",
        disabled && "opacity-50 cursor-not-allowed",
        !error && !disabled && "border-input",
        className
      )}
    >
      {prefix && (
        <div className="flex items-center pl-1 text-muted-foreground">
          {prefix}
        </div>
      )}
      <input
        ref={inputRef}
        name={name}
        value={value?.toString() ?? ""}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          "flex-1 h-9 px-3 py-1 bg-transparent text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none",
          "disabled:cursor-not-allowed",
          prefix && "pl-2",
          suffix && "pr-2"
        )}
      />
      {suffix && (
        <div className="flex items-center pr-3 text-muted-foreground">
          {suffix}
        </div>
      )}
    </div>
  );
}
