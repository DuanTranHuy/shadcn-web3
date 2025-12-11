"use client";
import { useConnection } from "wagmi";
import { Address } from "./web3/address";
import { NetworkOptions, NetworkSwitcher } from "./web3/network";
import { Transfer } from "./web3/transaction";
import { base, baseSepolia, bsc, mainnet } from "viem/chains";

// Supported chains - should match wagmi config in Web3Provider
const SUPPORTED_CHAINS = [mainnet, baseSepolia, base, bsc] as const;

export const AccountInfo = () => {
  const { address } = useConnection();
  return (
    <div className="space-y-4">
      {address && <Address address={address}/>}
      {address && <NetworkSwitcher chains={SUPPORTED_CHAINS} />}
      {address && <NetworkOptions chains={SUPPORTED_CHAINS} />}
      {address && <Transfer />}
    </div>
  );
}