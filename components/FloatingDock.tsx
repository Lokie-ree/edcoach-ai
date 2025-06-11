"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  Users,
  Home,
  ChartSpline,
  BookOpen,
  BarChart,
  ClipboardPlus
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Define navigation items with role restrictions (matching header.tsx)
const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", roles: ["coach", "teacher"] },
  { href: "/teachers", icon: Users, label: "Teachers", roles: ["coach"] },
  { href: "/walkthrough/new", icon: ClipboardPlus, label: "New Walkthrough", roles: ["coach"] },
  { href: "/analytics", icon: ChartSpline, label: "Analytics", roles: ["coach"] },
  { href: "/my-walkthroughs", icon: BookOpen, label: "My Walkthroughs", roles: ["teacher"] },
  { href: "/my-progress", icon: BarChart, label: "My Progress", roles: ["teacher"] },
];

export function FloatingDock() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get user role from Convex (use skip when user is not available)
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Don't render if user is not loaded yet or not authenticated
  if (!isLoaded || !user) {
    return null;
  }
  
  const userRole = convexUser?.role;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  // Limit to 4 main navigation items + theme toggle for optimal dock size
  const mainNavItems = filteredNavItems.slice(0, 4);

  return (
    <TooltipProvider>
      <Dock 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden"
        iconMagnification={60}
        iconDistance={100}
      >
        {mainNavItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <DockIcon 
                onClick={() => handleNavigation(item.href)}
                className="bg-black/10 dark:bg-white/10"
              >
                <item.icon className="size-full" />
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <DockIcon 
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="bg-black/10 dark:bg-white/10"
            >
              {theme === "light" ? (
                <Moon className="size-full" />
              ) : (
                <Sun className="size-full" />
              )}
            </DockIcon>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>
      </Dock>
    </TooltipProvider>
  );
} 