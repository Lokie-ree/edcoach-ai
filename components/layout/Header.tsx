"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/common/Logo";
import { ModeToggle } from "@/components/common/ModeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 supports-[backdrop-filter]:bg-background/60 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-primary/50 before:via-secondary/50 before:to-accent/50">
      <Container size="full" padding="compact">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">EdCoachAi</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button>Login</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
