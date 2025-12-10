'use client";'
import { useConnection } from "wagmi";
import { BlockieAvatar } from "./web3/blockie-avatar";

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
    </div>
  );
}