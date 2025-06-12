"use client";

import React, { useState } from "react";
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

// Define navigation items with role restrictions
const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", roles: ["coach", "teacher"] },
  { href: "/teachers", icon: Users, label: "Teachers", roles: ["coach"] },
  { href: "/walkthrough/new", icon: ClipboardPlus, label: "New Walkthrough", roles: ["coach"] },
  { href: "/analytics", icon: ChartSpline, label: "Analytics", roles: ["coach"] },
  { href: "/my-walkthroughs", icon: BookOpen, label: "My Walkthroughs", roles: ["teacher"] },
  { href: "/my-progress", icon: BarChart, label: "My Progress", roles: ["teacher"] },
];

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  direction: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, direction }) => {
  const [visible, setVisible] = useState(false);

  const showTooltip = () => setVisible(true);
  const hideTooltip = () => setVisible(false);

  return (
    <div onMouseEnter={showTooltip} onMouseLeave={hideTooltip} className="relative inline-block">
      {children}
      {visible && (
        <div
          className={`${
            direction === "up" || direction === "down"
              ? "absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 transform rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap"
              : "absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap"
          }`}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export function FloatingDock() {
  const [isHovered, setIsHovered] = useState(false);
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

  // Don't render if user hasn't completed onboarding (no role defined)
  if (!userRole) {
    return null;
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Create action buttons for speed dial
  const actionButtons = [
    ...filteredNavItems.map(item => ({
      icon: <item.icon size={20} />,
      label: item.label,
      key: item.href,
      action: () => handleNavigation(item.href)
    })),
    {
      icon: theme === "light" ? <Moon size={20} /> : <Sun size={20} />,
      label: "Toggle theme",
      key: "theme-toggle",
      action: handleThemeToggle
    }
  ];

  const getGlassyClasses = () => {
    return "backdrop-filter backdrop-blur-xl bg-white/80 dark:bg-black/80 border border-white/20 dark:border-white/10 rounded-xl shadow-lg transition-all duration-300";
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-8 right-8 z-50 md:hidden flex flex-col items-end gap-3"
    >
      {/* Main Speed Dial Button */}
      <button
        onMouseEnter={handleMouseEnter}
        className={`${getGlassyClasses()} order-1 flex items-center p-3 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50`}
      >
        <Menu size={20} />
      </button>

      {/* Speed Dial Actions */}
      <div
        className={`${
          isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
        } flex flex-col items-end gap-3 transition-all duration-500 ease-in-out origin-bottom order-0`}
      >
        {actionButtons.map((action, index) => (
          <Tooltip text={action.label} key={action.key} direction="up">
            <button
              onClick={action.action}
              className={`${getGlassyClasses()} flex items-center p-3 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50`}
            >
              {action.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
} 