"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  // Hide header for all dashboard, setup, invite, onboarding, and billing routes
  const isDashboardOrSetup =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/teachers") ||
    pathname.startsWith("/growth-journal") ||
    pathname.startsWith("/walkthrough") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/billing");

  return (
    <>
      {!isDashboardOrSetup && <Header />}
      {children}
    </>
  );
}
