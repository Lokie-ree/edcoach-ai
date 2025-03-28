"use client"

import Link from "next/link";
import { School, Receipt, Settings } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { ShinyButton } from "./magicui/shiny-button";
import { AuroraText } from "./magicui/aurora-text";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className={`p-4 flex items-center justify-between ${isHomePage ? "bg-blue-50" : "bg-white"}`}>
      <Link href="/" className="flex items-center gap-2">
        <School className="w-6 h-6" />
        <AuroraText className="text-xl font-bold">Receipt Tracker</AuroraText>
      </Link>
      <div>
        <div className="flex items-center space-x-2">
          <SignedIn>
            <Link href="/receipts">
              <Button variant="outline">
                <Receipt className="w-6 h-6 sm:hidden" />
                <span className="hidden sm:inline">Receipts</span>
              </Button>
            </Link>
            <Link href="/manage-plan">
              <Button variant="default">
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
  )
}

export default Header