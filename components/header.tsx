"use client";

import Link from "next/link";
import { Receipt, Settings } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import MaxWidthWrapper from "./max-width-wrapper";
import { Logo } from "./logo";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 supports-[backdrop-filter]:bg-background/60 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-blue-500/50 before:via-purple-500/50 before:to-pink-500/50">
    <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            EdCoach AI
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline">
                    <Receipt className="w-6 h-6 sm:hidden" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/manage-plan">
                  <Button>
                    <Settings className="w-6 h-6 sm:hidden" />
                    <span className="hidden sm:inline">Manage Plan</span>
                  </Button>
                </Link>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Login</Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
