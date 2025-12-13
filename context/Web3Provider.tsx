"use client";

import { cookieToInitialState, State, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ConnectKitProvider } from "connectkit";
import { config } from "@/lib/wagmi";

const queryClient = new QueryClient();

export const Web3Provider = ({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies: string | null;
}) => {
  const initialState = cookies
    ? cookieToInitialState(config, cookies)
    : undefined;
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
