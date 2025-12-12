"use client";
import { useAccount } from "wagmi";
import { Address } from "./web3/address";
import { NetworkSwitcher } from "./web3/network";
import { Transfer } from "./web3/transaction";
import { TARGET_NETWORKS } from "@/config/networks";

export const AccountInfo = () => {
  const { address } = useAccount();
  return (
    <div className="space-y-4">
      {address && <Address address={address}/>}
      {address && <NetworkSwitcher chains={TARGET_NETWORKS} />}
      {address && <Transfer />}
    </div>
  );
}