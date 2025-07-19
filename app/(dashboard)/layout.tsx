"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.current);
  const pathname = usePathname();

  // Function to get page title based on pathname
  const getPageTitle = (path: string) => {
    const pathMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/my-pgp": "My PGP",
      "/teachers": "Teachers",
      "/analytics": "Analytics",
      "/settings/billing": "Billing",
      "/settings/profile": "Settings",
      "/walkthrough": "Walkthroughs",
      "/walkthrough/new": "New Walkthrough",
    };

    // Handle dynamic routes
    if (path.startsWith("/walkthrough/") && path.includes("/view")) {
      return "View Walkthrough";
    }
    if (
      path.startsWith("/walkthrough/") &&
      !path.includes("/view") &&
      !path.includes("/new")
    ) {
      return "Edit Walkthrough";
    }

    return pathMap[path] || "Dashboard";
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold">
                    {getPageTitle(pathname)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome,{" "}
                    {user.firstName ||
                      user.emailAddresses[0]?.emailAddress ||
                      "User"}
                    !
                  </p>
                </div>
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
