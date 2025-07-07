"use client";

import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import Pricing from "@/components/sections/pricing";
import TestimonialsSection from "@/components/sections/testimonials-section";
import FAQSection from "@/components/sections/faq-section";
import Footer from "@/components/sections/footer";
import CTASection from "@/components/sections/cta-section";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WaitlistModal from "@/components/waitlist-modal";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );
  const [waitlistOpen, setWaitlistOpen] = useState(false);

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
      <HeroSection onWaitlistClick={() => setWaitlistOpen(true)} />
      <FeaturesSection />
      <HowItWorksSection />
      <Pricing onWaitlistClick={() => setWaitlistOpen(true)} />
      <TestimonialsSection />
      <FAQSection />
      <CTASection onWaitlistClick={() => setWaitlistOpen(true)} />
      <Footer />
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
} 