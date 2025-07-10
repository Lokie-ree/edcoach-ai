import Header from "@/components/layout/header";
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <MaxWidthWrapper className="py-8 md:py-12">
          {children}
        </MaxWidthWrapper>
      </main>
    </div>
  );
} 