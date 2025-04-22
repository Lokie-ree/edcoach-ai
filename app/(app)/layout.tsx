import Header from "@/components/header";
import { Toaster } from "sonner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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