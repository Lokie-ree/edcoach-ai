"use client";

import React from "react";
import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  Users,
  Home,
  ChartSpline,
  BookOpen,
  BarChart,
  ClipboardPlus,
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Define navigation items with role restrictions
const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", roles: ["coach", "teacher"] },
  { href: "/teachers", icon: Users, label: "Teachers", roles: ["coach"] },
  { href: "/walkthrough/new", icon: ClipboardPlus, label: "New Walkthrough", roles: ["coach"] },
  { href: "/analytics", icon: ChartSpline, label: "Analytics", roles: ["coach"] },
  { href: "/my-walkthroughs", icon: BookOpen, label: "My Walkthroughs", roles: ["teacher"] },
  { href: "/my-progress", icon: BarChart, label: "My Progress", roles: ["teacher"] },
];

export function NavMenuBtn() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get user role from Convex (use skip when user is not available)
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Don't render if user is not loaded yet, not authenticated, or hasn't completed onboarding
  const userRole = convexUser?.role;
  if (!isLoaded || !user || !userRole) {
    return null;
  }

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="z-50 md:hidden rounded-full shadow-lg bg-background/80 backdrop-blur"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="p-0 pb-8 md:hidden rounded-t-2xl">
        <SheetHeader className="pt-4 pb-2 px-6">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-6 pb-6">
          {filteredNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="justify-start text-lg gap-3"
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon size={20} />
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="justify-start text-lg gap-3 mt-2"
            onClick={handleThemeToggle}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            Toggle theme
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
} 