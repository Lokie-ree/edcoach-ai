"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  // Hide header for all dashboard routes
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/teachers") ||
    pathname.startsWith("/my-pgp") ||
    pathname.startsWith("/walkthrough") ||
    pathname.startsWith("/settings");

  return (
    <>
      {!isDashboard && <Header />}
      {children}
    </>
  );
}
