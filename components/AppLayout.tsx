import Header from "@/components/sections/header";
import { Toaster } from "sonner";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { FloatingDock } from "./FloatingDock";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <MaxWidthWrapper className="py-8">
          {children}
        </MaxWidthWrapper>
      </main>
      <FloatingDock />
      <Toaster />
    </div>
  );
} 