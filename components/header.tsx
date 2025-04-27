"use client";

import Link from "next/link";
import { Users, Settings, School, Home, MenuIcon, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import MaxWidthWrapper from "./max-width-wrapper";
import { Logo } from "./logo";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/teachers", icon: Users, label: "Teachers" },
  { href: "/manage-plan", icon: Settings, label: "Settings" },
];

const MobileNav = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 dark:divide-gray-700">
      <div className="py-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <div className="flex items-center px-4 py-2 text-sm hover:bg-accent cursor-pointer">
              <item.icon className="w-4 h-4 mr-2" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const DesktopNav = () => (
  <nav className="hidden md:flex items-center space-x-1">
    {navItems.map((item) => (
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

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
              <DesktopNav />

              <div className="md:hidden relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center"
                >
                  {menuOpen ? <X size={18} /> : <MenuIcon size={18} />}
                </Button>
                <MobileNav
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen(false)}
                />
              </div>
            </SignedIn>

            <ModeToggle />

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <Link href="/about">
                <Button variant="ghost" size="sm">
                  About
                </Button>
              </Link>
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
