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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <MaxWidthWrapper className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      EdCoach AI
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getPageTitle(pathname)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </MaxWidthWrapper>
        </header>
        <div className="flex flex-1 flex-col">
          <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
