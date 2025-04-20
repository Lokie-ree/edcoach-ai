"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  School, 
  Settings, 
  ChevronRight, 
  BarChart, 
  BookOpen,
  MenuIcon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Teachers",
    href: "/teachers",
    icon: Users,
  },
  {
    name: "Schools",
    href: "/organizations/select",
    icon: School,
  },
  {
    name: "Settings",
    href: "/manage-plan",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <Button 
          variant="default" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full shadow-lg"
        >
          {sidebarOpen ? <X size={18} /> : <MenuIcon size={18} />}
        </Button>
      </div>

      {/* Sidebar - Mobile: absolute overlay, Desktop: fixed sidebar */}
      <div className={cn(
        "bg-muted/40 backdrop-blur-md fixed md:sticky top-[65px] z-10 h-[calc(100vh-65px)] w-64 transition-all duration-300 ease-in-out border-r",
        sidebarOpen ? "left-0" : "-left-64"
      )}>
        <div className="h-full flex flex-col p-4">
          <div className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground border-l-2 border-primary" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 