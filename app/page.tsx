"use client";

import HeroSection from "@/app/(marketing)/components/Hero";
import FeaturesSection from "@/app/(marketing)/components/Features";
import HowItWorksSection from "@/app/(marketing)/components/HowItWorks";
import Pricing from "@/app/(marketing)/components/pricing";
import TestimonialsSection from "@/app/(marketing)/components/Testimonials";
import FAQSection from "@/app/(marketing)/components/Faq";
import Footer from "@/app/(marketing)/components/Footer";
import CTASection from "@/app/(marketing)/components/Cta";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip",
  );

  // Handle redirect for authenticated users
  useEffect(() => {
    if (!isLoaded) return;

    // Only redirect if user is authenticated and we have user data
    if (user && convexUser !== undefined) {
      if (convexUser) {
        // User is set up - redirect to dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, isLoaded, convexUser, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page content if user is authenticated (redirect in progress)
  if (user && convexUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (user && convexUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Pricing />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}
