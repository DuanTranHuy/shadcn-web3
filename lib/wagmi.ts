import { TARGET_NETWORKS } from "@/config/networks";
import { getDefaultConfig } from "connectkit";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const config = createConfig(
  getDefaultConfig({
    chains: TARGET_NETWORKS,
    transports: Object.fromEntries(
      TARGET_NETWORKS.map((chain) => [chain.id, http()])
    ),
    walletConnectProjectId: projectId,
    appName: "Shadcn Web3",
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
  })
);
