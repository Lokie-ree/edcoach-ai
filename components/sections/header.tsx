"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import { Logo } from "@/components/logo";
import { 
  Home, Users, ChartSpline, BookOpen, BarChart, ClipboardPlus
} from "lucide-react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

const Header = () => {
  const { user, isLoaded } = useUser();
  
  // Get the current user's role from Convex
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );

  // ONLY get AI usage for coaches
  const aiUsage = useQuery(
    api.plans.getAIUsageThisMonth,
    convexUser?.role === "coach" ? {} : "skip"
  );

  // Define navigation links based on user role
  const getNavigationLinks = () => {
    if (!convexUser) return [];

    if (convexUser.role === "coach") {
      const canCreateWalkthrough = !aiUsage?.isOverLimit;
      
      return [
        {
          label: "Dashboard",
          icon: <Home size={16} />,
          href: "/dashboard"
        },
        {
          label: "Teachers",
          icon: <Users size={16} />,
          href: "/teachers"
        },
        // Conditionally include New Walkthrough based on limits
        ...(canCreateWalkthrough ? [{
          label: "New Walkthrough",
          icon: <ClipboardPlus size={16} />,
          href: "/walkthrough/new"
        }] : []),
        {
          label: "Analytics",
          icon: <ChartSpline size={16} />,
          href: "/analytics"
        }
      ];
    } else if (convexUser.role === "teacher") {
      return [
        {
          label: "Dashboard",
          icon: <Home size={16} />,
          href: "/dashboard"
        },
        {
          label: "My Walkthroughs",
          icon: <BookOpen size={16} />,
          href: "/my-walkthroughs"
        },
        {
          label: "My Progress",
          icon: <BarChart size={16} />,
          href: "/my-progress"
        }
      ];
    }

    return [
      {
        label: "Dashboard",
        icon: <Home size={16} />,
        href: "/dashboard"
      }
    ];
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 supports-[backdrop-filter]:bg-background/60 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-blue-500/50 before:via-purple-500/50 before:to-pink-500/50">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">EdCoach AI</span>
          </Link>

          <div className="flex items-center space-x-4">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10",
                    userButtonPopoverCard: "shadow-lg border",
                  }
                }}
              >
                <UserButton.MenuItems>
                  {getNavigationLinks().map((link) => (
                    <UserButton.Link
                      key={link.href}
                      label={link.label}
                      labelIcon={link.icon}
                      href={link.href}
                    />
                  ))}
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

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
