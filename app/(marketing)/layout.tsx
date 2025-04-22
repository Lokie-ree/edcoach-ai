import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Header from "@/components/header";
import { Toaster } from "sonner";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth()

  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 