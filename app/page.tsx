"use client";

import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import Pricing from "@/components/sections/pricing";
import TestimonialsSection from "@/components/sections/testimonials-section";
import FAQSection from "@/components/sections/faq-section";
import Footer from "@/components/sections/footer";
import Script from "next/script";
import CTASection from "@/components/sections/cta-section";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user && isLoaded ? { clerkId: user.id } : "skip"
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
      <Script id="organization-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "EdCoach AI",
          url: "https://edcoachai.com",
          logo: "https://edcoachai.com/logo.png",
          sameAs: [
            "https://twitter.com/edcoachai",
            "https://linkedin.com/company/edcoachai",
            "https://facebook.com/edcoachai",
          ],
          description:
            "EdCoach AI empowers school leaders and coaches with real-time, rubric-aligned feedback suggestions.",
        })}
      </Script>
      <Script id="product-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "EdCoach AI Platform",
          description:
            "AI-powered instructional coaching platform that helps education leaders provide better feedback faster.",
          image: "https://edcoachai.com/product-image.jpg",
          offers: {
            "@type": "Offer",
            price: "29.99",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        })}
      </Script>
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