import { useConnection } from "wagmi";

export const AccountInfo = () => {
  const { address, isConnected, chain } = useConnection();

  return (
    <div>
      <p>
        wagmi connected: {isConnected ? 'true' : 'false'}
      </p>
      <p>wagmi address: {address}</p>
      <p>wagmi network: {chain?.id}</p>
    </div>
  );
}