"use client";
import { useConnection } from "wagmi";
import { Address } from "./web3/address";

export const AccountInfo = () => {
  const { address } = useConnection();
  return (
    <div>
      {address && <Address address={address}/>}
    </div>
  );
}