"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import { Logo } from "@/components/logo";
import { 
  Home, Users, ChartSpline, BookOpen, BarChart, ClipboardPlus, Settings
} from "lucide-react";

const Header = () => {
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
                  <UserButton.Link 
                    label="Dashboard" 
                    labelIcon={<Home size={16} />}
                    href="/dashboard" 
                  />
                  <UserButton.Link 
                    label="Teachers" 
                    labelIcon={<Users size={16} />}
                    href="/teachers" 
                  />
                  <UserButton.Link 
                    label="New Walkthrough" 
                    labelIcon={<ClipboardPlus size={16} />}
                    href="/walkthrough/new" 
                  />
                  <UserButton.Link 
                    label="Analytics" 
                    labelIcon={<ChartSpline size={16} />}
                    href="/analytics" 
                  />
                  <UserButton.Link 
                    label="My Walkthroughs" 
                    labelIcon={<BookOpen size={16} />}
                    href="/my-walkthroughs" 
                  />
                  <UserButton.Link 
                    label="My Progress" 
                    labelIcon={<BarChart size={16} />}
                    href="/my-progress" 
                  />
                  <UserButton.Link 
                    label="Organization" 
                    labelIcon={<Settings size={16} />}
                    href="/org" 
                  />
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
