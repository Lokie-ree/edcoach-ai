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
  Plus
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
  { href: "/walkthrough/new", icon: Plus, label: "New Walkthrough", roles: ["coach"] },
  { href: "/analytics", icon: ChartSpline, label: "Analytics", roles: ["coach"] },
  { href: "/my-walkthroughs", icon: BookOpen, label: "My Walkthroughs", roles: ["teacher"] },
  { href: "/my-progress", icon: BarChart, label: "My Progress", roles: ["teacher"] },
];

export function FloatingDock() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user } = useUser();

  // Get user role from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  
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
      <Dock className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
        {mainNavItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <DockIcon onClick={() => handleNavigation(item.href)}>
                <item.icon className="h-5 w-5" />
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <DockIcon onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </DockIcon>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>
      </Dock>
    </TooltipProvider>
  );
} 