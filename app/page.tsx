"use client";
import { AccountInfo } from "@/components/AccountInfo";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <DynamicWidget />
      <AccountInfo />
    </div>
  );
}
