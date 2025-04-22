"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Teachers", href: "/teachers" },
  { name: "Observations", href: "/observations" },
  { name: "Rubrics", href: "/rubrics" },
  { name: "Analytics", href: "/analytics" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-background hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-40 h-screen w-64 border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              EdCoach AI
            </span>
          </Link>
        </div>

        <div className="space-y-4 p-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-800/20"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "text-muted-foreground hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 hover:text-foreground"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20">
              <Bell className="h-5 w-5" />
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="container mx-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 