"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BarChart, 
  Users, 
  Settings, 
  MenuIcon,
  X,
  ClipboardList,
  LineChart
} from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import MaxWidthWrapper from "./max-width-wrapper";
import { Logo } from "./logo";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/observations", icon: ClipboardList, label: "Observations" },
  { href: "/analytics", icon: LineChart, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const principalNavItem = { href: "/user-management", icon: Users, label: "User Management" };

const DesktopNav = ({ isPrincipal, pathname }: { isPrincipal: boolean; pathname: string }) => (
  <nav className="hidden md:flex items-center gap-1">
    {[...navItems, ...(isPrincipal ? [principalNavItem] : [])].map((item) => (
      <Link key={item.href} href={item.href}>
        <Button
          variant={pathname === item.href ? "default" : "ghost"}
          size="lg"
          className={cn(
            "flex items-center gap-2 font-medium",
            pathname === item.href && "bg-primary/10 hover:bg-primary/20"
          )}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </Button>
      </Link>
    ))}
  </nav>
);

const MobileNav = ({ 
  isOpen, 
  onClose, 
  isPrincipal, 
  pathname 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  isPrincipal: boolean;
  pathname: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 top-16 z-50 bg-background border-b">
      <div className="flex flex-col py-2">
        {[...navItems, ...(isPrincipal ? [principalNavItem] : [])].map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isPrincipal = false; // TODO: Get from Clerk user object

  return (
    <header className="sticky top-0 z-50 h-16 backdrop-blur-md bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-semibold text-lg hidden md:inline">EdCoach AI</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <SignedIn>
              <DesktopNav isPrincipal={isPrincipal} pathname={pathname} />
              
              <div className="md:hidden relative">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center"
                >
                  {menuOpen ? <X size={20} /> : <MenuIcon size={20} />}
                </Button>
                <MobileNav 
                  isOpen={menuOpen} 
                  onClose={() => setMenuOpen(false)}
                  isPrincipal={isPrincipal}
                  pathname={pathname}
                />
              </div>
            </SignedIn>
            
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
