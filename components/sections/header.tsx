"use client";

import Link from "next/link";
import { Users, ChartSpline, Home, BookOpen, BarChart, ClipboardPlus } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import { Logo } from "@/components/logo";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { NavMenuBtn } from "@/components/NavMenuBtn";

// Define navigation items with role restrictions
const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", roles: ["coach", "teacher"] },
  { href: "/teachers", icon: Users, label: "Teachers", roles: ["coach"] },
  { href: "/walkthrough/new", icon: ClipboardPlus, label: "New Walkthrough", roles: ["coach"] },
  { href: "/analytics", icon: ChartSpline, label: "Analytics", roles: ["coach"] },
  { href: "/my-walkthroughs", icon: BookOpen, label: "My Walkthroughs", roles: ["teacher"] },
  { href: "/my-progress", icon: BarChart, label: "My Progress", roles: ["teacher"] },
];

const DesktopNav = ({ userRole }: { userRole?: "coach" | "teacher" }) => {
  // Only show navigation if user has a defined role (completed onboarding)
  if (!userRole) {
    return null;
  }

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {filteredNavItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Button>
        </Link>
      ))}
    </nav>
  );
};

const Header = () => {
  const { user } = useUser();
  
  // Get user role from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  
  const userRole = convexUser?.role;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 supports-[backdrop-filter]:bg-background/60 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-blue-500/50 before:via-purple-500/50 before:to-pink-500/50">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold ">EdCoach AI</span>
          </Link>

          <div className="flex items-center space-x-1 md:space-x-2">
            <SignedIn>
              <DesktopNav userRole={userRole} />
            </SignedIn>
            <SignedIn>
              <UserButton>
                <UserButton.MenuItems>
                  {userRole && navItems
                    .filter(item => item.roles.includes(userRole))
                    .map((item) => (
                      <UserButton.Link 
                        key={item.href}
                        href={item.href} 
                        label={item.label} 
                        labelIcon={<item.icon />} 
                      />
                    ))
                  }
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            {/* Mobile NavMenuBtn, only after onboarding */}
            {userRole && (
              <div className="md:hidden">
                <NavMenuBtn />
              </div>
            )}

            <SignedOut>
              <SignInButton mode="modal">
                <Button>Login</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
