"use client";

import Link from "next/link";
import { School, Receipt, Settings } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import MaxWidthWrapper from "./max-width-wrapper";
import { AnimatedGradientText } from "./magicui/animated-gradient-text";
import { Logo } from "./logo";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <AnimatedGradientText
              className="text-lg font-bold"
              colorFrom="#7928CA"
              colorTo="#38bdf8"
              speed={2}
            >
              EdCoach AI
            </AnimatedGradientText>
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
