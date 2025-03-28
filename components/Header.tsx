"use client"

import Link from "next/link";
import { School, Receipt, Settings } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { ShinyButton } from "./magicui/shiny-button";
import { AuroraText } from "./magicui/aurora-text";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Header = () => {

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <School className="w-5 h-5" />
            <AuroraText className="text-lg font-bold">Receipt Tracker</AuroraText>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <SignedIn>
                <Link href="/receipts">
                  <Button variant="outline">
                    <Receipt className="w-6 h-6 sm:hidden" />
                    <span className="hidden sm:inline">Receipts</span>
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
                  <ShinyButton>
                    Login
                  </ShinyButton>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  )
}

export default Header;