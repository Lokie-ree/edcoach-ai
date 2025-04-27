import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import { Toaster } from "sonner";
import MaxWidthWrapper from "@/components/max-width-wrapper";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MaxWidthWrapper className="py-8">{children}</MaxWidthWrapper>
      <Toaster />
    </div>
  );
}
