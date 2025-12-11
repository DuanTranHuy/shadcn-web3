import type { CSSProperties, ReactNode } from "react";

export type CommonInputProps<T = string> = {
  /** Current value of the input */
  value: T;
  /** Callback when value changes */
  onChange: (newValue: T) => void;
  /** Input name attribute */
  name?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: CSSProperties;
  /** Additional class names */
  className?: string;
};

export type BaseInputProps<T> = CommonInputProps<T> & {
  /** Whether input has an error */
  error?: boolean;
  /** Element to render before input */
  prefix?: ReactNode;
  /** Element to render after input */
  suffix?: ReactNode;
  /** Whether to refocus and set cursor at end */
  reFocus?: boolean;
};

/** Regex for validating signed numbers (positive/negative decimals) */
export const SIGNED_NUMBER_REGEX = /^-?\d*\.?\d*$/;

/** Maximum decimal places for USD values */
export const MAX_DECIMALS_USD = 2;

/** Maximum decimal places for ETH values */
export const MAX_DECIMALS_ETH = 18;
