"use client";
import { useConnection } from "wagmi";
import { Address } from "./web3/address";
import { NetworkOptions, NetworkSwitcher } from "./web3/network";
import { Transfer } from "./web3/transaction";
import { TARGET_NETWORKS } from "@/config/networks";

export const AccountInfo = () => {
  const { address } = useConnection();
  return (
    <div className="space-y-4">
      {address && <Address address={address}/>}
      {address && <NetworkSwitcher chains={TARGET_NETWORKS} />}
      {address && <NetworkOptions chains={TARGET_NETWORKS} />}
      {address && <Transfer />}
    </div>
  );
}