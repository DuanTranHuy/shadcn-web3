import { AccountInfo } from "@/components/account-info";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <DynamicWidget />
      <AccountInfo />
    </div>
  );
}
