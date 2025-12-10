"use client";
import { useConnection } from "wagmi";
import { BlockieAvatar } from "./web3/blockie-avatar";
import { Address } from "./web3/address";

export const AccountInfo = () => {
  const { address, isConnected, chain } = useConnection();
  return (
    <div>
      <p>
        wagmi connected: {isConnected ? 'true' : 'false'}
      </p>
      <p>wagmi address: {address}</p>
      <p>wagmi network: {chain?.id}</p>
      {address && <BlockieAvatar address={address}/>}
      {address && <Address address={address}/>}

    </div>
  );
}