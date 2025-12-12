import { TARGET_NETWORKS } from "@/config/networks";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: TARGET_NETWORKS,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});