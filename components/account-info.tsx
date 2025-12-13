"use client";
import { useAccount } from "wagmi";
import { Transfer } from "./web3/transaction";
import { CustomConnectButton } from "./web3/connect";

export const AccountInfo = () => {
  const { address } = useAccount();
  return (
    <div className="space-y-4">
      <CustomConnectButton />
      {address && <Transfer />}
    </div>
  );
};
