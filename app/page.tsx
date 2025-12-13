"use client";

import { AccountInfo } from "@/components/account-info";
import { ConnectKitButton } from "connectkit";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <ConnectKitButton />
      <AccountInfo />
    </div>
  );
}
