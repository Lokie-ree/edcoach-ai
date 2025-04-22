"use client";

import Link from "next/link";
import { Logo } from "./logo";
import MaxWidthWrapper from "./max-width-wrapper";

const AuthHeader = () => {
  return (
    <header className="sticky top-0 z-50 h-12 border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <MaxWidthWrapper>
        <div className="flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-base">EdCoach AI</span>
          </Link>
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default AuthHeader; 