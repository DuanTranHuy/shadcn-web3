import { AccountInfo } from "@/components/account-info";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <AccountInfo />
    </div>
  );
}
