import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import Pricing from "@/components/sections/pricing";
import TestimonialsSection from "@/components/sections/testimonials-section";
import FAQSection from "@/components/sections/faq-section";
import Footer from "@/components/sections/footer";
import { Metadata } from "next";
import Script from "next/script";
import CTASection from "@/components/sections/cta-section";

export const metadata: Metadata = {
  title: "EdCoach AI - AI-Powered Instructional Coaching Platform",
  description:
    "EdCoach AI empowers school leaders and coaches with real-time, rubric-aligned feedback suggestions to improve teacher effectiveness.",
  keywords: [
    "instructional coaching",
    "AI coaching",
    "educational technology",
    "teacher feedback",
    "coaching platform",
    "education AI",
    "teaching improvement",
    "classroom observation",
    "education leadership",
    "rubric-aligned feedback",
  ],
  authors: [{ name: "EdCoach AI Team" }],
  openGraph: {
    title: "EdCoach AI - Transform Your Instructional Coaching",
    description:
      "Deliver better feedback faster with AI-powered coaching insights tailored to your teaching standards.",
    url: "https://edcoachai.org",
    siteName: "EdCoach AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EdCoach AI Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdCoach AI - AI-Powered Instructional Coaching",
    description:
      "Deliver better feedback faster with AI-powered coaching insights.",
    images: ["/twitter-image.jpg"],
    creator: "@edcoachai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://edcoachai.com",
  },
};

export default function Home() {
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