import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatBalance(value: bigint, decimals: number, precision = 4): string {
  const formatted = Number(value) / Math.pow(10, decimals);
  return formatted.toFixed(precision).replace(/\.?0+$/, "");
}
