"use client";

import HeroSection from "@/components/sections/Hero";
import FeaturesSection from "@/components/sections/Features";
import HowItWorksSection from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/pricing";
import TestimonialsSection from "@/components/sections/Testimonials";
import FAQSection from "@/components/sections/Faq";
import Footer from "@/components/sections/footer";
import CTASection from "@/components/sections/Cta";
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
