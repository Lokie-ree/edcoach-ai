"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.current);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user needs to complete onboarding
  if (currentUser && !currentUser.onboardingComplete) {
    // Redirect to onboarding
    window.location.href = "/onboarding";
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarNav userRole={currentUser?.role} />
      <SidebarInset>
        <MaxWidthWrapper className="h-full flex flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
              </div>
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </MaxWidthWrapper>
      </SidebarInset>
    </SidebarProvider>
  );
}
