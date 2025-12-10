"use client";
import { useConnection } from "wagmi";
import { Address } from "./web3/address";
import { NetworkOptions, NetworkSwitcher } from "./web3/network-switcher";
import { baseSepolia, mainnet } from "viem/chains";

export const AccountInfo = () => {
  const { address } = useConnection();
  return (
    <div>
      {address && <Address address={address}/>}
      {address  && <NetworkSwitcher chains={[mainnet, baseSepolia]} />}
      {address  && <NetworkOptions chains={[mainnet, baseSepolia]} />}
    </div>
  );
}